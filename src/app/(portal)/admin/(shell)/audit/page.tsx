import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { formatDateTime } from '@/lib/labels';
import { auditDetails } from '@/lib/audit-details';
import { deviceName } from '@/lib/presence';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Әрекеттер журналы', ru: 'Журнал действий' },
  lead: {
    kk: 'Кірулер, балабақшалар мен материалдардағы өзгерістер: кім, қашан, қай құрылғыдан және нақты не істеді.',
    ru: 'Входы, изменения садов и материалов: кто, когда, с какого устройства и что именно сделал.',
  },
  when: { kk: 'Қашан', ru: 'Когда' },
  who: { kk: 'Кім', ru: 'Кто' },
  action: { kk: 'Әрекет', ru: 'Действие' },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  details: { kk: 'Егжей-тегжейі', ru: 'Детали' },
  prev: { kk: '← Артқа', ru: '← Назад' },
  next: { kk: 'Алға →', ru: 'Вперёд →' },
  pageOf: { kk: '{n}-бет, барлығы {total}', ru: 'Страница {n} из {total}' },
} as const;

const ACTION_LABEL: Record<string, { kk: string; ru: string }> = {
  'auth.login': { kk: 'Кіру', ru: 'Вход' },
  'auth.2fa_enabled': { kk: 'Telegram арқылы кіру қосылды', ru: 'Включён вход с кодом в Telegram' },
  'auth.2fa_disabled': { kk: 'Telegram арқылы кіру өшірілді', ru: 'Отключён вход с кодом в Telegram' },
  'auth.login_failed': { kk: 'Сәтсіз кіру әрекеті', ru: 'Неудачная попытка входа' },
  'auth.logout': { kk: 'Шығу', ru: 'Выход' },
  'auth.password_changed': { kk: 'Құпия сөзді ауыстыру', ru: 'Смена пароля' },
  'tenant.create': { kk: 'Балабақша құрылды', ru: 'Создан сад' },
  'tenant.update': { kk: 'Балабақша өзгертілді', ru: 'Изменён сад' },
  'tenant.status_change': { kk: 'Балабақша мәртебесі өзгертілді', ru: 'Изменён статус сада' },
  'tenant.impersonate': { kk: 'Балабақша атынан кіру', ru: 'Вход под садом' },
  'domain.add': { kk: 'Домен қосылды', ru: 'Добавлен домен' },
  'domain.verify': { kk: 'DNS тексеру', ru: 'Проверка DNS' },
  'domain.delete': { kk: 'Домен жойылды', ru: 'Удалён домен' },
  'domain.set_primary': { kk: 'Негізгі домен ауыстырылды', ru: 'Смена основного домена' },
  'user.create': { kk: 'Пайдаланушы құрылды', ru: 'Создан пользователь' },
  'user.reset_password': { kk: 'Құпия сөз тасталды', ru: 'Сброшен пароль' },
  'user.deactivate': { kk: 'Пайдаланушы өшірілді', ru: 'Пользователь отключён' },
  'user.activate': { kk: 'Пайдаланушы қосылды', ru: 'Пользователь включён' },
  'user.rename': { kk: 'Пайдаланушының аты-жөні өзгертілді', ru: 'Изменено ФИО пользователя' },
  'subscription.extend': { kk: 'Жазылым ұзартылды', ru: 'Продлена подписка' },
  'payment.record': { kk: 'Төлем белгіленді', ru: 'Отмечена оплата' },
  'content.create': { kk: 'Материал құрылды', ru: 'Создан материал' },
  'content.update': { kk: 'Материал өзгертілді', ru: 'Изменён материал' },
  'content.delete': { kk: 'Материал жойылды', ru: 'Удалён материал' },
  'tenant.theme': { kk: 'Тақырып ауыстырылды', ru: 'Сменена тема сайта' },
  'tenant.anketa_import': { kk: 'Сауалнамадан жүктелді', ru: 'Загружена анкета сада' },
  'contract.create': { kk: 'Шарт құрылды', ru: 'Создан договор' },
  'contract.update': { kk: 'Шарт өзгертілді', ru: 'Изменён договор' },
  'settings.update': { kk: 'Деректемелер өзгертілді', ru: 'Изменены реквизиты' },
};

const SENSITIVE = new Set(['user.reset_password', 'tenant.impersonate', 'auth.login_failed', 'tenant.status_change']);

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1);
  const pageSize = 100;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { tenant: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Нынешние названия — для записей журнала до 12.10.2026, где названия ещё не писали.
  const idsOf = (...entities: string[]) =>
    entries.filter((e) => e.entityId && entities.includes(e.entity ?? '')).map((e) => e.entityId!);
  const [posts, media, sections] = await Promise.all([
    prisma.post.findMany({ where: { id: { in: idsOf('post') } }, select: { id: true, titleRu: true, titleKk: true } }),
    prisma.media.findMany({ where: { id: { in: idsOf('media') } }, select: { id: true, origName: true } }),
    prisma.section.findMany({ where: { id: { in: idsOf('section', 'page') } }, select: { id: true, titleRu: true, titleKk: true } }),
  ]);
  const titles = new Map<string, string>([
    ...posts.map((r) => [r.id, (locale === 'kk' ? r.titleKk : r.titleRu) || r.titleRu] as const),
    ...media.map((r) => [r.id, r.origName] as const),
    ...sections.map((r) => [r.id, (locale === 'kk' ? r.titleKk : r.titleRu) || r.titleRu] as const),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">{T.when[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.who[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.action[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.garden[locale]}</th>
              <th className="px-4 py-3 font-semibold">{T.details[locale]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((entry) => (
              <tr key={entry.id} className={SENSITIVE.has(entry.action) ? 'bg-amber-50/60' : ''}>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">{formatDateTime(entry.createdAt, locale)}</td>
                <td className="px-4 py-2.5">
                  <span className="block font-mono">{entry.userLogin ?? '—'}</span>
                  {entry.userAgent ? <span className="block text-xs text-muted">{deviceName(entry.userAgent)}</span> : null}
                </td>
                <td className="px-4 py-2.5 font-semibold">{ACTION_LABEL[entry.action]?.[locale] ?? entry.action}</td>
                <td className="px-4 py-2.5 text-muted">{entry.tenant?.profile?.nameRu ?? entry.tenant?.slug ?? '—'}</td>
                <td className="px-4 py-2.5">
                  {auditDetails(
                    { action: entry.action, entity: entry.entity, meta: entry.meta, currentTitle: entry.entityId ? titles.get(entry.entityId) : null },
                    locale,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {page > 1 ? <a href={`?page=${page - 1}`} className="btn-secondary">{T.prev[locale]}</a> : null}
          <span className="text-muted">{T.pageOf[locale].replace('{n}', String(page)).replace('{total}', String(pages))}</span>
          {page < pages ? <a href={`?page=${page + 1}`} className="btn-secondary">{T.next[locale]}</a> : null}
        </div>
      ) : null}
    </>
  );
}
