import Link from 'next/link';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/labels';

export const dynamic = 'force-dynamic';

/**
 * Дашборд с прогрессом заполнения. Пустой сайт — главная причина, по которой
 * сад «не пользуется» продуктом, поэтому здесь прямо сказано, чего не хватает.
 */
export default async function TenantAdminHome({ params }: { params: Promise<{ host: string }> }) {
  const ctx = await tenantAdmin((await params).host);

  const [profile, posts, media, documents, staff, groups, menuDays, albums, feedback, lastPosts] =
    await Promise.all([
      prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
      ctx.db.posts.count({ where: { status: 'PUBLISHED' } }),
      ctx.db.media.count(),
      prisma.document.count({ where: { tenantId: ctx.tenantId } }),
      prisma.staffMember.count({ where: { tenantId: ctx.tenantId } }),
      prisma.group.count({ where: { tenantId: ctx.tenantId } }),
      prisma.menuDay.count({ where: { tenantId: ctx.tenantId } }),
      prisma.album.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.feedback.count({ where: { status: 'NEW' } }),
      ctx.db.posts.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    ]);

  const checklist = [
    { done: Boolean(profile?.aboutRu || profile?.aboutKk), label: 'Заполнить «О саде»', href: '/admin/profile' },
    { done: Boolean(profile?.phone && profile?.addressRu), label: 'Указать адрес и телефон', href: '/admin/profile' },
    { done: Boolean(profile?.coverMediaId), label: 'Загрузить обложку главной', href: '/admin/appearance' },
    { done: posts > 0, label: 'Опубликовать первую новость', href: '/admin/posts' },
    { done: albums > 0, label: 'Создать фотоальбом', href: '/admin/gallery' },
    { done: documents > 0, label: 'Добавить документы', href: '/admin/documents' },
    { done: staff > 0, label: 'Добавить педагогов', href: '/admin/staff' },
    { done: groups > 0, label: 'Заполнить группы', href: '/admin/groups' },
    { done: menuDays > 0, label: 'Добавить меню питания', href: '/admin/menu' },
  ];

  const doneCount = checklist.filter((item) => item.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  return (
    <>
      <PageHeader
        title={`Здравствуйте, ${ctx.user.fullName.split(' ')[0] ?? ''}`}
        description="Здесь видно, что уже готово на сайте, а что стоит добавить."
      />

      {ctx.user.mustChangePassword ? (
        <div className="mb-6">
          <Alert tone="warn" title="Смените временный пароль">
            Вы вошли с паролем, который выдал администратор портала.{' '}
            <Link href="/admin/account" className="font-semibold underline">Задать свой пароль →</Link>
          </Alert>
        </div>
      ) : null}

      <section className="card mb-6 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-bold">Заполнено {doneCount} из {checklist.length}</h2>
          <span className="font-display text-2xl font-extrabold text-brand">{percent}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition hover:bg-brand-soft ${
                  item.done ? 'text-muted' : 'font-semibold'
                }`}
              >
                <span aria-hidden>{item.done ? '✅' : '⬜'}</span>
                <span className={item.done ? 'line-through' : ''}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Публикаций" value={posts} />
        <StatCard label="Файлов" value={media} />
        <StatCard label="Новых обращений" value={feedback} />
        <StatCard label="Педагогов" value={staff} />
      </div>

      {lastPosts.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">Последние материалы</h2>
          <div className="card divide-y divide-line">
            {lastPosts.map((post) => (
              <Link key={post.id} href={`/admin/posts/${post.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-brand-soft/40">
                <span className="min-w-0 flex-1 truncate font-semibold">{post.titleRu || post.titleKk}</span>
                <span className={`badge ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {post.status === 'PUBLISHED' ? 'опубликовано' : 'черновик'}
                </span>
                <span className="text-sm text-muted">{formatDate(post.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
