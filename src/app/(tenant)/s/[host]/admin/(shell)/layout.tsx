import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { AdminShell, type NavItem } from '@/components/admin/AdminShell';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/labels';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Админка сада', robots: { index: false } };

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [profile, newFeedback] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    prisma.feedbackMessage.count({ where: { tenantId: ctx.tenantId, status: 'NEW' } }),
  ]);

  const base = '/admin';
  const nav: NavItem[] = [
    { href: base, label: 'Обзор', icon: '📊' },
    { href: `${base}/posts?type=NEWS`, label: 'Новости', icon: '📰' },
    { href: `${base}/posts?type=ANNOUNCEMENT`, label: 'Объявления', icon: '📢' },
    { href: `${base}/gallery`, label: 'Фотогалерея', icon: '📷' },
    { href: `${base}/documents`, label: 'Документы', icon: '📄' },
    { href: `${base}/media`, label: 'Файлы', icon: '🗂' },
    { href: `${base}/staff`, label: 'Педагоги', icon: '👩‍🏫' },
    { href: `${base}/groups`, label: 'Группы', icon: '🧸' },
    { href: `${base}/menu`, label: 'Меню питания', icon: '🍎' },
    { href: `${base}/pages`, label: 'Страницы', icon: '📝' },
    { href: `${base}/sections`, label: 'Разделы меню', icon: '🧭' },
    { href: `${base}/feedback`, label: 'Обращения', icon: '✉️', badge: newFeedback || undefined },
    { href: `${base}/appearance`, label: 'Внешний вид', icon: '🎨' },
    { href: `${base}/profile`, label: 'Паспорт сада', icon: '🏡' },
    { href: `${base}/account`, label: 'Мой пароль', icon: '🔒' },
  ];

  const banner = (
    <>
      {ctx.user.impersonatedBy ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
          Вы вошли как администратор портала. Все действия записываются в журнал.
        </div>
      ) : null}
      {!ctx.subscription.canEdit ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="warn" title="Режим только чтения">
            {ctx.subscription.isGrace
              ? `Подписка истекла ${formatDate(ctx.subscription.periodEnd)}. Сайт работает, но редактирование недоступно. Свяжитесь с администратором портала для продления.`
              : 'Редактирование заблокировано. Свяжитесь с администратором портала.'}
          </Alert>
        </div>
      ) : null}
    </>
  );

  return (
    <AdminShell
      title={profile?.nameRu ?? ctx.tenantSlug}
      subtitle={ctx.user.fullName}
      homeHref="/admin"
      nav={nav}
      banner={banner}
      headerRight={
        <>
          <a href="/" target="_blank" rel="noreferrer" className="btn-secondary text-sm">Мой сайт</a>
          <LogoutButton />
        </>
      }
    >
      {children}
    </AdminShell>
  );
}
