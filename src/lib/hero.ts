import type { TenantProfile } from '@prisma/client';
import { pick, withLocale, type Locale } from '@/lib/i18n';

/**
 * Тексты шапки и первого экрана главной, которые сад пишет сам.
 *
 * Всё необязательно: пустое поле — как было до этих настроек. Заголовок —
 * название сада, описание — текст «О саде», кнопок нет (шаблон показывает
 * свою кнопку с телефоном). Так сад, который ничего не заполнил, не видит
 * никаких перемен.
 */

export type HeroLink = { text: string; href: string; external: boolean };

export type HeroContent = {
  /** Плашка над заголовком: «Пространство гармоничного взросления». */
  eyebrow: string;
  title: string;
  /** Часть заголовка, выделенная цветом, — второй строкой. */
  highlight: string;
  lead: string;
  buttons: HeroLink[];
};

/**
 * Ссылка кнопки: страница сайта получает язык, внешний адрес открывается
 * в новой вкладке. Адрес уже проверен при сохранении (normalizeLinkUrl).
 */
export function ctaLink(text: string, url: string | null | undefined, locale: Locale): HeroLink | null {
  const href = url?.trim();
  if (!text.trim() || !href) return null;
  if (href.startsWith('/')) return { text, href: withLocale(href, locale), external: false };
  return { text, href, external: /^https?:/i.test(href) };
}

export function heroContent(profile: TenantProfile | null, locale: Locale): HeroContent {
  const name = pick(locale, profile?.nameKk, profile?.nameRu);
  const buttons = [
    ctaLink(pick(locale, profile?.heroCta1TextKk, profile?.heroCta1TextRu), profile?.heroCta1Url, locale),
    ctaLink(pick(locale, profile?.heroCta2TextKk, profile?.heroCta2TextRu), profile?.heroCta2Url, locale),
  ].filter((link): link is HeroLink => link !== null);

  return {
    eyebrow: pick(locale, profile?.heroEyebrowKk, profile?.heroEyebrowRu),
    title: pick(locale, profile?.heroTitleKk, profile?.heroTitleRu) || name,
    highlight: pick(locale, profile?.heroHighlightKk, profile?.heroHighlightRu),
    lead: pick(locale, profile?.heroLeadKk, profile?.heroLeadRu) || pick(locale, profile?.aboutKk, profile?.aboutRu),
    buttons,
  };
}

export type HeaderExtras = {
  /** Подпись под названием; пусто — район, как раньше. */
  tagline: string;
  /** Подпись написал сад (а не подставлен район) — её выделяем цветом. */
  taglineCustom: boolean;
  cta: HeroLink | null;
  phone: string | null;
  hours: string | null;
};

export function headerExtras(profile: TenantProfile | null, locale: Locale): HeaderExtras {
  const show = Boolean(profile?.headerShowPhone);
  const custom = pick(locale, profile?.headerTaglineKk, profile?.headerTaglineRu);
  return {
    tagline: custom || profile?.district || '',
    taglineCustom: Boolean(custom),
    cta: ctaLink(pick(locale, profile?.headerCtaTextKk, profile?.headerCtaTextRu), profile?.headerCtaUrl, locale),
    phone: show ? profile?.phone ?? null : null,
    hours: show ? profile?.workHours ?? null : null,
  };
}
