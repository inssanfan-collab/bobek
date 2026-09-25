import { withLocale, type Locale } from '@/lib/i18n';
import { portalSettings } from '@/server/docs/contract';
import './sales.css';

/**
 * Шапка и подвал продающей части портала: главная, оферта, контакты.
 * На главной пункты меню — якоря той же страницы, на остальных — ссылки
 * на разделы главной (`/#tarify`), с языком.
 *
 * Страницы для родителей (каталог, новости) пока на прежнем оформлении
 * (PortalChrome): с главной на них не ведут, пока садов немного.
 */

const T = {
  home: { kk: 'EduSad, басты бет', ru: 'EduSad, на главную' },
  sections: { kk: 'Бөлімдер', ru: 'Разделы' },
  navFeatures: { kk: 'Мүмкіндіктер', ru: 'Возможности' },
  navPlans: { kk: 'Тарифтер', ru: 'Тарифы' },
  navSteps: { kk: 'Қалай қосылуға болады', ru: 'Как подключиться' },
  navFaq: { kk: 'Сұрақтар', ru: 'Вопросы' },
  langGroup: { kk: 'Сайт тілі', ru: 'Язык сайта' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  skip: { kk: 'Мазмұнға өту', ru: 'К содержанию' },
  footAbout: {
    kk: 'Балабақшаларға сайт жасаймыз — қазақ және орыс тілдерінде, әкімші бөлімімен және Қазақстандағы хостингпен.',
    ru: 'Создаём сайты для детских садов — на казахском и русском, с админкой и хостингом в Казахстане.',
  },
  guide: { kk: 'Нұсқаулық, PDF', ru: 'Инструкция, PDF' },
  offer: { kk: 'Жария оферта', ru: 'Публичная оферта' },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
} as const;

/** Знак EduSad — бумажный самолётик. Цвета линий задаёт фон (.lm в sales.css). */
export function PlaneLogo() {
  return (
    <svg className="lm" width="46" height="46" viewBox="0 0 512 512" aria-hidden="true">
      <circle cx="296" cy="232" r="178" fill="var(--pl-sun)" />
      <g stroke="var(--pl-line)" strokeWidth="15" strokeLinejoin="round" strokeLinecap="round">
        <path d="M96 202L480 74L262 212Z" fill="var(--pl-wing)" />
        <path d="M96 202L262 212L196 254Z" fill="var(--pl-paper)" />
        <path d="M196 254L262 212L480 74L252 292Z" fill="var(--pl-paper)" />
        <path d="M196 254L252 292L226 366Z" fill="var(--pl-shade)" />
        <path d="M480 74L338 214L366 352Z" fill="var(--pl-wing)" />
        <path d="M252 292L338 214L366 352Z" fill="var(--pl-paper)" />
      </g>
      <path d="M206 384C168 404 118 418 78 396C40 375 40 322 80 306C118 292 150 330 132 372C114 414 66 440 22 440" fill="none" stroke="var(--pl-trail)" strokeWidth="15" strokeLinecap="round" strokeDasharray="26 22" />
    </svg>
  );
}

/** Куда ведёт раздел главной: на самой главной — якорь, с других страниц — адрес с якорем. */
const section = (locale: Locale, onHome: boolean, id: string) => (onHome ? `#${id}` : `${withLocale('/', locale)}#${id}`);

/**
 * Шапка. `pathname` нужен переключателю языка: язык меняется полной
 * загрузкой (обычной ссылкой), чтобы сценарий главной стартовал заново.
 */
export function SalesHeader({ locale, pathname, onHome = false }: { locale: Locale; pathname: string; onHome?: boolean }) {
  const kk = pathname === '/' ? '/?lang=kk' : `${pathname}?lang=kk`;
  return (
    <header className="wrap top">
      <a className="logo" href={withLocale('/', locale)} aria-label={T.home[locale]}>
        <PlaneLogo />
        <b>EduSad</b>
      </a>
      <nav className="nav" aria-label={T.sections[locale]}>
        <a href={section(locale, onHome, 'adminka')}>{T.navFeatures[locale]}</a>
        <a href={section(locale, onHome, 'tarify')}>{T.navPlans[locale]}</a>
        <a href={section(locale, onHome, 'podkluchenie')}>{T.navSteps[locale]}</a>
        <a href={section(locale, onHome, 'voprosy')}>{T.navFaq[locale]}</a>
      </nav>
      <div className="top-right">
        <div className="lang" role="group" aria-label={T.langGroup[locale]}>
          <a href={kk} hrefLang="kk" className={locale === 'kk' ? 'on' : undefined} aria-current={locale === 'kk' ? 'true' : undefined}>Қаз</a>
          <a href={pathname} hrefLang="ru" className={locale === 'ru' ? 'on' : undefined} aria-current={locale === 'ru' ? 'true' : undefined}>Рус</a>
        </div>
        <a className="sbtn sbtn-top" href={section(locale, onHome, 'zayavka')}>{T.apply[locale]}</a>
      </div>
    </header>
  );
}

export async function SalesFooter({ locale, onHome = false }: { locale: Locale; onHome?: boolean }) {
  const settings = await portalSettings();
  return (
    <footer className="band band-dark">
      <div className="wrap foot">
        <div>
          <a className="logo" href={withLocale('/', locale)} aria-label="EduSad">
            <PlaneLogo />
            <b>EduSad</b>
          </a>
          <p>{T.footAbout[locale]}</p>
          {settings.phone ? (
            <p><a className="foot-phone" href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>{settings.phone}</a></p>
          ) : null}
        </div>
        <nav aria-label={T.sections[locale]}>
          <b>{T.sections[locale]}</b>
          <a href={section(locale, onHome, 'tarify')}>{T.navPlans[locale]}</a>
          <a href={section(locale, onHome, 'podkluchenie')}>{T.navSteps[locale]}</a>
          <a href={withLocale('/contacts', locale)}>{T.contacts[locale]}</a>
          <a href="/downloads/edusad-instrukciya.pdf" download>{T.guide[locale]}</a>
          <a href={withLocale('/offer', locale)}>{T.offer[locale]}</a>
        </nav>
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} EduSad. Кудайбергенов Асет</div>
    </footer>
  );
}

/**
 * Обычная страница продающей части (оферта, контакты): цветная полоса
 * с шапкой и заголовком, белое поле с текстом, тёмный подвал.
 */
export async function SalesPage({
  locale,
  pathname,
  title,
  lead,
  children,
}: {
  locale: Locale;
  pathname: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="sales ready page" lang={locale}>
      <a className="skip" href="#main">{T.skip[locale]}</a>
      <div className="band band-hero page-hero">
        <SalesHeader locale={locale} pathname={pathname} />
        <div className="wrap page-head">
          <h1>{title}</h1>
          {lead ? <div className="page-lead">{lead}</div> : null}
        </div>
      </div>
      <main id="main" className="page-body">
        <div className="wrap">{children}</div>
      </main>
      <SalesFooter locale={locale} />
    </div>
  );
}
