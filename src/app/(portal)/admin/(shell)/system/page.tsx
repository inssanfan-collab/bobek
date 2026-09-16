import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { requireSuperadmin } from '@/server/auth/guards';
import { formatDateTime } from '@/lib/labels';
import { isStale, readSystemReport, reportPath, type CertificateInfo } from '@/server/system/report';
import { Runbook } from './Runbook';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Сервер', ru: 'Сервер' },
  lead: {
    kk: 'Сертификаттар, қызметтер және сервердегі орын. Мәліметтерді таймер 15 минут сайын жинайды.',
    ru: 'Сертификаты, службы и место на сервере. Данные собирает таймер каждые 15 минут.',
  },
  noData: { kk: 'Мәліметтер әзірге жоқ', ru: 'Данных пока нет' },
  noDataText: {
    kk: 'Есеп файлы табылмады. Бұл әзірлеушінің машинасында қалыпты жағдай; сервер бұлай жауап берсе, edusad-system-report.timer таймерін тексеріңіз.',
    ru: 'Файл отчёта не найден. На машине разработчика это нормально; если так отвечает сервер — проверьте таймер edusad-system-report.timer.',
  },
  stale: { kk: 'Мәліметтер ескірген', ru: 'Данные устарели' },
  staleText: {
    kk: 'Соңғы жинақтан бір сағаттан астам уақыт өтті — таймер тоқтап қалуы мүмкін.',
    ru: 'С последнего сбора прошло больше часа — возможно, таймер остановился.',
  },
  collected: { kk: 'Жиналған уақыты', ru: 'Данные собраны' },

  certs: { kk: 'SSL сертификаттары', ru: 'SSL-сертификаты' },
  certsLead: {
    kk: 'Let’s Encrypt сертификаты 90 күнге беріледі. Certbot оны 30 күн қалғанда жаңартады, сондықтан нақты мерзімі — 60-шы күн шамасы.',
    ru: 'Сертификат Let’s Encrypt выдаётся на 90 дней. Certbot обновляет его, когда остаётся меньше 30, то есть примерно на 60-й день.',
  },
  domain: { kk: 'Домендер', ru: 'Домены' },
  left: { kk: 'Қалды', ru: 'Осталось' },
  until: { kk: 'Дейін', ru: 'Действует до' },
  method: { kk: 'Тексеру тәсілі', ru: 'Способ проверки' },
  days: { kk: 'күн', ru: 'дн.' },
  certAlert: { kk: 'Сертификатқа назар аударыңыз', ru: 'Сертификат требует внимания' },
  certAlertText: {
    kk: 'Мерзімі 20 күннен аз қалды, ал жаңарту әлі болмаған. Төмендегі нұсқаулықтан қолмен жаңартуды қараңыз.',
    ru: 'Осталось меньше 20 дней, а обновление так и не прошло. Ниже в справочнике есть команда ручного перевыпуска.',
  },

  renewal: { kk: 'Автоматты жаңарту', ru: 'Автоматическое обновление' },
  timerOn: { kk: 'Таймер қосулы', ru: 'Таймер включён' },
  timerOff: { kk: 'Таймер өшірулі', ru: 'Таймер выключен' },
  schedule: { kk: 'Кестесі', ru: 'Расписание' },
  lastRun: { kk: 'Соңғы рет', ru: 'Последний запуск' },
  nextRun: { kk: 'Келесі рет', ru: 'Следующий запуск' },
  hookOn: { kk: 'Жаңартудан кейін қызметтер сертификатты қайта оқиды', ru: 'После обновления службы перечитывают сертификат' },
  hookOff: { kk: 'Қайта оқу ілмегі жоқ', ru: 'Хук перезагрузки отсутствует' },
  hookOffText: {
    kk: 'Certbot жаңа сертификатты дискіге жазады, ал nginx ескісін жадында ұстайды. Жаңарту келушіге жетпейді.',
    ru: 'Certbot запишет новый сертификат на диск, а nginx оставит в памяти старый. Обновление не доедет до посетителя.',
  },

  services: { kk: 'Қызметтер', ru: 'Службы' },
  running: { kk: 'жұмыста', ru: 'работает' },
  stopped: { kk: 'тоқтаған', ru: 'остановлена' },
  autostart: { kk: 'автоқосу', ru: 'автозапуск' },
  noAutostart: { kk: 'автоқосусыз', ru: 'без автозапуска' },

  disk: { kk: 'Диск', ru: 'Диск' },
  memory: { kk: 'Жедел жады', ru: 'Оперативная память' },
  freeOf: { kk: '%s ГБ-тан бос', ru: 'свободно из %s ГБ' },
  usedMb: { kk: '%s МБ-тан бос', ru: 'свободно из %s МБ' },
  version: { kk: 'Сайттың нұсқасы', ru: 'Версия сайта' },
  diskWarn: { kk: 'Дискіде орын аз', ru: 'На диске мало места' },
  diskWarnText: {
    kk: 'Орын 15%-дан аз қалды. Жүктелген файлдар мен журналдарды тексеріңіз.',
    ru: 'Осталось меньше 15% свободного места. Проверьте загруженные файлы и журналы.',
  },
} as const;

function fill(template: string, value: string | number): string {
  return template.replace('%s', String(value));
}

function certTone(cert: CertificateInfo): string {
  if (cert.daysLeft === null) return 'bg-slate-100 text-slate-700';
  if (cert.daysLeft < 20) return 'bg-red-100 text-red-800';
  if (cert.daysLeft < 30) return 'bg-amber-100 text-amber-900';
  return 'bg-emerald-100 text-emerald-800';
}

export default async function SystemPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const report = await readSystemReport();

  if (!report) {
    return (
      <>
        <PageHeader title={T.title[locale]} description={T.lead[locale]} />
        <Alert tone="warn" title={T.noData[locale]}>
          <p>{T.noDataText[locale]}</p>
          <p className="mt-2 font-mono text-xs">{reportPath()}</p>
        </Alert>
        <Runbook locale={locale} />
      </>
    );
  }

  const alerts = report.certificates.filter((cert) => cert.alert);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {isStale(report) ? (
        <Alert tone="warn" title={T.stale[locale]} className="mb-5">
          {T.staleText[locale]}
        </Alert>
      ) : null}

      {alerts.length > 0 ? (
        <Alert tone="danger" title={T.certAlert[locale]} className="mb-5">
          <p>{T.certAlertText[locale]}</p>
          <ul className="mt-2 list-inside list-disc">
            {alerts.map((cert) => (
              <li key={cert.name}>
                {cert.name} — {cert.daysLeft} {T.days[locale]}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {report.disk.percent >= 85 ? (
        <Alert tone="warn" title={T.diskWarn[locale]} className="mb-5">
          {T.diskWarnText[locale]}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={T.disk[locale]}
          value={`${report.disk.freeGb} ГБ`}
          hint={fill(T.freeOf[locale], report.disk.totalGb)}
        />
        <StatCard
          label={T.memory[locale]}
          value={`${report.memory.freeMb} МБ`}
          hint={fill(T.usedMb[locale], report.memory.totalMb)}
        />
        <StatCard
          label={T.version[locale]}
          value={<span className="font-mono text-base">{report.app.commit.split(' ')[0]}</span>}
          hint={report.app.commit.split(' ').slice(1).join(' ')}
        />
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold">{T.certs[locale]}</h2>
        <p className="mt-1 text-sm text-muted">{T.certsLead[locale]}</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-3 font-semibold">{T.domain[locale]}</th>
                <th className="py-2 pr-3 font-semibold">{T.left[locale]}</th>
                <th className="py-2 pr-3 font-semibold">{T.until[locale]}</th>
                <th className="py-2 font-semibold">{T.method[locale]}</th>
              </tr>
            </thead>
            <tbody>
              {report.certificates.map((cert) => (
                <tr key={cert.name} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-3">
                    {cert.domains.map((domain) => (
                      <span key={domain} className="block font-semibold">{domain}</span>
                    ))}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`badge ${certTone(cert)}`}>
                      {cert.daysLeft ?? '—'} {T.days[locale]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted">
                    {cert.expiresAt ? formatDateTime(new Date(cert.expiresAt), locale) : '—'}
                  </td>
                  <td className="py-2.5 font-mono text-xs text-muted">{cert.method || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="font-display text-lg font-bold">{T.renewal[locale]}</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-muted sm:w-44">certbot.timer</dt>
            <dd>
              <span className={`badge ${report.certbot.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {report.certbot.active ? T.timerOn[locale] : T.timerOff[locale]}
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-muted sm:w-44">{T.schedule[locale]}</dt>
            <dd className="min-w-0 break-words">{report.certbot.schedule}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-muted sm:w-44">{T.lastRun[locale]}</dt>
            <dd className="min-w-0 break-words font-mono text-xs">{report.certbot.lastRun || '—'}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <dt className="shrink-0 text-muted sm:w-44">{T.nextRun[locale]}</dt>
            <dd className="min-w-0 break-words font-mono text-xs">{report.certbot.nextRun || '—'}</dd>
          </div>
        </dl>

        {report.certbot.reloadHook ? (
          <Alert tone="success" className="mt-4">{T.hookOn[locale]}</Alert>
        ) : (
          <Alert tone="danger" title={T.hookOff[locale]} className="mt-4">
            {T.hookOffText[locale]}
          </Alert>
        )}
      </section>

      <section className="card mt-5 p-6">
        <h2 className="font-display text-lg font-bold">{T.services[locale]}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {report.services.map((service) => (
            <li key={service.name} className="flex items-center gap-3 rounded-2xl bg-brand-soft/40 px-4 py-2.5">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${service.active ? 'bg-emerald-500' : 'bg-red-500'}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-sm font-semibold">{service.name}</span>
                <span className="block text-xs text-muted">
                  {service.active ? T.running[locale] : T.stopped[locale]}
                  {' · '}
                  {service.enabled ? T.autostart[locale] : T.noAutostart[locale]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Runbook locale={locale} />

      <p className="mt-5 text-xs text-muted">
        {T.collected[locale]}: {formatDateTime(new Date(report.collectedAt), locale)}
      </p>
    </>
  );
}
