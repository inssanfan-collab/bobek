import { findThemeInfo } from './catalog';
import { AkkuFooter } from './akku/Footer';
import { AkkuHeader } from './akku/Header';
import { AkkuHome } from './akku/Home';
import { AkvarelFooter } from './akvarel/Footer';
import { AkvarelHeader } from './akvarel/Header';
import { AkvarelHome } from './akvarel/Home';
import { DalaFooter } from './dala/Footer';
import { DalaHeader } from './dala/Header';
import { DalaHome } from './dala/Home';
import { KonstruktorFooter } from './konstruktor/Footer';
import { KonstruktorHeader } from './konstruktor/Header';
import { KonstruktorHome } from './konstruktor/Home';
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
  dala: { Home: DalaHome, Header: DalaHeader, Footer: DalaFooter },
  akvarel: { Home: AkvarelHome, Header: AkvarelHeader, Footer: AkvarelFooter },
  konstruktor: { Home: KonstruktorHome, Header: KonstruktorHeader, Footer: KonstruktorFooter },
  akku: { Home: AkkuHome, Header: AkkuHeader, Footer: AkkuFooter },
};

export function findTheme(code: string | null | undefined): SiteTheme | null {
  const info = findThemeInfo(code);
  if (!info) return null;
  return { ...info, ...(PARTS[info.code] ?? {}) };
}
