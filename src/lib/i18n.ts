export const LOCALES = ['kk', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'kk' || value === 'ru';
}

/**
 * Берёт поле на нужном языке, а если перевода нет — на втором.
 * Пустая строка считается отсутствием перевода: сад сохранил форму, не заполнив вкладку.
 * Показать «Главная» по-русски казахоязычному родителю лучше, чем пустое место.
 */
export function pick(
  locale: Locale,
  kk: string | null | undefined,
  ru: string | null | undefined,
): string {
  const primary = locale === 'kk' ? kk : ru;
  const fallback = locale === 'kk' ? ru : kk;
  return (primary?.trim() || fallback?.trim() || '') as string;
}

export function pickOrNull(
  locale: Locale,
  kk: string | null | undefined,
  ru: string | null | undefined,
): string | null {
  const value = pick(locale, kk, ru);
  return value === '' ? null : value;
}

export const LOCALE_LABEL: Record<Locale, string> = { kk: 'ҚАЗ', ru: 'РУС' };
export const LOCALE_FULL: Record<Locale, string> = { kk: 'Қазақша', ru: 'Русский' };
