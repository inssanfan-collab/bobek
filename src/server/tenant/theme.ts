import 'server-only';
import { headers } from 'next/headers';
import { findTheme } from '@/themes';
import type { SiteTheme } from '@/themes/types';

/** Заголовок, которым middleware передаёт тему для предпросмотра (?theme=…). */
export const THEME_PREVIEW_HEADER = 'x-edusad-theme-preview';

/**
 * Тема, которой рисовать сайт сада.
 *
 * Предпросмотр чужой темы (?theme=код) работает только при THEME_PREVIEW=1 —
 * в разработке и в сквозных тестах. На боевом сервере переменной нет:
 * иначе любой посетитель мог бы примерить на сад тему, сделанную для другого.
 * Проверяем здесь, а не только в middleware: заголовок мог прислать и сам
 * посетитель.
 */
export async function activeTheme(stored: string | null | undefined): Promise<SiteTheme | null> {
  if (process.env.THEME_PREVIEW === '1') {
    const preview = (await headers()).get(THEME_PREVIEW_HEADER);
    if (preview === 'none') return null;
    const theme = findTheme(preview);
    if (theme) return theme;
  }
  return findTheme(stored);
}
