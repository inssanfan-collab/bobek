import type { Metadata } from 'next';
import '../../../globals.css';
// После globals: токены темы должны перекрывать палитру сада.
import '@/themes/themes.css';
import { siteContext } from '@/server/tenant/context';
import { pick } from '@/lib/i18n';
import { env } from '@/lib/env';
import { fontPair, isHeaderStyleCode, isPaletteCode, isPatternCode, isShapeCode } from '@/lib/templates';
import { cssTriplet, derivePalette } from '@/lib/colors';
import { activeTheme } from '@/server/tenant/theme';

export const dynamic = 'force-dynamic';

/**
 * Корневой layout сайта сада. Палитра проставляется атрибутом на <html>,
 * поэтому смена цвета в админке меняет весь сайт без пересборки.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string }>;
}): Promise<Metadata> {
  const { profile, primaryHost } = await siteContext((await params).host);
  const name = profile?.nameRu ?? profile?.nameKk ?? 'Балабақша';

  return {
    metadataBase: new URL(`https://${primaryHost}`),
    title: { default: name, template: `%s · ${name}` },
    description: profile?.aboutRu?.slice(0, 200) ?? `Официальный сайт: ${name}`,
    openGraph: {
      type: 'website',
      siteName: name,
      locale: 'ru_RU',
      url: `https://${primaryHost}`,
      // В ленте мессенджера ссылку на сайт сада узнают по его же обложке.
      // Берём её из /api/og, а не /api/media: там JPEG нужных пропорций,
      // а WhatsApp не показывает WebP, в который пересжимаются все загрузки.
      images: profile?.coverMediaId
        ? [{
            url: `/api/og/${profile.coverMediaId}`,
            width: 1200,
            height: 630,
            type: 'image/jpeg',
            alt: name,
          }]
        : undefined,
    },
    // Значок вкладки — логотип сада, который он загрузил в админке.
    icons: profile?.logoMediaId ? { icon: `/api/media/${profile.logoMediaId}` } : undefined,
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string }>;
}) {
  const { tenant, profile } = await siteContext((await params).host);
  // «Свой цвет» без самого цвета — откатываемся на стандартную палитру.
  const custom = tenant.palette === 'custom' && tenant.brandColor ? derivePalette(tenant.brandColor) : null;
  const palette = custom ? 'custom' : isPaletteCode(tenant.palette) && tenant.palette !== 'custom' ? tenant.palette : 'mandarin';
  const pattern = isPatternCode(tenant.pattern) ? tenant.pattern : 'none';
  const fonts = fontPair(tenant.fontPair);
  const shape = isShapeCode(tenant.shape) ? tenant.shape : 'soft';
  const headerStyle = isHeaderStyleCode(tenant.headerStyle) ? tenant.headerStyle : 'light';
  // Индивидуальная тема: её CSS действует только при этом атрибуте.
  const theme = await activeTheme(tenant.themeCode);

  return (
    <html
      lang="ru"
      data-palette={palette}
      data-pattern={pattern}
      data-theme={theme?.code}
      // Шапка не закреплена — одно CSS-правило в globals.css. Атрибутом, а не
      // пропом шапки: так настройка работает и в шаблонах, и в темах.
      data-header={tenant.headerSticky ? undefined : 'static'}
      data-header-style={headerStyle === 'light' ? undefined : headerStyle}
      data-font={fonts.code === 'soft' ? undefined : fonts.code}
      data-shape={shape === 'soft' ? undefined : shape}
      data-a11y="off"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Только выбранная садом пара шрифтов — остальные посетителю не нужны. */}
        <link href={`https://fonts.googleapis.com/css2?${fonts.google}&display=swap`} rel="stylesheet" />
        {custom ? (
          // «Свой цвет»: токены палитры из одного цвета сада. Правило, а не
          // style на <html>: встроенный стиль перебил бы версию для
          // слабовидящих, а так она по-прежнему сильнее.
          <style
            dangerouslySetInnerHTML={{
              __html: `:root[data-palette='custom']:not([data-a11y='on']){--surface:${cssTriplet(custom.surface)};--card:255 255 255;--brand:${cssTriplet(custom.brand)};--brand-soft:${cssTriplet(custom.brandSoft)};--brand-ink:${cssTriplet(custom.brandInk)};--accent:${cssTriplet(custom.accent)};}`,
            }}
          />
        ) : null}
        <script
          type="application/ld+json"
          // Микроразметка нужна, чтобы сад корректно показывался в поиске и на картах.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Preschool',
              name: pick('ru', profile?.nameKk, profile?.nameRu),
              telephone: profile?.phone ?? undefined,
              email: profile?.email ?? undefined,
              address: profile?.addressRu
                ? { '@type': 'PostalAddress', streetAddress: profile.addressRu, addressLocality: 'Актобе', addressCountry: 'KZ' }
                : undefined,
              geo:
                profile?.lat && profile?.lng
                  ? { '@type': 'GeoCoordinates', latitude: profile.lat, longitude: profile.lng }
                  : undefined,
              isPartOf: { '@type': 'WebSite', url: `https://${env.portalDomain}` },
            }),
          }}
        />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
          Перейти к содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
