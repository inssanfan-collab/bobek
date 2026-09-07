import type { Metadata } from 'next';
import Link from 'next/link';
import '../globals.css';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: {
    default: 'Bobegim — сайты для детских садов Актюбинской области',
    template: '%s · Bobegim',
  },
  description:
    'Готовый сайт для детского сада Актобе за 20 000 ₸ в год: своя админка, новости, галерея, документы и меню питания. Каталог садов города.',
  robots: { index: true, follow: true },
};

const NAV = [
  { href: '/catalog', label: 'Каталог садов' },
  { href: '/parents', label: 'Родителям' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/news', label: 'Новости' },
  { href: '/contacts', label: 'Контакты' },
];

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
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
          Перейти к содержимому
        </a>

        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
          <div className="container-page flex h-16 items-center gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand text-lg text-white" aria-hidden>
                🧸
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">Bobegim</span>
            </Link>

            <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Основное меню">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/apply" className="btn-primary text-sm">
                Подключить сад
              </Link>
              <Link href="/admin" className="btn-secondary hidden text-sm sm:inline-flex">
                Вход
              </Link>
            </div>
          </div>

          <nav className="container-page flex gap-1 overflow-x-auto pb-2 md:hidden" aria-label="Основное меню">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main id="main">{children}</main>

        <footer className="mt-20 border-t border-line bg-card">
          <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-lg font-extrabold">Bobegim</p>
              <p className="mt-2 text-sm text-muted">
                Сайты для детских садов Актюбинской области. Готовый движок, своя админка,
                поддержка на казахском и русском.
              </p>
            </div>
            <div>
              <p className="mb-2 font-semibold">Разделы</p>
              <ul className="space-y-1.5 text-sm text-muted">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-brand-ink">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold">Родителям</p>
              <ul className="space-y-1.5 text-sm text-muted">
                <li>
                  <a href="https://egov.kz/cms/ru/articles/child/2Fdetskiii_sad_rk" target="_blank" rel="noopener noreferrer">
                    Очередь в детский сад (egov.kz)
                  </a>
                </li>
                <li>
                  <a href="https://balabaqsha.snation.kz/" target="_blank" rel="noopener noreferrer">
                    Портал дошкольного образования
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold">Контакты</p>
              <ul className="space-y-1.5 text-sm text-muted">
                <li>г. Актобе</li>
                <li>
                  <Link href="/apply" className="font-semibold text-brand-ink">Оставить заявку</Link>
                </li>
                <li>
                  <Link href="/offer" className="hover:text-brand-ink">Публичная оферта</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-line py-4 text-center text-sm text-muted">
            © {new Date().getFullYear()} {env.portalDomain}
          </div>
        </footer>
      </body>
    </html>
  );
}
