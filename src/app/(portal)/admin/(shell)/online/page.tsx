import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { onlineVisitors } from '@/server/stats';
import { pick, type Locale } from '@/lib/i18n';
import { ONLINE_MS, adminPlace, deviceName } from '@/lib/presence';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Онлайн', ru: 'Онлайн' },
  lead: {
    kk: 'Қазір кім әкімші бөлімдерінде және сайттарда. Бет өзі жаңарып тұрады. Жаңарту шығарар алдында қараңыз.',
    ru: 'Кто сейчас в админках и на сайтах. Страница обновляется сама. Смотрите перед выкладкой обновления.',
  },
  free: { kk: 'Әкімші бөлімдерінде ешкім жоқ — жаңартуға болады', ru: 'В админках никого — можно обновлять' },
  busy: { kk: 'Әкімші бөлімдерінде қазір %s адам жұмыс істеп жатыр', ru: 'Сейчас в админках работают: %s' },
  busyHint: {
    kk: 'Жаңарту кезінде ашық беттегі келесі сақтау өтпей қалуы мүмкін — бетті жаңарту керек болады.',
    ru: 'При обновлении у них может не пройти следующее сохранение на открытой странице — придётся обновить страницу.',
  },
  staff: { kk: 'Әкімші бөлімдерінде', ru: 'В админках' },
  nobody: { kk: 'Соңғы 10 минутта ешкім болған жоқ.', ru: 'За последние 10 минут никого не было.' },
  who: { kk: 'Кім', ru: 'Кто' },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  where: { kk: 'Не ашық', ru: 'Что открыто' },
  state: { kk: 'Күйі', ru: 'Состояние' },
  device: { kk: 'Құрылғы', ru: 'Устройство' },
  you: { kk: 'сіз', ru: 'вы' },
  asGarden: { kk: 'балабақша атынан', ru: 'под садом' },
  portal: { kk: 'Портал әкімшісі', ru: 'Админка портала' },
  active: { kk: '🟢 жұмыс істеп жатыр', ru: '🟢 работает' },
  idle: { kk: '🟡 бет ашық, %s мин әрекетсіз', ru: '🟡 вкладка открыта, %s мин без действий' },
  gone: { kk: '⚪ %s мин бұрын болды', ru: '⚪ был %s мин назад' },
  visitors: { kk: 'Сайттарда (соңғы 5 минут)', ru: 'На сайтах (последние 5 минут)' },
  noVisitors: { kk: 'Соңғы 5 минутта сайттарға ешкім кірмеген.', ru: 'За последние 5 минут на сайты никто не заходил.' },
  people: { kk: '%s адам', ru: '%s чел.' },
  visitorsHint: {
    kk: 'Әр түрлі келушілер саны, мекенжайлар сақталмайды. Сайт қайта іске қосылғанда есеп нөлденеді.',
    ru: 'Число разных посетителей, адреса не сохраняются. После перезапуска сайта счёт начинается заново.',
  },
} as const;

const minutesAgo = (date: Date, now: number) => Math.max(1, Math.round((now - date.getTime()) / 60_000));

function stateOf(lastSeenAt: Date, lastActiveAt: Date | null, now: number, locale: Locale): string {
  if (now - lastSeenAt.getTime() > ONLINE_MS) return T.gone[locale].replace('%s', String(minutesAgo(lastSeenAt, now)));
  if (lastActiveAt && now - lastActiveAt.getTime() < 2 * 60_000) return T.active[locale];
  return T.idle[locale].replace('%s', String(minutesAgo(lastActiveAt ?? lastSeenAt, now)));
}

export default async function OnlinePage() {
  const me = await requireSuperadmin();
  const locale = me.locale;
  const now = Date.now();

  const sessions = await prisma.session.findMany({
    where: { lastSeenAt: { gt: new Date(now - 10 * 60_000) }, expiresAt: { gt: new Date(now) } },
    include: { user: { include: { tenant: { include: { profile: { select: { nameKk: true, nameRu: true } } } } } } },
    orderBy: { lastSeenAt: 'desc' },
  });
  const visitors = onlineVisitors(5);
  const tenants = visitors.size
    ? await prisma.tenant.findMany({
        where: { id: { in: [...visitors.keys()] } },
        select: { id: true, slug: true, profile: { select: { nameKk: true, nameRu: true } } },
      })
    : [];

  // Себя не считаем: владелец смотрит эту страницу, ему не мешает собственная выкладка.
  const others = sessions.filter((s) => s.lastSeenAt && now - s.lastSeenAt.getTime() <= ONLINE_MS && s.userId !== me.id && !s.impersonatedBy);

  return (
    <>
      <AutoRefresh seconds={15} />
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {others.length === 0 ? (
        <Alert tone="success" title={T.free[locale]} className="mb-5" />
      ) : (
        <Alert tone="warn" title={T.busy[locale].replace('%s', String(others.length))} className="mb-5">
          {T.busyHint[locale]}
        </Alert>
      )}

      <section className="card mb-5 overflow-x-auto p-6">
        <h2 className="font-display text-lg font-bold">{T.staff[locale]}</h2>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{T.nobody[locale]}</p>
        ) : (
          <table className="mt-3 w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 pr-4 font-semibold">{T.who[locale]}</th>
                <th className="py-2 pr-4 font-semibold">{T.garden[locale]}</th>
                <th className="py-2 pr-4 font-semibold">{T.where[locale]}</th>
                <th className="py-2 pr-4 font-semibold">{T.state[locale]}</th>
                <th className="py-2 font-semibold">{T.device[locale]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sessions.map((session) => {
                const { user } = session;
                const garden = user.tenant ? pick(locale, user.tenant.profile?.nameKk, user.tenant.profile?.nameRu) || user.tenant.slug : T.portal[locale];
                return (
                  <tr key={session.id}>
                    <td className="py-2 pr-4">
                      <span className="font-semibold">{user.fullName}</span>
                      <span className="block text-xs text-muted">
                        {user.login}
                        {user.id === me.id ? ` · ${T.you[locale]}` : ''}
                        {session.impersonatedBy ? ` · ${T.asGarden[locale]}` : ''}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{garden}</td>
                    <td className="py-2 pr-4">{adminPlace(session.lastPath, locale)}</td>
                    <td className="py-2 pr-4">{stateOf(session.lastSeenAt!, session.lastActiveAt, now, locale)}</td>
                    <td className="py-2 text-xs text-muted">{deviceName(session.userAgent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-bold">{T.visitors[locale]}</h2>
        {tenants.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{T.noVisitors[locale]}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {tenants
              .map((tenant) => ({ tenant, count: visitors.get(tenant.id) ?? 0 }))
              .sort((a, b) => b.count - a.count)
              .map(({ tenant, count }) => (
                <li key={tenant.id} className="flex justify-between gap-4 py-2">
                  <span>{pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}</span>
                  <span className="font-semibold">{T.people[locale].replace('%s', String(count))}</span>
                </li>
              ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted">{T.visitorsHint[locale]}</p>
      </section>
    </>
  );
}
