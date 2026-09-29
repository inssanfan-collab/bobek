import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { formatMoney, formatPhone, phoneHref } from '@/lib/labels';
import { localeFromParam, withLocale, type Locale } from '@/lib/i18n';
import { EDU_DOMAIN_NOTE, isPlanCode, PLAN_CODES, PLAN_COMMON, PLAN_INFO, STATE_PRICE_NOTE } from '@/lib/plans';
import { findThemeInfo } from '@/themes/catalog';
import { csrfToken } from '@/server/auth/csrf';
import { portalSettings } from '@/server/docs/contract';
import { SalesTabs } from '@/components/portal/sales/SalesTabs';
import { SalesMotion } from '@/components/portal/sales/SalesMotion';
import { AdminDemo, type DemoTask } from '@/components/portal/sales/AdminDemo';
import { readGuideManifest } from '@/server/guide/manifest';
import { SalesApplyForm } from '@/components/portal/sales/SalesApplyForm';
import { SalesFooter, SalesHeader } from '@/components/portal/sales/SalesChrome';
import { portalAlternateLinks } from '@/lib/seo';

export const dynamic = 'force-dynamic';

/**
 * Главная портала — продаёт сайты детским садам (с 23.09.2026 она для
 * заведующих, а не для родителей).
 *
 * Манера «нежная» (29.09.2026, образец G в bobegim-design): утреннее небо,
 * пастель, облака, шарики. Вместо нарисованных картинок — настоящие снимки
 * демо-сада «Балапан» и его админки, на языке страницы: заведующая видит,
 * что именно покупает. Снимки лежат в public/images/sales, переснимать их —
 * когда заметно поменялся сайт сада или админка.
 *
 * Весь текст отдаёт сервер: страница читается без скриптов и видна
 * поисковикам. Сценарии — переключение вкладок (SalesTabs) и мягкое
 * движение при прокрутке (SalesMotion: gsap и Lenis, только на главной).
 * Цены и описание тарифов — только из plans.ts и env.planPrices.
 */

const T = {
  skip: { kk: 'Мазмұнға өту', ru: 'К содержанию' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },

  label: { kk: 'Ақтөбе балабақшаларына арналған сайттар', ru: 'Сайты для детских садов Актобе' },
  h1: { kk: 'Балабақшаңыздың сайты', ru: 'Сайт вашего детского сада' },
  h1Mark: { kk: 'бір жұмыс күнінде', ru: 'за один рабочий день' },
  lead: {
    kk: 'Қазақ және орыс тіліндегі ресми сайт: нашар көретіндерге арналған нұсқасы бар, ал әкімші бөлімін кез келген қызметкер оңай меңгереді.',
    ru: 'Официальный сайт на казахском и русском, с версией для слабовидящих и админкой, в которой разберётся любой сотрудник.',
  },
  demo: { kk: 'Сайт үлгісін көру', ru: 'Посмотреть пример сайта' },
  factPrice: { kk: 'жылына %s бастап', ru: 'от %s в год' },
  factHosting: { kk: 'хостинг кіреді', ru: 'хостинг включён' },
  factDocs: { kk: 'шарт, шот және акт', ru: 'договор, счёт и акт' },
  bubbleDay: { kk: '1 күнде', ru: 'за 1 день' },
  bubbleEye: { kk: 'Нашар көретіндерге', ru: 'Для слабовидящих' },
  heroHand: { kk: 'сіздің сайтыңыз осындай болады ♡', ru: 'вот таким будет ваш сайт ♡' },
  heroAlt: { kk: '«Балапан» балабақшасы сайтының басты беті компьютерде', ru: 'Главная страница сайта детского сада «Балапан» на компьютере' },
  heroPhoneAlt: { kk: 'Сол сайт телефонда', ru: 'Тот же сайт на телефоне' },

  trustHosting: { kk: 'Қазақстандағы хостинг', ru: 'Хостинг в Казахстане' },
  trustHostingNote: { kk: 'балалар деректері шетелге кетпейді', ru: 'данные детей не уходят за рубеж' },
  trustLang: { kk: 'Екі тіл', ru: 'Два языка' },
  trustLangNote: { kk: '«Тіл туралы» заң талап еткендей', ru: 'как требует закон «О языках»' },
  trustEye: { kk: 'Нашар көретіндерге', ru: 'Для слабовидящих' },
  trustEyeNote: { kk: 'нұсқасы бір түймемен қосылады', ru: 'версия включается одной кнопкой' },
  trustDocs: { kk: 'Шарт, шот және акт', ru: 'Договор, счёт и акт' },
  trustDocsNote: { kk: 'шот бойынша төлем', ru: 'оплата по счёту' },

  lookKicker: { kk: 'сыртқы келбеті', ru: 'как выглядит' },
  lookTitle: { kk: 'Ата-аналарға да, тексерушіге де көрсетуге болатын сайт', ru: 'Сайт, который не стыдно показать родителям и проверке' },
  lookLead: {
    kk: 'Үлгіні, палитраны және қаріптерді балабақша өзі таңдайды. Өзіндік келбет керек болса, жеке дизайн жасаймыз.',
    ru: 'Шаблон, палитру и шрифты сад выбирает сам. Если нужен собственный облик, нарисуем индивидуальный дизайн.',
  },
  lookTabs: { kk: 'Сайттың түрі', ru: 'Вид сайта' },
  standard: { kk: 'Дайын үлгі', ru: 'Готовый шаблон' },
  inPlan: { kk: 'Тарифке кіреді', ru: 'Входит в тариф' },
  ownDesign: { kk: 'Жеке дизайн', ru: 'Индивидуальный дизайн' },
  standardText: {
    kk: 'Балабақшаның кең фотосы, хабарландырулар, жаңалықтар және ата-аналарға арналған бөлімдер. Бәрі әкімші бөлімінде, «Сыртқы көрініс» бөлімінде өзгертіледі.',
    ru: 'Фото сада на всю ширину, объявления, новости и разделы для родителей. Всё меняется в админке, в разделе «Внешний вид».',
  },
  standardChecks: {
    kk: ['басты беттің үлгілері және 19 палитра', 'қазақ әріптері бар қаріп жұптары', 'балабақшаның өз фирмалық түсі'],
    ru: ['шаблоны главной и 19 палитр', 'пары шрифтов с казахскими буквами', 'свой фирменный цвет сада'],
  },
  akvarelText: {
    kk: 'Жұмсақ акварель дақтары, дөңгелек мұқаба және балалар суреттері: бұлттар, күн, қайық.',
    ru: 'Мягкие акварельные пятна, круглая обложка и детские рисунки: облака, солнце, кораблик.',
  },
  dalaText: {
    kk: 'Даланың көгілдір және сарғыш түстері, фото жиегінің орнына арка, сайттың басы мен аяғында «қошқар мүйіз» ою-өрнегі.',
    ru: 'Бирюза и охра степи, арка вместо рамки фотографии и казахский орнамент «қошқар мүйіз» в шапке и подвале.',
  },
  konstruktorText: {
    kk: 'Анық жиегі бар жарқын блоктар — балалар құрастырғышының бөлшектері сияқты.',
    ru: 'Яркие блоки с чёткой обводкой, как детали детского конструктора.',
  },

  adminKicker: { kk: 'әкімші бөлімі', ru: 'админка' },
  adminTitle: { kk: 'Сайтты балабақшаның кез келген қызметкері жүргізе алады', ru: 'Вести сайт сможет любой сотрудник' },
  adminLead: {
    kk: 'Бағдарламашысыз және оқусыз. Міне, ең жиі жасалатын үш іс.',
    ru: 'Без программиста и без обучения. Вот три дела, которые делаются чаще всего.',
  },
  adminTabs: { kk: 'Әкімші бөлімінде не істеледі', ru: 'Что делается в админке' },
  tabNews: { kk: 'Фотосы бар жаңалық', ru: 'Новость с фото' },
  tabNewsTime: { kk: 'бірер минут', ru: 'пара минут' },
  tabNewsText: {
    kk: 'Екі тілдегі мәтін қатар жазылады. Фото өзі сығылады, ал геобелгілер алынып тасталады.',
    ru: 'Текст на двух языках пишется рядом. Фото сжимается само, а геометки с него снимаются.',
  },
  tabMenu: { kk: 'Апталық мәзір', ru: 'Меню на неделю' },
  tabMenuText: {
    kk: 'Күн сайын немесе бекітілген мәзірдің сканымен: ата-аналар ол туралы жиі сұрайды.',
    ru: 'По дням или сканом утверждённого меню: родители спрашивают о нём чаще всего.',
  },
  tabDocs: { kk: 'Құжаттар', ru: 'Документы' },
  tabDocsText: {
    kk: 'Компьютердегідей бумалар бойынша. Сайтта да солай көрінеді.',
    ru: 'По папкам, как на компьютере. На сайте они выглядят так же.',
  },
  adminNewsAlt: { kk: 'Әкімші бөлімі: жаңа жаңалық, тақырыбы қазақша және орысша', ru: 'Админка: новая новость, заголовок на казахском и русском' },
  adminMenuAlt: { kk: 'Әкімші бөлімі: күндік тамақтану мәзірі', ru: 'Админка: меню питания на день' },
  adminDocsAlt: { kk: 'Әкімші бөлімі: құжаттар мен бумалар', ru: 'Админка: документы и папки' },
  guideLink: { kk: 'Әр бөлім бойынша бейнесі бар нұсқаулық', ru: 'Инструкция с видео по каждому разделу' },

  plansKicker: { kk: 'тарифтер', ru: 'тарифы' },
  plansTitle: { kk: 'Екі тариф', ru: 'Два тарифа' },
  plansLead: {
    kk: 'Екеуінде де сайт бірдей — айырмашылық тек оны кім жүргізетінінде.',
    ru: 'Сайт в обоих одинаковый — разница только в том, кто его ведёт.',
  },
  perYear: { kk: 'жылына', ru: 'в год' },
  choose: { kk: '«%s» тарифін таңдау', ru: 'Выбрать «%s»' },
  managedTag: { kk: 'Біз толтырамыз ♡', ru: 'Наполняем за вас ♡' },
  common: { kk: 'Екі тарифке де кіреді', ru: 'В оба тарифа входит' },

  stepsKicker: { kk: 'қосылу', ru: 'подключение' },
  stepsTitle: { kk: 'Өтінімнен сайтқа дейін', ru: 'От заявки до сайта' },
  stepsLead: {
    kk: 'Сауалнаманы алған соң бір жұмыс күнінде іске қосамыз.',
    ru: 'Запускаем за один рабочий день после того, как получим анкету.',
  },
  steps: {
    kk: [
      ['бүгін', 'Өтінім', 'Осы бетте немесе телефон арқылы өтінім қалдырасыз.'],
      ['сол күні', 'Қоңырау', 'Қайта қоңырау шалып, сұрақтарға жауап береміз және сауалнама жібереміз.'],
      ['ыңғайлы кезде', 'Сауалнама', 'Excel кестесін толтырасыз: топтар, педагогтар, байланыс. Деректер сайтқа өзі түседі.'],
      ['бір жұмыс күнінде', 'Кіру', 'Сайт мекенжайы мен әкімші бөліміне кіру логинін береміз — толтыра бастауға болады.'],
      ['10 жұмыс күніне дейін', 'Төлем', 'Шарт, шот және акт бір нөмірмен. Төлемнен кейін сайт барлығына ашық.'],
    ],
    ru: [
      ['сегодня', 'Заявка', 'Оставляете заявку на этой странице или по телефону.'],
      ['в тот же день', 'Звонок', 'Перезваниваем, отвечаем на вопросы и присылаем анкету.'],
      ['когда удобно', 'Анкета', 'Заполняете Excel: группы, педагоги, контакты. Данные сами встанут на сайт.'],
      ['за рабочий день', 'Доступ', 'Выдаём адрес сайта и логин в админку — можно наполнять.'],
      ['до 10 рабочих дней', 'Оплата', 'Договор, счёт и акт под одним номером. После оплаты сайт открыт для всех.'],
    ],
  },

  faqKicker: { kk: 'сұрақтар', ru: 'вопросы' },
  faqTitle: { kk: 'Меңгерушілердің жиі қоятын сұрақтары', ru: 'Частые вопросы заведующих' },
  faqLead: {
    kk: 'Жауап таппадыңыз ба — өтінім қалдырыңыз, қайта қоңырау шалып, бәрін түсіндіреміз.',
    ru: 'Не нашли ответ — оставьте заявку, перезвоним и всё объясним.',
  },
  callSelf: { kk: 'немесе өзіңіз қоңырау шалыңыз', ru: 'или позвоните сами' },

  applyKicker: { kk: 'өтінім', ru: 'заявка' },
  applyTitle: { kk: 'Балабақшаңыздың сайтын бір жұмыс күнінде іске қосамыз', ru: 'Запустим сайт вашего сада за один рабочий день' },
  applyLead: {
    kk: 'Өтінім қалдырыңыз — сол күні қайта қоңырау шалып, барлық сұраққа жауап береміз.',
    ru: 'Оставьте заявку — перезвоним в тот же день и ответим на все вопросы.',
  },
  next: {
    kk: [
      ['сол күні', 'қайта қоңырау шалып, сауалнама жібереміз'],
      ['сауалнамадан кейін', 'бір жұмыс күнінде мекенжай мен әкімші бөліміне кіруді береміз'],
      ['10 жұмыс күніне дейін', 'шарт пен шот бойынша төлем, одан кейін сайт барлығына ашық'],
    ],
    ru: [
      ['в тот же день', 'перезвоним и пришлём анкету'],
      ['после анкеты', 'за рабочий день выдадим адрес и вход в админку'],
      ['до 10 рабочих дней', 'оплата по договору и счёту, после неё сайт открыт для всех'],
    ],
  },
  byPhone: { kk: 'Телефонмен ыңғайлырақ:', ru: 'Удобнее по телефону:' },
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
        ['Мемлекеттік балабақшаға жарай ма?', 'Иә, сайт мемлекеттік және жеке балабақшаларға бірдей. Бағасы ғана басқа: мемлекеттік сатып алуды өткізу күрделірек әрі көбірек уақытты талап етеді, сондықтан мемлекеттік балабақшаға құнын бөлек айтамыз.'],
      ]
    : [
        ['Можно ли свой адрес, например balapan-balabaqshasy.kz?', 'Да. Домен .kz или edu.kz вы покупаете сами на организацию, а мы поможем настроить — сертификат безопасности выпустится автоматически. Адрес на edusad.kz продолжит работать.'],
        ['Что будет, если не продлить подписку?', 'Напомним за 30, 14 и 3 дня. Без оплаты сайт закрывается на следующий день после окончания срока, а после оплаты открывается сразу — всё, что на нём было, сохраняется.'],
        ['Кто будет наполнять сайт?', `На «${basic}» — сотрудник сада через админку. На тарифе «${managed}» материалы присылаете нам, а размещаем их мы; админка остаётся и у вас.`],
        ['Документы уже лежат на Google Диске. Их придётся загружать заново?', 'Нет. Перенесём папки целиком, со всей вложенностью, — на сайте они будут выглядеть так же, как у вас на диске.'],
        ['Подойдёт ли государственному саду?', 'Да, сайт одинаковый для государственных и частных садов. Отличается только цена: проведение государственных закупок сложнее и требует больше времени, поэтому государственному саду назовём стоимость отдельно.'],
      ];
}

const ICONS = {
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  lang: '<path d="M4 5h9M8.5 3v2M6 5c.8 3.5 3 6 6 7.5M11 5c-.8 3.8-3.2 6.8-7 8.5M13 21l4.5-10 4.5 10M14.6 17.5h5.8"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 15.5h7M9 19h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
} as const;

function Icon({ name, width = 2 }: { name: keyof typeof ICONS; width?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
  );
}

/** Сердечко и замочек — заливкой, не контуром. */
const Heart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3Z" /></svg>
);
const Lock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z" /></svg>
);
const Cloud = ({ style }: { style: React.CSSProperties }) => (
  <svg className="cloud" viewBox="0 0 120 64" style={style} aria-hidden="true"><path d="M16 60c-9 0-15-7-13-15 2-7 10-10 16-7 1-13 13-20 24-17 6-11 22-14 31-4 7-3 17-1 20 7 12-1 20 8 18 18-1 9-8 18-18 18H16Z" /></svg>
);

/** Окно браузера со снимком сайта и телефон рядом. */
function Devices({ host, desk, mob, alt, phoneAlt, className, lazy = true, children }: {
  host: string; desk: string; mob: string; alt: string; phoneAlt: string; className: string; lazy?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className={`stage ${className}`}>
      <div className="frame">
        <div className="browser">
          <div className="bar"><i /><i /><i /><span className="url"><Lock />{host}</span></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={desk} width={1600} height={1000} alt={alt} loading={lazy ? 'lazy' : undefined} fetchPriority={lazy ? undefined : 'high'} />
        </div>
      </div>
      <div className="phone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mob} width={480} height={1039} alt={phoneAlt} loading={lazy ? 'lazy' : undefined} />
      </div>
      {children}
    </div>
  );
}

const fill = (template: string, value: string) => template.replace('%s', value);
const img = (name: string, locale: Locale) => `/images/sales/${name}.${locale}.webp`;
const cssVars = (vars: Record<string, string>) => vars as React.CSSProperties;

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
  };
}

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; plan?: string }>;
}) {
  const [{ lang, plan }, csrf, settings, manifest] = await Promise.all([searchParams, csrfToken(), portalSettings(), readGuideManifest()]);
  const locale = localeFromParam(lang);
  const minPrice = formatMoney(Math.min(...PLAN_CODES.map((code) => env.planPrices[code])));
  // Демо-сад открываем на языке страницы: у него основной язык казахский.
  const demoHref = `https://demo.${env.portalDomain}${locale === 'ru' ? '/?lang=ru' : '/'}`;
  // Адрес в окне браузера — такой получит сад: имя.edusad.kz.
  const host = `balapan.${env.portalDomain}`;

  // Вкладки тем: сначала «Акварель» — она же на первом экране.
  const looks = [
    { code: 'akvarel', dot: 'var(--peach-d)', soft: 'var(--peach)', text: T.akvarelText },
    { code: 'standard', dot: 'var(--sky-d)', soft: 'var(--sky)', text: T.standardText },
    { code: 'dala', dot: 'var(--mint-d)', soft: 'var(--mint)', text: T.dalaText },
    { code: 'konstruktor', dot: 'var(--butter-d)', soft: 'var(--butter)', text: T.konstruktorText },
  ].map((look) => {
    const theme = findThemeInfo(look.code);
    const name = theme ? `«${locale === 'kk' ? theme.nameKk : theme.nameRu}»` : T.standard[locale];
    return { ...look, name, own: Boolean(theme) };
  });

  // Живая админка: кадры инструкции (дело «documents» у инструкции — «docs» у снимков).
  const demoTasks: DemoTask[] = [
    { id: 'news', guide: 'news', color: 'var(--peach)', title: T.tabNews, time: T.tabNewsTime, text: T.tabNewsText, alt: T.adminNewsAlt, path: '/admin/posts' },
    { id: 'menu', guide: 'menu', color: 'var(--mint)', title: T.tabMenu, time: null, text: T.tabMenuText, alt: T.adminMenuAlt, path: '/admin/menu' },
    { id: 'docs', guide: 'documents', color: 'var(--butter)', title: T.tabDocs, time: null, text: T.tabDocsText, alt: T.adminDocsAlt, path: '/admin/documents' },
  ].map((task) => ({
    id: task.id,
    title: task.title[locale],
    time: task.time ? task.time[locale] : null,
    text: task.text[locale],
    color: task.color,
    alt: task.alt[locale],
    path: task.path,
    still: img(`admin-${task.id}`, locale),
    steps: manifest?.tasks[task.guide]?.steps[locale] ?? null,
    base: `/guide/steps/${locale}/${task.guide}/`,
  }));

  return (
    <div className="sales" lang={locale} style={cssVars({ '--foot-from': '#EEE6FF' })}>
      {/* canonical и hreflang — тегами, а не через metadata: у главной Next
          терял ?lang=kk (см. src/lib/seo.ts). React переносит их в <head>. */}
      {portalAlternateLinks('/', locale).map((link) => (
        <link key={link.hrefLang ?? link.rel} rel={link.rel} hrefLang={link.hrefLang} href={link.href} />
      ))}
      <a className="skip" href="#main">{T.skip[locale]}</a>
      {/* Прячет первый экран до вступления (SalesMotion) ещё до отрисовки,
          чтобы он не мигнул. Сценарий не дошёл — через 3 с всё видно само. */}
      <script dangerouslySetInnerHTML={{ __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('sales-intro')" }} />
      <SalesHeader locale={locale} pathname="/" onHome />

      <main id="main">
        <section className="hero">
          <div className="rainbow" aria-hidden="true" />
          <Cloud style={{ width: 150, height: 80, left: '4%', top: 34 }} />
          <Cloud style={{ width: 110, height: 58, left: '46%', top: 18, animationDuration: '32s', animationDelay: '-8s' }} />
          <Cloud style={{ width: 90, height: 48, right: '3%', top: 90, animationDuration: '22s', animationDelay: '-4s' }} />
          <div className="wrap hero-grid">
            <div>
              <span className="label"><Heart />{T.label[locale]}</span>
              <h1>{T.h1[locale]}&nbsp;— <span className="hl">{T.h1Mark[locale]}</span></h1>
              <p className="lead">{T.lead[locale]}</p>
              <div className="cta">
                <a className="sbtn sbtn-primary" href="#zayavka">{T.apply[locale]}</a>
                <a className="sbtn sbtn-secondary" href={demoHref} target="_blank" rel="noopener">
                  {T.demo[locale]}
                  <Icon name="arrow" width={2.4} />
                </a>
              </div>
              <ul className="facts">
                <li><Heart /><span><b>{fill(T.factPrice[locale], minPrice)}</b></span></li>
                <li><Heart />{T.factHosting[locale]}</li>
                <li><Heart />{T.factDocs[locale]}</li>
              </ul>
            </div>
            <Devices
              className="hero-stage"
              host={host}
              desk={img('site-akvarel-desk', locale)}
              mob={img('site-akvarel-mob', locale)}
              alt={T.heroAlt[locale]}
              phoneAlt={T.heroPhoneAlt[locale]}
              lazy={false}
            >
              <span className="bubble b-lang" aria-hidden="true"><span className="ic"><Icon name="lang" /></span>Қаз · Рус</span>
              <span className="bubble b-day" aria-hidden="true"><span className="ic"><Icon name="clock" /></span>{T.bubbleDay[locale]}</span>
              <span className="bubble b-eye" aria-hidden="true"><span className="ic"><Icon name="eye" /></span>{T.bubbleEye[locale]}</span>
              <span className="hand hero-hand" aria-hidden="true">{T.heroHand[locale]}</span>
            </Devices>
          </div>
        </section>
        <div className="scallop" style={cssVars({ '--from': '#FFE7DC' })} aria-hidden="true" />

        <section className="block" style={{ paddingTop: 60, paddingBottom: 0 }}>
          <ul className="wrap trust">
            <li><span className="ic"><Icon name="shield" /></span><b>{T.trustHosting[locale]}</b><span>{T.trustHostingNote[locale]}</span></li>
            <li><span className="ic"><Icon name="lang" /></span><b>{T.trustLang[locale]}</b><span>{T.trustLangNote[locale]}</span></li>
            <li><span className="ic"><Icon name="eye" /></span><b>{T.trustEye[locale]}</b><span>{T.trustEyeNote[locale]}</span></li>
            <li><span className="ic"><Icon name="doc" /></span><b>{T.trustDocs[locale]}</b><span>{T.trustDocsNote[locale]}</span></li>
          </ul>
        </section>

        <section className="block" id="vid">
          <div className="blot" style={{ width: 420, height: 320, left: -120, top: 160, background: 'var(--rose)' }} aria-hidden="true" />
          <div className="blot" style={{ width: 380, height: 300, right: -100, bottom: 40, background: 'var(--sky)' }} aria-hidden="true" />
          <div className="wrap">
            <div className="head">
              <div><span className="kicker">{T.lookKicker[locale]}</span><h2>{T.lookTitle[locale]}</h2></div>
              <p>{T.lookLead[locale]}</p>
            </div>
            <div className="chips" role="tablist" aria-label={T.lookTabs[locale]}>
              {looks.map((look, i) => (
                <button
                  key={look.code}
                  type="button"
                  role="tab"
                  id={`look-tab-${look.code}`}
                  aria-controls={`look-${look.code}`}
                  aria-selected={i === 0}
                  tabIndex={i === 0 ? 0 : -1}
                  style={cssVars({ '--dot': look.dot, '--soft': look.soft })}
                >
                  {look.name}
                </button>
              ))}
            </div>
            {looks.map((look, i) => (
              <div key={look.code} className="looks" role="tabpanel" id={`look-${look.code}`} aria-labelledby={`look-tab-${look.code}`} data-panel hidden={i > 0}>
                <Devices
                  className="look-stage"
                  host={host}
                  desk={img(`site-${look.code}-desk`, locale)}
                  mob={img(`site-${look.code}-mob`, locale)}
                  alt={look.name}
                  phoneAlt=""
                />
                <div className="memo" style={cssVars({ '--nc': look.soft })}>
                  <span className="tag">{look.own ? T.ownDesign[locale] : T.inPlan[locale]}</span>
                  <h3>{look.name}</h3>
                  <p>{look.text[locale]}</p>
                  {look.own ? null : (
                    <ul className="checks">
                      {T.standardChecks[locale].map((item) => <li key={item}><Icon name="check" width={2.8} />{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="scallop" style={cssVars({ '--from': 'var(--milk)', backgroundColor: 'var(--lav)' })} aria-hidden="true" />
        <section className="block lav-band" id="adminka">
          <div className="wrap">
            <div className="head">
              <div><span className="kicker">{T.adminKicker[locale]}</span><h2>{T.adminTitle[locale]}</h2></div>
              <p>{T.adminLead[locale]}</p>
            </div>
            <AdminDemo tasks={demoTasks} host={host} label={T.adminTabs[locale]}>
              <a className="guide-link" href={withLocale('/guide', locale)}>
                {T.guideLink[locale]}
                <Icon name="right" width={2.4} />
              </a>
            </AdminDemo>
          </div>
        </section>
        <div className="scallop" style={cssVars({ '--from': 'var(--lav)' })} aria-hidden="true" />

        <section className="block" id="tarify">
          <div className="blot" style={{ width: 400, height: 300, right: -80, top: 120, background: 'var(--butter)' }} aria-hidden="true" />
          <div className="wrap">
            <div className="head">
              <div><span className="kicker">{T.plansKicker[locale]}</span><h2>{T.plansTitle[locale]}</h2></div>
              <p>{T.plansLead[locale]}</p>
            </div>
            <div className="plans">
              {PLAN_CODES.map((code) => {
                const info = PLAN_INFO[code];
                const managed = code === 'MANAGED';
                return (
                  <div key={code} className="plan" style={cssVars({ '--pc': managed ? 'var(--peach)' : 'var(--mint)' })}>
                    <div className="plan-top">
                      <h3>{info.name[locale]}</h3>
                      {managed ? <span className="tag">{T.managedTag[locale]}</span> : null}
                    </div>
                    <div className="price"><span className="num" data-value={env.planPrices[code]}>{formatMoney(env.planPrices[code])}</span><small>{T.perYear[locale]}</small></div>
                    <div className="who">{info.tagline[locale]}</div>
                    <p>{info.whoFills[locale]}</p>
                    <a className={managed ? 'sbtn sbtn-primary' : 'sbtn sbtn-secondary'} href="#zayavka" data-plan={code}>
                      {fill(T.choose[locale], info.name[locale])}
                    </a>
                  </div>
                );
              })}
            </div>
            <div className="common">
              <h3>{T.common[locale]}</h3>
              <ul className="checks">
                {PLAN_COMMON.map((item) => (
                  <li key={item.ru}><Icon name="check" width={2.8} />{item[locale].replaceAll('%domain%', env.portalDomain)}</li>
                ))}
              </ul>
            </div>
            <div className="plan-notes">
              <div><Icon name="info" /><p><b>{STATE_PRICE_NOTE.title[locale]}</b>{STATE_PRICE_NOTE.text[locale]}</p></div>
              <div><Icon name="globe" /><p>{EDU_DOMAIN_NOTE[locale]}.</p></div>
            </div>
          </div>
        </section>

        <section className="block" id="podkluchenie" style={{ paddingTop: 20 }}>
          <div className="wrap">
            <div className="head">
              <div><span className="kicker">{T.stepsKicker[locale]}</span><h2>{T.stepsTitle[locale]}</h2></div>
              <p>{T.stepsLead[locale]}</p>
            </div>
            <ol className="steps">
              {T.steps[locale].map(([when, title, text], i) => (
                <li key={title}>
                  <span className="balloon" aria-hidden="true">{i + 1}</span>
                  <span className="when">{when}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="block" id="voprosy" style={{ paddingTop: 20 }}>
          <div className="blot" style={{ width: 380, height: 300, left: -120, top: 60, background: 'var(--mint)' }} aria-hidden="true" />
          <div className="wrap faq-grid">
            <div>
              <span className="kicker">{T.faqKicker[locale]}</span>
              <h2 className="big">{T.faqTitle[locale]}</h2>
              <p>{T.faqLead[locale]}</p>
              {settings.phone ? (
                <div className="call"><span>{T.callSelf[locale]}</span><a href={phoneHref(settings.phone)}>{formatPhone(settings.phone)}</a></div>
              ) : null}
            </div>
            <div className="faq">
              {faq(locale).map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="scallop" style={cssVars({ '--from': 'var(--milk)', backgroundColor: '#FFE7DC' })} aria-hidden="true" />
        <section className="block apply" id="zayavka">
          <Cloud style={{ width: 140, height: 74, left: '3%', top: 30 }} />
          <Cloud style={{ width: 100, height: 54, right: '5%', bottom: 40, animationDelay: '-10s' }} />
          <div className="wrap apply-grid">
            <div>
              <span className="kicker">{T.applyKicker[locale]}</span>
              <h2 className="big">{T.applyTitle[locale]}</h2>
              <p className="lead">{T.applyLead[locale]}</p>
              <ol className="next">
                {T.next[locale].map(([when, what]) => <li key={when}><span><b>{when}</b>{what}</span></li>)}
              </ol>
              {settings.phone ? (
                <p className="phone-line">{T.byPhone[locale]} <a href={phoneHref(settings.phone)}>{formatPhone(settings.phone)}</a></p>
              ) : null}
            </div>
            <SalesApplyForm csrf={csrf} locale={locale} plan={isPlanCode(plan) ? plan : null} />
          </div>
        </section>
      </main>

      <SalesFooter locale={locale} onHome />
      <SalesTabs />
      <SalesMotion />
    </div>
  );
}
