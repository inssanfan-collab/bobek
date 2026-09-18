import type { ReactElement, ReactNode } from 'react';
import { HeaderTools, SiteHeader, siteNavLinks } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';
import { TemplateHome } from '@/templates';
import { ThemeBoundary } from '@/themes/ThemeBoundary';
import { activeTheme } from '@/server/tenant/theme';
import { renderThemePart } from '@/server/themes/render';
import { withLocale, type Locale } from '@/lib/i18n';
import { isHeaderLayoutCode } from '@/lib/templates';
import type { HomeProps } from '@/templates/types';
import type { MenuSection } from '@/themes/types';
import type { TenantProfile } from '@prisma/client';

/*
 * Точки, где индивидуальная тема подменяет стандартный сайт: шапка, подвал
 * и главная. Если у сада нет темы или тема не задаёт эту часть — рисуется
 * стандартная. Если тема упала — тоже стандартная: на сервере это ловит
 * renderThemePart, в браузере — ThemeBoundary.
 */

async function themed(
  theme: string,
  part: 'home' | 'header' | 'footer',
  element: ReactElement,
  standard: ReactNode,
) {
  const { node, failed } = await renderThemePart(theme, part, element, standard);
  if (failed) return <div data-theme-fallback={part}>{node}</div>;
  return (
    <ThemeBoundary theme={theme} part={part} fallback={standard}>
      {node}
    </ThemeBoundary>
  );
}

type HeaderProps = {
  themeCode: string | null;
  /** Вид стандартной шапки; у индивидуальной темы шапка своя. */
  layout?: string;
  profile: TenantProfile | null;
  sections: MenuSection[];
  locale: Locale;
  pathname: string;
};

export async function ThemedHeader({ themeCode, layout, ...props }: HeaderProps) {
  const standard = <SiteHeader {...props} layout={layout && isHeaderLayoutCode(layout) ? layout : 'classic'} />;
  const theme = await activeTheme(themeCode);
  if (!theme?.Header) return standard;

  const Header = theme.Header;
  return themed(
    theme.code,
    'header',
    <Header
      {...props}
      homeHref={withLocale('/', props.locale)}
      tools={<HeaderTools locale={props.locale} pathname={props.pathname} />}
      nav={<SiteNav locale={props.locale} links={siteNavLinks(props.sections, props.locale)} />}
    />,
    standard,
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
  return themed(theme.code, 'footer', <Footer {...props} />, standard);
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
  return themed(theme.code, 'home', <Home {...props} />, standard);
}
