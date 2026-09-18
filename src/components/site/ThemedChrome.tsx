import { HeaderTools, SiteHeader, siteNavLinks } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';
import { TemplateHome } from '@/templates';
import { ThemeBoundary } from '@/themes/ThemeBoundary';
import { activeTheme } from '@/server/tenant/theme';
import { withLocale, type Locale } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import type { MenuSection } from '@/themes/types';
import type { TenantProfile } from '@prisma/client';

/*
 * Точки, где индивидуальная тема подменяет стандартный сайт: шапка, подвал
 * и главная. Если у сада нет темы или тема не задаёт эту часть — рисуется
 * стандартная. Если тема упала — тоже стандартная (ThemeBoundary).
 */

type HeaderProps = {
  themeCode: string | null;
  profile: TenantProfile | null;
  sections: MenuSection[];
  locale: Locale;
  pathname: string;
};

export async function ThemedHeader({ themeCode, ...props }: HeaderProps) {
  const standard = <SiteHeader {...props} />;
  const theme = await activeTheme(themeCode);
  if (!theme?.Header) return standard;

  const Header = theme.Header;
  return (
    <ThemeBoundary theme={theme.code} part="header" fallback={standard}>
      <Header
        {...props}
        homeHref={withLocale('/', props.locale)}
        tools={<HeaderTools locale={props.locale} pathname={props.pathname} />}
        nav={<SiteNav locale={props.locale} links={siteNavLinks(props.sections, props.locale)} />}
      />
    </ThemeBoundary>
  );
}

type FooterProps = {
  themeCode: string | null;
  profile: TenantProfile | null;
  sections: MenuSection[];
  locale: Locale;
  portalDomain: string;
};

export async function ThemedFooter({ themeCode, ...props }: FooterProps) {
  const standard = <SiteFooter {...props} />;
  const theme = await activeTheme(themeCode);
  if (!theme?.Footer) return standard;

  const Footer = theme.Footer;
  return (
    <ThemeBoundary theme={theme.code} part="footer" fallback={standard}>
      <Footer {...props} />
    </ThemeBoundary>
  );
}

export async function ThemedHome({
  themeCode,
  templateCode,
  ...props
}: HomeProps & { themeCode: string | null; templateCode: string }) {
  const standard = <TemplateHome code={templateCode} {...props} />;
  const theme = await activeTheme(themeCode);
  if (!theme?.Home) return standard;

  const Home = theme.Home;
  return (
    <ThemeBoundary theme={theme.code} part="home" fallback={standard}>
      <Home {...props} />
    </ThemeBoundary>
  );
}
