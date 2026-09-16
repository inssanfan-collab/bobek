import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { PLAN_CODES, PLAN_INFO } from '@/lib/plans';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  // По-казахски «от» — это падежное окончание, оно пишется слитно с ценой:
  // «жылына 50 000 ₸-ден бастап». Поэтому пробел перед heroAfter ставится
  // только в русском варианте.
  heroBefore: { kk: 'Балабақшаның жеке сайты жылына', ru: 'Свой сайт детского сада от' },
  heroAfter: { kk: '-ден бастап', ru: 'в год' },
  heroLead: {
    kk: 'Сайт бірден екі тілде — мұны «Тілдер туралы» заң талап етеді. Жаңалықтар, құжаттар, педагогтар, тамақтану мәзірі. Бағдарламашысыз, балабақша қызметкері толтырады.',
    ru: 'Сайт сразу на двух языках — этого требует закон «О языках». Новости, документы, педагоги, меню питания. Заполняет сотрудник сада, без программиста.',
  },
  connect: { kk: 'Балабақшамды қосу', ru: 'Подключить свой сад' },
  viewCatalog: { kk: 'Каталогты қарау', ru: 'Посмотреть каталог' },
  oneDay: { kk: '1 күн', ru: '1 день' },
  untilLaunch: { kk: 'сайтты іске қосуға дейін', ru: 'до запуска сайта' },
  twoLanguages: { kk: 'бірден екі тіл', ru: 'два языка сразу' },
  mockPhotoAlt: {
    kk: 'Балабақша тобы: үстел басындағы балалар мен тәрбиеші',
    ru: 'Группа детского сада: дети с воспитателем за столом',
  },
  mockNews: { kk: 'Жаңалықтар', ru: 'Новости' },
  mockNewsItem: { kk: 'Наурыз мейрамы — 21 наурыз', ru: 'Наурыз мейрамы — 21 марта' },
  mockMenu: { kk: 'Мәзір', ru: 'Меню' },
  mockMenuItem: { kk: 'Сүтпен ботқа, жеміс', ru: 'Каша с ягодами, фрукты' },

  featuresEyebrow: { kk: 'Платформа мүмкіндіктері', ru: 'Функции платформы' },
  featuresTitle: { kk: 'Балабақша сайтында не жұмыс істейді', ru: 'Что уже работает на сайте сада' },
  featuresLead: {
    kk: 'Бөлімдер мектепке дейінгі ұйымдардың сайттарына қойылатын талаптар бойынша жиналған: тексеруші сұрайтыны да, ата-ана іздейтіні де бар.',
    ru: 'Разделы собраны по требованиям к сайтам дошкольных организаций: и то, что спрашивает проверка, и то, что ищет родитель.',
  },

  parentsEyebrow: { kk: 'Ата-аналарға', ru: 'Родителям' },
  parentsTitle: {
    kk: 'Балабақша өмірі туралы бәрі — ашық және телефонда',
    ru: 'Всё о жизни детского сада — открыто и в смартфоне',
  },
  parentsLead: {
    kk: 'Ата-ана қоңырау шалмай-ақ көреді: бос орындар бар ма, бүгін не береді, топ карантинде ме, қандай құжаттар қажет.',
    ru: 'Родитель видит без звонка: есть ли места, чем сегодня кормят, не закрыта ли группа на карантин, какие документы нужны.',
  },
  parentsMore: { kk: 'Ата-аналарға арналған бөлім →', ru: 'Раздел для родителей →' },

  stepsEyebrow: { kk: 'Қалай қосылу керек', ru: 'Как подключиться' },
  stepsTitle: { kk: 'Дайын сайтқа дейін үш қадам', ru: 'Три шага до готового сайта' },

  tariffEyebrow: { kk: 'Тарифтер', ru: 'Тарифы' },
  tariffTitle: {
    kk: 'Сайт бірдей — толтыруды кім жүргізетінін таңдайсыз',
    ru: 'Сайт одинаковый — выбираете, кто его наполняет',
  },
  tariffLead: {
    kk: 'Сайт, әкімші бөлімі, хостинг және қолдау екі тарифте де бар. Жаңалықтар, фото мен құжаттар санына шектеу жоқ, жасырын қосымша төлем жоқ.',
    ru: 'Сайт, админка, хостинг и поддержка — в обоих тарифах. Без ограничений на количество новостей, фотографий и документов, без скрытых доплат.',
  },
  perYear: { kk: 'жылына', ru: 'в год' },
  allPlans: { kk: 'Тарифтерді салыстыру', ru: 'Сравнить тарифы' },
  tariffIncluded: { kk: 'Екі тарифке де кіреді', ru: 'Входит в оба тарифа' },
  tariffNotIncluded: { kk: 'Бағаға кірмейді', ru: 'Не входит' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  eduDomain: {
    kk: 'edu.kz аймағындағы жеке домен: ол білім беру ұйымдарына арналған, сондықтан балабақша оны өзі сатып алып, өзіне рәсімдейді. Баптауға тегін көмектесеміз, қауіпсіздік сертификаты автоматты беріледі.',
    ru: 'Собственный домен в зоне edu.kz: она для организаций образования, поэтому сад покупает его сам и оформляет на себя. Настроить помогаем бесплатно, сертификат безопасности выпускается автоматически.',
  },

  gardensSection: { kk: 'Порталдағы балабақшалар', ru: 'Сады на портале' },
  wholeCatalog: { kk: 'Толық каталог →', ru: 'Весь каталог →' },
  openSite: { kk: 'Сайтты ашу →', ru: 'Открыть сайт →' },

  ctaTitle: {
    kk: 'Балабақшаның ресми сайтын бір жұмыс күнінде іске қосыңыз',
    ru: 'Запустите официальный сайт сада за один рабочий день',
  },
  ctaLead: {
    kk: 'Өтінім қалдырыңыз — сол күні қоңырау шалып, мекенжай мен кіру деректерін береміз.',
    ru: 'Оставьте заявку — перезвоним в тот же день и выдадим адрес и доступы.',
  },
} as const;

/**
 * Шесть карточек одного размера. Раньше сетка была «бенто» — одна широкая
 * тёмная плитка и мелкие вокруг, — и по ней не читалось, что главное.
 */
const FEATURES = [
  {
    image: '/images/story-time.webp',
    titleKk: 'Бос орындар',
    titleRu: 'Свободные места',
    textKk: 'Ата-ана қоңырау шалмай көреді, меңгеруші санды бір өрісте өзгертеді.',
    textRu: 'Родитель видит без звонка, заведующая меняет число в одном поле.',
  },
  {
    image: '/images/menu-porridge.webp',
    titleKk: 'Ас мәзірі',
    titleRu: 'Меню питания',
    textKk: 'Апталық мәзір немесе бекітілген мәзірдің сканы — ата-аналардың жиі сұрағы.',
    textRu: 'Меню на неделю или скан утверждённого — самый частый вопрос родителей.',
  },
  {
    image: '/images/drawings.webp',
    titleKk: 'Жаңалықтар мен хабарландырулар',
    titleRu: 'Новости и объявления',
    textKk: 'Ертеңгіліктер, карантин, режимнің өзгеруі — чаттан емес, сайттан.',
    textRu: 'Утренники, карантин, изменение режима — с сайта, а не из чата.',
  },
  {
    image: null,
    titleKk: 'Құжаттар',
    titleRu: 'Документы',
    textKk: 'Жарғы, лицензия, қабылдау ережелері, өзін-өзі бағалау — бөлімдерге бөлінген.',
    textRu: 'Устав, лицензия, правила приёма, самооценка — разложены по разделам.',
  },
  {
    image: null,
    titleKk: 'Педагогтар мен топтар',
    titleRu: 'Педагоги и группы',
    textKk: 'Құрамы, санаты, өтілі; топтар жасы мен оқыту тілі бойынша.',
    textRu: 'Состав, категории, стаж; группы по возрасту и языку обучения.',
  },
  {
    image: null,
    titleKk: 'Фотогалерея',
    titleRu: 'Фотогалерея',
    textKk: 'Альбомдар. Фотолар қысылады, GPS белгілері автоматты өшіріледі.',
    textRu: 'Альбомы. Фото сжимаются, геометки снимаются автоматически.',
  },
] as const;

const STEPS = [
  {
    n: '01',
    title: { kk: 'Өтінім қалдырасыз', ru: 'Оставляете заявку' },
    text: {
      kk: 'Балабақшаның атауы, ауданы, меңгерушінің телефоны. Сол күні қоңырау шаламыз.',
      ru: 'Название сада, район, телефон заведующей. Перезваниваем в тот же день.',
    },
  },
  {
    n: '02',
    title: { kk: 'Кіру жаднамасын аласыз', ru: 'Получаете памятку доступа' },
    text: {
      kk: 'Сайттың мекенжайы, қызметкердің логині мен құпия сөзі. Сайт жұмыс істеп тұр — толтыру ғана қалады.',
      ru: 'Адрес сайта, логин и пароль сотрудника. Сайт уже работает — остаётся наполнить.',
    },
  },
  {
    n: '03',
    title: { kk: 'Өзіңіз толтырасыз', ru: 'Наполняете сами' },
    text: {
      kk: 'Әкімші бөлімі әдіскерге немесе тәрбиешіге есептелген, бағдарламашыға емес.',
      ru: 'Админка рассчитана на методиста или воспитателя, а не на программиста.',
    },
  },
] as const;

const TARIFF_INCLUDED = [
  { kk: 'сіздің-балабақша.%s түріндегі мекенжай', ru: 'Адрес вида ваш-сад.%s' },
  { kk: 'Қазақ және орыс тілдеріндегі сайт пен әкімші бөлімі', ru: 'Сайт и админка на казахском и русском' },
  { kk: 'Алты үлгі, алты палитра және фон өрнектері', ru: 'Шесть шаблонов, шесть палитр и узоры фона' },
  { kk: 'Нашар көретіндерге арналған нұсқа', ru: 'Версия для слабовидящих' },
  { kk: 'Қазақстандағы хостинг, күн сайынғы сақтық көшірмелер', ru: 'Хостинг в Казахстане и ежедневные резервные копии' },
  { kk: 'Телефон арқылы қолдау және қол жеткізуді қалпына келтіру', ru: 'Поддержка по телефону и восстановление доступа' },
] as const;

function Check() {
  return (
    <svg
      className="mt-1 h-5 w-5 flex-none text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m4 12 6 6L20 6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      className="h-[1.1em] w-[1.1em]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/** Заголовок вкладки тоже двуязычный: layout в Next не получает язык из адреса. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: {
      absolute:
        locale === 'kk'
          ? 'EduSad — Ақтөбе облысы балабақшаларының сайттары'
          : 'EduSad — сайты для детских садов Актюбинской области',
    },
    description:
      locale === 'kk'
        ? `Балабақшаның жеке сайты жылына ${formatMoney(env.planPrices.BASIC)}-ден бастап: екі тілде, әкімші бөлімімен, Қазақстандағы хостингпен.`
        : `Свой сайт детского сада от ${formatMoney(env.planPrices.BASIC)} в год: на двух языках, с админкой и хостингом в Казахстане.`,
  };
}

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);
  const price = formatMoney(env.planPrices.BASIC);

  const latestGardens = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  return (
    <PortalPage locale={locale} pathname="/">
      {/* ── герой ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="decor pointer-events-none absolute -left-40 -top-56 h-[38rem] w-[52rem] rounded-full bg-brand/20 blur-3xl"
          aria-hidden
        />
        <div
          className="decor pointer-events-none absolute -right-48 -top-64 h-[36rem] w-[48rem] rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              {T.heroBefore[locale]}{' '}
              <span className="bg-gradient-to-r from-brand-ink via-brand to-accent bg-clip-text text-transparent">
                {price}
              </span>
              {locale === 'kk' ? '' : ' '}
              {T.heroAfter[locale]}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{T.heroLead[locale]}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={withLocale('/apply', locale)}
                className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-4 font-bold text-surface transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                {T.connect[locale]}
                <Arrow />
              </Link>
              <Link
                href={withLocale('/catalog', locale)}
                className="inline-flex items-center rounded-full border-[1.5px] border-line px-6 py-4 font-bold transition hover:border-ink"
              >
                {T.viewCatalog[locale]}
              </Link>
            </div>
          </div>

          {/* макет сайта сада */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lift">
              <div className="flex items-center gap-2 border-b border-line bg-surface/60 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden />
                <span className="ml-2.5 text-xs font-semibold text-muted">
                  sad12.{env.portalDomain}
                </span>
              </div>
              <div className="space-y-3.5 p-5">
                <Image
                  src="/images/group-room.webp"
                  alt={T.mockPhotoAlt[locale]}
                  width={512}
                  height={286}
                  priority
                  className="h-44 w-full rounded-2xl object-cover"
                />
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="rounded-2xl bg-brand-soft px-4 py-3">
                    <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-brand-ink">
                      {T.mockNews[locale]}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-snug">{T.mockNewsItem[locale]}</p>
                  </div>
                  <div className="rounded-2xl bg-accent-soft px-4 py-3">
                    <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-accent-ink">
                      {T.mockMenu[locale]}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-snug">{T.mockMenuItem[locale]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── что работает ──────────────────────────────────────────────── */}
      <section className="container-page py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">
          {T.featuresEyebrow[locale]}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {T.featuresTitle[locale]}
        </h2>
        <p className="mt-3 max-w-2xl text-muted">{T.featuresLead[locale]}</p>

        {/* Без auto-rows-fr: карточки без фотографии тянулись до высоты
            карточек с фотографией и наполовину состояли из пустоты. */}
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.titleRu}
              className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft"
            >
              {feature.image ? (
                <Image
                  src={feature.image}
                  alt=""
                  width={512}
                  height={382}
                  className="h-36 w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">
                  {locale === 'kk' ? feature.titleKk : feature.titleRu}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {locale === 'kk' ? feature.textKk : feature.textRu}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-muted">
          {locale === 'kk' ? 'Ата-аналар не көретіні туралы — ' : 'Подробнее о том, что видит родитель, — '}
          <Link
            href={withLocale('/parents', locale)}
            className="font-bold text-brand-ink underline underline-offset-4"
          >
            {T.parentsMore[locale]}
          </Link>
        </p>
      </section>
      {/* ── три шага ──────────────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">
          {T.stepsEyebrow[locale]}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {T.stepsTitle[locale]}
        </h2>
        <ol className="mt-9 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-3xl border border-line bg-card p-7 shadow-soft">
              <p className="font-display text-4xl font-extrabold leading-none text-line">{step.n}</p>
              <h3 className="mt-4 font-display text-xl font-bold">{step.title[locale]}</h3>
              <p className="mt-2 text-muted">{step.text[locale]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── тариф ─────────────────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <div className="grid gap-10 rounded-[2.5rem] bg-night p-8 text-surface sm:p-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
              {T.tariffEyebrow[locale]}
            </p>
            <h2 className="mt-3.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {T.tariffTitle[locale]}
            </h2>
            <p className="mt-3 text-surface/75">{T.tariffLead[locale]}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {PLAN_CODES.map((code) => (
                <Link
                  key={code}
                  href={withLocale(`/apply?plan=${code}`, locale)}
                  className="group rounded-2xl bg-surface/10 px-5 py-4 transition hover:bg-surface/15"
                >
                  <p className="font-bold">{PLAN_INFO[code].name[locale]}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-accent">
                    {formatMoney(env.planPrices[code])}
                  </p>
                  <p className="text-xs text-surface/60">{T.perYear[locale]}</p>
                  <p className="mt-2 text-sm text-surface/80">{PLAN_INFO[code].tagline[locale]}</p>
                </Link>
              ))}
            </div>

            <Link
              href={withLocale('/pricing', locale)}
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-4 font-bold text-ink transition hover:-translate-y-0.5"
            >
              {T.allPlans[locale]}
              <Arrow />
            </Link>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
              {T.tariffIncluded[locale]}
            </p>
            <div className="mt-4 space-y-3">
              {TARIFF_INCLUDED.map((item) => (
                <p key={item.ru} className="flex items-start gap-3">
                  <Check />
                  <span>{item[locale].replace('%s', env.portalDomain)}</span>
                </p>
              ))}
            </div>

            {/* Собственный домен — первый вопрос покупателя, поэтому он назван
                отдельно, а не спрятан строкой в общем списке. */}
            <div className="mt-7 rounded-2xl bg-surface/10 px-5 py-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-surface/60">
                {T.tariffNotIncluded[locale]}
              </p>
              <p className="mt-2 text-sm text-surface/85">{T.eduDomain[locale]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── сады на портале ───────────────────────────────────────────── */}
      {latestGardens.length > 0 ? (
        <section className="container-page pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {T.gardensSection[locale]}
            </h2>
            <Link href={withLocale('/catalog', locale)} className="font-bold text-brand-ink">
              {T.wholeCatalog[locale]}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestGardens.map((tenant) => (
              <a
                key={tenant.id}
                href={`https://${tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`}`}
                className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                {tenant.profile?.coverMediaId ? (
                  // Обложка, которую сад загрузил у себя в админке. Через <img>,
                  // а не next/image: файл отдаётся приложением по id, и гонять
                  // его ещё и через оптимизатор незачем.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/media/${tenant.profile.coverMediaId}`}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-brand-soft to-accent-soft" aria-hidden />
                )}
                <div className="p-6">
                  <p className="font-display text-lg font-bold">
                    {pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}
                  </p>
                  {tenant.profile?.district ? (
                    <p className="mt-1 text-sm text-muted">{tenant.profile.district}</p>
                  ) : null}
                  <p className="mt-4 text-sm font-bold text-brand-ink">{T.openSite[locale]}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── финальный призыв ──────────────────────────────────────────── */}
      <section className="container-page pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] border border-brand/30 bg-brand-soft p-8 sm:p-12">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
              {T.ctaTitle[locale]}
            </h2>
            <p className="mt-2 max-w-xl text-brand-ink/80">{T.ctaLead[locale]}</p>
          </div>
          <Link
            href={withLocale('/apply', locale)}
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-4 font-bold text-surface transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            {T.connect[locale]}
            <Arrow />
          </Link>
        </div>
      </section>
    </PortalPage>
  );
}
