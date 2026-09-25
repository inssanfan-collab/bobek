import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { localeFromParam, type Locale } from '@/lib/i18n';
import { EDU_DOMAIN_NOTE, isPlanCode, PLAN_CODES, PLAN_COMMON, PLAN_INFO, STATE_PRICE_NOTE } from '@/lib/plans';
import { csrfToken } from '@/server/auth/csrf';
import { SalesLive } from '@/components/portal/sales/SalesLive';
import { SalesApplyForm } from '@/components/portal/sales/SalesApplyForm';
import { SalesFooter, SalesHeader } from '@/components/portal/sales/SalesChrome';

export const dynamic = 'force-dynamic';

/**
 * Главная портала — продаёт сайты детским садам.
 *
 * С 23.09.2026 назначение главной сменилось: она для заведующих, а не для
 * родителей. Каталог садов (/catalog) и страницы для родителей остались,
 * но в шапку и подвал главной не выведены — «пока садов не станет много».
 *
 * Разметка и стили — перенос образца «В+, живой» (bobegim-design,
 * C2-prodazha.html). Весь текст отдаёт сервер: страница читается без
 * скриптов и видна поисковикам. Движение и макеты добавляет SalesLive.
 * Цены и описание тарифов — только из plans.ts и env.planPrices.
 */

const T = {
  skip: { kk: 'Мазмұнға өту', ru: 'К содержанию' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },

  h1: { kk: 'Балабақшаңыздың сайты — бір жұмыс күнінде', ru: 'Сайт вашего детского сада — за один рабочий день' },
  lead: {
    kk: 'Қазақ және орыс тіліндегі ресми сайт: нашар көретіндерге арналған нұсқасы бар, ал әкімші бөлімін кез келген қызметкер оңай меңгереді.',
    ru: 'Официальный сайт на казахском и русском, с версией для слабовидящих и админкой, в которой разберётся любой сотрудник.',
  },
  demo: { kk: 'Сайт үлгісін көру →', ru: 'Посмотреть пример сайта →' },
  heroAlt: {
    kk: 'Ақ төбедегі балабақша, аулада тәрбиеші мен балалар ойнап жүр',
    ru: 'Детский сад на белом холме, воспитатель и дети играют во дворе',
  },

  trustHosting: { kk: 'Қазақстандағы хостинг', ru: 'Хостинг в Казахстане' },
  trustHostingNote: { kk: 'балалар деректері шетелге кетпейді', ru: 'данные детей не уходят за рубеж' },
  trustLang: { kk: 'Екі тіл', ru: 'Два языка' },
  trustLangNote: { kk: '«Тіл туралы» заң талап еткендей', ru: 'как требует закон «О языках»' },
  trustDocs: { kk: 'Шарт, шот және акт', ru: 'Договор, счёт и акт' },
  trustDocsNote: { kk: 'шот бойынша төлем', ru: 'оплата по счёту' },
  trustPrice: { kk: 'Жылына %s бастап', ru: 'От %s в год' },
  // Цена — для частных садов: у государственных своя, см. STATE_PRICE_NOTE.
  trustPriceNote: { kk: 'жеке балабақшаларға, хостинг кіреді', ru: 'для частных садов, хостинг включён' },

  adminTitle: { kk: 'Сайтты балабақшаның кез келген қызметкері жүргізе алады', ru: 'Вести сайт сможет любой сотрудник сада' },
  adminLead: {
    kk: 'Бағдарламашысыз және оқусыз. Міне, ең жиі жасалатын үш іс.',
    ru: 'Без программиста и без обучения. Вот три дела, которые делаются чаще всего.',
  },
  adminAlt: { kk: 'Балабақша қызметкері ноутбукта жаңалық жариялап отыр', ru: 'Сотрудница сада публикует новость на ноутбуке' },
  tabNews: { kk: 'Фотосы бар жаңалық', ru: 'Новость с фото' },
  tabMenu: { kk: 'Апталық мәзір', ru: 'Меню на неделю' },
  tabDocs: { kk: 'Құжаттар', ru: 'Документы' },
  adminCaption: {
    kk: 'Екі-үш минут. Екі тілдегі мәтін қатар жазылады, фото өзі сығылады, ал геобелгілер алынып тасталады — балалар суретімен бірге балабақшаның координаттары интернетке кетпейді.',
    ru: 'Пара минут. Текст на двух языках пишется рядом, фото сжимается само, а геометки с него снимаются — координаты сада с фотографий детей не уйдут в интернет.',
  },

  plansTitle: { kk: 'Екі тариф', ru: 'Два тарифа' },
  plansLead: {
    kk: 'Екеуінде де сайт бірдей — айырмашылық тек оны кім жүргізетінінде.',
    ru: 'Сайт в обоих одинаковый — разница только в том, кто его ведёт.',
  },
  perYear: { kk: 'жылына', ru: 'в год' },
  choose: { kk: '«%s» тарифін таңдау', ru: 'Выбрать «%s»' },

  stepsTitle: { kk: 'Өтінімнен сайтқа дейін', ru: 'От заявки до сайта' },
  stepsLead: {
    kk: 'Сауалнаманы алған соң бір жұмыс күнінде іске қосамыз.',
    ru: 'Запускаем за один рабочий день после того, как получим анкету.',
  },
  steps: {
    kk: [
      ['Бүгін', 'Өтінім', 'Осы бетте немесе телефон арқылы өтінім қалдырасыз.'],
      ['Сол күні', 'Қоңырау', 'Қайта қоңырау шалып, сұрақтарға жауап береміз және сауалнама жібереміз.'],
      ['Ыңғайлы кезде', 'Сауалнама', 'Excel кестесін толтырасыз: топтар, педагогтар, байланыс. Деректер сайтқа өзі түседі.'],
      ['Бір жұмыс күнінде', 'Кіру', 'Сайт мекенжайы мен әкімші бөліміне кіру логинін береміз — толтыра бастауға болады.'],
      ['10 жұмыс күніне дейін', 'Төлем', 'Шарт, шот және акт бір нөмірмен. Төлемнен кейін сайт барлығына ашық.'],
    ],
    ru: [
      ['Сегодня', 'Заявка', 'Оставляете заявку на этой странице или по телефону.'],
      ['В тот же день', 'Звонок', 'Перезваниваем, отвечаем на вопросы и присылаем анкету.'],
      ['Когда удобно', 'Анкета', 'Заполняете Excel: группы, педагоги, контакты. Данные сами встанут на сайт.'],
      ['За рабочий день', 'Доступ', 'Выдаём адрес сайта и логин в админку — можно наполнять.'],
      ['До 10 рабочих дней', 'Оплата', 'Договор, счёт и акт под одним номером. После оплаты сайт открыт для всех.'],
    ],
  },

  faqTitle: { kk: 'Сұрақтар', ru: 'Вопросы' },
  faqLead: {
    kk: 'Жауап таппадыңыз ба — өтінім қалдырыңыз, қайта қоңырау шалып, бәрін түсіндіреміз.',
    ru: 'Не нашли ответ — оставьте заявку, перезвоним и всё объясним.',
  },

  applyTitle: { kk: 'Балабақшаңыздың сайтын бір жұмыс күнінде іске қосамыз', ru: 'Запустим сайт вашего сада за один рабочий день' },
  applyLead: {
    kk: 'Өтінім қалдырыңыз — сол күні қайта қоңырау шалып, барлық сұраққа жауап береміз.',
    ru: 'Оставьте заявку — перезвоним в тот же день и ответим на все вопросы.',
  },
  applyAlt: { kk: 'Тәрбиеші балабақша есігін ашып тұр, балалар ішке жүгіріп барады', ru: 'Воспитатель открывает двери сада, дети бегут внутрь' },
} as const;

/** Вопросы. Ответы про тарифы берут названия из plans.ts. */
function faq(locale: Locale): [string, string][] {
  const basic = PLAN_INFO.BASIC.name[locale];
  const managed = PLAN_INFO.MANAGED.name[locale];
  return locale === 'kk'
    ? [
        ['Өз мекенжайымызды қоюға бола ма, мысалы balapan-balabaqshasy.kz?', 'Иә. .kz немесе edu.kz доменін ұйымның атына өзіңіз сатып аласыз, ал баптауға біз көмектесеміз — қауіпсіздік сертификаты өзі шығарылады. edusad.kz-тегі мекенжай да жұмыс істей береді.'],
        ['Жазылымды ұзартпасақ не болады?', '30, 14 және 3 күн бұрын ескертеміз. Төлем болмаса, сайт мерзім біткен соң келесі күні жабылады, ал төлегеннен кейін бірден ашылады — ондағының бәрі сақталады.'],
        ['Сайтты кім толтырады?', `«${basic}» тарифінде — балабақша қызметкері әкімші бөлімі арқылы. «${managed}» тарифінде материалдарды бізге жібересіз, ал оларды біз орналастырамыз; әкімші бөлімі сізде де қалады.`],
        ['Құжаттар Google Дискіде жатыр. Оларды қайта жүктеуге тура келе ме?', 'Жоқ. Бумаларды ішкі бумаларымен бірге толықтай көшіреміз — сайтта олар дискідегідей көрінеді.'],
        ['Мемлекеттік балабақшаға жарай ма?', 'Иә, сайт мемлекеттік және жеке балабақшаларға бірдей. Бағасы ғана басқа: беттегі бағалар жеке балабақшаларға арналған, ал мемлекеттік сатып алу рәсімі күрделірек — мемлекеттік балабақшаға құнын бөлек айтамыз.'],
      ]
    : [
        ['Можно ли свой адрес, например balapan-balabaqshasy.kz?', 'Да. Домен .kz или edu.kz вы покупаете сами на организацию, а мы поможем настроить — сертификат безопасности выпустится автоматически. Адрес на edusad.kz продолжит работать.'],
        ['Что будет, если не продлить подписку?', 'Напомним за 30, 14 и 3 дня. Без оплаты сайт закрывается на следующий день после окончания срока, а после оплаты открывается сразу — всё, что на нём было, сохраняется.'],
        ['Кто будет наполнять сайт?', `На «${basic}» — сотрудник сада через админку. На тарифе «${managed}» материалы присылаете нам, а размещаем их мы; админка остаётся и у вас.`],
        ['Документы уже лежат на Google Диске. Их придётся загружать заново?', 'Нет. Перенесём папки целиком, со всей вложенностью, — на сайте они будут выглядеть так же, как у вас на диске.'],
        ['Подойдёт ли государственному саду?', 'Да, сайт одинаковый для государственных и частных садов. Отличается только цена: на странице — цены для частных садов, а у государственных стоимость другая, потому что проведение госзакупок сложнее. Назовём её отдельно.'],
      ];
}

const ICONS = {
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  lang: '<path d="M4 5h9M8.5 3v2M6 5c.8 3.5 3 6 6 7.5M11 5c-.8 3.8-3.2 6.8-7 8.5M13 21l4.5-10 4.5 10M14.6 17.5h5.8"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 11h6M9 14h3"/><circle cx="15" cy="16.5" r="2.2"/>',
  tenge: '<path d="M6 5h12M6 9h12M12 9v11"/>',
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <span data-icon={name}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
    </span>
  );
}


const fill = (template: string, value: string) => template.replace('%s', value);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  const from = formatMoney(Math.min(...PLAN_CODES.map((code) => env.planPrices[code])));
  return {
    title: {
      absolute:
        locale === 'kk'
          ? 'EduSad — балабақшаға арналған сайт бір жұмыс күнінде'
          : 'EduSad — сайт для детского сада за один рабочий день',
    },
    description:
      locale === 'kk'
        ? `Балабақшаның ресми сайты қазақ және орыс тілдерінде: әкімші бөлімі, нашар көретіндерге арналған нұсқа, Қазақстандағы хостинг. Жылына ${from} бастап.`
        : `Официальный сайт детского сада на казахском и русском: админка, версия для слабовидящих, хостинг в Казахстане. От ${from} в год.`,
    alternates: { languages: { ru: '/', kk: '/?lang=kk' } },
  };
}

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; plan?: string }>;
}) {
  const [{ lang, plan }, csrf] = await Promise.all([searchParams, csrfToken()]);
  const locale = localeFromParam(lang);
  const minPrice = formatMoney(Math.min(...PLAN_CODES.map((code) => env.planPrices[code])));
  // Демо-сад открываем на языке страницы: у него основной язык казахский.
  const demoHref = `https://demo.${env.portalDomain}${locale === 'ru' ? '/?lang=ru' : '/'}`;


  return (
    <div className="sales live" lang={locale}>
      <a className="skip" href="#main">{T.skip[locale]}</a>

      <div className="band band-hero">
        <canvas className="mesh" aria-hidden="true" />
        <div className="orbs" aria-hidden="true">
          {[1.2, 0.7, 1.6, 0.9, 1.3].map((depth, i) => (
            <i key={i} className={`o o${i + 1}`} data-depth={depth}><b /></i>
          ))}
        </div>
        <SalesHeader locale={locale} pathname="/" onHome />

        <section className="wrap hero" id="main">
          <div className="hero-copy">
            <h1>{T.h1[locale]}</h1>
            <p className="lead">{T.lead[locale]}</p>
            <div className="cta-row">
              <a className="sbtn sbtn-primary" href="#zayavka">{T.apply[locale]}</a>
              <a className="link" href={demoHref} target="_blank" rel="noopener">{T.demo[locale]}</a>
            </div>
          </div>
          <div className="scene bleed">
            <figure className="hero-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/sales/hero.webp" alt={T.heroAlt[locale]} width={1200} height={896} fetchPriority="high" />
            </figure>
            <div className="phone">
              {/* Макеты — картинка из разметки, читалке экрана в них делать нечего. */}
              <div className="screen" id="phone" aria-hidden="true" />
            </div>
          </div>
        </section>

        <ul className="wrap trust">
          <li><Icon name="shield" /><b>{T.trustHosting[locale]}</b><span>{T.trustHostingNote[locale]}</span></li>
          <li><Icon name="lang" /><b>{T.trustLang[locale]}</b><span>{T.trustLangNote[locale]}</span></li>
          <li><Icon name="doc" /><b>{T.trustDocs[locale]}</b><span>{T.trustDocsNote[locale]}</span></li>
          <li><Icon name="tenge" /><b>{fill(T.trustPrice[locale], minPrice)}</b><span>{T.trustPriceNote[locale]}</span></li>
        </ul>
      </div>

      <main>
        <section className="band band-dark block" id="adminka">
          <div className="wrap">
            <div className="head">
              <h2>{T.adminTitle[locale]}</h2>
              <p>{T.adminLead[locale]}</p>
            </div>
            <div className="admin">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="admin-img" src="/images/sales/admin.webp" alt={T.adminAlt[locale]} width={1200} height={896} loading="lazy" />
                <div className="tabs" id="tabs" role="tablist">
                  <button type="button" role="tab" data-tab="news" aria-selected="true">{T.tabNews[locale]}</button>
                  <button type="button" role="tab" data-tab="menu" aria-selected="false">{T.tabMenu[locale]}</button>
                  <button type="button" role="tab" data-tab="docs" aria-selected="false">{T.tabDocs[locale]}</button>
                </div>
                <p className="caption" id="caption">{T.adminCaption[locale]}</p>
              </div>
              <div className="window">
                <div className="screen" id="admin" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="band block" id="tarify">
          <div className="wrap">
            <div className="head">
              <h2>{T.plansTitle[locale]}</h2>
              <p>{T.plansLead[locale]}</p>
            </div>
            <div className="plans">
              {PLAN_CODES.map((code) => {
                const info = PLAN_INFO[code];
                const featured = code === 'MANAGED';
                return (
                  <div key={code} className={featured ? 'plan plan-featured' : 'plan'}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="plan-img" src={featured ? '/images/sales/plan-us.webp' : '/images/sales/plan-self.webp'} alt="" width={116} height={116} loading="lazy" />
                    <h3>{info.name[locale]}</h3>
                    <div className="price">{formatMoney(env.planPrices[code])}<small>{T.perYear[locale]}</small></div>
                    <div className="who">{info.tagline[locale]}</div>
                    <p>{info.whoFills[locale]}</p>
                    <a className={featured ? 'sbtn sbtn-primary' : 'sbtn sbtn-secondary'} href="#zayavka" data-plan={code}>
                      {fill(T.choose[locale], info.name[locale])}
                    </a>
                  </div>
                );
              })}
            </div>
            <ul className="common">
              {PLAN_COMMON.map((item) => <li key={item.ru}>{item[locale].replaceAll('%domain%', env.portalDomain)}</li>)}
            </ul>
            <p className="state-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
              </svg>
              <span><b>{STATE_PRICE_NOTE.title[locale]}</b>{STATE_PRICE_NOTE.text[locale]}</span>
            </p>
            <p className="note">{EDU_DOMAIN_NOTE[locale]}.</p>
          </div>
        </section>

        <section className="band block band-soft" id="podkluchenie">
          <div className="wrap">
            <div className="head">
              <h2>{T.stepsTitle[locale]}</h2>
              <p>{T.stepsLead[locale]}</p>
            </div>
            <ol className="tl" id="timeline">
              {T.steps[locale].map(([when, title, text], i) => (
                <li key={title}>
                  <span className="tl-pic">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/sales/tl-${i + 1}.webp`} alt="" width={112} height={112} loading="lazy" />
                    <b>{i + 1}</b>
                  </span>
                  <span className="when">{when}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band block" id="voprosy">
          <div className="wrap">
            <div className="head">
              <h2>{T.faqTitle[locale]}</h2>
              <p>{T.faqLead[locale]}</p>
            </div>
            <div className="faq">
              {faq(locale).map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="band band-brand block" id="zayavka">
          <div className="wrap apply">
            <div className="side">
              <h2>{T.applyTitle[locale]}</h2>
              <p>{T.applyLead[locale]}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="apply-img" src="/images/sales/apply.webp" alt={T.applyAlt[locale]} width={1200} height={896} loading="lazy" />
            </div>
            <SalesApplyForm csrf={csrf} locale={locale} plan={isPlanCode(plan) ? plan : null} />
          </div>
        </section>
      </main>

      <SalesFooter locale={locale} onHome />

      <SalesLive locale={locale} />
    </div>
  );
}
