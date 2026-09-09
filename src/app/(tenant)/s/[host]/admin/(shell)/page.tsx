import Link from 'next/link';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { statsSummary } from '@/server/stats';

export const dynamic = 'force-dynamic';

const T = {
  greeting: { kk: 'Сәлеметсіз бе, %s', ru: 'Здравствуйте, %s' },
  lead: {
    kk: 'Мұнда сайтта не дайын, ал нені қосқан жөн екені көрінеді.',
    ru: 'Здесь видно, что уже готово на сайте, а что стоит добавить.',
  },
  changePassword: { kk: 'Уақытша құпия сөзді ауыстырыңыз', ru: 'Смените временный пароль' },
  changePasswordHint: {
    kk: 'Сіз портал әкімшісі берген құпия сөзбен кірдіңіз.',
    ru: 'Вы вошли с паролем, который выдал администратор портала.',
  },
  changePasswordLink: { kk: 'Өз құпия сөзімді қою →', ru: 'Задать свой пароль →' },
  progress: { kk: '%2$s ішінен %1$s толтырылды', ru: 'Заполнено %1$s из %2$s' },
  views: { kk: 'Айдағы қаралым', ru: 'Просмотров за месяц' },
  viewsHint: {
    kk: 'толығырақ — «Сайтқа кірулер» бөлімінде',
    ru: 'подробнее — в разделе «Посещаемость»',
  },
  posts: { kk: 'Жарияланымдар', ru: 'Публикаций' },
  feedback: { kk: 'Жаңа өтініштер', ru: 'Новых обращений' },
  files: { kk: 'Файлдар', ru: 'Файлов' },
  latest: { kk: 'Соңғы материалдар', ru: 'Последние материалы' },
  published: { kk: 'жарияланды', ru: 'опубликовано' },
  draft: { kk: 'жоба', ru: 'черновик' },
  todo: {
    about: { kk: '«Балабақша туралы» бөлімін толтыру', ru: 'Заполнить «О саде»' },
    contacts: { kk: 'Мекенжай мен телефонды көрсету', ru: 'Указать адрес и телефон' },
    cover: { kk: 'Басты беттің мұқабасын жүктеу', ru: 'Загрузить обложку главной' },
    firstPost: { kk: 'Алғашқы жаңалықты жариялау', ru: 'Опубликовать первую новость' },
    album: { kk: 'Фотоальбом жасау', ru: 'Создать фотоальбом' },
    documents: { kk: 'Құжаттарды қосу', ru: 'Добавить документы' },
    staff: { kk: 'Педагогтарды қосу', ru: 'Добавить педагогов' },
    groups: { kk: 'Топтарды толтыру', ru: 'Заполнить группы' },
    menu: { kk: 'Тамақтану мәзірін қосу', ru: 'Добавить меню питания' },
  },
} as const;

/**
 * Дашборд с прогрессом заполнения. Пустой сайт — главная причина, по которой
 * сад «не пользуется» продуктом, поэтому здесь прямо сказано, чего не хватает.
 */
export default async function TenantAdminHome({ params }: { params: Promise<{ host: string }> }) {
  const ctx = await tenantAdmin((await params).host);
  const locale = ctx.user.locale;

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

  const stats = await statsSummary(ctx.tenantId, 30);

  const checklist = [
    { done: Boolean(profile?.aboutRu || profile?.aboutKk), label: T.todo.about[locale], href: '/admin/profile' },
    { done: Boolean(profile?.phone && profile?.addressRu), label: T.todo.contacts[locale], href: '/admin/profile' },
    { done: Boolean(profile?.coverMediaId), label: T.todo.cover[locale], href: '/admin/appearance' },
    { done: posts > 0, label: T.todo.firstPost[locale], href: '/admin/posts' },
    { done: albums > 0, label: T.todo.album[locale], href: '/admin/gallery' },
    { done: documents > 0, label: T.todo.documents[locale], href: '/admin/documents' },
    { done: staff > 0, label: T.todo.staff[locale], href: '/admin/staff' },
    { done: groups > 0, label: T.todo.groups[locale], href: '/admin/groups' },
    { done: menuDays > 0, label: T.todo.menu[locale], href: '/admin/menu' },
  ];

  const doneCount = checklist.filter((item) => item.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  return (
    <>
      <PageHeader
        title={T.greeting[locale].replace('%s', ctx.user.fullName.split(' ')[0] ?? '')}
        description={T.lead[locale]}
      />

      {ctx.user.mustChangePassword ? (
        <div className="mb-6">
          <Alert tone="warn" title={T.changePassword[locale]}>
            {T.changePasswordHint[locale]}{' '}
            <Link href="/admin/account" className="font-semibold underline">{T.changePasswordLink[locale]}</Link>
          </Alert>
        </div>
      ) : null}

      <section className="card mb-6 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-bold">
            {T.progress[locale]
              .replace('%1$s', String(doneCount))
              .replace('%2$s', String(checklist.length))}
          </h2>
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
        <StatCard label={T.views[locale]} value={stats.total30} hint={T.viewsHint[locale]} />
        <StatCard label={T.posts[locale]} value={posts} />
        <StatCard label={T.feedback[locale]} value={feedback} />
        <StatCard label={T.files[locale]} value={media} />
      </div>

      {lastPosts.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-bold">{T.latest[locale]}</h2>
          <div className="card divide-y divide-line">
            {lastPosts.map((post) => (
              <Link key={post.id} href={`/admin/posts/${post.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-brand-soft/40">
                <span className="min-w-0 flex-1 truncate font-semibold">{pick(locale, post.titleKk, post.titleRu)}</span>
                <span className={`badge ${post.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {post.status === 'PUBLISHED' ? T.published[locale] : T.draft[locale]}
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
