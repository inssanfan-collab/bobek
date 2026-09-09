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
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  bodyLabel: { kk: 'Беттің мәтіні', ru: 'Текст страницы' },
  seoLabel: { kk: 'Іздеу жүйелеріне арналған сипаттама', ru: 'Описание для поисковиков' },
  seoHint: {
    kk: 'Бір-екі сөйлем. Іздеу нәтижелерінде көрсетіледі.',
    ru: 'Одно-два предложения. Показывается в результатах поиска.',
  },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  cancel: { kk: 'Болдырмау', ru: 'Отмена' },
} as const;

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
  const locale = ctx.user.locale;
  const meta = sectionMeta(section.type, section.slug);

  return (
    <>
      <PageHeader title={pick(locale, section.titleKk, section.titleRu)} description={pick(locale, meta?.hintKk, meta?.hintRu)} />

      <ActionForm action={savePage} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />
        <input type="hidden" name="sectionId" value={section.id} />

        <section className="card p-6">
          <BilingualField
            label={T.bodyLabel[locale]}
            ru={<RichText name="bodyRu" defaultValue={section.page?.bodyRu ?? ''} placeholder="Расскажите о саде…" disabled={!ctx.canEdit} locale={ctx.user.locale} />}
            kk={<RichText name="bodyKk" defaultValue={section.page?.bodyKk ?? ''} placeholder="Балабақша туралы жазыңыз…" disabled={!ctx.canEdit} locale={ctx.user.locale} />}
          />
        </section>

        <section className="card p-6">
          <BilingualField
            label={T.seoLabel[locale]}
            hint={T.seoHint[locale]}
            ru={<textarea name="seoDescRu" rows={2} defaultValue={section.page?.seoDescRu ?? ''} className="field" />}
            kk={<textarea name="seoDescKk" rows={2} defaultValue={section.page?.seoDescKk ?? ''} className="field" />}
          />
        </section>

        <div className="flex gap-3">
          <SubmitButton>{T.save[locale]}</SubmitButton>
          <Link href="/admin/pages" className="btn-secondary">{T.cancel[locale]}</Link>
        </div>
      </ActionForm>
    </>
  );
}
