import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { findThemeInfo } from '@/themes/catalog';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import type { CSSProperties } from 'react';
import {
  COVER_FOCUS, CUSTOM_PALETTE, FONT_PAIRS, HEADER_STYLES, PALETTES, PATTERNS, SHAPES, TEMPLATES, type ShapeCode,
} from '@/lib/templates';
import { derivePalette } from '@/lib/colors';
import { PresetPicker } from './PresetPicker';
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
  presets: { kk: 'Дайын стильдер', ru: 'Готовые стили' },
  customColor: { kk: 'Өз түсіңіз', ru: 'Свой цвет' },
  customHint: {
    kk: 'Мысалы, логотиптегі түс. Батырмадағы мәтін оқылатындай етіп, түсті қажет болса сәл қоюлатамыз.',
    ru: 'Например, цвет с логотипа. Если на кнопках текст читался бы плохо, мы чуть сгустим цвет — оттенок останется тем же.',
  },
  customNow: { kk: 'Сайтта', ru: 'На сайте' },
  customAdjusted: { kk: '(оқылу үшін сәл қоюлатылды)', ru: '(чуть сгущён ради читаемости)' },
  fonts: { kk: 'Қаріптер', ru: 'Шрифты' },
  fontsHint: {
    kk: 'Барлығы қазақ әріптерімен тексерілген.',
    ru: 'Все проверены на казахские буквы.',
  },
  fontSample: { kk: 'Балабақша «Күншуақ»', ru: 'Детский сад «Күншуақ»' },
  // Образец нарочно по-казахски в обоих языках: видно, что буквы на месте.
  fontSampleText: { kk: 'Әже, ұлым, қызым — бәрі осында.', ru: 'Әже, ұлым, қызым — бәрі осында.' },
  shape: { kk: 'Пішін', ru: 'Форма элементов' },
  headerStyle: { kk: 'Тақырыпша түсі', ru: 'Цвет шапки' },
  customTheme: {
    kk: 'Сайтыңыз «%s» жеке дизайнымен көрсетіледі. Төмендегі шаблон мен түстер ол өшірілгенде ғана қолданылады. Логотип пен мұқаба жеке дизайнда да жұмыс істейді.',
    ru: 'Ваш сайт показывается в индивидуальном дизайне «%s». Шаблон и цвета ниже применятся, только если его отключить. Логотип и обложка работают и в индивидуальном дизайне.',
  },
} as const;

/** Мини-образец формы: так же, как её рисуют правила [data-shape] в globals.css. */
const SHAPE_PREVIEW: Record<ShapeCode, CSSProperties> = {
  soft: { borderRadius: '1.25rem', boxShadow: '0 8px 24px -12px rgb(15 23 42 / 0.25)' },
  round: { borderRadius: '2rem', boxShadow: '0 8px 24px -12px rgb(15 23 42 / 0.25)' },
  sharp: { borderRadius: '0.375rem' },
  outline: { borderRadius: '1.25rem', border: '2px solid rgb(var(--ink))', boxShadow: '4px 4px 0 rgb(var(--brand))' },
};

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
      select: {
        headerSticky: true, homeShowSections: true, homeSectionIds: true, homeShowContacts: true,
        brandColor: true, fontPair: true, shape: true, headerStyle: true,
      },
    }),
    ctx.db.sections.findMany({ where: { parentId: null, isVisible: true }, orderBy: { position: 'asc' } }),
  ]);
  const customPreview = layout?.brandColor ? derivePalette(layout.brandColor) : null;
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

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{T.presets[locale]}</h2>
          <div className="mt-2">
            <PresetPicker locale={locale} />
          </div>
        </section>

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
                <span className="flex -space-x-1.5" aria-hidden>
                  <span className="h-5 w-5 rounded-full ring-2 ring-card" style={{ background: palette.swatch }} />
                  <span className="h-5 w-5 rounded-full ring-2 ring-card" style={{ background: palette.accent }} />
                </span>
                {pick(locale, palette.nameKk, palette.nameRu)}
              </label>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-line p-4">
            <label className="flex cursor-pointer items-center gap-2 font-semibold">
              <input type="radio" name="palette" value="custom" defaultChecked={ctx.palette === 'custom'} className="h-4 w-4" />
              {pick(locale, CUSTOM_PALETTE.nameKk, CUSTOM_PALETTE.nameRu)}
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="color"
                name="brandColor"
                defaultValue={layout?.brandColor ?? '#2a7de1'}
                aria-label={T.customColor[locale]}
                className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-card p-1"
              />
              <p className="max-w-xl text-sm text-muted">{T.customHint[locale]}</p>
            </div>
            {customPreview ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">{T.customNow[locale]}:</span>
                {[customPreview.brand, customPreview.brandSoft, customPreview.brandInk, customPreview.accent].map((color) => (
                  <span key={color} className="h-6 w-6 rounded-full ring-1 ring-line" style={{ background: color }} aria-hidden />
                ))}
                {customPreview.adjusted ? <span className="text-muted">{T.customAdjusted[locale]}</span> : null}
              </div>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.fonts[locale]}</legend>
          <p className="mt-1 text-sm text-muted">{T.fontsHint[locale]}</p>
          {/* Все пары — только здесь, чтобы образцы были в своих шрифтах. На сайт грузится одна. */}
          <link rel="stylesheet" precedence="default" href={`https://fonts.googleapis.com/css2?${FONT_PAIRS.map((f) => f.google).join('&')}&display=swap`} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FONT_PAIRS.map((pair) => (
              <label
                key={pair.code}
                className="cursor-pointer rounded-2xl border border-line p-4 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input type="radio" name="fontPair" value={pair.code} defaultChecked={(layout?.fontPair ?? 'soft') === pair.code} className="sr-only" />
                <span className="block text-xl font-bold" style={{ fontFamily: `'${pair.display}', system-ui` }}>
                  {T.fontSample[locale]}
                </span>
                <span className="mt-1 block text-sm" style={{ fontFamily: `'${pair.text}', system-ui` }}>
                  {T.fontSampleText[locale]}
                </span>
                <span className="mt-2 block text-xs font-semibold text-muted">
                  {pick(locale, pair.nameKk, pair.nameRu)} · {pair.display}{pair.display === pair.text ? '' : ` + ${pair.text}`}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.shape[locale]}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHAPES.map((shape) => (
              <label
                key={shape.code}
                className="cursor-pointer rounded-2xl border border-line p-4 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input type="radio" name="shape" value={shape.code} defaultChecked={(layout?.shape ?? 'soft') === shape.code} className="sr-only" />
                <span
                  aria-hidden
                  className="block h-14 border bg-card"
                  style={SHAPE_PREVIEW[shape.code]}
                />
                <span className="mt-3 block font-semibold">{pick(locale, shape.nameKk, shape.nameRu)}</span>
                <span className="block text-xs text-muted">{pick(locale, shape.hintKk, shape.hintRu)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="font-display text-lg font-bold">{T.headerStyle[locale]}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {HEADER_STYLES.map((style) => (
              <label
                key={style.code}
                className="cursor-pointer rounded-2xl border border-line p-4 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30"
              >
                <input type="radio" name="headerStyle" value={style.code} defaultChecked={(layout?.headerStyle ?? 'light') === style.code} className="sr-only" />
                <span
                  aria-hidden
                  className={`flex h-10 items-center gap-2 rounded-lg px-3 ${
                    style.code === 'brand' ? 'bg-brand text-white' : style.code === 'dark' ? 'bg-[#1c1f26] text-white' : 'border border-line bg-surface'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-current opacity-60" />
                  <span className="h-2 w-16 rounded-full bg-current opacity-40" />
                </span>
                <span className="mt-2 block font-semibold">{pick(locale, style.nameKk, style.nameRu)}</span>
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
