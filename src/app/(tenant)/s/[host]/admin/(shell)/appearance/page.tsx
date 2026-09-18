import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { findThemeInfo } from '@/themes/catalog';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { COVER_FOCUS, PALETTES, PATTERNS, TEMPLATES } from '@/lib/templates';
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
  focus: { kk: 'Мұқабадағы маңызды бөлік', ru: 'Что важно на обложке' },
  focusHint: {
    kk: 'Телефонда фото ені бойынша қиылады. Мұнда қай бөлігі көрініп қалатынын таңдайсыз.',
    ru: 'На телефоне фото обрезается по ширине — здесь выбирается, какая часть останется видимой. Лучше всего подходят горизонтальные снимки примерно 3:2.',
  },
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
  layout: { kk: 'Тақырыпша мен басты бет', ru: 'Шапка и главная страница' },
  headerSticky: { kk: 'Айналдырғанда тақырыпшаны жоғарыда бекіту', ru: 'Закреплять шапку при прокрутке' },
  headerStickyHint: {
    kk: 'Қосулы болса, мәзір мен байланыс батырмалары әрдайым көрінеді. Өшірулі болса, тақырыпша бетпен бірге жоғары кетеді — кішкентай экранда мәтінге көбірек орын қалады.',
    ru: 'Включено — меню и кнопки всегда под рукой. Выключено — шапка уезжает вверх вместе со страницей, и на маленьком экране больше места для текста.',
  },
  homeShowSections: { kk: 'Басты бетте «Сайт бөлімдері» блогын көрсету', ru: 'Показывать на главной блок «Разделы сайта»' },
  homeSections: { kk: 'Блоктағы бөлімдер', ru: 'Какие разделы показывать в блоке' },
  homeSectionsHint: {
    kk: 'Бәрі белгіленсе, кейін қосылған жаңа бөлімдер де блокқа өздігінен түседі. Мәзірге бұл әсер етпейді.',
    ru: 'Если отмечены все, новые разделы тоже будут попадать в блок сами. На меню сайта это не влияет.',
  },
  homeShowContacts: { kk: 'Басты бетте «Байланыс» блогын көрсету', ru: 'Показывать на главной блок «Контакты»' },
  homeShowContactsHint: {
    kk: 'Байланыс бәрібір сайттың төменгі бөлігінде және «Байланыс» бөлімінде қалады.',
    ru: 'Контакты всё равно остаются в подвале сайта и в разделе «Контакты».',
  },
  customTheme: {
    kk: 'Сайтыңыз «%s» жеке дизайнымен көрсетіледі. Төмендегі шаблон мен түстер ол өшірілгенде ғана қолданылады. Логотип пен мұқаба жеке дизайнда да жұмыс істейді.',
    ru: 'Ваш сайт показывается в индивидуальном дизайне «%s». Шаблон и цвета ниже применятся, только если его отключить. Логотип и обложка работают и в индивидуальном дизайне.',
  },
} as const;

export default async function AppearancePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;
  const theme = findThemeInfo(ctx.themeCode);

  const [profile, csrf, layout, rootSections] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
    prisma.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { headerSticky: true, homeShowSections: true, homeSectionIds: true, homeShowContacts: true },
    }),
    ctx.db.sections.findMany({ where: { parentId: null, isVisible: true }, orderBy: { position: 'asc' } }),
  ]);
  // Пустой выбор значит «все разделы» — так их и отмечаем.
  const chosenSections = new Set(
    layout?.homeSectionIds.length ? layout.homeSectionIds : rootSections.map((section) => section.id),
  );

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

      {theme ? (
        <div className="mb-5">
          <Alert tone="info">{T.customTheme[locale].replace('%s', pick(locale, theme.nameKk, theme.nameRu))}</Alert>
        </div>
      ) : null}

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

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.focus[locale]}</legend>
          <p className="mt-1 text-sm text-muted">{T.focusHint[locale]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {COVER_FOCUS.map((item) => (
              <label
                key={item.code}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input
                  type="radio"
                  name="coverFocus"
                  value={item.code}
                  defaultChecked={(profile?.coverFocus || 'center') === item.code}
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

        <fieldset className="card space-y-5 p-6">
          <legend className="font-display text-lg font-bold">{T.layout[locale]}</legend>

          <label className="flex items-start gap-3">
            <input type="checkbox" name="headerSticky" defaultChecked={layout?.headerSticky ?? true} className="mt-1 h-4 w-4" />
            <span>
              <span className="block font-semibold">{T.headerSticky[locale]}</span>
              <span className="block text-sm text-muted">{T.headerStickyHint[locale]}</span>
            </span>
          </label>

          <div>
            <label className="flex items-start gap-3">
              <input type="checkbox" name="homeShowSections" defaultChecked={layout?.homeShowSections ?? true} className="mt-1 h-4 w-4" />
              <span className="font-semibold">{T.homeShowSections[locale]}</span>
            </label>
            {rootSections.length > 0 ? (
              <div className="ml-7 mt-3 rounded-2xl border border-line p-4">
                <p className="text-sm font-semibold">{T.homeSections[locale]}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {rootSections.map((section) => (
                    <label key={section.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="homeSectionIds"
                        value={section.id}
                        defaultChecked={chosenSections.has(section.id)}
                        className="h-4 w-4"
                      />
                      {pick(locale, section.titleKk, section.titleRu)}
                    </label>
                  ))}
                </div>
                <p className="field-hint mt-2">{T.homeSectionsHint[locale]}</p>
              </div>
            ) : null}
          </div>

          <label className="flex items-start gap-3">
            <input type="checkbox" name="homeShowContacts" defaultChecked={layout?.homeShowContacts ?? true} className="mt-1 h-4 w-4" />
            <span>
              <span className="block font-semibold">{T.homeShowContacts[locale]}</span>
              <span className="block text-sm text-muted">{T.homeShowContactsHint[locale]}</span>
            </span>
          </label>
        </fieldset>

        <SubmitButton>{T.save[locale]}</SubmitButton>
      </form>
    </>
  );
}
