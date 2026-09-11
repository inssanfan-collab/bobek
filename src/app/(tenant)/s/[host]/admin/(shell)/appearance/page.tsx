import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { PALETTES, PATTERNS, TEMPLATES } from '@/lib/templates';
import { pick } from '@/lib/i18n';
import { saveAppearance } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Сыртқы көрінісі', ru: 'Внешний вид' },
  lead: {
    kk: 'Үлгі басты беттің құрылымын, палитра бүкіл сайттың түстерін белгілейді.',
    ru: 'Шаблон задаёт композицию главной страницы, палитра — цвета всего сайта.',
  },
  onlyAdmin: {
    kk: 'Үлгі мен түстерді балабақша әкімшісі өзгерте алады. Оған немесе портал әкімшісіне хабарласыңыз.',
    ru: 'Менять шаблон и цвета может администратор сада. Обратитесь к нему или к администратору портала.',
  },
  template: { kk: 'Үлгі', ru: 'Шаблон' },
  pattern: { kk: 'Фон өрнегі', ru: 'Узор фона' },
  patternHint: {
    kk: 'Өрнек палитра түсімен боялады, сондықтан кез келген түспен үйлеседі.',
    ru: 'Узор красится цветом палитры, поэтому сочетается с любой гаммой.',
  },
  palette: { kk: 'Палитра', ru: 'Палитра' },
  images: { kk: 'Суреттер', ru: 'Изображения' },
  cover: { kk: 'Басты беттің мұқабасы', ru: 'Обложка главной страницы' },
  coverHint: {
    kk: 'Ғимараттың немесе мерекенің көлденең фотосы. Ені 1600 пикселден бастап.',
    ru: 'Горизонтальное фото здания или праздника. Ширина от 1600 пикселей.',
  },
  logo: { kk: 'Логотип', ru: 'Логотип' },
  save: { kk: 'Сыртқы көріністі сақтау', ru: 'Сохранить внешний вид' },
} as const;

export default async function AppearancePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title={T.title[locale]} />
        <Alert tone="info">{T.onlyAdmin[locale]}</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <form action={saveAppearance} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />
        <input type="hidden" name="coverMediaId" defaultValue={profile?.coverMediaId ?? ''} />
        <input type="hidden" name="logoMediaId" defaultValue={profile?.logoMediaId ?? ''} />

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.template[locale]}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="font-display font-bold">{pick(locale, template.nameKk, template.nameRu)}</p>
                <p className="mt-1 text-xs text-muted">{pick(locale, template.descriptionKk, template.descriptionRu)}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.palette[locale]}</legend>
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
                {pick(locale, palette.nameKk, palette.nameRu)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.pattern[locale]}</legend>
          <p className="mt-1 text-sm text-muted">{T.patternHint[locale]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PATTERNS.map((item) => (
              <label
                key={item.code}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input
                  type="radio"
                  name="pattern"
                  value={item.code}
                  defaultChecked={(ctx.pattern || 'none') === item.code}
                  className="sr-only"
                />
                {pick(locale, item.nameKk, item.nameRu)}
              </label>
            ))}
          </div>
        </fieldset>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.images[locale]}</h2>
          </div>

          <div>
            <label className="field-label" htmlFor="cover">{T.cover[locale]}</label>
            {profile?.coverMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${profile.coverMediaId}`} alt="" className="mb-2 h-32 w-full rounded-2xl object-cover" />
            ) : null}
            <input id="cover" name="cover" type="file" accept="image/*" className="field" />
            <p className="field-hint">{T.coverHint[locale]}</p>
          </div>

          <div>
            <label className="field-label" htmlFor="logo">{T.logo[locale]}</label>
            {profile?.logoMediaId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${profile.logoMediaId}`} alt="" className="mb-2 h-20 rounded-2xl object-contain" />
            ) : null}
            <input id="logo" name="logo" type="file" accept="image/*" className="field" />
          </div>
        </section>

        <SubmitButton>{T.save[locale]}</SubmitButton>
      </form>
    </>
  );
}
