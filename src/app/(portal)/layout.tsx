import type { Metadata } from 'next';
import '../globals.css';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';

export const metadata: Metadata = {
  title: {
    default: 'EduSad — сайты для детских садов Актюбинской области',
    template: '%s · EduSad',
  },
  description:
    `Готовый сайт для детского сада Актобе от ${formatMoney(env.planPrices.BASIC)} в год: своя админка, новости, галерея, документы и меню питания. Наполняете сами или доверяете нам. Каталог садов города.`,
  robots: { index: true, follow: true },
  metadataBase: new URL(`https://${env.portalDomain}`),
  // Карточка превью в WhatsApp и Telegram. Статичный JPEG: WebP там
  // не показывается, а сборщики ссылок ходят за картинкой при каждой
  // пересылке. Пересобрать — pnpm og:image.
  openGraph: {
    type: 'website',
    siteName: 'EduSad',
    locale: 'ru_RU',
    url: `https://${env.portalDomain}`,
    images: [{ url: '/og-edusad.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'EduSad' }],
  },
};

/**
 * Каркас портала. Шапка и подвал живут в PortalChrome и вставляются самими
 * страницами: layout не получает searchParams, а язык портала берётся из
 * адреса. Тот же приём, что на сайтах садов с SiteHeader / SiteFooter.
 *
 * lang="ru" остаётся значением по умолчанию: атрибут уточняет страница,
 * когда открыта казахская версия.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-palette="mandarin" data-skin="portal" data-a11y="off">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Шрифты проверены по глифам, а не по unicode-range: Google Fonts
            объявляет подмножество cyrillic-ext и у тех гарнитур, где казахских
            букв нет вовсе. Manrope оказался как раз таким — ә ғ қ ң ұ у него
            отсутствуют, и браузер подменял их системным шрифтом. Nunito
            (заголовки главной) проверен так же: все казахские буквы есть. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Nunito:wght@800;900&family=Onest:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
