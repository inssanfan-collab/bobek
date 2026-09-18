import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { env } from '@/lib/env';
import { subscriptionState } from '@/server/subscription';
import {
  formatDate, formatDateTime, formatMoney, KIND, ROLE, STATUS, STATUS_TONE,
} from '@/lib/labels';
import { pick } from '@/lib/i18n';
import {
  addDomain, createContractAction, deleteDomain, impersonate, markContractSigned,
  recordPayment, resetUserPassword, setPrimaryDomain, setTenantStatus, setTenantTheme, verifyDomain,
} from '../actions';
import { findThemeInfo, THEME_CATALOG } from '@/themes/catalog';
import { suggestedPeriod, portalSettings } from '@/server/docs/contract';
import { isPlanCode, PLAN_CODES, PLAN_INFO } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const T = {
  openSite: { kk: 'Сайтты ашу', ru: 'Открыть сайт' },
  docs: { kk: 'Құжаттар', ru: 'Документы' },
  docsLead: {
    kk: 'Шарт, шот және акт — үшеуі бір нөмірмен. Мемлекеттік балабақша осы үшеуінсіз шығынды өткізе алмайды.',
    ru: 'Договор, счёт и акт — все три под одним номером. Без них государственный сад не проведёт расход.',
  },
  newContract: { kk: 'Шарт жасау', ru: 'Сформировать договор' },
  periodStart: { kk: 'Кезеңнің басы', ru: 'Начало периода' },
  periodEnd: { kk: 'Кезеңнің соңы', ru: 'Конец периода' },
  contractFile: { kk: 'Шарт', ru: 'Договор' },
  invoiceFile: { kk: 'Шот', ru: 'Счёт' },
  actFile: { kk: 'Акт', ru: 'Акт' },
  signed: { kk: 'Қол қойылды', ru: 'Подписан' },
  notSigned: { kk: 'Қол қойылмаған', ru: 'Не подписан' },
  actSigned: { kk: 'Акт қабылданды', ru: 'Акт подписан' },
  noRequisites: { kk: 'Деректемелер толтырылмаған', ru: 'Реквизиты не заполнены' },
  noRequisitesText: {
    kk: 'Құжаттарда орындаушының деректемелері бос қалады. «Деректемелер» бөлімінде толтырыңыз.',
    ru: 'В документах останутся пустые реквизиты исполнителя. Заполните их в разделе «Реквизиты».',
  },
  noContracts: { kk: 'Шарт әлі жасалмаған', ru: 'Договоров пока нет' },
  impersonate: { kk: 'Балабақша атынан кіру', ru: 'Войти как сад' },
  statusBlock: { kk: 'Мәртебе және жазылым', ru: 'Статус и подписка' },
  currentStatus: { kk: 'Ағымдағы мәртебе', ru: 'Текущий статус' },
  subscriptionUntil: { kk: 'Жазылым мерзімі', ru: 'Подписка до' },
  plan: { kk: 'Тариф', ru: 'Тариф' },
  byPlan: { kk: 'тариф бойынша', ru: 'по тарифу' },
  amountHint: {
    kk: 'Бос қалдырсаңыз — таңдалған тарифтің бағасы.',
    ru: 'Оставьте пустым — возьмём цену выбранного тарифа.',
  },
  adminMode: { kk: 'Әкімші бөлімінің режимі', ru: 'Режим админки' },
  fullAccess: { kk: 'толық қолжетімділік', ru: 'полный доступ' },
  blocked: { kk: 'тек қарау', ru: 'только просмотр' },
  expired: { kk: 'Жазылым аяқталды', ru: 'Подписка истекла' },
  expiredText: {
    kk: 'Әкімші бөлімі тек қарау режимінде. Ертеңгі тексерісте балабақша тоқтатылады және сайт жабылады. Төлемді төменде белгілесеңіз — бәрі бірден қалпына келеді.',
    ru: 'Админка только на просмотр. На ближайшей утренней проверке сад будет приостановлен, а сайт закрыт. Отметьте оплату ниже — всё сразу вернётся.',
  },
  changeStatus: { kk: 'Мәртебені өзгерту', ru: 'Изменить статус' },
  apply: { kk: 'Қолдану', ru: 'Применить' },
  recordPayment: { kk: 'Төлемді белгілеу', ru: 'Отметить оплату' },
  amount: { kk: 'Сомасы, ₸', ru: 'Сумма, ₸' },
  extendBy: { kk: 'Ұзарту, ай', ru: 'Продлить на, мес.' },
  method: { kk: 'Тәсілі', ru: 'Способ' },
  invoice: { kk: 'Шот / қолма-қол емес', ru: 'Счёт / безнал' },
  cash: { kk: 'Қолма-қол', ru: 'Наличные' },
  invoiceNo: { kk: 'Шот нөмірі', ru: 'Номер счёта' },
  optional: { kk: 'міндетті емес', ru: 'необязательно' },
  savePayment: { kk: 'Төлемді жазу', ru: 'Записать оплату' },
  domains: { kk: 'Домендер', ru: 'Домены' },
  domain: { kk: 'Домен', ru: 'Домен' },
  kind: { kk: 'Түрі', ru: 'Тип' },
  actions: { kk: 'Әрекеттер', ru: 'Действия' },
  primary: { kk: 'негізгі', ru: 'основной' },
  checkDns: { kk: 'DNS тексеру', ru: 'Проверить DNS' },
  theme: { kk: 'Жеке дизайн', ru: 'Индивидуальный дизайн' },
  themeLead: {
    kk: 'Осы балабақша үшін жасалған тақырып. Ол шаблонды алмастырады; өшірсеңіз — балабақша таңдаған шаблон қайтады, деректер өзгермейді.',
    ru: 'Тема, сделанная под этот сад. Она заменяет шаблон; если выключить — вернётся шаблон, который выбрал сад, данные не меняются.',
  },
  themeNone: { kk: 'Жоқ — балабақша шаблоны', ru: 'Нет — шаблон сада' },
  themeCurrent: { kk: 'Қазір', ru: 'Сейчас' },
  themeSave: { kk: 'Қолдану', ru: 'Применить' },
  themeHowTo: {
    kk: 'Жаңа тақырып қалай жасалады — src/themes/README.md.',
    ru: 'Как сделать новую тему — src/themes/README.md.',
  },
  certPending: { kk: 'DNS күтілуде', ru: 'Ждём DNS' },
  certDnsOk: { kk: 'DNS дұрыс — сертификат шығарылуда', ru: 'DNS в порядке — выпускаем сертификат' },
  certDnsOkHint: { kk: 'Әдетте 10 минутқа дейін.', ru: 'Обычно до 10 минут.' },
  certActive: { kk: 'Жұмыс істейді', ru: 'Работает' },
  certUntil: { kk: 'сертификат мерзімі', ru: 'сертификат до' },
  certFailed: { kk: 'Қате', ru: 'Ошибка' },
  domainsLead: {
    kk: 'Портал субдомені өздігінен берілді. Жеке доменді (.kz немесе edu.kz) балабақша өзі сатып алады — оны осында қосыңыз, қалғанын сервер өзі жасайды. www.<домен> да өздігінен қосылады, егер оның A-жазбасы серверге бағытталса.',
    ru: 'Поддомен на портале выдан автоматически. Собственный домен (.kz или edu.kz) сад покупает сам — добавьте его здесь, остальное сервер сделает сам. www.<домен> тоже подключится, если у него есть A-запись на сервер.',
  },
  remove: { kk: 'Жою', ru: 'Удалить' },
  makePrimary: { kk: 'Негізгі ету', ru: 'Сделать основным' },
  ownDomain: { kk: 'Балабақшаның жеке домені (.kz немесе edu.kz)', ru: 'Собственный домен сада (.kz или edu.kz)' },
  ownDomainHint: {
    kk: 'Мысалы nursat.kz немесе nursat.edu.kz — http:// және www өздігінен алынып тасталады. Тіркеушіде A-жазба %ip% көрсетуі керек. Сертификат пен сайт 10 минут ішінде өздігінен қосылады.',
    ru: 'Например nursat.kz или nursat.edu.kz — http:// и www уберём сами. У регистратора нужна A-запись на %ip%. Сертификат и сайт подключатся сами в течение 10 минут.',
  },
  addDomain: { kk: 'Домен қосу', ru: 'Добавить домен' },
  users: { kk: 'Балабақша пайдаланушылары', ru: 'Пользователи сада' },
  fullName: { kk: 'Аты-жөні', ru: 'ФИО' },
  login: { kk: 'Логин', ru: 'Логин' },
  role: { kk: 'Рөлі', ru: 'Роль' },
  lastLogin: { kk: 'Соңғы кіру', ru: 'Последний вход' },
  password: { kk: 'Құпия сөз', ru: 'Пароль' },
  disabled: { kk: 'өшірілген', ru: 'отключён' },
  reset: { kk: 'Тастау', ru: 'Сбросить' },
  content: { kk: 'Толтырылуы', ru: 'Наполнение' },
  noSubscription: { kk: 'ресімделмеген', ru: 'не оформлена' },
  never: { kk: 'бірде-бір рет', ru: 'ни разу' },
  posts: { kk: 'Жарияланым', ru: 'Публикаций' },
  files: { kk: 'Файл', ru: 'Файлов' },
  documents: { kk: 'Құжат', ru: 'Документов' },
  feedback: { kk: 'Өтініш', ru: 'Обращений' },
} as const;

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperadmin();
  const locale = admin.locale;
  const { id } = await params;

  const [tenant, csrf] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
      include: {
        profile: true,
        domains: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        users: { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' }, take: 10 },
        _count: { select: { posts: true, media: true, documents: true, feedback: true } },
      },
    }),
    csrfToken(),
  ]);

  if (!tenant) notFound();

  const subscription = await subscriptionState(tenant.id);
  const currentTheme = findThemeInfo(tenant.themeCode);
  const primary = tenant.domains.find((d) => d.isPrimary) ?? tenant.domains[0];

  const [contracts, period, settings] = await Promise.all([
    prisma.contract.findMany({ where: { tenantId: tenant.id }, orderBy: { issuedAt: 'desc' } }),
    suggestedPeriod(tenant.id),
    portalSettings(),
  ]);
  // Без реквизитов документы печатаются с пустыми полями — предупреждаем заранее.
  const requisitesReady = Boolean(settings.companyNameRu && settings.iban && settings.taxId);

  return (
    <>
      <PageHeader
        title={pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}
        description={tenant.profile?.kind ? KIND[tenant.profile.kind][locale] : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            {primary ? (
              <a href={`https://${primary.host}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                {T.openSite[locale]}
              </a>
            ) : null}
            <form action={impersonate}>
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <input type="hidden" name="tenantId" value={tenant.id} />
              <button type="submit" className="btn-primary">{T.impersonate[locale]}</button>
            </form>
          </div>
        }
      />

      <Alert tone="info">
        Вход «под садом» фиксируется в журнале действий вместе с вашим логином.
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{T.statusBlock[locale]}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">{T.currentStatus[locale]}</span>
              <span className={`badge ${STATUS_TONE[tenant.status]}`}>{STATUS[tenant.status][locale]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">{T.plan[locale]}</span>
              <strong>{subscription.plan ? PLAN_INFO[subscription.plan].name[locale] : '—'}</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">{T.subscriptionUntil[locale]}</span>
              <strong>{subscription.periodEnd ? formatDate(subscription.periodEnd, locale) : T.noSubscription[locale]}</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-40 text-muted">{T.adminMode[locale]}</span>
              <span>
                {subscription.canEdit && tenant.status !== 'SUSPENDED' ? T.fullAccess[locale] : T.blocked[locale]}
              </span>
            </div>
          </div>

          {/* Срок вышел, а утренняя проверка ещё не приостановила сад. */}
          {subscription.isExpired && tenant.status === 'ACTIVE' ? (
            <div className="mt-4">
              <Alert tone="warn" title={T.expired[locale]}>
                {T.expiredText[locale]}
              </Alert>
            </div>
          ) : null}

          <form action={setTenantStatus} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div>
              <label className="field-label" htmlFor="status">{T.changeStatus[locale]}</label>
              <select id="status" name="status" defaultValue={tenant.status} className="field">
                {Object.entries(STATUS).map(([value, phrase]) => (
                  <option key={value} value={value}>{phrase[locale]}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary">{T.apply[locale]}</button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{T.recordPayment[locale]}</h2>
          <p className="mt-1 text-sm text-muted">
            Оплата продлевает подписку и снимает приостановку, если она была.
          </p>
          <form action={recordPayment} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div>
              <label className="field-label" htmlFor="paymentPlan">{T.plan[locale]}</label>
              <select id="paymentPlan" name="plan" className="field" defaultValue={subscription.plan ?? 'BASIC'}>
                {PLAN_CODES.map((code) => (
                  <option key={code} value={code}>
                    {PLAN_INFO[code].name[locale]} — {formatMoney(env.planPrices[code])}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="amount">{T.amount[locale]}</label>
              <input id="amount" name="amount" type="number" min={1} placeholder={T.byPlan[locale]} className="field" />
              <p className="mt-1 text-xs text-muted">{T.amountHint[locale]}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="months">{T.extendBy[locale]}</label>
              <input id="months" name="months" type="number" min={1} max={36} defaultValue={12} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="method">{T.method[locale]}</label>
              <select id="method" name="method" className="field" defaultValue="kaspi">
                <option value="kaspi">Kaspi</option>
                <option value="invoice">{T.invoice[locale]}</option>
                <option value="cash">{T.cash[locale]}</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="invoiceNo">{T.invoiceNo[locale]}</label>
              <input id="invoiceNo" name="invoiceNo" className="field" placeholder={T.optional[locale]} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">{T.savePayment[locale]}</button>
            </div>
          </form>

          {tenant.payments.length > 0 ? (
            <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
              {tenant.payments.map((payment) => (
                <li key={payment.id} className="flex justify-between gap-3">
                  <span className="text-muted">{formatDate(payment.paidAt, locale)}</span>
                  <span className="font-semibold">{formatMoney(payment.amount)}</span>
                  <span className="text-muted">{payment.method}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.docs[locale]}</h2>
          <p className="mt-1 text-sm text-muted">{T.docsLead[locale]}</p>

          {requisitesReady ? null : (
            <Alert tone="warn" title={T.noRequisites[locale]} className="mt-4">
              <p>{T.noRequisitesText[locale]}</p>
              <Link href="/admin/requisites" className="mt-2 inline-block font-semibold underline">
                /admin/requisites
              </Link>
            </Alert>
          )}

          <form action={createContractAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div>
              <label className="field-label" htmlFor="contractPlan">{T.plan[locale]}</label>
              <select id="contractPlan" name="plan" className="field" defaultValue={subscription.plan ?? 'BASIC'}>
                {PLAN_CODES.map((code) => (
                  <option key={code} value={code}>
                    {PLAN_INFO[code].name[locale]} — {formatMoney(env.planPrices[code])}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="periodStart">{T.periodStart[locale]}</label>
              <input
                id="periodStart"
                name="periodStart"
                type="date"
                defaultValue={period.start.toISOString().slice(0, 10)}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="periodEnd">{T.periodEnd[locale]}</label>
              <input
                id="periodEnd"
                name="periodEnd"
                type="date"
                defaultValue={period.end.toISOString().slice(0, 10)}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="contractAmount">{T.amount[locale]}</label>
              <input
                id="contractAmount"
                name="amount"
                type="number"
                min={1}
                placeholder={T.byPlan[locale]}
                className="field"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">{T.newContract[locale]}</button>
            </div>
          </form>

          {contracts.length === 0 ? (
            <p className="mt-5 border-t border-line pt-4 text-sm text-muted">{T.noContracts[locale]}</p>
          ) : (
            <ul className="mt-5 space-y-3 border-t border-line pt-4">
              {contracts.map((contract) => (
                <li key={contract.id} className="rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-base font-bold">{contract.number}</span>
                    <span className="text-sm text-muted">
                      {formatDate(contract.periodStart, locale)} — {formatDate(contract.periodEnd, locale)}
                    </span>
                    <span className="text-sm font-semibold">{formatMoney(contract.amount)}</span>
                    <span className="badge bg-slate-100 text-xs text-slate-700">
                      {PLAN_INFO[isPlanCode(contract.plan) ? contract.plan : 'BASIC'].name[locale]}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a href={`/admin/contracts/${contract.id}/contract`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                      {T.contractFile[locale]} PDF
                    </a>
                    <a href={`/admin/contracts/${contract.id}/invoice`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                      {T.invoiceFile[locale]} PDF
                    </a>
                    <a href={`/admin/contracts/${contract.id}/act`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                      {T.actFile[locale]} PDF
                    </a>

                    <form action={markContractSigned} className="inline">
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="contractId" value={contract.id} />
                      <input type="hidden" name="field" value="signedAt" />
                      <button type="submit" className={`badge ${contract.signedAt ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {contract.signedAt ? `${T.signed[locale]}: ${formatDate(contract.signedAt, locale)}` : T.notSigned[locale]}
                      </button>
                    </form>

                    <form action={markContractSigned} className="inline">
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="contractId" value={contract.id} />
                      <input type="hidden" name="field" value="actSignedAt" />
                      <button type="submit" className={`badge ${contract.actSignedAt ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {contract.actSignedAt ? `${T.actSigned[locale]}: ${formatDate(contract.actSignedAt, locale)}` : T.actFile[locale]}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.domains[locale]}</h2>
          <p className="mt-1 text-sm text-muted">
            {T.domainsLead[locale]}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">{T.domain[locale]}</th>
                  <th className="py-2 pr-4 font-semibold">{T.kind[locale]}</th>
                  <th className="py-2 pr-4 font-semibold">DNS / сертификат</th>
                  <th className="py-2 font-semibold">{T.actions[locale]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenant.domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="py-3 pr-4">
                      <a href={`https://${domain.host}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
                        {domain.host}
                      </a>
                      {domain.isPrimary ? <span className="badge ml-2 bg-brand-soft text-brand-ink">{T.primary[locale]}</span> : null}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {domain.type === 'SUBDOMAIN' ? 'поддомен портала' : 'домен сада'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        domain.certStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : domain.certStatus === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {domain.certStatus === 'ACTIVE'
                          ? T.certActive[locale]
                          : domain.certStatus === 'DNS_OK'
                            ? T.certDnsOk[locale]
                            : domain.certStatus === 'FAILED'
                              ? T.certFailed[locale]
                              : T.certPending[locale]}
                      </span>
                      {domain.certStatus === 'ACTIVE' && domain.certExpiresAt ? (
                        <p className="mt-1 text-xs text-muted">{T.certUntil[locale]} {formatDate(domain.certExpiresAt, locale)}</p>
                      ) : null}
                      {domain.certStatus === 'DNS_OK' && !domain.lastError ? (
                        <p className="mt-1 text-xs text-muted">{T.certDnsOkHint[locale]}</p>
                      ) : null}
                      {domain.lastError ? <p className="mt-1 max-w-md break-words text-xs text-muted">{domain.lastError}</p> : null}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {domain.type === 'CUSTOM' ? (
                          <>
                            <form action={verifyDomain}>
                              <input type="hidden" name={CSRF_FIELD} value={csrf} />
                              <input type="hidden" name="domainId" value={domain.id} />
                              <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">{T.checkDns[locale]}</button>
                            </form>
                            <form action={deleteDomain}>
                              <input type="hidden" name={CSRF_FIELD} value={csrf} />
                              <input type="hidden" name="domainId" value={domain.id} />
                              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">{T.remove[locale]}</button>
                            </form>
                          </>
                        ) : null}
                        {!domain.isPrimary && domain.certStatus === 'ACTIVE' ? (
                          <form action={setPrimaryDomain}>
                            <input type="hidden" name={CSRF_FIELD} value={csrf} />
                            <input type="hidden" name="domainId" value={domain.id} />
                            <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">{T.makePrimary[locale]}</button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={addDomain} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div className="min-w-64 flex-1">
              <label className="field-label" htmlFor="host">{T.ownDomain[locale]}</label>
              <input id="host" name="host" className="field" placeholder="nursat.kz" />
              <p className="field-hint">
                {T.ownDomainHint[locale].replace('%ip%', process.env.SERVER_IPV4?.trim() || 'IP сервера')}
              </p>
            </div>
            <button type="submit" className="btn-secondary">{T.addDomain[locale]}</button>
          </form>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.theme[locale]}</h2>
          <p className="mt-1 text-sm text-muted">{T.themeLead[locale]}</p>
          <p className="mt-3 text-sm">
            {T.themeCurrent[locale]}:{' '}
            <strong>{currentTheme ? pick(locale, currentTheme.nameKk, currentTheme.nameRu) : T.themeNone[locale]}</strong>
          </p>
          <form action={setTenantTheme} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="tenantId" value={tenant.id} />
            <div className="min-w-64 flex-1">
              <label className="field-label" htmlFor="themeCode">{T.theme[locale]}</label>
              <select id="themeCode" name="themeCode" defaultValue={tenant.themeCode ?? ''} className="field">
                <option value="">{T.themeNone[locale]}</option>
                {THEME_CATALOG.map((theme) => (
                  <option key={theme.code} value={theme.code}>
                    {pick(locale, theme.nameKk, theme.nameRu)} — {theme.noteRu}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary">{T.themeSave[locale]}</button>
          </form>
          <p className="field-hint mt-2">{T.themeHowTo[locale]}</p>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.users[locale]}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-muted">
                <tr>
                  <th className="py-2 pr-4 font-semibold">{T.fullName[locale]}</th>
                  <th className="py-2 pr-4 font-semibold">{T.login[locale]}</th>
                  <th className="py-2 pr-4 font-semibold">{T.role[locale]}</th>
                  <th className="py-2 pr-4 font-semibold">{T.lastLogin[locale]}</th>
                  <th className="py-2 font-semibold">{T.password[locale]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenant.users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4 font-semibold">
                      {user.fullName}
                      {!user.isActive ? <span className="badge ml-2 bg-red-100 text-red-800">{T.disabled[locale]}</span> : null}
                    </td>
                    <td className="py-3 pr-4 font-mono">{user.login}</td>
                    <td className="py-3 pr-4 text-muted">{ROLE[user.role][locale]}</td>
                    <td className="py-3 pr-4 text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt, locale) : T.never[locale]}</td>
                    <td className="py-3">
                      <form action={resetUserPassword}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">{T.reset[locale]}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href={`/admin/users?tenantId=${tenant.id}`} className="btn-ghost mt-4">
            Добавить пользователя →
          </Link>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.content[locale]}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label={T.posts[locale]} value={tenant._count.posts} />
            <Metric label={T.files[locale]} value={tenant._count.media} />
            <Metric label={T.documents[locale]} value={tenant._count.documents} />
            <Metric label={T.feedback[locale]} value={tenant._count.feedback} />
          </dl>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-brand-soft/50 p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-2xl font-extrabold">{value}</dd>
    </div>
  );
}
