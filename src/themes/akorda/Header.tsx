import Link from 'next/link';
import { SiteLink } from '@/components/site/blocks';
import { UiIcon, type UiIconName } from '@/components/site/UiIcon';
import { headerExtras } from '@/lib/hero';
import { pick } from '@/lib/i18n';
import type { TenantProfile } from '@prisma/client';
import type { ThemeHeaderProps } from '../types';

const T = {
  skip: { kk: 'Негізгі мазмұнға өту', ru: 'Перейти к основному содержанию' },
  official: { kk: 'Ресми сайты', ru: 'Официальный сайт' },
  home: { kk: 'Басты бет', ru: 'Главная' },
  crumbs: { kk: 'Сіз осы жердесіз', ru: 'Вы здесь' },
  search: { kk: 'Іздеу', ru: 'Поиск' },
  page: { kk: 'Бет', ru: 'Страница' },
  doc: { kk: 'Құжат', ru: 'Документ' },
  emblem: { kk: 'Қазақстан Республикасының Мемлекеттік елтаңбасы', ru: 'Государственный герб Республики Казахстан' },
} as const;

/** Соцсети сада — значки в левой части полосы, как у образца. */
function socialLinks(profile: TenantProfile | null): { key: string; label: string; href: string; icon: UiIconName }[] {
  if (!profile) return [];
  const wa = profile.whatsapp ? profile.whatsapp.replace(/\D/g, '') : '';
  const items = [
    profile.telegram && { key: 'telegram', label: 'Telegram', href: profile.telegram, icon: 'telegram' as UiIconName },
    profile.youtube && { key: 'youtube', label: 'YouTube', href: profile.youtube, icon: 'youtube' as UiIconName },
    profile.instagram && { key: 'instagram', label: 'Instagram', href: profile.instagram, icon: 'instagram' as UiIconName },
    profile.facebook && { key: 'facebook', label: 'Facebook', href: profile.facebook, icon: 'facebook' as UiIconName },
    wa && { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${wa.startsWith('8') ? `7${wa.slice(1)}` : wa}`, icon: 'chat' as UiIconName },
  ];
  return items.filter(Boolean) as { key: string; label: string; href: string; icon: UiIconName }[];
}

/**
 * Шапка «Акорда» — по образцу akorda.kz: серая полоса высотой 80 px
 * с орнаментом (слева значки соцсетей, справа язык, ниже меню по центру),
 * под ней синий блок с флагом, гербом и надписью «Официальный сайт» над
 * названием. Герб и флаг — государственные символы, поэтому у частного сада
 * (`isPrivate`) их нет: тот же блок на синем фоне и с логотипом сада.
 * Блок с флагом — отдельный элемент под шапкой: липнет только полоса,
 * а не 260 px картинки.
 */
export function AkordaHeader({ profile, sections, locale, pathname, homeHref, tools, nav }: ThemeHeaderProps) {
  const state = !profile?.isPrivate;
  const name = pick(locale, profile?.nameKk, profile?.nameRu) || 'Балабақша';
  const extras = headerExtras(profile, locale);
  const isHome = pathname === '/' || pathname === '';
  const NameTag = isHome ? 'h1' : 'p';
  const socials = socialLinks(profile);
  const hasMark = state || Boolean(profile?.logoMediaId);

  const first = pathname.split('/').filter(Boolean)[0];
  const section = first ? sections.find((item) => item.slug === first) : undefined;
  const crumb = section
    ? { href: `/${section.slug}`, label: pick(locale, section.titleKk, section.titleRu) }
    : first === 'search'
      ? { href: '/search', label: T.search[locale] }
      : first === 'doc'
        ? { href: pathname, label: T.doc[locale] }
        : first
          ? { href: pathname, label: T.page[locale] }
          : null;

  return (
    <>
      <a href="#main" className="akorda-skip">{T.skip[locale]}</a>
      <header className="site-header akorda-header sticky top-0 z-40">
        <div className="container-page akorda-bar">
          <div className="akorda-bar-left">
            {state ? (
              <Link href={homeHref} className="akorda-mini" aria-label={T.home[locale]}>
                {/* eslint-disable-next-line @next/next/no-img-element -- статичный герб темы */}
                <img src="/images/themes/akorda/gerb-small.png" alt="" width={46} height={47} />
              </Link>
            ) : null}
            {socials.length > 0 ? (
              <ul className="akorda-socials">
                {socials.map((item) => (
                  <li key={item.key}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                      <UiIcon name={item.icon} className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : extras.phone ? (
              <p className="akorda-contact">
                <a href={`tel:${extras.phone.replace(/[^\d+]/g, '')}`}>{extras.phone}</a>
                {extras.hours ? <span> · {extras.hours}</span> : null}
              </p>
            ) : null}
          </div>
          <div className="akorda-tools">{tools}</div>
        </div>
        <div className="akorda-nav">{nav}</div>
        {crumb ? (
          <nav aria-label={T.crumbs[locale]} className="akorda-crumbs">
            <ol className="container-page flex flex-wrap items-center gap-2 py-2">
              <li><SiteLink href="/" locale={locale}>{T.home[locale]}</SiteLink></li>
              <li aria-hidden>/</li>
              <li>
                {pathname.split('/').filter(Boolean).length > 1 ? (
                  <SiteLink href={crumb.href} locale={locale}>{crumb.label}</SiteLink>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            </ol>
          </nav>
        ) : null}
      </header>

      <section className={`akorda-flag ${isHome ? '' : 'akorda-flag-small'} ${state ? 'akorda-flag-state' : 'akorda-flag-plain'} ${hasMark ? '' : 'akorda-flag-nomark'}`}>
        {state ? (
          // Развевающийся флаг — то же видео, что у образца. Оно только для красоты: без звука, для чтения
          // не нужно, на телефоне и при «меньше движения» его нет — остаётся неподвижная картинка.
          <video className="akorda-video" autoPlay muted loop playsInline preload="metadata" poster="/images/themes/akorda/flag.jpg" aria-hidden tabIndex={-1}>
            <source src="/images/themes/akorda/flag.mp4" type="video/mp4" />
          </video>
        ) : null}
        <div className="container-page akorda-flag-inner">
          <div className="akorda-flag-mark">
            {state ? (
              <SiteLink href="/" locale={locale}>
                {/* eslint-disable-next-line @next/next/no-img-element -- статичный герб темы */}
                <img src="/images/themes/akorda/gerb.png" alt={T.emblem[locale]} width={144} height={144} className="akorda-emblem" />
              </SiteLink>
            ) : profile?.logoMediaId ? (
              <SiteLink href="/" locale={locale}>
                {/* eslint-disable-next-line @next/next/no-img-element -- файл отдаёт /api/media */}
                <img src={`/api/media/${profile.logoMediaId}`} alt="" className="akorda-logo" />
              </SiteLink>
            ) : null}
          </div>
          <div className="akorda-flag-title">
            <p className="akorda-official">{T.official[locale]}</p>
            <NameTag className="akorda-site-name">{name}</NameTag>
          </div>
        </div>
      </section>
    </>
  );
}
