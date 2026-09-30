import {
  ContactCard, GalleryStrip, NewsCard, PlacesBadge, SectionTiles, SiteLink, T as BLOCK_T,
} from '@/components/site/blocks';
import { HeroButtons, HeroTitle } from '@/components/site/Hero';
import { UiIcon, type UiIconName } from '@/components/site/UiIcon';
import { pick, type Locale } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import { Cloud, CloudEdge, FactIcon, type FactIconName } from './Doodles';

type Profile = HomeProps['profile'];

const T = {
  about: { kk: 'Біз туралы', ru: 'О нашем саде' },
  more: { kk: 'Толығырақ', ru: 'Читать подробнее' },
  groups: { kk: 'Топтар', ru: 'Группы' },
  places: { kk: 'Орын саны', ru: 'Мест в саду' },
  hours: { kk: 'Жұмыс уақыты', ru: 'Часы работы' },
  lang: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  care: { kk: 'Балаға қамқорлық', ru: 'Забота о ребёнке' },
  careNote: { kk: 'Тәжірибелі педагогтар', ru: 'Опытные педагоги' },
  kk: { kk: 'қазақ', ru: 'казахский' },
  ru: { kk: 'орыс', ru: 'русский' },
  address: { kk: 'Мекенжай', ru: 'Адрес' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
} as const;

/** Номер для wa.me — только цифры, с кодом страны вместо 8. */
function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Жёлтые круглые кнопки соцсетей, как в образце. */
function SocialDots({ profile }: { profile: Profile }) {
  if (!profile) return null;
  const items = [
    profile.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${waNumber(profile.whatsapp)}`, icon: 'chat' },
    profile.instagram && { label: 'Instagram', href: profile.instagram, icon: 'instagram' },
    profile.telegram && { label: 'Telegram', href: profile.telegram, icon: 'telegram' },
    profile.youtube && { label: 'YouTube', href: profile.youtube, icon: 'youtube' },
    profile.facebook && { label: 'Facebook', href: profile.facebook, icon: 'facebook' },
  ].filter(Boolean) as { label: string; href: string; icon: UiIconName }[];
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="oyin-dot" aria-label={item.label}>
          <UiIcon name={item.icon} className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}

type Fact = { icon: FactIconName; label: string; value: string };

/** «Забота о ребёнке» и факты из паспорта — только заполненные. */
function facts(profile: Profile, locale: Locale): Fact[] {
  if (!profile) return [];
  const langs = [profile.langKk && T.kk[locale], profile.langRu && T.ru[locale]].filter(Boolean).join(', ');
  const list: Fact[] = [];
  if (profile.groupsCount) list.push({ icon: 'kids', label: T.groups[locale], value: String(profile.groupsCount) });
  if (profile.placesTotal) list.push({ icon: 'home', label: T.places[locale], value: String(profile.placesTotal) });
  if (profile.workHours) list.push({ icon: 'clock', label: T.hours[locale], value: profile.workHours });
  if (langs) list.push({ icon: 'talk', label: T.lang[locale], value: langs });
  // «Забота о ребёнке» стоит первой всегда, как в образце; в ряду — четыре
  // пункта, поэтому при полном паспорте последний (язык) не помещается.
  return [{ icon: 'care' as const, label: T.careNote[locale], value: T.care[locale] }, ...list].slice(0, 4);
}

/**
 * Главная «Ойын алаңы» — яркая детская площадка по образцу, который
 * прислал владелец: рисунок на весь первый экран, синие полосы с облачным
 * краем, жёлтые карточки, красные круги со значками. Обложка сада (фото
 * здания) — в блоке «О саде», первый экран отдан рисунку.
 */
export function OyinHome({ profile, sections, news, announcements, albums, locale, coverUrl, coverPosition, showContacts, hero }: HomeProps) {
  const address = pick(locale, profile?.addressKk, profile?.addressRu);
  const about = pick(locale, profile?.aboutKk, profile?.aboutRu);
  const aboutSection = sections.find((section) => section.slug === 'about');
  const list = facts(profile, locale);

  return (
    <div className="oyin-home">
      <section className="oyin-hero">
        <picture className="decor oyin-hero-art">
          <source media="(min-width: 1024px)" srcSet="/images/themes/oyin/hero-2000.webp 2000w, /images/themes/oyin/hero-1600.webp 1600w" sizes="100vw" />
          <img src="/images/themes/oyin/hero-960.webp" alt="" width={960} height={536} />
        </picture>
        <div className="container-page oyin-hero-inner">
          <div className="oyin-hero-text">
            <HeroTitle hero={hero} tone="plain" className="oyin-h1 font-display" />
            {hero.lead ? <p className="oyin-lead mt-4 max-w-xl">{hero.lead}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <HeroButtons hero={hero} tone="plain">
                {profile?.phone ? <a href={telHref(profile.phone)} className="btn-primary">{profile.phone}</a> : null}
              </HeroButtons>
              <SocialDots profile={profile} />
            </div>
          </div>
          {address || profile?.workHours ? (
            <div className="oyin-hero-card">
              {address ? (
                <p className="flex items-center gap-3">
                  <span className="oyin-dot oyin-dot-sm" aria-hidden><FactIcon name="home" className="h-4 w-4" stroke={2} /></span>
                  <span className="text-sm font-semibold">{address}</span>
                </p>
              ) : null}
              {profile?.workHours ? (
                <p className="flex items-center gap-3">
                  <span className="oyin-dot oyin-dot-sm" aria-hidden><FactIcon name="clock" className="h-4 w-4" stroke={2} /></span>
                  <span className="text-sm font-semibold">{profile.workHours}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="oyin-sky">
        <Cloud className="oyin-doodle oyin-sky-cloud-1" />
        <Cloud className="oyin-doodle oyin-sky-cloud-2" />
        <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="oyin-title">{T.about[locale]}</h2>
            {about && about !== hero.lead ? <p className="oyin-about-text mt-4">{about}</p> : null}
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" style={{ objectPosition: coverPosition }} className="oyin-photo mt-6" />
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {aboutSection ? (
                <SiteLink href={`/${aboutSection.slug}`} locale={locale} className="oyin-yellow-btn">{T.more[locale]}</SiteLink>
              ) : null}
              <PlacesBadge profile={profile} locale={locale} />
            </div>
          </div>
          {list.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
              {list.map((fact) => (
                <li key={fact.label} className="oyin-fact">
                  <span className="oyin-fact-icon"><FactIcon name={fact.icon} className="h-9 w-9 sm:h-11 sm:w-11" /></span>
                  <span className="oyin-fact-value">{fact.value}</span>
                  <span className="oyin-fact-label">{fact.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {sections.length > 0 || announcements.length > 0 ? (
        <section className="oyin-band">
          <CloudEdge className="oyin-edge-top" />
          <div className="container-page space-y-10 py-14">
            {announcements.length > 0 ? (
              <div className="oyin-notice">
                <p className="oyin-notice-label">{BLOCK_T.announcements[locale]}</p>
                <ul className="mt-2 space-y-1.5">
                  {announcements.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <SiteLink href={`/announcements/${item.slug}`} locale={locale} className="font-bold underline-offset-4 hover:underline">
                        {pick(locale, item.titleKk, item.titleRu)}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="oyin-tiles">
              <SectionTiles sections={sections} locale={locale} />
            </div>
          </div>
          <CloudEdge className="oyin-edge-bottom" />
        </section>
      ) : null}

      <div className="container-page space-y-16 py-14">
        {news.length > 0 ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="oyin-title">{BLOCK_T.news[locale]}</h2>
              <SiteLink href="/news" locale={locale} className="oyin-more">{BLOCK_T.allNews[locale]} →</SiteLink>
            </div>
            <div className="oyin-news mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((post) => (
                <NewsCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="oyin-gallery">
          <GalleryStrip albums={albums.slice(0, 3)} locale={locale} />
        </div>

        {showContacts ? (
          <div className="oyin-contacts">
            <ContactCard profile={profile} locale={locale} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
