import { findThemeInfo } from './catalog';
import { KunbagysFooter } from './kunbagys/Footer';
import { KunbagysHeader } from './kunbagys/Header';
import { KunbagysHome } from './kunbagys/Home';
import { AkordaFooter } from './akorda/Footer';
import { AkordaHeader } from './akorda/Header';
import { AkordaHome } from './akorda/Home';
import { UyshikFooter } from './uyshik/Footer';
import { UyshikHeader } from './uyshik/Header';
import { UyshikHome } from './uyshik/Home';
import { UyshikAnimFooter } from './uyshik-anim/Footer';
import { UyshikAnimHeader } from './uyshik-anim/Header';
import { UyshikAnimHome } from './uyshik-anim/Home';
import { MamyqFooter } from './mamyq/Footer';
import { MamyqHeader } from './mamyq/Header';
import { MamyqHome } from './mamyq/Home';
import { GulderFooter } from './gulder/Footer';
import { GulderHeader } from './gulder/Header';
import { GulderHome } from './gulder/Home';
import { NurFooter } from './nur/Footer';
import { NurHeader } from './nur/Header';
import { NurHome } from './nur/Home';
import { KosaqFooter } from './kosaq/Footer';
import { KosaqHeader } from './kosaq/Header';
import { KosaqHome } from './kosaq/Home';
import { KuanyshFooter } from './kuanysh/Footer';
import { KuanyshHeader } from './kuanysh/Header';
import { KuanyshHome } from './kuanysh/Home';
import { AspanFooter } from './aspan/Footer';
import { AspanHeader } from './aspan/Header';
import { AspanHome } from './aspan/Home';
import { JasylFooter } from './jasyl/Footer';
import { JasylHeader } from './jasyl/Header';
import { JasylHome } from './jasyl/Home';
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
  akorda: { Home: AkordaHome, Header: AkordaHeader, Footer: AkordaFooter },
  uyshik: { Home: UyshikHome, Header: UyshikHeader, Footer: UyshikFooter },
  'uyshik-anim': { Home: UyshikAnimHome, Header: UyshikAnimHeader, Footer: UyshikAnimFooter },
  resmi: { Home: ResmiHome, Header: ResmiHeader, Footer: ResmiFooter },
  shuaq: { Home: ShuaqHome, Header: ShuaqHeader, Footer: ShuaqFooter },
  erekshe: { Home: ErekshHome, Header: ErekshHeader, Footer: ErekshFooter },
  jasyl: { Home: JasylHome, Header: JasylHeader, Footer: JasylFooter },
  aspan: { Home: AspanHome, Header: AspanHeader, Footer: AspanFooter },
  kuanysh: { Home: KuanyshHome, Header: KuanyshHeader, Footer: KuanyshFooter },
  kosaq: { Home: KosaqHome, Header: KosaqHeader, Footer: KosaqFooter },
  nur: { Home: NurHome, Header: NurHeader, Footer: NurFooter },
  gulder: { Home: GulderHome, Header: GulderHeader, Footer: GulderFooter },
  mamyq: { Home: MamyqHome, Header: MamyqHeader, Footer: MamyqFooter },
  kunbagys: { Home: KunbagysHome, Header: KunbagysHeader, Footer: KunbagysFooter },
};

export function findTheme(code: string | null | undefined): SiteTheme | null {
  const info = findThemeInfo(code);
  if (!info) return null;
  return { ...info, ...(PARTS[info.code] ?? {}) };
}
