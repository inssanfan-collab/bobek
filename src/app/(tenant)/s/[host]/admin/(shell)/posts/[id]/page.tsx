import { notFound } from 'next/navigation';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PostForm } from '../PostForm';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  editing: { kk: 'Өңдеу', ru: 'Редактирование' },
} as const;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ host: string; id: string }>;
}) {
  const { host, id } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const post = await ctx.db.posts.findFirst({
    where: { id },
    include: { section: true, coverMedia: true },
  });
  if (!post) notFound();

  const [csrf, library] = await Promise.all([
    csrfToken(),
    // Только изображения: обложкой не может быть PDF устава.
    ctx.db.media.findMany({
      where: { mime: { startsWith: 'image/' } },
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: { id: true, origName: true },
    }),
  ]);

  return (
    <>
      <PageHeader title={T.editing[locale]} description={pick(locale, post.titleKk, post.titleRu)} />
      <PostForm
        csrf={csrf}
        host={host}
        section={post.section}
        post={post}
        cover={post.coverMedia}
        library={library}
        canEdit={ctx.canEdit}
        locale={ctx.user.locale}
      />
    </>
  );
}
