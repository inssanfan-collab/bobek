import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { PortalPostForm } from '../PortalPostForm';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Порталдың жаңа жаңалығы', ru: 'Новая новость портала' },
} as const;

export default async function NewPortalPostPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const csrf = await csrfToken();

  return (
    <>
      <PageHeader title={T.title[locale]} />
      <PortalPostForm csrf={csrf} locale={user.locale} />
    </>
  );
}
