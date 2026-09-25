'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Не істеу керек', ru: 'Что и как делать' },
  lead: {
    kk: 'Командалар сервердегі түбірлік пайдаланушыдан орындалады. Әкімшілік бөлім ештеңені өзі орындамайды — тек көрсетеді.',
    ru: 'Команды выполняются на сервере под root. Админка сама ничего не выполняет — только показывает.',
  },
  copy: { kk: 'Көшіру', ru: 'Скопировать' },
  copied: { kk: 'Көшірілді', ru: 'Скопировано' },
} as const;

type Entry = {
  question: { kk: string; ru: string };
  answer: { kk: string; ru: string };
  commands: string[];
};

/**
 * Справочник написан ответами на вопросы, которые возникают в спешке:
 * «сертификат вот-вот истечёт», «сад не открывается». В такой момент
 * читать общее описание устройства некогда — нужна команда.
 */
const ENTRIES: Entry[] = [
  {
    question: {
      kk: 'Жаңа балабақшаға сертификат қалай беріледі?',
      ru: 'Как выдать сертификат новому саду?',
    },
    answer: {
      kk: 'Домен базада пайда болған соң скриптті қосыңыз: ол базадағы барлық домендерді өтіп, сертификаты жоқтарына сұрайды және nginx баптауын жасайды.',
      ru: 'После того как домен появился в базе, запустите скрипт: он обходит все домены портала, запрашивает сертификат тем, у кого его нет, и создаёт настройку nginx.',
    },
    commands: ['/usr/local/bin/vsesad-certs'],
  },
  {
    question: {
      kk: 'Сертификатты қолмен жаңарту',
      ru: 'Перевыпустить сертификат вручную',
    },
    answer: {
      kk: 'Мерзімі жақындап қалса да автоматты жаңарту өтпесе. --force-renewal мерзімі жетпесе де қайта шығарады; Let’s Encrypt шектеуі — аптасына бір доменге бес қайта шығару.',
      ru: 'Если срок близко, а автоматическое обновление не прошло. Ключ --force-renewal перевыпускает, даже когда срок ещё не подошёл; ограничение Let’s Encrypt — пять перевыпусков на домен в неделю.',
    },
    commands: [
      'certbot renew --cert-name aisha.edusad.kz --force-renewal',
      'certbot certificates',
    ],
  },
  {
    question: {
      kk: 'Жаңарту жұмыс істей ме — нақты шығармай тексеру',
      ru: 'Проверить, что обновление пройдёт, ничего не выпуская',
    },
    answer: {
      kk: 'Сынақ режимі нақты сертификатқа тимейді және шектеулерді жұмсамайды. Бір домен үшін --cert-name қосыңыз.',
      ru: 'Пробный прогон не трогает боевые сертификаты и не расходует лимиты. Для одного домена добавьте --cert-name.',
    },
    commands: ['certbot renew --dry-run'],
  },
  {
    question: {
      kk: 'nginx-ті қайта оқыту',
      ru: 'Перезагрузить nginx',
    },
    answer: {
      kk: 'Алдымен баптауды тексеріңіз: қате болса reload өтпейді және сайт бұрынғыдай жұмыс істей береді. reload байланыстарды үзбейді.',
      ru: 'Сначала проверка настроек: при ошибке reload не пройдёт и сайт продолжит работать на прежней конфигурации. Reload не рвёт соединения.',
    },
    commands: ['nginx -t && systemctl reload nginx'],
  },
  {
    question: {
      kk: 'Сайттың жаңа нұсқасын шығару',
      ru: 'Выложить обновление сайта',
    },
    answer: {
      kk: 'Кодты алу, жинау және қызметті қайта қосу. Мәліметтер базасының көшірмесі өзгерсе — migrate deploy алдымен.',
      ru: 'Забрать код, собрать и перезапустить службу. Если менялась схема базы — сначала migrate deploy.',
    },
    commands: [
      'cd /var/www/vsesad && git pull --ff-only',
      'npx prisma migrate deploy',
      'pnpm build && systemctl restart vsesad',
    ],
  },
  {
    question: {
      kk: 'Сайт ашылмай тұр — қайдан қарау керек?',
      ru: 'Сайт не открывается — куда смотреть?',
    },
    answer: {
      kk: 'Алдымен қызметтің журналы, сосын nginx қателері. Қызмет жұмыс істеп тұрып, бет 502 берсе — қолданба жауап бермей тұр.',
      ru: 'Сначала журнал службы, затем ошибки nginx. Если служба работает, а страница отдаёт 502 — приложение не отвечает.',
    },
    commands: [
      'systemctl status vsesad',
      'journalctl -u vsesad -n 100 --no-pager',
      'tail -50 /var/log/nginx/error.log',
    ],
  },
  {
    question: {
      kk: 'Сертификаттар журналы',
      ru: 'Журнал обновления сертификатов',
    },
    answer: {
      kk: 'Жаңарту неге өтпегенін осы жерден көресіз. Соңғы жазбалар файлдың соңында.',
      ru: 'Здесь видно, почему обновление не прошло. Последние записи — в конце файла.',
    },
    commands: ['tail -80 /var/log/letsencrypt/letsencrypt.log'],
  },
  {
    question: {
      kk: 'Осы бөлімдегі мәліметтерді дәл қазір жаңарту',
      ru: 'Обновить данные этого раздела прямо сейчас',
    },
    answer: {
      kk: 'Әдетте таймер 15 минут сайын жинайды. Қолмен қосу файлды бірден жаңартады.',
      ru: 'Обычно сбор идёт по таймеру каждые 15 минут. Ручной запуск обновляет файл сразу.',
    },
    commands: ['/usr/local/bin/edusad-system-report', 'systemctl list-timers edusad-system-report.timer'],
  },
  {
    question: {
      kk: 'Поштаға хабарламалар келмей жатыр',
      ru: 'Не приходят уведомления на почту',
    },
    answer: {
      kk: 'Хаттар edusad@e04.kz атынан осы сервердегі пошта арқылы кетеді. Алдымен журналда status=sent бар-жоғын қараңыз: бар болса, хат Gmail-ге жетті — «Спам» қалтасын тексеріңіз. Күзетші әр 5 минут сайын тексереді, оның күйі файлда.',
      ru: 'Письма уходят от edusad@e04.kz через почтовый сервер этой же машины. Сначала посмотрите журнал: если там status=sent, Gmail письмо принял — проверьте «Спам». Сторож проверяет всё каждые 5 минут, его состояние лежит в файле.',
    },
    commands: [
      'grep "to=<" /var/log/mail.log | tail -5',
      'cat /var/lib/edusad/watchdog.json',
      'systemctl list-timers edusad-watchdog.timer edusad-subscriptions.timer',
    ],
  },
  {
    question: {
      kk: 'Кіруге тыйым салынғандарды қарау',
      ru: 'Посмотреть заблокированные адреса',
    },
    answer: {
      kk: 'Үш сәтсіз әрекеттен кейін адрес тәулікке бұғатталады. Қате бұғаттауды unban арқылы алып тастауға болады.',
      ru: 'После трёх неудачных попыток адрес блокируется на сутки. Ошибочную блокировку снимает unban.',
    },
    commands: ['fail2ban-client status sshd', 'fail2ban-client set sshd unbanip 1.2.3.4'],
  },
  {
    question: {
      kk: 'Базаның көшірмесін қазір жасау',
      ru: 'Сделать копию базы прямо сейчас',
    },
    answer: {
      kk: 'Мысалы, қауіпті өзгерістер алдында. Көшірмелер /var/backups/vsesad ішінде, 30 күн сақталады. Жүктелген файлдар көшірілмейді.',
      ru: 'Например, перед рискованными изменениями. Копии — в /var/backups/vsesad, хранятся 30 дней. Загруженные файлы не копируются.',
    },
    commands: ['/usr/local/bin/vsesad-backup', 'ls -lh /var/backups/vsesad'],
  },
  {
    question: {
      kk: 'Базаны көшірмеден қалпына келтіру',
      ru: 'Восстановить базу из копии',
    },
    answer: {
      kk: 'Аргументсіз — көшірмелер тізімі. Файлмен — растауды сұрайды, қазіргі күйдің көшірмесін жасайды, сайтты тоқтатып, базаны бір транзакциямен ауыстырады.',
      ru: 'Без аргумента — список копий. С файлом — спросит подтверждение, снимет копию текущего состояния, остановит сайт и заменит базу одной транзакцией.',
    },
    commands: ['vsesad-restore', 'vsesad-restore /var/backups/vsesad/vsesad_ГГГГ-ММ-ДД_0330.dump'],
  },
  {
    question: {
      kk: 'Көшірменің жарамдылығын тексеру (айына бір рет)',
      ru: 'Проверить, что копия восстанавливается (раз в месяц)',
    },
    answer: {
      kk: 'Түнгі скрипт мұны әр көшірмеде өзі жасайды; бұл — қолмен тексеру. Жұмыс базасына тимейді: соңғы көшірмені уақытша базаға қалпына келтіріп, балабақшаларды санайды және уақытша базаны жояды.',
      ru: 'Ночной скрипт делает это сам с каждой копией; это — ручная проверка. Рабочую базу не трогает: разворачивает последнюю копию во временную базу, считает сады и удаляет её.',
    },
    commands: [
      `f=$(ls -1t /var/backups/vsesad/*.dump | head -1); runuser -u postgres -- createdb vsesad_check && runuser -u postgres -- pg_restore --no-owner --exit-on-error -d vsesad_check < "$f" && runuser -u postgres -- psql -d vsesad_check -tAc 'select count(*) from "Tenant"'; runuser -u postgres -- dropdb vsesad_check`,
    ],
  },
];

export function Runbook({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      setTimeout(() => setCopied((prev) => (prev === command ? null : prev)), 1500);
    } catch {
      // Буфер обмена доступен не везде — команду всегда можно выделить мышью.
    }
  };

  return (
    <section className="card mt-5 p-6">
      <h2 className="font-display text-lg font-bold">{T.title[locale]}</h2>
      <p className="mt-1 text-sm text-muted">{T.lead[locale]}</p>

      <div className="mt-4 space-y-2">
        {ENTRIES.map((entry) => (
          <details key={entry.question.ru} className="group rounded-2xl border border-line">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 font-semibold">
              <span className="min-w-0 flex-1">{entry.question[locale]}</span>
              <span className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>

            <div className="border-t border-line px-4 py-3">
              <p className="text-sm text-muted">{entry.answer[locale]}</p>

              <ul className="mt-3 space-y-2">
                {entry.commands.map((command) => (
                  <li key={command} className="flex flex-wrap items-center gap-2 rounded-xl bg-ink/5 px-3 py-2">
                    <code className="min-w-0 flex-1 break-all font-mono text-xs">{command}</code>
                    <button
                      type="button"
                      onClick={() => copy(command)}
                      className="btn-ghost shrink-0 text-xs"
                    >
                      {copied === command ? T.copied[locale] : T.copy[locale]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
