import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { AdminShell, type NavItem } from '@/components/admin/AdminShell';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Админка портала', robots: { index: false } };

export default async function PortalAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperadmin();

  const [newLeads, newFeedback] = await Promise.all([
    prisma.lead.count({ where: { isHandled: false } }),
    prisma.feedbackMessage.count({ where: { status: 'NEW' } }),
  ]);

  const nav: NavItem[] = [
    { href: '/admin', label: 'Обзор', icon: '📊' },
    { href: '/admin/tenants', label: 'Детские сады', icon: '🏡' },
    { href: '/admin/tenants/new', label: 'Создать сад', icon: '➕' },
    { href: '/admin/users', label: 'Пользователи', icon: '🔑' },
    { href: '/admin/subscriptions', label: 'Подписки', icon: '💳' },
    { href: '/admin/leads', label: 'Заявки', icon: '📥', badge: newLeads || undefined },
    { href: '/admin/news', label: 'Новости портала', icon: '✍️' },
    { href: '/admin/feed', label: 'Публикации садов', icon: '📰', badge: newFeedback || undefined },
    { href: '/admin/audit', label: 'Журнал действий', icon: '🧾' },
  ];

  return (
    <AdminShell
      title="Админка портала"
      subtitle={user.fullName}
      homeHref="/admin"
      nav={nav}
      headerRight={<LogoutButton />}
    >
      {children}
    </AdminShell>
  );
}
