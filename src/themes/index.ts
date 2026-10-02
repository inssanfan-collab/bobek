import { findThemeInfo } from './catalog';
import { ErekshFooter } from './erekshe/Footer';
import { ErekshHeader } from './erekshe/Header';
import { ErekshHome } from './erekshe/Home';
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
import { OyinFooter } from './oyin/Footer';
import { OyinHeader } from './oyin/Header';
import { OyinHome } from './oyin/Home';
import { ResmiFooter } from './resmi/Footer';
import { ResmiHeader } from './resmi/Header';
import { ResmiHome } from './resmi/Home';
import { ShuaqFooter } from './shuaq/Footer';
import { ShuaqHeader } from './shuaq/Header';
import { ShuaqHome } from './shuaq/Home';
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
  oyin: { Home: OyinHome, Header: OyinHeader, Footer: OyinFooter },
  resmi: { Home: ResmiHome, Header: ResmiHeader, Footer: ResmiFooter },
  shuaq: { Home: ShuaqHome, Header: ShuaqHeader, Footer: ShuaqFooter },
  erekshe: { Home: ErekshHome, Header: ErekshHeader, Footer: ErekshFooter },
};

export function findTheme(code: string | null | undefined): SiteTheme | null {
  const info = findThemeInfo(code);
  if (!info) return null;
  return { ...info, ...(PARTS[info.code] ?? {}) };
}
