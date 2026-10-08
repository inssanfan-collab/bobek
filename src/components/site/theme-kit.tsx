import type { ReactNode } from 'react';
import type { Section, TenantProfile } from '@prisma/client';
import Link from 'next/link';
import { SectionLinkList, SiteLink, mediaUrl, type AlbumWithCover } from '@/components/site/blocks';
import { LinkButton } from '@/components/site/Hero';
import { SocialLinks } from '@/components/site/SocialLinks';
import { headerExtras } from '@/lib/hero';
import { pick, type Locale } from '@/lib/i18n';

/**
 * Общие детали индивидуальных тем, собранных из блоков главной: картинки
 * темы, заголовки секций, направления развития по ГОСО, шапка и подвал
 * с классами темы. Темы различаются раскладкой и CSS, а разметка шапки,
 * подвала и мелочей — одна, чтобы десять тем не расходились в поведении
 * (кнопки для слабовидящих, язык, меню, «Наверх»).
 */

const T = {
  enroll: { kk: 'Экскурсияға жазылу', ru: 'Записаться на экскурсию' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  poweredBy: { kk: 'Сайт жасалған', ru: 'Сайт работает на платформе' },
  top: { kk: 'Жоғары', ru: 'Наверх' },
} as const;

/** Картинка темы: два размера WebP из public/images/themes/<код>/<имя>-{640,1200}.webp. */
export function ThemeImage({
  theme,
  name,
  className,
  alt = '',
  sizes = '(min-width: 1024px) 50vw, 100vw',
  eager = false,
}: {
  theme: string;
  name: string;
  className?: string;
  alt?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const base = `/images/themes/${theme}/${name}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- статичные картинки темы, без оптимизатора Next
    <img
      src={`${base}-1200.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-1200.webp 1200w`}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

/** Фото сада, если есть, иначе картинка темы. */
export function CoverOr({
  coverUrl,
  coverPosition,
  theme,
  name,
  className,
  eager,
}: {
  coverUrl: string | null;
  coverPosition?: string;
  theme: string;
  name: string;
  className?: string;
  eager?: boolean;
}) {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- обложку отдаёт /api/media
    return <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className={className} loading={eager ? 'eager' : 'lazy'} />;
  }
  return <ThemeImage theme={theme} name={name} className={className} eager={eager} />;
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  lead?: string | null;
  className?: string;
  id?: string;
}) {
  return (
    <div className={className ?? 'kit-head'}>
      {eyebrow ? <p className="kit-eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className="kit-title">{title}</h2>
      {lead ? <p className="kit-lead">{lead}</p> : null}
    </div>
  );
}

/**
 * Направления развития — образовательные области ГОСО дошкольного
 * образования. Общие для любого сада Казахстана, поэтому годятся там, где
 * у сада нет своих кружков: это правда, а не выдуманный текст.
 */
export type Area = { key: string; title: string; text: string };

const AREAS = [
  {
    key: 'health',
    kk: ['Денсаулық', 'Дене шынықтыру, таза ауадағы серуен, салауатты өмір салтының алғашқы дағдылары.'],
    ru: ['Здоровье', 'Физкультура, прогулки на свежем воздухе, первые навыки здорового образа жизни.'],
  },
  {
    key: 'speech',
    kk: ['Коммуникация', 'Сөйлеуді дамыту, көркем әдебиет, қазақ тілі мен екінші тілге алғашқы қадам.'],
    ru: ['Коммуникация', 'Развитие речи, художественная литература, казахский язык и первые шаги во втором языке.'],
  },
  {
    key: 'logic',
    kk: ['Таным', 'Математика негіздері, құрастыру, айналадағы әлеммен танысу.'],
    ru: ['Познание', 'Основы математики, конструирование, знакомство с окружающим миром.'],
  },
  {
    key: 'art',
    kk: ['Шығармашылық', 'Сурет салу, мүсіндеу, жапсыру, музыка.'],
    ru: ['Творчество', 'Рисование, лепка, аппликация, музыка.'],
  },
  {
    key: 'social',
    kk: ['Әлеуметтік орта', 'Достық, өзара көмек, туған өлке мен ұлттық дәстүрлер.'],
    ru: ['Социум', 'Дружба, взаимопомощь, родной край и национальные традиции.'],
  },
] as const;

export function developmentAreas(locale: Locale, count = 5): Area[] {
  return AREAS.slice(0, count).map((area) => ({ key: area.key, title: area[locale][0], text: area[locale][1] }));
}

/** Фото из альбомов сада подряд — для галерей плиткой. Только настоящие снимки сада. */
export type AlbumPhoto = { key: string; src: string; albumSlug: string; title: string };

export function albumPhotos(albums: AlbumWithCover[], locale: Locale, limit: number): AlbumPhoto[] {
  const photos: AlbumPhoto[] = [];
  // По кругу: сначала первое фото каждого альбома, потом вторые — галерея
  // показывает разные события, а не шесть снимков одного утренника.
  const longest = Math.max(0, ...albums.map((album) => album.items.length));
  for (let index = 0; index < longest && photos.length < limit; index += 1) {
    for (const album of albums) {
      const item = album.items[index];
      const src = item ? mediaUrl(item.media) : null;
      if (src) photos.push({ key: `${album.id}-${index}`, src, albumSlug: album.slug, title: pick(locale, album.titleKk, album.titleRu) });
      if (photos.length >= limit) break;
    }
  }
  return photos;
}

/** Раздел меню нужного типа — для кнопок «Записаться», «Все фото» и т.п. */
export function findSection(menu: Section[] | undefined, type: Section['type']): Section | undefined {
  return menu?.find((section) => section.type === type);
}

/** Раздел «О нас»: по адресу about, а если сад его переименовал — первая текстовая страница. */
export function aboutSection(menu: Section[] | undefined): Section | undefined {
  return menu?.find((section) => section.slug === 'about') ?? findSection(menu, 'PAGE');
}

/**
 * Кнопка записи: на виртуальную приёмную сада, без неё — в «Контакты», а нет
 * и их — кнопки нет. На Darabala.kz не ведём: очередь в каждой области своя,
 * и сад из другой области на чужой портал родителей не отправляет.
 */
export function EnrollLink({ menu, locale, className, children }: { menu?: Section[]; locale: Locale; className?: string; children?: ReactNode }) {
  const target = findSection(menu, 'FEEDBACK') ?? findSection(menu, 'CONTACTS');
  return target ? (
    <SiteLink href={`/${target.slug}`} locale={locale} className={className}>{children ?? T.enroll[locale]}</SiteLink>
  ) : null;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/**
 * Шапка темы: полоса с телефоном и часами (если сад их включил), логотип
 * и название, кнопка записи, кнопки для слабовидящих и язык, меню.
 * Классы с префиксом темы (`<p>-header`, `<p>-logo`…) — красит тема.
 */
export function KitHeader({
  prefix,
  profile,
  locale,
  homeHref,
  tools,
  nav,
  logoFallback,
  menu,
}: {
  prefix: string;
  profile: TenantProfile | null;
  locale: Locale;
  homeHref: string;
  tools: ReactNode;
  nav: ReactNode;
  logoFallback: ReactNode;
  menu?: Section[];
}) {
  const name = pick(locale, profile?.shortNameKk || profile?.nameKk, profile?.shortNameRu || profile?.nameRu);
  const extras = headerExtras(profile, locale);

  return (
    <header className={`site-header ${prefix}-header sticky top-0 z-40`}>
      {extras.phone || extras.hours ? (
        <div className={`${prefix}-topbar`}>
          <p className="container-page flex flex-wrap items-center gap-x-5 gap-y-1 py-1.5 text-sm">
            {extras.phone ? <a href={telHref(extras.phone)} className="font-bold">{extras.phone}</a> : null}
            {extras.hours ? <span>{extras.hours}</span> : null}
          </p>
        </div>
      ) : null}
      <div className="container-page flex items-center gap-3 py-3 sm:gap-4">
        <Link href={homeHref} className={`${prefix}-brand flex min-w-0 items-center gap-3`}>
          {profile?.logoMediaId ? (
            // eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media
            <img src={`/api/media/${profile.logoMediaId}`} alt="" className={`${prefix}-logo h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14`} />
          ) : (
            <span className={`${prefix}-logo grid h-11 w-11 shrink-0 place-items-center sm:h-14 sm:w-14`} aria-hidden>{logoFallback}</span>
          )}
          <span className="min-w-0">
            <span className={`${prefix}-name block`}>{name || 'Балабақша'}</span>
            {extras.tagline ? <span className={`${prefix}-tagline block truncate`}>{extras.tagline}</span> : null}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {extras.cta ? (
            <LinkButton link={extras.cta} className={`${prefix}-cta btn hidden shrink-0 lg:inline-flex`} />
          ) : (
            <EnrollLink menu={menu} locale={locale} className={`${prefix}-cta btn hidden shrink-0 lg:inline-flex`} />
          )}
          <div className={`${prefix}-tools flex shrink-0 items-center gap-1`}>{tools}</div>
        </div>
      </div>
      <div className={`${prefix}-nav`}>{nav}</div>
    </header>
  );
}

/** Подвал темы: название и адрес, разделы, контакты и соцсети, строка «Сайт работает на…» и «Наверх». */
export function KitFooter({
  prefix,
  profile,
  sections,
  locale,
  portalDomain,
  top,
}: {
  prefix: string;
  profile: TenantProfile | null;
  sections: Section[];
  locale: Locale;
  portalDomain: string;
  /** Украшение над подвалом: волна, облака. */
  top?: ReactNode;
}) {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const address = pick(locale, profile?.addressKk, profile?.addressRu);

  return (
    <footer className={`${prefix}-footer mt-12`}>
      {top}
      <div className={`${prefix}-footer-body`}>
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className={`${prefix}-footer-name`}>{name || 'Балабақша'}</p>
            {address ? <p className="mt-3 text-sm">{address}</p> : null}
            {profile?.workHours ? <p className="mt-1 text-sm">{profile.workHours}</p> : null}
          </div>
          <div>
            <p className={`${prefix}-footer-title`}>{T.sections[locale]}</p>
            <SectionLinkList sections={sections} locale={locale} className="space-y-1.5 text-sm" />
          </div>
          <div>
            <p className={`${prefix}-footer-title`}>{T.contacts[locale]}</p>
            <ul className="space-y-1.5 break-words text-sm">
              {profile?.phone ? <li><a href={telHref(profile.phone)} className="font-bold">{profile.phone}</a></li> : null}
              {profile?.phoneExtra ? <li>{profile.phoneExtra}</li> : null}
              {profile?.email ? <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li> : null}
            </ul>
            <div className={`${prefix}-footer-social mt-4`}>
              <SocialLinks profile={profile} locale={locale} withTitle={false} />
            </div>
          </div>
        </div>
        <div className={`${prefix}-footer-bottom`}>
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <p>
              {T.poweredBy[locale]}{' '}
              <a href={`https://${portalDomain}`} target="_blank" rel="noopener noreferrer" className="font-bold">{portalDomain}</a>
            </p>
            <a href="#" className="font-bold">↑ {T.top[locale]}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
