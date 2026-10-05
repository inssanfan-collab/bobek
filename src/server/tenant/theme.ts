import 'server-only';
import { cookies, headers } from 'next/headers';
import { A11Y_COOKIE } from '@/lib/a11y';
import { env } from '@/lib/env';
import { findTheme } from '@/themes';
import type { SiteTheme } from '@/themes/types';

/** Заголовок, которым middleware передаёт тему для предпросмотра (?theme=…). */
export const THEME_PREVIEW_HEADER = 'x-edusad-theme-preview';

/**
 * Тема, которой рисовать сайт сада.
 *
 * Предпросмотр чужой темы (?theme=код) работает при THEME_PREVIEW=1 —
 * в разработке и в сквозных тестах — и на демо-саде (demo.<портал>): его
 * данные выдуманы, на нём садам показывают все дизайны. На настоящих садах
 * примерки нет: иначе любой посетитель мог бы примерить на сад тему,
 * сделанную для другого. Проверяем здесь, а не только в middleware:
 * заголовок мог прислать и сам посетитель.
 */
export async function activeTheme(
  stored: string | null | undefined,
  { ignoreA11y = false }: { ignoreA11y?: boolean } = {},
): Promise<SiteTheme | null> {
  // Версия для слабовидящих — стандартная доступная вёрстка, без темы.
  if (!ignoreA11y && (await a11yOn())) return null;
  const requestHeaders = await headers();
  const host = (requestHeaders.get('host') ?? '').toLowerCase().replace(/:\d+$/, '');
  if (process.env.THEME_PREVIEW === '1' || host === `demo.${env.portalDomain}`) {
    const preview = requestHeaders.get(THEME_PREVIEW_HEADER);
    if (preview === 'none') return null;
    const theme = findTheme(preview);
    if (theme) return theme;
  }
  return findTheme(stored);
}

/** Включена ли у посетителя версия для слабовидящих (cookie сайта сада). */
export async function a11yOn(): Promise<boolean> {
  return (await cookies()).get(A11Y_COOKIE)?.value === '1';
}
