import Link from 'next/link';
import { A11yToggle } from '@/components/A11yToggle';
import { LocaleSwitch } from './LocaleSwitch';
import { SiteNav } from './SiteNav';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { sectionLink } from '@/lib/sections';
import { headerExtras, type HeroLink } from '@/lib/hero';
import type { HeaderLayoutCode } from '@/lib/templates';
import type { Section, TenantProfile } from '@prisma/client';

const T = {
  /* По-казахски «Мәзір» — это и навигация, и меню питания: рядом с разделом
     «Ас мәзірі» кнопка читалась как ссылка на еду. Оставлено русское слово. */
  menu: { kk: 'Меню', ru: 'Меню' },
  home: { kk: 'Басты бет', ru: 'Главная' },
  search: { kk: 'Іздеу', ru: 'Поиск' },
  call: { kk: 'Қоңырау шалу', ru: 'Позвонить' },
} as const;

type MenuSection = Section & { children?: Section[] };

/**
 * Пункты меню сайта: главная, разделы с подменю, поиск. Общие для стандартной
 * шапки и шапок индивидуальных тем — меню у сайта одно, как его ни оформляй.
 */
export function siteNavLinks(sections: MenuSection[], locale: Locale) {
  const toLink = (section: Section) => {
    const { href, external } = sectionLink(section, (path) => withLocale(path, locale));
    return { href, external, label: pick(locale, section.titleKk, section.titleRu) };
  };
  return [
    { href: withLocale('/', locale), label: T.home[locale] },
    ...sections.map((section) => ({ ...toLink(section), children: section.children?.map(toLink) })),
    { href: withLocale('/search', locale), label: T.search[locale] },
  ];
}

/** Кнопка версии для слабовидящих и переключатель языка — обязательны в любой шапке. */
export function HeaderTools({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <>
      <A11yToggle />
      <LocaleSwitch locale={locale} pathname={pathname} />
    </>
  );
}

function Logo({ profile, large }: { profile: TenantProfile | null; large: boolean }) {
  const size = large ? 'h-14 w-14' : 'h-11 w-11';
  return profile?.logoMediaId ? (
    // Логотип сада вместо заглушки. object-contain, а не cover:
    // у садов гербы и эмблемы непредсказуемых пропорций, обрезать их нельзя.
    // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media, оптимизатор Next с ним не работает
    <img src={`/api/media/${profile.logoMediaId}`} alt="" className={`${size} shrink-0 rounded-2xl object-contain`} />
  ) : (
    <span className={`grid ${size} shrink-0 place-items-center rounded-2xl bg-brand text-white`}>
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 20V9.5L12 4l8 5.5V20" />
        <path d="M9.5 20v-5.5h5V20" />
        <path d="M4 20h16" />
      </svg>
    </span>
  );
}

function Brand({
  profile,
  locale,
  tagline,
  taglineCustom,
  centered,
}: {
  profile: TenantProfile | null;
  locale: Locale;
  tagline: string;
  taglineCustom: boolean;
  centered: boolean;
}) {
  const name = pick(locale, profile?.shortNameKk ?? profile?.nameKk, profile?.shortNameRu ?? profile?.nameRu);
  return (
    <Link
      href={withLocale('/', locale)}
      className={`flex min-w-0 items-center gap-3 ${centered ? 'flex-col text-center sm:flex-row sm:text-left' : ''}`}
    >
      <Logo profile={profile} large={centered} />
      <span className="min-w-0">
        <span className={`block font-display font-extrabold leading-tight ${centered ? 'text-xl sm:text-2xl' : 'truncate text-lg'}`}>
          {name || 'Балабақша'}
        </span>
        {tagline ? (
          <span
            className={`site-tagline block text-xs ${taglineCustom ? 'font-bold uppercase tracking-wide text-brand-ink' : 'text-muted'} ${centered ? '' : 'truncate'}`}
          >
            {tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function Contacts({ phone, hours }: { phone: string | null; hours: string | null }) {
  if (!phone) return null;
  return (
    <div className="hidden text-right leading-tight lg:block">
      <a href={`tel:${phone.replace(/\s/g, '')}`} className="block font-bold hover:text-brand-ink">{phone}</a>
      {hours ? (
        <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          {hours}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Телефон на планшете — круглой кнопкой: строка с часами там не помещается.
 * На телефоне кнопки нет совсем: рядом с названием и обязательными кнопками
 * ей не хватает места, и шапка раздвигала бы страницу вбок.
 */
function PhoneIcon({ phone, locale }: { phone: string | null; locale: Locale }) {
  if (!phone) return null;
  return (
    <a
      href={`tel:${phone.replace(/\s/g, '')}`}
      aria-label={`${T.call[locale]}: ${phone}`}
      className="hidden h-10 w-10 place-items-center rounded-full border border-line hover:bg-brand-soft sm:grid lg:hidden"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
      </svg>
    </a>
  );
}

function Cta({ cta }: { cta: HeroLink | null }) {
  if (!cta) return null;
  const className = 'btn-primary hidden whitespace-nowrap shadow-soft sm:inline-flex';
  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>{cta.text}</a>
  ) : cta.href.startsWith('/') ? (
    <Link href={cta.href} className={className}>{cta.text}</Link>
  ) : (
    <a href={cta.href} className={className}>{cta.text}</a>
  );
}

/**
 * Стандартная шапка сайта сада в трёх видах:
 * - classic — название слева, меню строкой ниже;
 * - floating — плашка со скруглением и тенью, с отступом от краёв;
 * - center — логотип и название по центру, меню под ними.
 *
 * Во всех видах одни и те же части: название с подписью, телефон и часы
 * (если сад включил), кнопка действия (если задана), обязательные кнопки
 * и меню. Класс site-header — для настроек «закреплять» и «цвет шапки».
 */
export function SiteHeader({
  profile,
  sections,
  locale,
  pathname,
  layout = 'classic',
}: {
  profile: TenantProfile | null;
  /** Разделы верхнего уровня; вложенные — в children (см. siteMenu). */
  sections: MenuSection[];
  locale: Locale;
  pathname: string;
  layout?: HeaderLayoutCode;
}) {
  const extras = headerExtras(profile, locale);
  const nav = <SiteNav locale={locale} links={siteNavLinks(sections, locale)} align={layout === 'center' ? 'center' : 'start'} />;
  const right = (
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
      <Contacts phone={extras.phone} hours={extras.hours} />
      <PhoneIcon phone={extras.phone} locale={locale} />
      <Cta cta={extras.cta} />
      <HeaderTools locale={locale} pathname={pathname} />
    </div>
  );

  if (layout === 'floating') {
    return (
      <header className="site-header sticky top-0 z-40 pt-3">
        <div className="container-page">
          <div className="rounded-3xl border border-line bg-surface/95 shadow-lift backdrop-blur">
            <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-5">
              <Brand profile={profile} locale={locale} tagline={extras.tagline} taglineCustom={extras.taglineCustom} centered={false} />
              {right}
            </div>
            <div className="border-t border-line/70 pt-2">{nav}</div>
          </div>
        </div>
      </header>
    );
  }

  if (layout === 'center') {
    return (
      <header className="site-header sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        {/* По центру: телефон и часы — слева, кнопки — справа, название — между ними строкой ниже. */}
        <div className="container-page flex items-center gap-3 pt-3">
          <div className="hidden lg:block [&>div]:text-left">
            <Contacts phone={extras.phone} hours={extras.hours} />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <PhoneIcon phone={extras.phone} locale={locale} />
            <Cta cta={extras.cta} />
            <HeaderTools locale={locale} pathname={pathname} />
          </div>
        </div>
        <div className="container-page flex justify-center pb-3 pt-1">
          <Brand profile={profile} locale={locale} tagline={extras.tagline} taglineCustom={extras.taglineCustom} centered />
        </div>
        {nav}
      </header>
    );
  }

  return (
    <header className="site-header sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-page flex items-center gap-4 py-3">
        <Brand profile={profile} locale={locale} tagline={extras.tagline} taglineCustom={extras.taglineCustom} centered={false} />
        {right}
      </div>
      {nav}
    </header>
  );
}
