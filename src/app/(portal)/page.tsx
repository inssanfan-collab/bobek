import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  eyebrow: { kk: 'Балабақшаның жеке сайты', ru: 'Балабақшаның жеке сайты' },
  heroBefore: { kk: 'Балабақшаның жеке сайты', ru: 'Свой сайт детского сада за' },
  heroAfter: { kk: 'жылына', ru: 'в год' },
  heroLead: {
    kk: 'Сайт бірден екі тілде — мұны «Тілдер туралы» заң талап етеді. Жаңалықтар, құжаттар, педагогтар, тамақтану мәзірі. Бағдарламашысыз, балабақша қызметкері толтырады.',
    ru: 'Сайт сразу на двух языках — этого требует закон «О языках». Новости, документы, педагоги, меню питания. Заполняет сотрудник сада, без программиста.',
  },
  connect: { kk: 'Балабақшамды қосу', ru: 'Подключить свой сад' },
  viewCatalog: { kk: 'Каталогты қарау', ru: 'Посмотреть каталог' },
  gardensOnPortal: { kk: 'порталдағы балабақша', ru: 'сада на портале' },
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
  floatEyebrow: { kk: 'Бүгінгі мәзір', ru: 'Бүгінгі мәзір' },
  floatValue: { kk: 'Таңғы ас — Сүтпен ботқа', ru: 'Таңғы ас — Сүтпен ботқа' },

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

  tariffEyebrow: { kk: 'Тариф', ru: 'Тариф' },
  tariffTitle: {
    kk: 'Балабақша сайты үшін жылына %s',
    ru: '%s в год за сайт детского сада',
  },
  tariffLead: {
    kk: 'Жасырын қосымша төлемсіз және жаңалықтар мен фото санына шектеусіз бір тариф.',
    ru: 'Один тариф без скрытых доплат и ограничений по количеству новостей и фотографий.',
  },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  eduDomain: {
    kk: 'edu.kz аймағындағы доменді өзіңіз сатып аласыз — біз баптауға көмектесеміз.',
    ru: 'Домен на EDU.KZ покупаете сами, а мы поможем настроить.',
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

/** Полоса доверия под героем: короткие типографские пункты, без громких иконок. */
const TRUST = [
  { kk: 'Хостинг Қазақстанда', ru: 'Хостинг в Казахстане' },
  { kk: '«Тілдер туралы» заңға сәйкес', ru: 'Соответствие закону «О языках»' },
  { kk: 'Күн сайын сақтық көшірме', ru: 'Резервные копии каждый день' },
  { kk: 'Телефон арқылы қолдау', ru: 'Поддержка по телефону' },
] as const;

const PARENT_POINTS = [
  {
    kk: 'Қоңырау шалмай бос орындарды көру',
    ru: 'Посмотреть свободные места, не звоня заведующей',
  },
  { kk: 'Аптаның тамақтану мәзірі', ru: 'Меню питания на неделю' },
  { kk: 'Карантин және іс-шаралар туралы хабарландыру', ru: 'Объявления о карантине и утренниках' },
  { kk: 'Жарғы, лицензия, қабылдау ережелері', ru: 'Устав, лицензия, правила приёма' },
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
  { kk: 'Қазақ және орыс тілдеріндегі әкімші бөлімі', ru: 'Админка на казахском и русском' },
  { kk: 'Үш үлгі және алты түс палитрасы', ru: 'Три шаблона и шесть палитр' },
  { kk: 'Нашар көретіндерге арналған нұсқа', ru: 'Версия для слабовидящих' },
  { kk: 'Қазақстандағы хостинг және сақтық көшірмелер', ru: 'Хостинг и резервные копии в Казахстане' },
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

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);
  const price = formatMoney(env.subscriptionPrice);

  const [gardenCount, latestGardens] = await Promise.all([
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

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
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-ink">
              {T.eyebrow[locale]}
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              {T.heroBefore[locale]}{' '}
              <span className="bg-gradient-to-r from-brand-ink via-brand to-accent bg-clip-text text-transparent">
                {price}
              </span>{' '}
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

            <dl className="mt-10 flex flex-wrap gap-x-11 gap-y-5">
              <div>
                <dd className="font-display text-3xl font-extrabold">{gardenCount}</dd>
                <dt className="text-sm text-muted">{T.gardensOnPortal[locale]}</dt>
              </div>
              <div>
                <dd className="font-display text-3xl font-extrabold">{T.oneDay[locale]}</dd>
                <dt className="text-sm text-muted">{T.untilLaunch[locale]}</dt>
              </div>
              <div>
                <dd className="font-display text-3xl font-extrabold">ҚАЗ / РУС</dd>
                <dt className="text-sm text-muted">{T.twoLanguages[locale]}</dt>
              </div>
            </dl>
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

            {/* Карточка выступает из-под нижнего края макета: на одном уровне
                с плитками она наезжала на «Меню питания». */}
            <div className="decor absolute -bottom-11 right-4 rounded-2xl border border-line bg-card/90 px-4 py-3 shadow-lift backdrop-blur sm:-right-6">
              <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.1em] text-accent-ink">
                {T.floatEyebrow[locale]}
              </p>
              <p className="mt-1 text-sm font-bold">{T.floatValue[locale]}</p>
            </div>
          </div>
        </div>

        {/* полоса доверия */}
        <div className="container-page relative pb-14">
          <ul className="grid gap-3 rounded-3xl border border-line bg-card/60 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <li key={item.ru} className="flex items-start gap-2.5 text-sm font-semibold">
                <Check />
                <span>{item[locale]}</span>
              </li>
            ))}
          </ul>
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

        <div className="mt-9 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Свободные места — то, ради чего родитель заходит на сайт сада,
              поэтому плитка занимает две колонки и открывает ряд. */}
          <article className="group relative overflow-hidden rounded-3xl bg-night text-surface shadow-soft md:col-span-2">
            <Image
              src="/images/story-time.webp"
              alt=""
              width={512}
              height={286}
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105"
            />
            <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-night via-night/85 to-night/20 p-7">
              <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.14em] text-accent">
                {locale === 'kk' ? 'Ата-ана бірден көреді' : 'Родитель видит сразу'}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold">
                {locale === 'kk' ? 'Бос орындар' : 'Свободные места'}
              </h3>
              <p className="mt-2 max-w-md text-surface/80">
                {locale === 'kk'
                  ? '«Күншуақ» тобында 5 орын — қоңырау шалудың қажеті жоқ.'
                  : '5 мест в группе «Күншуақ» — звонить заведующей не нужно.'}
              </p>
            </div>
          </article>

          {/* Меню: фотография сверху, под ней настоящий день недели */}
          <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
            <Image
              src="/images/menu-porridge.webp"
              alt=""
              width={512}
              height={382}
              className="h-36 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold">
                Мәзір · {locale === 'kk' ? 'Мәзір' : 'Меню'}
              </h3>
              <dl className="mt-3 text-sm">
                {[
                  { k: 'Таңғы ас', v: 'Сүтпен ботқа' },
                  { k: locale === 'kk' ? 'Түскі ас' : 'Обед', v: 'Сорпа' },
                  { k: 'Бесін ас', v: locale === 'kk' ? 'Кеспе' : 'Запеканка' },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex justify-between gap-3 border-b border-dashed border-line py-1.5 last:border-0"
                  >
                    <dt className="text-muted">{row.k}</dt>
                    <dd className="font-bold">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>

          {/* Новости */}
          <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
            <Image
              src="/images/drawings.webp"
              alt=""
              width={512}
              height={382}
              className="h-36 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="font-display text-xl font-bold">
                {locale === 'kk' ? 'Жаңалықтар мен хабарландырулар' : 'Новости и объявления'}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {locale === 'kk'
                  ? 'Наурыз мейрамы, ертеңгіліктер, карантин — ата-аналар чаттан емес, сайттан біледі.'
                  : 'Наурыз мейрамы, утренники, карантин — родители узнают с сайта, а не из чата.'}
              </p>
            </div>
          </article>

          {/* Документы */}
          <article className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold">
              Құжаттар · {locale === 'kk' ? 'Құжаттар' : 'Документы'}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {locale === 'kk'
                ? 'Тексеруші де, ата-ана да іздейтін жерде.'
                : 'Там, где их ищет и проверка, и родитель.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Жарғы', 'Лицензия', locale === 'kk' ? 'Қабылдау ережелері' : 'Правила приёма'].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand-ink"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </article>

          {/* Педагоги */}
          <article className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold">
              {locale === 'kk' ? 'Педагогтар' : 'Педагоги'}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {locale === 'kk'
                ? 'Құрамы, санаты, өтілі және біліктілікті арттыру курстары.'
                : 'Состав, категории, стаж и курсы повышения квалификации.'}
            </p>
          </article>

          {/* Галерея */}
          <article className="rounded-3xl border border-accent/30 bg-accent-soft p-6">
            <h3 className="font-display text-xl font-bold">
              {locale === 'kk' ? 'Фотогалерея' : 'Фотогалерея'}
            </h3>
            <p className="mt-2 text-sm text-accent-ink">
              {locale === 'kk'
                ? 'Ертеңгіліктер мен серуендердің альбомдары. Фотолар қысылады, EXIF өшіріледі.'
                : 'Альбомы утренников и прогулок. Фото сжимаются, EXIF удаляется.'}
            </p>
          </article>
        </div>
      </section>
      {/* ── родителям ─────────────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <div className="grid gap-8 rounded-[2.5rem] border border-line bg-card p-8 shadow-soft sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">
              {T.parentsEyebrow[locale]}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
              {T.parentsTitle[locale]}
            </h2>
            <p className="mt-3 text-muted">{T.parentsLead[locale]}</p>
            <Link
              href={withLocale('/parents', locale)}
              className="mt-6 inline-block font-bold text-brand-ink underline underline-offset-4"
            >
              {T.parentsMore[locale]}
            </Link>
          </div>
          <ul className="grid gap-3">
            {PARENT_POINTS.map((point) => (
              <li
                key={point.ru}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4"
              >
                <Check />
                <span className="font-semibold">{point[locale]}</span>
              </li>
            ))}
          </ul>
        </div>
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
              {T.tariffTitle[locale].replace('%s', price)}
            </h2>
            <p className="mt-3 text-surface/75">{T.tariffLead[locale]}</p>
            <Link
              href={withLocale('/apply', locale)}
              className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-4 font-bold text-ink transition hover:-translate-y-0.5"
            >
              {T.apply[locale]}
              <Arrow />
            </Link>
          </div>
          <div className="space-y-3">
            {TARIFF_INCLUDED.map((item) => (
              <p key={item.ru} className="flex items-start gap-3">
                <Check />
                <span>{item[locale].replace('%s', env.portalDomain)}</span>
              </p>
            ))}
            <p className="mt-5 rounded-2xl bg-surface/10 px-5 py-4 text-sm text-surface/85">
              {T.eduDomain[locale]}
            </p>
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
                <div
                  className="h-32 bg-gradient-to-br from-brand-soft to-accent-soft"
                  aria-hidden
                />
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
