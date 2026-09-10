import Link from 'next/link';
import Image from 'next/image';
import { LOCALES, LOCALE_LABEL, withLocale, type Locale } from '@/lib/i18n';
import { VersionCompareBar } from './VersionCompareBar';

const T = {
  skip: { kk: 'Мазмұнға өту', ru: 'Перейти к содержимому' },
  mainMenu: { kk: 'Негізгі мәзір', ru: 'Основное меню' },
  connect: { kk: 'Балабақшаны қосу', ru: 'Подключить сад' },
  login: { kk: 'Кіру', ru: 'Вход в админку' },
  languageGroup: { kk: 'Сайт тілі', ru: 'Язык сайта' },
  about: {
    kk: 'Ақтөбе облысының балабақшаларына арналған жаңа буын мультисайты. Дайын заманауи дизайн, қауіпсіз деректер, балалар мен ата-аналарға ыңғайлы экожүйе.',
    ru: 'Платформа нового поколения для детских садов Актюбинской области. Премиальный 3D-дизайн, безопасность детей, готовый сайт за 24 часа.',
  },
  sections: { kk: 'Бөлімдер', ru: 'Разделы портала' },
  parents: { kk: 'Ата-аналарға', ru: 'Родителям' },
  queue: { kk: 'Балабақшаға кезек (Darabala.kz)', ru: 'Очередь в детский сад (Darabala.kz)' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
  city: { kk: 'Ақтөбе қ.', ru: 'г. Актобе' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  offer: { kk: 'Жария оферта', ru: 'Публичная оферта' },
  status: { kk: 'Ақтөбе облысының ресми білім порталы', ru: 'Официальный портал садов Актобе' },
} as const;

const NAV = [
  { href: '/catalog', label: { kk: 'Балабақшалар каталогы', ru: 'Каталог садов' } },
  { href: '/parents', label: { kk: 'Ата-аналарға', ru: 'Родителям' } },
  { href: '/pricing', label: { kk: 'Тарифтер', ru: 'Тарифы' } },
  { href: '/news', label: { kk: 'Жаңалықтар', ru: 'Новости' } },
  { href: '/contacts', label: { kk: 'Байланыс', ru: 'Контакты' } },
] as const;

export function RedesignPage({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1E293B] antialiased selection:bg-orange-500/20 selection:text-orange-950 font-sans">
      <VersionCompareBar locale={locale} currentMode="redesign" />
      <RedesignHeader locale={locale} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <RedesignFooter locale={locale} />
    </div>
  );
}

export function RedesignHeader({ locale }: { locale: Locale }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-orange-600 focus:px-4 focus:py-2 focus:text-white"
      >
        {T.skip[locale]}
      </a>

      <header className="sticky top-[41px] z-40 border-b border-orange-100/80 bg-white/80 backdrop-blur-xl shadow-xs transition-all">
        <div className="container-page flex h-20 items-center justify-between gap-4 py-3">
          {/* Logo with mascot badge */}
          <Link href={withLocale('/redesign', locale)} className="flex items-center gap-3.5 group">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden border-2 border-orange-200/80 shadow-md group-hover:scale-105 group-hover:rotate-2 transition-transform duration-300">
              <Image
                src="/assets/redesign/mascot-logo.jpg"
                alt="Bobegim mascot"
                width={48}
                height={48}
                className="object-cover w-full h-full"
                priority
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bobegim
                </span>
                <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                  KZ 2026
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 -mt-0.5 hidden sm:block">
                {T.status[locale]}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label={T.mainMenu[locale]}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href, locale)}
                className="rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200"
              >
                {item.label[locale]}
              </Link>
            ))}
          </nav>

          {/* Right Actions & Locale Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <div
              className="flex overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-inner"
              role="group"
              aria-label={T.languageGroup[locale]}
            >
              {LOCALES.map((code) => (
                <Link
                  key={code}
                  href={withLocale('/redesign', code)}
                  aria-current={code === locale}
                  className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
                    code === locale
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {LOCALE_LABEL[code]}
                </Link>
              ))}
            </div>

            {/* Admin Login Button */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-orange-300 shadow-xs transition"
            >
              <span className="text-sm">🔒</span>
              <span>{T.login[locale]}</span>
            </Link>

            {/* Primary Connect CTA */}
            <Link
              href={withLocale('/apply', locale)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:brightness-110 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>{T.connect[locale]}</span>
              <span className="text-base leading-none">✨</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Horizontal Scroll */}
        <nav className="container-page flex gap-2 overflow-x-auto pb-3 pt-1 lg:hidden scrollbar-none" aria-label={T.mainMenu[locale]}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={withLocale(item.href, locale)}
              className="whitespace-nowrap rounded-2xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-orange-300 hover:text-orange-600"
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}

export function RedesignFooter({ locale }: { locale: Locale }) {
  const isKk = locale === 'kk';

  return (
    <footer className="mt-28 border-t border-slate-200/80 bg-white">
      {/* Top Footer Banner */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-orange-50/50 to-white py-12">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl overflow-hidden shadow-lg border-2 border-white shrink-0">
              <Image
                src="/assets/redesign/mascot-logo.jpg"
                alt="Bobegim mascot"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-slate-900">
                Bobegim — {isKk ? 'балабақшаларға арналған бірыңғай экожүйе' : 'единая экосистема детских садов'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {isKk
                  ? 'Ақтөбе облысы бойынша мемлекеттік және жеке мектепке дейінгі білім беру ұйымдарына арналған'
                  : 'Специально для дошкольных организаций Актюбинской области с соблюдением требований МОН РК'}
              </p>
            </div>
          </div>

          <Link
            href={withLocale('/apply', locale)}
            className="rounded-2xl bg-slate-900 px-6 py-3.5 text-xs font-black text-white hover:bg-orange-600 shadow-md transition-all shrink-0"
          >
            {isKk ? 'Балабақшаны қазір қосу →' : 'Подключить свой сад →'}
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Col 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-2xl font-black text-slate-900 tracking-tight">
              Bobegim.kz
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {T.about[locale]}
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
            <span>🛡️</span>
            <span>{isKk ? 'ҚР серверлерінде орналасқан' : 'Серверы строго в Республике Казахстан'}</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <p className="font-display text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
            {T.sections[locale]}
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600 font-bold">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={withLocale(item.href, locale)}
                  className="hover:text-orange-600 transition"
                >
                  {item.label[locale]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={withLocale('/pricing', locale)}
                className="text-orange-600 hover:underline"
              >
                {isKk ? 'Тариф: жылына 50 000 ₸ →' : 'Тариф: 50 000 ₸ в год →'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <p className="font-display text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
            {T.parents[locale]}
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600 font-bold">
            <li>
              <a
                href="https://darabala.kz"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-600 transition inline-flex items-center gap-1.5"
              >
                <span>{T.queue[locale]}</span>
                <span>↗</span>
              </a>
            </li>
            <li>
              <Link href={withLocale('/parents', locale)} className="hover:text-orange-600 transition">
                {isKk ? 'Балабақшаны таңдау нұсқаулығы' : 'Гид по выбору детского сада'}
              </Link>
            </li>
            <li>
              <Link href={withLocale('/catalog', locale)} className="hover:text-orange-600 transition">
                {isKk ? 'Ақтөбе сандарының картасы' : 'Интерактивная карта садов'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <p className="font-display text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
            {T.contacts[locale]}
          </p>
          <div className="space-y-3 text-xs text-slate-600">
            <p className="font-bold text-slate-900">
              {T.city[locale]}, {isKk ? 'Ақтөбе облысы' : 'Актюбинская область'}
            </p>
            <p className="flex items-center gap-2 font-mono text-slate-900 font-bold">
              <span>📞</span>
              <span>+7 (7132) 90-50-60</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-black">WhatsApp қолдау желісі: 24/7</span>
            </p>
            <div className="pt-2">
              <Link
                href={withLocale('/apply', locale)}
                className="inline-block rounded-xl bg-orange-50 border border-orange-200 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-600 hover:text-white transition"
              >
                {T.apply[locale]}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Copyright */}
      <div className="border-t border-slate-100 bg-slate-50/70 py-6">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 Bobegim.kz. {isKk ? 'Барлық құқықтар қорғалған.' : 'Все права защищены.'}</p>
          <div className="flex items-center gap-4">
            <Link href={withLocale('/offer', locale)} className="hover:text-slate-900 transition">
              {T.offer[locale]}
            </Link>
            <span>•</span>
            <span>{isKk ? 'Қазақстан Республикасы' : 'г. Актобе, Республика Казахстан'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
