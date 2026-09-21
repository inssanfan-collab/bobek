#!/bin/bash
# Подключение доменов садов: сертификат Let's Encrypt и сайт в nginx.
#
# Ставится в /usr/local/bin/vsesad-certs, запускается таймером
# vsesad-certs.timer раз в 10 минут от root.
#
# Источник правды — таблица "Domain" в базе портала: домен подключается,
# только если он там есть. Иначе любой, направивший свой домен на наш IP,
# исчерпал бы нам лимиты Let's Encrypt. Результат пишется обратно в базу
# (certStatus, certExpiresAt, lastError) — его видно в карточке сада.
#
# Что делает за проход:
#   1. Для каждого домена проверяет A-запись. Не указывает на нас — к Let's
#      Encrypt не обращаемся: у него лимит 5 неудач в час на имя.
#   2. Выпускает сертификат; www.<домен> добавляет, если его A-запись тоже
#      указывает на нас. www ведёт на основной адрес.
#   3. Пишет конфигурацию nginx, проверяет nginx -t и только тогда
#      перезагружает: на машине живут чужие сайты.
#   4. Домен удалили из карточки — убирает его конфигурацию и сертификат.
set -uo pipefail

APP_DIR="/var/www/vsesad"
ACME_ROOT="/var/www/acme"
AVAIL="/etc/nginx/sites-available"
ENABLED="/etc/nginx/sites-enabled"
STATE="/var/lib/edusad/certs"
# После неудачи Let's Encrypt снова пробуем не раньше чем через час.
RETRY_MINUTES=60
HOST_RE='^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'

mkdir -p "$STATE"

env_value() {
  grep -E "^$1=" "$APP_DIR/.env" | head -1 | cut -d= -f2- | tr -d "\"' "
}

# Домен портала и адрес сервера берём из настроек приложения, а не повторяем
# здесь: при переезде эти строки молча остались бы старыми.
PORTAL=$(env_value PORTAL_DOMAIN)
SERVER_IP=$(env_value SERVER_IPV4)
EMAIL=$(env_value NOTIFY_EMAIL)

log() { echo "$(date '+%F %T') $*"; }

sql() {
  sudo -u postgres psql -d vsesad -v ON_ERROR_STOP=1 -tA "$@"
}

# Записать результат в карточку. Текст ошибки передаём переменной psql,
# а не подставляем в запрос: в выводе certbot бывают кавычки. Prisma хранит
# время в UTC без пояса, поэтому и здесь всё переводим в UTC явно.
set_status() {
  local host=$1 status=$2 error=${3:-} expires=${4:-}
  sql -v host="$host" -v status="$status" -v err="$error" -v exp="$expires" <<'SQL' >/dev/null
update "Domain" set
  "certStatus" = :'status'::"CertStatus",
  "lastError" = nullif(:'err', ''),
  "certExpiresAt" = nullif(:'exp', '')::timestamptz at time zone 'UTC',
  "verifiedAt" = case when :'status' in ('DNS_OK', 'ACTIVE')
                      then coalesce("verifiedAt", now() at time zone 'UTC') else "verifiedAt" end
where host = :'host'
  and ("certStatus" <> :'status'::"CertStatus"
       or coalesce("lastError", '') <> :'err'
       or "certExpiresAt" is distinct from (nullif(:'exp', '')::timestamptz at time zone 'UTC'));
SQL
}

# A-запись по публичному DNS: локальный резолвер мог закэшировать старое.
points_here() {
  local ips
  ips=$(dig +short +time=3 +tries=2 A "$1" @1.1.1.1 2>/dev/null | grep -E '^[0-9.]+$')
  [ -n "$SERVER_IP" ] && grep -qx "$SERVER_IP" <<<"$ips"
}

resolved_to() {
  dig +short +time=3 +tries=2 A "$1" @1.1.1.1 2>/dev/null | grep -E '^[0-9.]+$' | paste -sd, -
}

cert_expiry() {
  openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$1/cert.pem" 2>/dev/null \
    | cut -d= -f2 | xargs -I{} date -u -d "{}" '+%F %T+00'
}

cert_covers() {
  openssl x509 -noout -ext subjectAltName -in "/etc/letsencrypt/live/$1/cert.pem" 2>/dev/null \
    | grep -q "DNS:$2\(,\|$\)"
}

write_conf() {
  local host=$1 with_www=$2 file="$AVAIL/tenant-$1"
  # Конфиг пишется без подстановки: $host и прочие здесь — переменные nginx,
  # имя домена подставляется отдельно.
  cat > "$file.new" <<'CONF'
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name __DOMAIN__;

    ssl_certificate     /etc/letsencrypt/live/__DOMAIN__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN__/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    add_header Strict-Transport-Security "max-age=31536000" always;

    client_max_body_size 55m;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
server {
    listen 80;
    listen [::]:80;
    server_name __NAMES__;

    # Продление идёт по http, поэтому проверка отвечает до переадресации.
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/acme;
    }

    location / {
        return 301 https://__DOMAIN__$request_uri;
    }
}
CONF
  if [ "$with_www" = "1" ]; then
    cat >> "$file.new" <<'CONF'
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name www.__DOMAIN__;

    ssl_certificate     /etc/letsencrypt/live/__DOMAIN__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN__/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://__DOMAIN__$request_uri;
}
CONF
    sed -i "s/__NAMES__/__DOMAIN__ www.__DOMAIN__/" "$file.new"
  else
    sed -i "s/__NAMES__/__DOMAIN__/" "$file.new"
  fi
  sed -i "s/__DOMAIN__/$host/g" "$file.new"

  if cmp -s "$file.new" "$file" && [ -L "$ENABLED/tenant-$host" ]; then
    rm -f "$file.new"
    return 1
  fi
  mv "$file.new" "$file"
  ln -sfn "$file" "$ENABLED/tenant-$host"
  return 0
}

# ─── Домены из базы ───

# Отличаем «доменов нет» от «база не ответила»: во втором случае ничего
# не удаляем, иначе сбой базы снёс бы сайты всех садов.
if ! all_hosts=$(sql -c 'select host from "Domain";'); then
  log "ОШИБКА: база не ответила, проход пропущен"
  exit 1
fi
live=$(sql -F' ' -c "select d.host, d.type from \"Domain\" d join \"Tenant\" t on t.id = d.\"tenantId\"
                     where t.status in ('ACTIVE','DRAFT','SUSPENDED');") || exit 1

changed=0

# Список читаем с отдельного дескриптора: certbot внутри цикла мог бы
# съесть остаток списка со стандартного ввода.
while read -r host type <&3; do
  [ -z "$host" ] && continue
  [ "$host" = "$PORTAL" ] && continue
  if ! [[ "$host" =~ $HOST_RE ]]; then
    log "пропускаю странное имя: $host"
    continue
  fi

  has_cert=0
  [ -f "/etc/letsencrypt/live/$host/cert.pem" ] && has_cert=1

  if ! points_here "$host"; then
    now=$(resolved_to "$host")
    if [ "$has_cert" = "1" ] && [ -L "$ENABLED/tenant-$host" ]; then
      # Сертификат есть, а DNS увели — по этому имени открывается уже не наш сервер.
      set_status "$host" FAILED "A-запись теперь: ${now:-не найдена}. Нужно: $SERVER_IP" "$(cert_expiry "$host")"
    else
      set_status "$host" PENDING "A-запись: ${now:-не найдена}. Нужно: $SERVER_IP" ""
    fi
    continue
  fi

  # www только у собственных доменов: у поддомена портала его не бывает.
  want_www=0
  [ "$type" = "CUSTOM" ] && points_here "www.$host" && want_www=1

  need_issue=0
  recently_failed=0
  if [ "$has_cert" = "0" ]; then
    need_issue=1
  elif [ "$want_www" = "1" ] && ! cert_covers "$host" "www.$host"; then
    need_issue=1
  fi

  if [ "$need_issue" = "1" ]; then
    fail_mark="$STATE/$host.failed"
    recently_failed=0
    [ -f "$fail_mark" ] && [ -n "$(find "$fail_mark" -mmin -$RETRY_MINUTES)" ] && recently_failed=1
  fi

  if [ "$need_issue" = "1" ] && [ "$recently_failed" = "1" ]; then
    # Сайт без сертификата ждёт следующей попытки; с сертификатом — работает
    # как есть, не хватает только www.
    [ "$has_cert" = "0" ] && continue
  elif [ "$need_issue" = "1" ]; then
    [ "$has_cert" = "0" ] && set_status "$host" DNS_OK "" ""
    names=(-d "$host")
    [ "$want_www" = "1" ] && names+=(-d "www.$host")
    account=(--register-unsafely-without-email)
    [ -n "$EMAIL" ] && account=(-m "$EMAIL")
    log "выпускаю сертификат: ${names[*]}"
    if ! out=$(</dev/null certbot certonly --webroot -w "$ACME_ROOT" --cert-name "$host" "${names[@]}" \
                 --expand --non-interactive --agree-tos "${account[@]}" 2>&1); then
      reason=$(grep -iE 'detail:|error|problem' <<<"$out" | tail -3 | tr '\n' ' ' | cut -c1-400)
      log "  не получилось: $host — $reason"
      touch "$fail_mark"
      if [ "$has_cert" = "0" ]; then
        set_status "$host" FAILED "Let's Encrypt: ${reason:-неизвестная ошибка}" ""
        continue
      fi
      www_error="www.$host не подключён — Let's Encrypt: ${reason:-неизвестная ошибка}"
    else
      rm -f "$fail_mark"
      has_cert=1
    fi
  fi

  with_www=0
  cert_covers "$host" "www.$host" && with_www=1
  if write_conf "$host" "$with_www"; then
    changed=1
    log "подключён: $host$([ "$with_www" = "1" ] && echo " и www.$host")"
  fi
  set_status "$host" ACTIVE "${www_error:-}" "$(cert_expiry "$host")"
  www_error=""
done 3<<<"$live"

# ─── Уборка удалённых доменов ───

for file in "$AVAIL"/tenant-*; do
  [ -e "$file" ] || continue
  host=${file#"$AVAIL/tenant-"}
  [[ "$host" == *.new ]] && continue
  grep -qx "$host" <<<"$all_hosts" && continue
  [ "$host" = "$PORTAL" ] && continue
  [[ "$host" =~ $HOST_RE ]] || continue
  log "домен удалён из карточки, убираю: $host"
  rm -f "$ENABLED/tenant-$host" "$file" "$STATE/$host.failed"
  certbot delete --cert-name "$host" --non-interactive >/dev/null 2>&1 || true
  changed=1
done

if [ "$changed" = "1" ]; then
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
    log "nginx перезагружен"
  else
    log "ОШИБКА: конфигурация nginx не прошла проверку, перезагрузка отменена"
    nginx -t
    exit 1
  fi
fi
