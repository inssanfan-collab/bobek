import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { AdminShell, type NavItem } from '@/components/admin/AdminShell';
import { AdminLocaleSwitch } from '@/components/admin/AdminLocaleSwitch';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { AdminPwa } from '@/components/admin/AdminPwa';
import { ONLINE_MS } from '@/lib/presence';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Админка портала', robots: { index: false } };

const T = {
  title: { kk: 'Портал әкімшісі', ru: 'Админка портала' },
  navLabel: { kk: 'Әкімші бөлімдері', ru: 'Разделы админки' },
  logout: { kk: 'Шығу', ru: 'Выйти' },
  nav: {
    overview: { kk: 'Шолу', ru: 'Обзор' },
    tenants: { kk: 'Балабақшалар', ru: 'Детские сады' },
    newTenant: { kk: 'Балабақша құру', ru: 'Создать сад' },
    users: { kk: 'Пайдаланушылар', ru: 'Пользователи' },
    subscriptions: { kk: 'Жазылымдар', ru: 'Подписки' },
    leads: { kk: 'Өтінімдер', ru: 'Заявки' },
    news: { kk: 'Портал жаңалықтары', ru: 'Новости портала' },
    feed: { kk: 'Балабақшалардың жарияланымдары', ru: 'Публикации садов' },
    audit: { kk: 'Әрекеттер журналы', ru: 'Журнал действий' },
    requisites: { kk: 'Деректемелер', ru: 'Реквизиты' },
    system: { kk: 'Сервер', ru: 'Сервер' },
    notifications: { kk: 'Хабарламалар', ru: 'Уведомления' },
    online: { kk: 'Онлайн', ru: 'Онлайн' },
  },
} as const;

export default async function PortalAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperadmin();
  const locale = user.locale;

  // «Онлайн» со счётчиком: сколько человек, кроме вас, сейчас в админках.
  const [newLeads, online] = await Promise.all([
    prisma.lead.count({ where: { isHandled: false } }),
    prisma.session.count({
      where: { lastSeenAt: { gt: new Date(Date.now() - ONLINE_MS) }, userId: { not: user.id }, impersonatedBy: null },
    }),
  ]);

  const n = T.nav;
  const nav: NavItem[] = [
    { href: '/admin', label: n.overview[locale], icon: '📊' },
    { href: '/admin/tenants', label: n.tenants[locale], icon: '🏡' },
    { href: '/admin/tenants/new', label: n.newTenant[locale], icon: '➕' },
    { href: '/admin/users', label: n.users[locale], icon: '🔑' },
    { href: '/admin/subscriptions', label: n.subscriptions[locale], icon: '💳' },
    { href: '/admin/leads', label: n.leads[locale], icon: '📥', badge: newLeads || undefined },
    { href: '/admin/news', label: n.news[locale], icon: '✍️' },
    // Без счётчика: раньше здесь висело число новых обращений родителей,
    // которых на странице нет, и убрать его отсюда было нельзя. Обращения
    // разбирает сам сад в своей админке.
    { href: '/admin/feed', label: n.feed[locale], icon: '📰' },
    { href: '/admin/audit', label: n.audit[locale], icon: '🧾' },
    { href: '/admin/requisites', label: n.requisites[locale], icon: '🏦' },
    { href: '/admin/system', label: n.system[locale], icon: '🖥️' },
    { href: '/admin/online', label: n.online[locale], icon: '🟢', badge: online || undefined },
    { href: '/admin/notifications', label: n.notifications[locale], icon: '🔔' },
  ];

  return (
    <AdminShell
      title={T.title[locale]}
      subtitle={user.fullName}
      homeHref="/admin"
      nav={nav}
      navLabel={T.navLabel[locale]}
      headerRight={
        <>
          <AdminLocaleSwitch locale={locale} />
          <LogoutButton label={T.logout[locale]} />
        </>
      }
    >
      <AdminPwa />
      {children}
    </AdminShell>
  );
}
