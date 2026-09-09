import Link from 'next/link';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  region: { kk: 'Ақтөбе облысы', ru: 'Актюбинская область' },
  heroBefore: { kk: 'Балабақшаның жеке сайты —', ru: 'Свой сайт детского сада —' },
  heroPrice: { kk: 'жылына %s', ru: 'за %s в год' },
  heroLead: {
    kk: 'Әкімші бөлімі бар дайын жүйе: жаңалықтар, хабарландырулар, фотогалерея, құжаттар, педагогтар, тамақтану мәзірі. Бағдарламашысыз, өзіңіз толтырасыз. Сайт қазақ және орыс тілдерінде.',
    ru: 'Готовый движок с админкой: новости, объявления, фотогалерея, документы, педагоги, меню питания. Заполняете сами, без программиста. Сайт на казахском и русском.',
  },
  connect: { kk: 'Балабақшамды қосу', ru: 'Подключить свой сад' },
  viewCatalog: { kk: 'Каталогты қарау', ru: 'Посмотреть каталог' },
  gardensOnPortal: { kk: 'Порталдағы балабақша', ru: 'Садов на портале' },
  launch: { kk: 'Сайтты іске қосу', ru: 'Запуск сайта' },
  oneDay: { kk: '1 күн', ru: '1 день' },
  languages: { kk: 'Тілдер', ru: 'Языки' },
  mockupNote: {
    kk: 'Балабақша сайты қосылғаннан кейін осылай көрінеді — фото мен жаңалықтарды қосу ғана қалады.',
    ru: 'Так выглядит сайт сада сразу после подключения — остаётся добавить фотографии и новости.',
  },
  whatInside: { kk: 'Сайтқа не кіреді', ru: 'Что входит в сайт' },
  whatInsideLead: {
    kk: 'Бөлімдер жиынтығы мектепке дейінгі ұйымдардың сайттарына қойылатын талаптар бойынша жиналған — тексерушілер сұрайтын және ата-аналар іздейтіні.',
    ru: 'Набор разделов собран по требованиям к сайтам дошкольных организаций — то, что спрашивают проверяющие и ищут родители.',
  },
  howItWorks: { kk: 'Бұл қалай жұмыс істейді', ru: 'Как это работает' },
  allInclusive: { kk: 'Жылына %s — бәрі кіреді', ru: '%s в год — всё включено' },
  allInclusiveBefore: { kk: 'Мекенжай: ', ru: 'Адрес вида ' },
  allInclusiveAfter: {
    kk: ', жүйе, әкімші бөлімі, хостинг, жаңартулар мен қолдау. edu.kz аймағындағы доменді өзіңіз сатып аласыз — біз баптауға көмектесеміз.',
    ru: ', движок, админка, хостинг, обновления и поддержка. Домен на EDU.KZ покупаете сами, а мы поможем настроить.',
  },
  aboutTariff: { kk: 'Тариф туралы толығырақ', ru: 'Подробнее о тарифе' },
  gardensSection: { kk: 'Порталдағы балабақшалар', ru: 'Сады на портале' },
  wholeCatalog: { kk: 'Толық каталог →', ru: 'Весь каталог →' },
  openSite: { kk: 'Сайтты ашу →', ru: 'Открыть сайт →' },
  yourGarden: { kk: 'сіздің-балабақша.', ru: 'ваш-сад.' },
} as const;

const FEATURES = [
  {
    icon: '📰',
    title: { kk: 'Жаңалықтар мен хабарландырулар', ru: 'Новости и объявления' },
    text: {
      kk: 'Ертеңгіліктер, карантин, жиналыстар — ата-аналар чаттан емес, бірден біледі.',
      ru: 'Утренники, карантин, собрания — родители узнают сразу, а не из чата.',
    },
  },
  {
    icon: '📷',
    title: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
    text: {
      kk: 'Мерекелер альбомдары. Топтап жүктеу, фото өлшемі өзі кішірейеді.',
      ru: 'Альбомы с праздников. Загрузка пачкой, размер фото уменьшается сам.',
    },
  },
  {
    icon: '📄',
    title: { kk: 'Құжаттар', ru: 'Документы' },
    text: {
      kk: 'Жарғы, лицензия, қабылдау қағидалары, сатып алулар — бәрі тексерушінің көз алдында.',
      ru: 'Устав, лицензия, правила приёма, госзакупки — всё на виду у проверяющих.',
    },
  },
  {
    icon: '👩‍🏫',
    title: { kk: 'Педагогтар мен топтар', ru: 'Педагоги и группы' },
    text: {
      kk: 'Құрам, білімі, өтілі, санаттары, топтар бойынша бос орындар.',
      ru: 'Состав, образование, стаж, категории, свободные места по группам.',
    },
  },
  {
    icon: '🍎',
    title: { kk: 'Тамақтану мәзірі', ru: 'Меню питания' },
    text: {
      kk: 'Күн бойынша мәзір немесе бекітілгеннің сканы. Ата-аналардың ең жиі сұрағы.',
      ru: 'Меню по дням или скан утверждённого. Самый частый вопрос родителей.',
    },
  },
  {
    icon: '✉️',
    title: { kk: 'Виртуалды қабылдау', ru: 'Виртуальная приёмная' },
    text: {
      kk: 'Ата-аналардың өтініштері тікелей әкімші бөліміңізге келеді.',
      ru: 'Обращения родителей приходят прямо в вашу админку.',
    },
  },
] as const;

const STEPS = [
  {
    n: 1,
    title: { kk: 'Өтінім қалдырасыз', ru: 'Оставляете заявку' },
    text: {
      kk: 'Қоңырау шаласыз немесе нысанды толтырасыз. Тек балабақшаның атауы мен телефон қажет.',
      ru: 'Звоните или заполняете форму. Нужны только название сада и телефон.',
    },
  },
  {
    n: 2,
    title: { kk: 'Сайт пен кіру деректерін аласыз', ru: 'Получаете сайт и доступы' },
    text: {
      kk: 'Біз сайт жасап, жаднама береміз: мекенжай, логин және әкімші бөлімінің құпия сөзі.',
      ru: 'Мы создаём сайт и выдаём памятку: адрес, логин и пароль от админки.',
    },
  },
  {
    n: 3,
    title: { kk: 'Өзіңіз толтырасыз', ru: 'Наполняете сами' },
    text: {
      kk: 'Әкімші бөліміне кіріп, жаңалықтар, фото және құжаттар қосасыз. Оқыту қажет емес.',
      ru: 'Заходите в админку и добавляете новости, фото и документы. Обучение не нужно.',
    },
  },
] as const;

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

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
      <section className="relative overflow-hidden">
        <div className="decor pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-soft blur-3xl" aria-hidden />
        <div className="decor pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" aria-hidden />

        <div className="container-page relative grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="badge bg-brand-soft text-brand-ink">{T.region[locale]}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {T.heroBefore[locale]}{' '}
              <span className="text-brand">{T.heroPrice[locale].replace('%s', formatMoney(env.subscriptionPrice))}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {T.heroLead[locale]}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={withLocale('/apply', locale)} className="btn-primary px-6 py-3 text-base">{T.connect[locale]}</Link>
              <Link href={withLocale('/catalog', locale)} className="btn-secondary px-6 py-3 text-base">{T.viewCatalog[locale]}</Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-muted">{T.gardensOnPortal[locale]}</dt>
                <dd className="font-display text-2xl font-extrabold">{gardenCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{T.launch[locale]}</dt>
                <dd className="font-display text-2xl font-extrabold">{T.oneDay[locale]}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{T.languages[locale]}</dt>
                <dd className="font-display text-2xl font-extrabold">ҚАЗ / РУС</dd>
              </div>
            </dl>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-line bg-brand-soft/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
              <span className="ml-3 truncate rounded-lg bg-card px-3 py-1 text-xs text-muted">
                sad12.{env.portalDomain}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-brand/80 to-accent/70" aria-hidden />
              <div className="grid grid-cols-3 gap-3" aria-hidden>
                {['📰', '📷', '📄'].map((icon) => (
                  <div key={icon} className="grid h-20 place-items-center rounded-2xl bg-brand-soft text-2xl">
                    {icon}
                  </div>
                ))}
              </div>
              <div className="space-y-2" aria-hidden>
                <div className="h-3 w-3/4 rounded-full bg-line" />
                <div className="h-3 w-full rounded-full bg-line" />
                <div className="h-3 w-2/3 rounded-full bg-line" />
              </div>
              <p className="text-sm text-muted">
                {T.mockupNote[locale]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="font-display text-3xl font-extrabold">{T.whatInside[locale]}</h2>
        <p className="mt-2 max-w-2xl text-muted">
          {T.whatInsideLead[locale]}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title.ru} className="card p-6">
              <span className="text-3xl" aria-hidden>{feature.icon}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{feature.title[locale]}</h3>
              <p className="mt-1.5 text-sm text-muted">{feature.text[locale]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="container-page">
          <h2 className="font-display text-3xl font-extrabold">{T.howItWorks[locale]}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="relative rounded-2xl border border-line p-6">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand font-display text-lg font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{step.title[locale]}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.text[locale]}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border border-brand/30 bg-brand-soft p-6 sm:p-8">
            <h3 className="font-display text-2xl font-extrabold text-brand-ink">
              {T.allInclusive[locale].replace('%s', formatMoney(env.subscriptionPrice))}
            </h3>
            <p className="mt-2 max-w-2xl text-brand-ink/80">
              {T.allInclusiveBefore[locale]}
              <strong>{T.yourGarden[locale]}{env.portalDomain}</strong>
              {T.allInclusiveAfter[locale]}
            </p>
            <Link href={withLocale('/pricing', locale)} className="btn-primary mt-5">{T.aboutTariff[locale]}</Link>
          </div>
        </div>
      </section>

      {latestGardens.length > 0 ? (
        <section className="container-page py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold">{T.gardensSection[locale]}</h2>
            <Link href={withLocale('/catalog', locale)} className="btn-ghost">{T.wholeCatalog[locale]}</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestGardens.map((tenant) => (
              <a
                key={tenant.id}
                href={`https://${tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`}`}
                className="card p-5 transition hover:shadow-lift"
              >
                <p className="font-display text-lg font-bold">{pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug}</p>
                {tenant.profile?.district ? (
                  <p className="mt-1 text-sm text-muted">{tenant.profile.district}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-brand">{T.openSite[locale]}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </PortalPage>
  );
}
