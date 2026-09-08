# Развёртывание на VPS

## 0. Требования к серверу

| Параметр | Значение |
|---|---|
| ОС | Ubuntu 22.04 или 24.04 |
| Ресурсы | от 4 ГБ RAM, 2 vCPU, 80 ГБ SSD |
| Расположение | **только Казахстан** |
| Порты | 80 и 443 открыты наружу |

**Про расположение сервера — не пропускайте.** По правилам регистрации доменов `.kz`
домен обязан указывать на IP-адрес, физически находящийся в Казахстане. При нарушении
регистратор присылает предупреждение и через 10 дней приостанавливает домен. Поэтому
VPS берём у казахстанского провайдера (PS Internet, Hoster.kz, Freedom Cloud и т. п.),
а не у зарубежного.

Персональные данные (обращения родителей, фотографии детей) по закону РК тоже должны
храниться на серверах в Казахстане — это второй довод за то же решение.

## 1. Подготовка сервера

```bash
ssh root@ВАШ_IP

apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 git ufw

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

systemctl enable --now docker
```

## 2. DNS

В панели регистратора для домена портала:

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | IP сервера |
| A | `www` | IP сервера |
| A | `*` | IP сервера |

Запись `*` (wildcard) обязательна — именно она даёт работать адресам садов
вида `sad12.bobegim.kz`. Без неё каждый новый сад пришлось бы добавлять в DNS руками.

Проверить: `dig +short sad12.bobegim.kz` должен вернуть IP сервера.

## 3. Установка

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/inssanfan-collab/bobek.git bobegim
cd bobegim

cp .env.example .env
nano .env
```

Заполните в `.env`:

```env
PORTAL_DOMAIN="bobegim.kz"
NEXT_PUBLIC_PORTAL_DOMAIN="bobegim.kz"

POSTGRES_PASSWORD="<openssl rand -hex 24>"
SESSION_SECRET="<openssl rand -hex 32>"
TLS_ASK_TOKEN="<openssl rand -hex 16>"

ACME_EMAIL="вашапочта@example.kz"
SERVER_IPV4="IP сервера"

# COOKIE_SECURE оставьте пустым: в проде cookie должна быть Secure.
COOKIE_SECURE=
```

Запуск:

```bash
docker compose up -d --build
docker compose run --rm app pnpm exec prisma migrate deploy

# Создать суперадмина. Демо-сады на боевом сервере не нужны.
SEED_DEMO=false SEED_ADMIN_LOGIN=admin SEED_ADMIN_PASSWORD='придумайте-длинный-пароль' \
  docker compose run --rm app pnpm exec tsx prisma/seed.ts
```

Откройте `https://bobegim.kz/admin`, войдите и **сразу смените пароль** — система об этом
напомнит сама.

## 4. Как выдаются сертификаты

Caddy получает сертификаты сам, вмешательство не нужно:

- **портал и поддомены садов** — обычный выпуск при первом обращении к адресу;
- **собственные домены садов** — режим `on_demand_tls`. Перед выпуском Caddy
  спрашивает приложение по адресу `/api/tls/ask`, знаем ли мы такой домен. Если домена
  нет в базе — сертификат не выпускается. Без этой проверки любой, кто направит свой
  домен на наш IP, заставил бы нас выпускать ему сертификаты и быстро исчерпал бы
  лимиты Let's Encrypt.

Подключение домена сада:

1. Сад покупает домен **на себя** и прописывает A-запись на IP сервера.
2. В админке портала: карточка сада → «Собственный домен сада» → добавить → «Проверить DNS».
3. Когда статус стал `DNS_OK`, откройте домен в браузере — Caddy выпустит сертификат
   при первом заходе.
4. При необходимости нажмите «Сделать основным»: второй адрес начнёт отдавать 301
   и `rel=canonical`, чтобы поисковики не считали сайты дублями.

## 5. Обновление

```bash
cd /opt/bobegim
./deploy/deploy.sh
```

Скрипт сам делает копию базы, собирает образ, применяет миграции, перезапускает
и проверяет, что приложение отвечает.

## 6. Резервные копии

```bash
crontab -e
# Копия каждую ночь в 03:00
0 3 * * * /opt/bobegim/deploy/backup.sh >> /var/log/bobegim-backup.log 2>&1

# Проверка подписок каждое утро в 09:00: список садов на обзвон
# и автоматическая приостановка тех, у кого истёк льготный период
0 9 * * * cd /opt/bobegim && docker compose run --rm app pnpm subscriptions:check >> /var/log/bobegim-subs.log 2>&1
```

Скрипт подписок ничего не рассылает по почте — он печатает список тех, кому пора
позвонить. У садов часто общий ящик, который никто не читает, поэтому обзвон
надёжнее письма. Список можно посмотреть и вручную:

```bash
docker compose run --rm app pnpm subscriptions:check
```

Хранятся 14 дней в `./backups`. **Раз в месяц проверяйте восстановление** —
непроверенная копия копией не является:

```bash
./deploy/restore.sh backups/db_2026-09-07_03-00.sql.gz
```

Копии лежат на том же сервере, что и данные. Настройте выгрузку в другое место
(второй VPS, объектное хранилище) — иначе потеря сервера означает потерю и копий.

## 7. Локальная разработка

### Шаг 1. Забрать код

```bash
cd ~/Desktop
git clone -b claude/kindergarten-portal-aktobe-njxi42 https://github.com/inssanfan-collab/bobek.git bobegim
cd bobegim
```

На Windows то же самое в PowerShell:

```powershell
cd $HOME\Desktop
git clone -b claude/kindergarten-portal-aktobe-njxi42 https://github.com/inssanfan-collab/bobek.git bobegim
cd bobegim
```

Понадобятся [Node.js 22+](https://nodejs.org), [pnpm](https://pnpm.io/installation)
(`npm i -g pnpm`) и [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Шаг 2. Домены садов

Сад определяется по домену, поэтому на `localhost` приложение покажет 404 —
нужны локальные имена. Добавьте строку в файл hosts:

- macOS и Linux: `sudo nano /etc/hosts`
- Windows: откройте Блокнот **от имени администратора** и в нём
  `C:\Windows\System32\drivers\etc\hosts`

```
127.0.0.1 bobegim.local sad12.bobegim.local kunshuaq.bobegim.local ertegi.bobegim.local demo-sad.bobegim.local
```

### Шаг 3. Запуск

```bash
pnpm install
cp .env.local.example .env   # на Windows: copy .env.local.example .env
pnpm db:up                   # поднимает PostgreSQL в Docker
pnpm db:setup                # применяет миграции и создаёт демо-сады
pnpm dev
```

`.env.local.example` — готовый набор настроек для своей машины, править в нём
ничего не нужно. Для сервера он не годится: там берите `.env.example`
и задавайте собственные секреты.

Откройте **http://bobegim.local:3000** — именно это имя, не `localhost`.

Демо-доступы после `pnpm db:setup`:

| Кто | Адрес | Логин | Пароль |
|---|---|---|---|
| Админ портала | bobegim.local:3000/admin | `admin` | `admin-bobegim-2026` |
| Сад №12 «Балдырған» | sad12.bobegim.local:3000/admin | `sad12-admin` | `sad12-2026` |
| «Күншуақ» | kunshuaq.bobegim.local:3000/admin | `kunshuaq-admin` | `kunshuaq-2026` |
| «Ертегі» | ertegi.bobegim.local:3000/admin | `ertegi-admin` | `ertegi-2026` |

Демо-сады сделаны на трёх разных шаблонах — так сразу видно разницу.

### Если что-то не работает

| Симптом | Что проверить |
|---|---|
| `Can't reach database server` | запущен ли Docker Desktop и прошёл ли `pnpm db:up` |
| Открывается 404 вместо сайта | открыт `localhost` вместо `bobegim.local`, или не прописан hosts |
| Вход не проходит с верным паролем | нет `COOKIE_SECURE=false` в `.env` при работе по http |
| Порт 5432 занят | на машине уже есть PostgreSQL — остановите его или поменяйте порт в `docker-compose.dev.yml` |

Остановить базу: `pnpm db:down`. Данные сохраняются в томе Docker
и переживают перезапуск.

## 8. Тесты

```bash
pnpm test          # юнит-тесты: резолв доменов, языки, санитайзер, адреса
pnpm test:e2e      # сквозные сценарии в браузере
```

E2E поднимают сервер сами с `COOKIE_SECURE=false`: тесты идут по http, а cookie
с флагом Secure браузер на http молча отбрасывает — вход выглядел бы как «неверный пароль».

## 9. Диагностика

```bash
docker compose logs -f app        # логи приложения
docker compose logs -f caddy      # выпуск сертификатов
curl -s https://bobegim.kz/api/health
docker compose exec postgres psql -U bobegim -d bobegim -c '\dt'
```

Частые ситуации:

| Симптом | Причина |
|---|---|
| Сад открывается, а `/admin` даёт 404 | сад в статусе «Черновик» или пользователь привязан к другому саду |
| Не выпускается сертификат для домена сада | домен не добавлен в админке либо A-запись ещё не обновилась |
| Вход не проходит, хотя пароль верный | сайт открыт по http, а cookie помечена Secure — включите https |
| Домен `.kz` перестал открываться | сервер не в Казахстане, регистратор приостановил домен |
