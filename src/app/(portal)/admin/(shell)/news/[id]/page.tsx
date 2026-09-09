import { notFound } from 'next/navigation';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PortalPostForm } from '../PortalPostForm';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Жаңалықты өңдеу', ru: 'Редактирование новости' },
} as const;

export default async function EditPortalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const { id } = await params;

  const [post, csrf] = await Promise.all([
    prisma.portalPost.findUnique({ where: { id } }),
    csrfToken(),
  ]);
  if (!post) notFound();

  return (
    <>
      <PageHeader title={T.title[locale]} description={pick(locale, post.titleKk, post.titleRu)} />
      <PortalPostForm csrf={csrf} post={post} locale={user.locale} />
    </>
  );
}
