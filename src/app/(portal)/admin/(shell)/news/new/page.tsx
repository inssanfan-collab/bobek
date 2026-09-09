import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PortalPostForm } from '../PortalPostForm';

export const dynamic = 'force-dynamic';

export default async function NewPortalPostPage() {
  const user = await requireSuperadmin();
  const csrf = await csrfToken();

  return (
    <>
      <PageHeader title="Новая новость портала" />
      <PortalPostForm csrf={csrf} locale={user.locale} />
    </>
  );
}
