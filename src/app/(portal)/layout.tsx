import type { Metadata } from 'next';
import '../globals.css';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';

export const metadata: Metadata = {
  title: {
    default: 'Bobegim — сайты для детских садов Актюбинской области',
    template: '%s · Bobegim',
  },
  description:
    `Готовый сайт для детского сада Актобе за ${formatMoney(env.subscriptionPrice)} в год: своя админка, новости, галерея, документы и меню питания. Каталог садов города.`,
  robots: { index: true, follow: true },
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
    <html lang="ru" data-palette="mandarin" data-a11y="off">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
