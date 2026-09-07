import { csrfToken } from '@/server/auth/csrf';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { env } from '@/lib/env';
import { NewTenantForm } from './NewTenantForm';

export const dynamic = 'force-dynamic';

export default async function NewTenantPage() {
  await requireSuperadmin();
  const csrf = await csrfToken();

  return (
    <>
      <PageHeader
        title="Создание детского сада"
        description="Пять шагов: название, адрес, контакты, внешний вид и администратор. В конце — памятка доступа."
      />
      <NewTenantForm csrf={csrf} portalDomain={env.portalDomain} />
    </>
  );
}
