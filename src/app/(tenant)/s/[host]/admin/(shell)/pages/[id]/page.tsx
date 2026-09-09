import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { RichText } from '@/components/admin/RichText';
import { BilingualField } from '@/components/admin/BilingualField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { sectionMeta } from '@/lib/sections';
import { ActionForm } from '@/components/ActionForm';
import { savePage } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ host: string; id: string }>;
}) {
  const { host, id } = await params;
  const ctx = await tenantAdmin(host);

  const section = await ctx.db.sections.findFirst({ where: { id }, include: { page: true } });
  if (!section) notFound();

  const csrf = await csrfToken();
  const meta = sectionMeta(section.type, section.slug);

  return (
    <>
      <PageHeader title={section.titleRu} description={meta?.hintRu} />

      <ActionForm action={savePage} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />
        <input type="hidden" name="sectionId" value={section.id} />

        <section className="card p-6">
          <BilingualField
            label="Текст страницы"
            ru={<RichText name="bodyRu" defaultValue={section.page?.bodyRu ?? ''} placeholder="Расскажите о саде…" disabled={!ctx.canEdit} locale={ctx.user.locale} />}
            kk={<RichText name="bodyKk" defaultValue={section.page?.bodyKk ?? ''} placeholder="Балабақша туралы жазыңыз…" disabled={!ctx.canEdit} locale={ctx.user.locale} />}
          />
        </section>

        <section className="card p-6">
          <BilingualField
            label="Описание для поисковиков"
            hint="Одно-два предложения. Показывается в результатах поиска."
            ru={<textarea name="seoDescRu" rows={2} defaultValue={section.page?.seoDescRu ?? ''} className="field" />}
            kk={<textarea name="seoDescKk" rows={2} defaultValue={section.page?.seoDescKk ?? ''} className="field" />}
          />
        </section>

        <div className="flex gap-3">
          <SubmitButton>Сохранить</SubmitButton>
          <Link href="/admin/pages" className="btn-secondary">Отмена</Link>
        </div>
      </ActionForm>
    </>
  );
}
