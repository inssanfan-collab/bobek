import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { PortalAdminShell } from '@/components/admin/PortalAdminShell';
import type { PortalNavGroup } from '@/components/admin/PortalNav';
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
  // Короткие подписи для нижней панели на телефоне: там на пункт ~75 px.
  tab: {
    tenants: { kk: 'Бақшалар', ru: 'Сады' },
  },
  groups: {
    gardens: { kk: 'Балабақшалар', ru: 'Сады' },
    content: { kk: 'Мазмұн', ru: 'Контент' },
    system: { kk: 'Жүйе', ru: 'Система' },
  },
  more: { kk: 'Тағы', ru: 'Ещё' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
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
  const g = T.groups;
  // tab — пункт нижней панели на телефоне (там их четыре плюс «Ещё»).
  const groups: PortalNavGroup[] = [
    {
      label: g.gardens[locale],
      items: [
        { href: '/admin', label: n.overview[locale], icon: 'overview', tab: true },
        { href: '/admin/tenants', label: n.tenants[locale], icon: 'gardens', tab: true },
        { href: '/admin/tenants/new', label: n.newTenant[locale], icon: 'plus' },
        { href: '/admin/subscriptions', label: n.subscriptions[locale], icon: 'card' },
        { href: '/admin/leads', label: n.leads[locale], icon: 'inbox', badge: newLeads || undefined, tab: true },
      ],
    },
    {
      label: g.content[locale],
      items: [
        { href: '/admin/news', label: n.news[locale], icon: 'news' },
        // Без счётчика: раньше здесь висело число новых обращений родителей,
        // которых на странице нет, и убрать его отсюда было нельзя. Обращения
        // разбирает сам сад в своей админке.
        { href: '/admin/feed', label: n.feed[locale], icon: 'feed' },
      ],
    },
    {
      label: g.system[locale],
      items: [
        { href: '/admin/online', label: n.online[locale], icon: 'online', badge: online || undefined, tab: true },
        { href: '/admin/notifications', label: n.notifications[locale], icon: 'bell' },
        { href: '/admin/users', label: n.users[locale], icon: 'users' },
        { href: '/admin/audit', label: n.audit[locale], icon: 'log' },
        { href: '/admin/requisites', label: n.requisites[locale], icon: 'bank' },
        { href: '/admin/system', label: n.system[locale], icon: 'server' },
      ],
    },
  ];
  // На панели телефона «Детские сады» не помещаются — там «Сады».
  const tabbed = groups.map((group) => ({
    ...group,
    items: group.items.map((item) => (item.href === '/admin/tenants' ? { ...item, tabLabel: T.tab.tenants[locale] } : item)),
  }));

  return (
    <PortalAdminShell
      title={T.title[locale]}
      subtitle={user.fullName}
      groups={tabbed}
      navLabel={T.navLabel[locale]}
      moreLabel={T.more[locale]}
      closeLabel={T.close[locale]}
      extras={
        <>
          <AdminLocaleSwitch locale={locale} />
          <LogoutButton label={T.logout[locale]} />
        </>
      }
    >
      <AdminPwa />
      {children}
    </PortalAdminShell>
  );
}
