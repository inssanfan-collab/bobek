import { csrfToken } from '@/server/auth/csrf';
import { requireSuperadmin } from '@/server/auth/guards';
import { PageHeader } from '@/components/admin/AdminShell';
import { env } from '@/lib/env';
import { NewTenantForm } from './NewTenantForm';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Балабақша құру', ru: 'Создание детского сада' },
  lead: {
    kk: 'Бес қадам: атауы, мекенжайы, байланыс, сыртқы көрінісі және әкімшісі. Соңында — кіру жаднамасы.',
    ru: 'Пять шагов: название, адрес, контакты, внешний вид и администратор. В конце — памятка доступа.',
  },
} as const;

export default async function NewTenantPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const csrf = await csrfToken();

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />
      <NewTenantForm csrf={csrf} portalDomain={env.portalDomain} locale={locale} />
    </>
  );
}
