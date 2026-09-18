import { findThemeInfo } from './catalog';
import { ObrazecFooter } from './obrazec/Footer';
import { ObrazecHeader } from './obrazec/Header';
import { ObrazecHome } from './obrazec/Home';
import type { SiteTheme, ThemeParts } from './types';

/**
 * Вёрстка индивидуальных тем — см. src/themes/README.md.
 *
 * Новая тема: папка src/themes/<код>/ с Home/Header/Footer (любые из них)
 * и theme.css, строка в catalog.ts, строка здесь и @import в themes.css.
 * Тест tests/unit/themes.test.ts сверяет, что ничего не забыто.
 */
const PARTS: Record<string, ThemeParts> = {
  obrazec: { Home: ObrazecHome, Header: ObrazecHeader, Footer: ObrazecFooter },
};

export function findTheme(code: string | null | undefined): SiteTheme | null {
  const info = findThemeInfo(code);
  if (!info) return null;
  return { ...info, ...(PARTS[info.code] ?? {}) };
}
