import { notFound } from 'next/navigation';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PostForm } from '../PostForm';
import type { SectionType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function NewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);

  const type = (search.type === 'ANNOUNCEMENT' ? 'ANNOUNCEMENT' : 'NEWS') as SectionType;
  const section = await ctx.db.sections.findFirst({ where: { type } });
  if (!section) notFound();

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
      <PageHeader title={type === 'NEWS' ? 'Новая новость' : 'Новое объявление'} />
      <PostForm csrf={csrf} host={host} section={section} library={library} canEdit={ctx.canEdit} />
    </>
  );
}
