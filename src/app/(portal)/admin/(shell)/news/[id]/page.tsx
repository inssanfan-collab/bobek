import { notFound } from 'next/navigation';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PortalPostForm } from '../PortalPostForm';

export const dynamic = 'force-dynamic';

export default async function EditPortalPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await params;

  const [post, csrf] = await Promise.all([
    prisma.portalPost.findUnique({ where: { id } }),
    csrfToken(),
  ]);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Редактирование новости" description={post.titleRu} />
      <PortalPostForm csrf={csrf} post={post} />
    </>
  );
}
