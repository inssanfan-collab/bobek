import Link from 'next/link';
import { env } from '@/lib/env';
import { LOCALES, LOCALE_LABEL, withLocale, type Locale } from '@/lib/i18n';

/**
 * Шапка и подвал портала.
 *
 * Вынесены из layout намеренно: layout в Next не получает searchParams,
 * а язык портала живёт именно в адресе (`?lang=kk`) — как на сайтах садов.
 * Держать его в cookie было бы проще, но тогда поисковик увидел бы одну
 * версию страницы вместо двух.
 */

const T = {
  skip: { kk: 'Мазмұнға өту', ru: 'Перейти к содержимому' },
  mainMenu: { kk: 'Негізгі мәзір', ru: 'Основное меню' },
  connect: { kk: 'Балабақшаны қосу', ru: 'Подключить сад' },
  login: { kk: 'Кіру', ru: 'Вход' },
  languageGroup: { kk: 'Сайт тілі', ru: 'Язык сайта' },
  about: {
    kk: 'Ақтөбе облысының балабақшаларына арналған сайттар. Дайын жүйе, жеке әкімші бөлімі, қазақ және орыс тілдерінде қолдау.',
    ru: 'Сайты для детских садов Актюбинской области. Готовый движок, своя админка, поддержка на казахском и русском.',
  },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  parents: { kk: 'Ата-аналарға', ru: 'Родителям' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  preschoolPortal: { kk: 'Мектепке дейінгі білім порталы', ru: 'Портал дошкольного образования' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  city: { kk: 'Ақтөбе қ.', ru: 'г. Актобе' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  offer: { kk: 'Жария оферта', ru: 'Публичная оферта' },
} as const;

const NAV = [
  { href: '/catalog', label: { kk: 'Балабақшалар каталогы', ru: 'Каталог садов' } },
  { href: '/parents', label: { kk: 'Ата-аналарға', ru: 'Родителям' } },
  { href: '/pricing', label: { kk: 'Тарифтер', ru: 'Тарифы' } },
  { href: '/news', label: { kk: 'Жаңалықтар', ru: 'Новости' } },
  { href: '/contacts', label: { kk: 'Байланыс', ru: 'Контакты' } },
] as const;

/**
 * Обёртка страницы портала: шапка, main и подвал разом. Страницы вставляют
 * её вместо того, чтобы повторять три компонента подряд.
 */
export function PortalPage({
  locale,
  pathname,
  children,
}: {
  locale: Locale;
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalHeader locale={locale} pathname={pathname} />
      <main id="main">{children}</main>
      <PortalFooter locale={locale} />
    </>
  );
}

export function PortalHeader({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {T.skip[locale]}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-6">
          <Link href={withLocale('/', locale)} className="flex shrink-0 items-center gap-2.5">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-ink font-display text-lg font-extrabold text-white"
              aria-hidden
            >
              Б
            </span>
            <span>
              <span className="block font-display text-xl font-extrabold leading-none tracking-tight">
                Бөбегім
              </span>
              {/* На узком экране подпись прячется: вместе с кнопками шапки
                  она не помещается в 375 px и вызывала горизонтальный скролл. */}
              <span className="mt-0.5 hidden text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-muted sm:block">
                Ақтөбе балабақшалары
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label={T.mainMenu[locale]}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href, locale)}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink"
              >
                {item.label[locale]}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <PortalLocaleSwitch locale={locale} pathname={pathname} />
            <Link href={withLocale('/apply', locale)} className="btn-primary text-sm">
              {T.connect[locale]}
            </Link>
            <Link href="/admin" className="btn-secondary hidden text-sm sm:inline-flex">
              {T.login[locale]}
            </Link>
          </div>
        </div>

        <nav className="container-page flex gap-1 overflow-x-auto pb-2 md:hidden" aria-label={T.mainMenu[locale]}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={withLocale(item.href, locale)}
              className="whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft"
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

function PortalLocaleSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-line" role="group" aria-label={T.languageGroup[locale]}>
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={withLocale(pathname, code)}
          aria-current={code === locale}
          className={
            code === locale
              ? 'bg-brand px-2.5 py-1.5 text-xs font-bold text-white'
              : 'px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink'
          }
        >
          {LOCALE_LABEL[code]}
        </Link>
      ))}
    </div>
  );
}

export function PortalFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-extrabold">Bobegim</p>
          <p className="mt-2 text-sm text-muted">{T.about[locale]}</p>
        </div>
        <div>
          <p className="mb-2 font-semibold">{T.sections[locale]}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={withLocale(item.href, locale)} className="hover:text-brand-ink">
                  {item.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold">{T.parents[locale]}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>
              <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer">
                {T.queue[locale]}
              </a>
            </li>
            <li>
              <a href="https://balabaqsha.snation.kz/" target="_blank" rel="noopener noreferrer">
                {T.preschoolPortal[locale]}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold">{T.contacts[locale]}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>{T.city[locale]}</li>
            <li>
              <Link href={withLocale('/apply', locale)} className="font-semibold text-brand-ink">
                {T.apply[locale]}
              </Link>
            </li>
            <li>
              <Link href={withLocale('/offer', locale)} className="hover:text-brand-ink">
                {T.offer[locale]}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} {env.portalDomain}
      </div>
    </footer>
  );
}
