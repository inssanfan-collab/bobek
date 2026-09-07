import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { PALETTES, TEMPLATES } from '@/lib/templates';
import { saveAppearance } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AppearancePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title="Внешний вид" />
        <Alert tone="info">
          Менять шаблон и цвета может администратор сада. Обратитесь к нему или к администратору портала.
        </Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Внешний вид"
        description="Шаблон задаёт композицию главной страницы, палитра — цвета всего сайта."
      />

      <form action={saveAppearance} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />
        <input type="hidden" name="coverMediaId" defaultValue={profile?.coverMediaId ?? ''} />
        <input type="hidden" name="logoMediaId" defaultValue={profile?.logoMediaId ?? ''} />

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">Шаблон</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((template) => (
              <label
                key={template.code}
                className="cursor-pointer rounded-2xl border border-line p-4 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input
                  type="radio"
                  name="templateCode"
                  value={template.code}
                  defaultChecked={ctx.templateCode === template.code}
                  className="sr-only"
                />
                <p className="font-display font-bold">{template.nameRu}</p>
                <p className="mt-1 text-xs text-muted">{template.descriptionRu}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">Палитра</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {PALETTES.map((palette) => (
              <label
                key={palette.code}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input
                  type="radio"
                  name="palette"
                  value={palette.code}
                  defaultChecked={ctx.palette === palette.code}
                  className="sr-only"
                />
                <span className="h-5 w-5 rounded-full" style={{ background: palette.swatch }} aria-hidden />
                {palette.nameRu}
              </label>
            ))}
          </div>
        </fieldset>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Изображения</h2>
          </div>

          <div>
            <label className="field-label" htmlFor="cover">Обложка главной страницы</label>
            {profile?.coverMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${profile.coverMediaId}`} alt="" className="mb-2 h-32 w-full rounded-2xl object-cover" />
            ) : null}
            <input id="cover" name="cover" type="file" accept="image/*" className="field" />
            <p className="field-hint">Горизонтальное фото здания или праздника. Ширина от 1600 пикселей.</p>
          </div>

          <div>
            <label className="field-label" htmlFor="logo">Логотип</label>
            {profile?.logoMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${profile.logoMediaId}`} alt="" className="mb-2 h-20 rounded-2xl object-contain" />
            ) : null}
            <input id="logo" name="logo" type="file" accept="image/*" className="field" />
          </div>
        </section>

        <SubmitButton>Сохранить внешний вид</SubmitButton>
      </form>
    </>
  );
}
