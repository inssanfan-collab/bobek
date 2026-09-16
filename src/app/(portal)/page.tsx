import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { formatDate, formatGardenCount, formatMoney, KIND } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/**
 * Главная портала — для родителей.
 *
 * Раньше она продавала сайты садам, а родитель, пришедший найти сад,
 * упирался в цену подписки и шаги подключения. Родителей на портале
 * в сотни раз больше, чем заведующих, поэтому первым экраном теперь
 * поиск сада, а всё для садов — на отдельной странице `/connect`,
 * куда ведут кнопки «Подключить сад».
 */

const T = {
  eyebrow: { kk: 'Ақтөбе балабақшалары', ru: 'Детские сады Актобе' },
  heroTitle: {
    kk: 'Балабақшаны табыңыз және ол туралы бәрін біліңіз',
    ru: 'Найдите детский сад и узнайте о нём всё',
  },
  heroLead: {
    kk: 'Балабақшалардың ресми сайттары бір жерде: бос орындар, ас мәзірі, педагогтар, құжаттар мен жаңалықтар — қоңырау шалмай-ақ.',
    ru: 'Официальные сайты садов в одном месте: свободные места, меню, педагоги, документы и новости — без звонков.',
  },
  searchLabel: { kk: 'Атауы немесе мекенжайы', ru: 'Название или адрес' },
  searchExample: { kk: 'Мысалы: Нұрсат', ru: 'Например: Нурсат' },
  district: { kk: 'Аудан', ru: 'Район' },
  allDistricts: { kk: 'Барлық аудан', ru: 'Все районы' },
  hasPlaces: { kk: 'Тек бос орыны барлар', ru: 'Только со свободными местами' },
  find: { kk: 'Балабақша табу', ru: 'Найти сад' },
  howQueue: { kk: 'Балабақшаға кезекке қалай тұру керек →', ru: 'Как встать в очередь в детский сад →' },
  photoAlt: {
    kk: 'Тәрбиеші балаларға кітап оқып отыр',
    ru: 'Воспитатель читает детям книгу',
  },
  // Счётное слово склоняется по-русски («1 сад», «2 сада», «5 садов»);
  // по-казахски после числа не меняется, поэтому казахская подпись целиком здесь.
  statGardensKk: { kk: 'балабақша порталда', ru: '' },
  statGardensRu: { kk: '', ru: 'на портале' },
  statFreeKk: { kk: 'балабақшада бос орын бар', ru: '' },
  statFreeRu: { kk: '', ru: 'со свободными местами' },

  gardensTitle: { kk: 'Порталдағы балабақшалар', ru: 'Сады на портале' },
  gardensLead: {
    kk: 'Алдымен бос орыны бар балабақшалар. Әрқайсысының өз ресми сайты бар.',
    ru: 'Сначала — сады со свободными местами. У каждого свой официальный сайт.',
  },
  wholeCatalog: { kk: 'Толық каталог және карта →', ru: 'Весь каталог и карта →' },
  freePlaces: { kk: 'Бос орын: %s', ru: 'Свободно мест: %s' },
  noPlaces: { kk: 'Бос орын жоқ', ru: 'Мест нет' },
  private: { kk: 'Жеке', ru: 'Частный' },
  state: { kk: 'Мемлекеттік', ru: 'Государственный' },
  openSite: { kk: 'Сайтты ашу →', ru: 'Открыть сайт →' },

  newsTitle: { kk: 'Балабақшалардың жаңалықтары', ru: 'Новости садов' },
  newsLead: {
    kk: 'Ертеңгіліктер, хабарландырулар, топтардың өмірі — барлық балабақшалардың сайттарынан.',
    ru: 'Утренники, объявления, жизнь групп — со всех сайтов садов.',
  },
  video: { kk: 'Бейне', ru: 'Видео' },

  queueEyebrow: { kk: 'Ата-аналарға', ru: 'Родителям' },
  queueTitle: { kk: 'Балабақшаға қалай түсуге болады', ru: 'Как попасть в детский сад' },
  queueLead: {
    kk: 'Кезекті мемлекет жүргізеді — біз оған тек сілтеме береміз. Порталда балабақшаны таңдауға және оның құжаттары мен шарттарын алдын ала білуге болады.',
    ru: 'Очередь ведёт государство — мы на неё только ссылаемся. На портале можно выбрать сад и заранее узнать его документы и условия.',
  },
  queueButton: { kk: 'Darabala.kz-те кезекке тұру', ru: 'Встать в очередь на Darabala.kz' },
  queueMore: { kk: 'Толығырақ: құжаттар және кезеңдер →', ru: 'Подробнее: документы и этапы →' },

  insideEyebrow: { kk: 'Әр балабақшаның сайтында', ru: 'На сайте каждого сада' },
  insideTitle: { kk: 'Ата-анаға қажеттінің бәрі', ru: 'Всё, что нужно родителю' },

  gardenBandTitle: { kk: 'Сіз балабақшаның өкілісіз бе?', ru: 'Вы представляете детский сад?' },
  gardenBandText: {
    kk: 'Екі тілдегі ресми сайт және қарапайым әкімші бөлімі — жылына %s-ден бастап. Бір жұмыс күнінде іске қосамыз.',
    ru: 'Официальный сайт на двух языках и простая админка — от %s в год. Запускаем за один рабочий день.',
  },
  gardenBandButton: { kk: 'Балабақшаны қосу', ru: 'Подключить сад' },
} as const;

const QUEUE_STEPS = [
  {
    title: { kk: 'Кезекке тұру', ru: 'Встать в очередь' },
    text: {
      kk: 'Darabala.kz порталында, баланың ЖСН-і және ЭЦҚ арқылы. Төрт балабақшаға дейін таңдауға болады.',
      ru: 'На портале Darabala.kz, по ИИН ребёнка и ЭЦП. Можно выбрать до четырёх садов.',
    },
  },
  {
    title: { kk: 'Жолдаманы алу', ru: 'Получить направление' },
    text: {
      kk: 'Кезек жеткенде хабарлама келеді. Жолдаманы мерзімінде растаңыз, әйтпесе ол келесі балаға өтеді.',
      ru: 'Когда подойдёт очередь, придёт уведомление. Подтвердите направление в срок, иначе оно уйдёт следующему.',
    },
  },
  {
    title: { kk: 'Құжаттарды тапсыру', ru: 'Сдать документы' },
    text: {
      kk: 'Нақты тізім — балабақшаның сайтында, «Құжаттар» бөлімінде немесе телефон арқылы.',
      ru: 'Точный список — на сайте сада, в разделе «Документы», или по телефону.',
    },
  },
] as const;

/** Что родитель найдёт на сайте любого сада: у всех одинаковый набор разделов. */
const INSIDE = [
  {
    image: '/images/story-time.webp',
    title: { kk: 'Бос орындар', ru: 'Свободные места' },
    text: { kk: 'Топтар бойынша, қоңырау шалмай.', ru: 'По группам, без звонка заведующей.' },
  },
  {
    image: '/images/menu-porridge.webp',
    title: { kk: 'Ас мәзірі', ru: 'Меню питания' },
    text: { kk: 'Бүгін және апта бойы не береді.', ru: 'Чем кормят сегодня и на неделе.' },
  },
  {
    image: '/images/drawings.webp',
    title: { kk: 'Жаңалықтар мен хабарландырулар', ru: 'Новости и объявления' },
    text: { kk: 'Ертеңгіліктер, карантин, режимнің өзгеруі.', ru: 'Утренники, карантин, изменения режима.' },
  },
  {
    image: null,
    title: { kk: 'Құжаттар', ru: 'Документы' },
    text: { kk: 'Қабылдау ережелері, лицензия, жарғы.', ru: 'Правила приёма, лицензия, устав.' },
  },
  {
    image: null,
    title: { kk: 'Педагогтар мен топтар', ru: 'Педагоги и группы' },
    text: { kk: 'Кім тәрбиелейді, топтың жасы және оқыту тілі.', ru: 'Кто воспитывает, возраст и язык обучения группы.' },
  },
  {
    image: null,
    title: { kk: 'Меңгерушіге сұрақ', ru: 'Вопрос заведующей' },
    text: { kk: 'Виртуалды қабылдау бөлмесі арқылы.', ru: 'Через виртуальную приёмную на сайте.' },
  },
] as const;

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

/** Адрес сайта сада: собственный домен, если куплен, иначе поддомен портала. */
function gardenUrl(
  tenant: { slug: string; domains: { host: string }[] },
  locale: Locale,
  path = '/',
): string {
  const host = tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`;
  // Сайты садов понимают тот же ?lang=kk, что и портал: язык едет дальше.
  return `https://${host}${withLocale(path, locale)}`;
}

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
          ? 'EduSad — Ақтөбе балабақшалары: бос орындар, мәзір, жаңалықтар'
          : 'EduSad — детские сады Актобе: свободные места, меню, новости',
    },
    description:
      locale === 'kk'
        ? 'Ақтөбе балабақшаларының ресми сайттары бір жерде: бос орындар, ас мәзірі, педагогтар, құжаттар мен жаңалықтар. Балабақшаға кезекке қалай тұру керек.'
        : 'Официальные сайты детских садов Актобе в одном месте: свободные места, меню, педагоги, документы и новости. Как встать в очередь в детский сад.',
  };
}

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  const [gardens, gardensTotal, freeTotal, districts, news] = await Promise.all([
    prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } },
      // Родитель ищет место — сады, где оно есть, показываем первыми.
      orderBy: [{ profile: { placesFree: 'desc' } }, { createdAt: 'desc' }],
      take: 6,
    }),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.count({ where: { status: 'ACTIVE', profile: { placesFree: { gt: 0 } } } }),
    prisma.tenantProfile.findMany({
      where: { district: { not: null }, tenant: { status: 'ACTIVE' } },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    }),
    // Лента новостей со всех садов. Только из видимых разделов работающих
    // садов: скрытый садом раздел не должен всплывать на портале.
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        tenant: { status: 'ACTIVE' },
        section: { isVisible: true, type: { in: ['NEWS', 'ANNOUNCEMENT'] } },
      },
      include: {
        coverMedia: { select: { id: true } },
        section: { select: { slug: true } },
        tenant: { include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    }),
  ]);

  return (
    <PortalPage locale={locale} pathname="/">
      {/* ── первый экран: поиск сада ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="decor pointer-events-none absolute -left-40 -top-56 h-[38rem] w-[52rem] rounded-full bg-brand/20 blur-3xl"
          aria-hidden
        />
        <div
          className="decor pointer-events-none absolute -right-48 -top-64 h-[36rem] w-[48rem] rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">
              {T.eyebrow[locale]}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {T.heroTitle[locale]}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{T.heroLead[locale]}</p>

            {/* Поиск сразу уводит в каталог с фильтрами: второй поиск на главной
                разошёлся бы с каталогом при первой же правке одного из них. */}
            <form
              action="/catalog"
              role="search"
              className="mt-8 grid gap-3 rounded-3xl border border-line bg-card p-4 shadow-soft sm:grid-cols-[1fr_auto] sm:p-5"
            >
              {locale === 'kk' ? <input type="hidden" name="lang" value="kk" /> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="home-q">{T.searchLabel[locale]}</label>
                  <input id="home-q" name="q" className="field" placeholder={T.searchExample[locale]} />
                </div>
                <div>
                  <label className="field-label" htmlFor="home-district">{T.district[locale]}</label>
                  <select id="home-district" name="district" className="field" defaultValue="">
                    <option value="">{T.allDistricts[locale]}</option>
                    {districts.map((d) => (
                      <option key={d.district} value={d.district ?? ''}>{d.district}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                  <input type="checkbox" name="free" value="1" className="h-4 w-4" />
                  {T.hasPlaces[locale]}
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 self-end rounded-full bg-ink px-6 py-4 font-bold text-surface transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                {T.find[locale]}
                <Arrow />
              </button>
            </form>

            <Link
              href={withLocale('/parents', locale)}
              className="mt-5 inline-block font-bold text-brand-ink underline underline-offset-4"
            >
              {T.howQueue[locale]}
            </Link>
          </div>

          <div className="relative">
            <Image
              src="/images/story-time.webp"
              alt={T.photoAlt[locale]}
              width={640}
              height={478}
              priority
              className="h-72 w-full rounded-[2rem] object-cover shadow-lift sm:h-96"
            />
            {gardensTotal > 0 ? (
              <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-2 gap-3 sm:left-6 sm:right-auto sm:w-80">
                <div className="rounded-2xl border border-line bg-card px-4 py-3 shadow-soft">
                  <p className="font-display text-3xl font-extrabold leading-none">{gardensTotal}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {locale === 'kk'
                      ? T.statGardensKk.kk
                      : `${formatGardenCount(gardensTotal, 'ru')} ${T.statGardensRu.ru}`}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-card px-4 py-3 shadow-soft">
                  <p className="font-display text-3xl font-extrabold leading-none text-emerald-700">{freeTotal}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {locale === 'kk'
                      ? T.statFreeKk.kk
                      : `${formatGardenCount(freeTotal, 'ru')} ${T.statFreeRu.ru}`}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── сады ──────────────────────────────────────────────────────── */}
      {gardens.length > 0 ? (
        <section className="container-page py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {T.gardensTitle[locale]}
              </h2>
              <p className="mt-2 text-muted">{T.gardensLead[locale]}</p>
            </div>
            <Link href={withLocale('/catalog', locale)} className="font-bold text-brand-ink">
              {T.wholeCatalog[locale]}
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gardens.map((tenant) => {
              const p = tenant.profile;
              const address = pick(locale, p?.addressKk, p?.addressRu);
              return (
                <article
                  key={tenant.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-soft"
                >
                  {p?.coverMediaId ? (
                    // Обложка, которую сад загрузил сам; отдаётся приложением по id.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${p.coverMediaId}`} alt="" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-brand-soft to-accent-soft" aria-hidden />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {p?.placesFree ? (
                        <span className="badge bg-emerald-100 text-emerald-800">
                          {T.freePlaces[locale].replace('%s', String(p.placesFree))}
                        </span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-600">{T.noPlaces[locale]}</span>
                      )}
                      <span className="badge bg-brand-soft text-brand-ink">
                        {p?.isPrivate ? T.private[locale] : T.state[locale]}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold">
                      {pick(locale, p?.nameKk, p?.nameRu) || tenant.slug}
                    </h3>
                    {p?.kind ? <p className="text-sm text-muted">{KIND[p.kind][locale]}</p> : null}
                    {address ? <p className="mt-2 text-sm">{address}</p> : null}
                    {p?.phone ? (
                      <a
                        href={`tel:${p.phone.replace(/\s/g, '')}`}
                        className="mt-1 text-sm font-semibold text-brand-ink"
                      >
                        {p.phone}
                      </a>
                    ) : null}

                    <a
                      href={gardenUrl(tenant, locale)}
                      className="mt-auto pt-5 text-sm font-bold text-brand-ink"
                    >
                      {T.openSite[locale]}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── новости садов ─────────────────────────────────────────────── */}
      {news.length > 0 ? (
        <section className="container-page pb-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {T.newsTitle[locale]}
          </h2>
          <p className="mt-2 text-muted">{T.newsLead[locale]}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => (
              <a
                key={post.id}
                href={gardenUrl(post.tenant, locale, `/${post.section.slug}/${post.slug}`)}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative">
                  {post.coverMedia ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${post.coverMedia.id}`} alt="" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-brand/60 to-accent/50" aria-hidden />
                  )}
                  {post.videoUrl ? (
                    <span className="absolute left-3 top-3 badge bg-ink/80 text-surface">▶ {T.video[locale]}</span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold text-muted">
                    {pick(locale, post.tenant.profile?.nameKk, post.tenant.profile?.nameRu) || post.tenant.slug}
                    {' · '}
                    {formatDate(post.publishedAt, locale)}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-brand-ink">
                    {pick(locale, post.titleKk, post.titleRu)}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── как попасть в сад ─────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <div className="grid gap-10 rounded-[2.5rem] bg-night p-8 text-surface sm:p-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
              {T.queueEyebrow[locale]}
            </p>
            <h2 className="mt-3.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {T.queueTitle[locale]}
            </h2>
            <p className="mt-3 text-surface/75">{T.queueLead[locale]}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href="https://darabala.kz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-4 font-bold text-ink transition hover:-translate-y-0.5"
              >
                {T.queueButton[locale]}
                <Arrow />
              </a>
              <Link href={withLocale('/parents', locale)} className="font-bold text-surface underline underline-offset-4">
                {T.queueMore[locale]}
              </Link>
            </div>
          </div>

          <ol className="space-y-3">
            {QUEUE_STEPS.map((step, index) => (
              <li key={step.title.ru} className="flex gap-4 rounded-2xl bg-surface/10 px-5 py-4">
                <span className="font-display text-3xl font-extrabold leading-none text-accent">{index + 1}</span>
                <div>
                  <p className="font-bold">{step.title[locale]}</p>
                  <p className="mt-1 text-sm text-surface/80">{step.text[locale]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── что есть на сайте сада ────────────────────────────────────── */}
      <section className="container-page pb-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">
          {T.insideEyebrow[locale]}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {T.insideTitle[locale]}
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map((item) => (
            <article key={item.title.ru} className="overflow-hidden rounded-3xl border border-line bg-card shadow-soft">
              {item.image ? (
                <Image src={item.image} alt="" width={512} height={382} className="h-36 w-full object-cover" />
              ) : null}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{item.title[locale]}</h3>
                <p className="mt-2 text-sm text-muted">{item.text[locale]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── для садов: одна узкая полоса, остальное на /connect ───────── */}
      <section className="container-page pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-brand/30 bg-brand-soft px-8 py-7 sm:px-10">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-brand-ink sm:text-2xl">
              {T.gardenBandTitle[locale]}
            </h2>
            <p className="mt-1 max-w-2xl text-brand-ink/80">
              {T.gardenBandText[locale].replace('%s', formatMoney(env.planPrices.BASIC))}
            </p>
          </div>
          <Link
            href={withLocale('/connect', locale)}
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-bold text-surface transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            {T.gardenBandButton[locale]}
            <Arrow />
          </Link>
        </div>
      </section>
    </PortalPage>
  );
}
