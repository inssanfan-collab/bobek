import type { Metadata } from 'next';
import { env } from '@/lib/env';
import type { Locale } from '@/lib/i18n';

/** Адрес страницы портала на нужном языке: русская — без параметра, казахская — ?lang=kk. */
export function portalUrl(path: string, locale: Locale): string {
  const url = `https://${env.portalDomain}${path || '/'}`;
  return locale === 'kk' ? `${url}${url.includes('?') ? '&' : '?'}lang=kk` : url;
}

/**
 * canonical и hreflang страницы портала — полными адресами. Относительный
 * '/?lang=kk' Next склеивал с metadataBase без параметра, и поисковик видел
 * у казахской версии тот же адрес, что у русской: казахская в поиск не попадала.
 *
 * Не для главной: у адреса с путём «/» Next оставляет только домен и теряет
 * ?lang=kk даже у полного адреса. Главная выводит теги сама (portalAlternateLinks).
 */
export function portalAlternates(path: string, locale: Locale): Metadata['alternates'] {
  return {
    canonical: portalUrl(path, locale),
    languages: {
      ru: portalUrl(path, 'ru'),
      kk: portalUrl(path, 'kk'),
      'x-default': portalUrl(path, 'ru'),
    },
  };
}

/** Те же canonical и hreflang списком — для главной, которая выводит <link> сама. */
export function portalAlternateLinks(path: string, locale: Locale): { rel: 'canonical' | 'alternate'; hrefLang?: string; href: string }[] {
  return [
    { rel: 'canonical', href: portalUrl(path, locale) },
    { rel: 'alternate', hrefLang: 'ru', href: portalUrl(path, 'ru') },
    { rel: 'alternate', hrefLang: 'kk', href: portalUrl(path, 'kk') },
    { rel: 'alternate', hrefLang: 'x-default', href: portalUrl(path, 'ru') },
  ];
}
