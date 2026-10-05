import 'server-only';
import { headers } from 'next/headers';
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
export async function activeTheme(stored: string | null | undefined): Promise<SiteTheme | null> {
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
