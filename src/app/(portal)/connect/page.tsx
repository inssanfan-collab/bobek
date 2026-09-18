import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { PLAN_CODES, PLAN_INFO } from '@/lib/plans';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { portalSettings } from '@/server/docs/contract';

export const dynamic = 'force-dynamic';

/**
 * Страница для детских садов.
 *
 * Читает её заведующая или бухгалтер между делами, поэтому здесь только
 * конкретика: сколько стоит, что сделать по шагам и где скачать бумаги.
 * Длинные описания возможностей не нужны — сайт проще показать, чем
 * расписать, а подробности лежат в PDF-инструкции.
 */

const T = {
  eyebrow: { kk: 'Балабақшаларға', ru: 'Детским садам' },
  // По-казахски «от» — окончание, пишется слитно с ценой: «50 000 ₸-ден бастап».
  titleBefore: { kk: 'Балабақшаның ресми сайты — жылына', ru: 'Официальный сайт детского сада — от' },
  titleAfter: { kk: '-ден бастап', ru: 'в год' },
  lead: {
    kk: 'Екі тілде, әкімші бөлімімен, %s мекенжайында. Бір жұмыс күнінде іске қосамыз.',
    ru: 'На двух языках, с админкой, по адресу %s. Запускаем за один рабочий день.',
  },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  guidePdf: { kk: 'Нұсқаулық, PDF', ru: 'Инструкция, PDF' },

  priceTitle: { kk: 'Құны', ru: 'Стоимость' },
  perYear: { kk: 'жылына', ru: 'в год' },
  priceBoth: {
    kk: 'Екеуінде де: сайт, әкімші бөлімі, Қазақстандағы хостинг, сақтық көшірмелер, қолдау. Жеке домен (.kz немесе edu.kz) бөлек — баптауға тегін көмектесеміз.',
    ru: 'В обоих: сайт, админка, хостинг в Казахстане, резервные копии, поддержка. Свой домен .kz или edu.kz — отдельно, настроить поможем бесплатно.',
  },
  comparePlans: { kk: 'Тарифтерді салыстыру →', ru: 'Сравнить тарифы →' },

  stepsTitle: { kk: 'Қалай қосылу керек', ru: 'Как подключиться' },

  howtoTitle: { kk: 'Қысқа нұсқаулықтар', ru: 'Мини-инструкции' },

  filesTitle: { kk: 'Жүктеп алу', ru: 'Скачать' },
  fileGuide: { kk: 'Жұмыс нұсқаулығы', ru: 'Инструкция по работе' },
  fileAnketa: { kk: 'Сауалнама үлгісі', ru: 'Шаблон анкеты' },
  fileSample: { kk: 'Толтыру үлгісі', ru: 'Образец заполнения' },
  fileOffer: { kk: 'Жария оферта', ru: 'Публичная оферта' },

  questions: { kk: 'Сұрақтар бар ма?', ru: 'Остались вопросы?' },
  questionsText: {
    kk: 'Өтінім қалдырыңыз — сол күні қоңырау шалып, бәрін түсіндіреміз.',
    ru: 'Оставьте заявку — перезвоним в тот же день и всё объясним.',
  },
  phone: { kk: 'Телефон', ru: 'Телефон' },
} as const;

const STEPS = [
  {
    title: { kk: 'Өтінім', ru: 'Заявка' },
    text: {
      kk: 'Нысанды толтырыңыз — сол күні қоңырау шаламыз.',
      ru: 'Заполните форму — перезвоним в тот же день.',
    },
  },
  {
    title: { kk: 'Сауалнама', ru: 'Анкета' },
    text: {
      kk: 'Excel үлгісін толтырып жібересіз: деректер бірден сайтқа түседі.',
      ru: 'Заполняете шаблон Excel и присылаете: данные сразу попадут на сайт.',
    },
  },
  {
    title: { kk: 'Кіру', ru: 'Доступ' },
    text: {
      kk: 'Сайт мекенжайы мен әкімші бөлімінің логинін береміз — толтыруға болады.',
      ru: 'Выдаём адрес сайта и логин в админку — можно наполнять.',
    },
  },
  {
    title: { kk: 'Шарт және төлем', ru: 'Договор и оплата' },
    text: {
      kk: 'Шарт, шот және акт екі тілде. Төлем түскен соң сайт барлығына ашылады.',
      ru: 'Договор, счёт и акт на двух языках. После оплаты сайт открывается для всех.',
    },
  },
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Балабақшаларға — сайт қосу' : 'Детским садам — подключить сайт',
    description:
      locale === 'kk'
        ? `Балабақшаның ресми сайты жылына ${formatMoney(env.planPrices.BASIC)}-ден бастап. Қалай қосылу, төлеу және домен жалғау — қысқа нұсқаулықтар.`
        : `Официальный сайт детского сада от ${formatMoney(env.planPrices.BASIC)} в год. Как подключиться, оплатить и подключить домен — короткие инструкции.`,
  };
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);
  const settings = await portalSettings();
  const example = `ваш-сад.${env.portalDomain}`;
  const exampleKk = `сіздің-балабақша.${env.portalDomain}`;
  // Адрес сервера для A-записи. Он и так публичен — на него указывает DNS
  // портала; без него инструкция про домен превращается в «позвоните нам».
  const serverIp = (process.env.SERVER_IPV4 ?? '').trim();

  const HOWTO = [
    {
      title: { kk: 'Сауалнаманы қалай толтыру керек', ru: 'Как заполнить анкету' },
      steps: [
        { kk: 'Сауалнама үлгісін жүктеп алыңыз (төменде).', ru: 'Скачайте шаблон анкеты (ниже).' },
        {
          kk: '«Детский сад», «Группы» және «Педагоги» парақтарын толтырыңыз. Әр парақта түсініктемесі бар.',
          ru: 'Заполните листы «Детский сад», «Группы» и «Педагоги». На каждом есть подсказки.',
        },
        {
          kk: 'Күмән болса — толтыру үлгісіне қараңыз.',
          ru: 'Если сомневаетесь — сверьтесь с образцом заполнения.',
        },
        {
          kk: 'Файлды бізге жіберіңіз — біз оны жүктейміз, ал деректер сайтқа өздігінен түседі.',
          ru: 'Пришлите файл нам — мы его загрузим, и данные сами встанут на сайт.',
        },
      ],
    },
    {
      title: { kk: 'Бірінші жаңалықты қалай қосу керек', ru: 'Как добавить первую новость' },
      steps: [
        {
          kk: `Әкімші бөліміне кіріңіз: ${exampleKk}/admin.`,
          ru: `Войдите в админку: ${example}/admin.`,
        },
        { kk: 'Сол жақтағы мәзірде «Жаңалықтар» → «Жазу».', ru: 'В меню слева — «Новости» → «Написать».' },
        {
          kk: 'Тақырып пен мәтінді қазақша және орысша жазыңыз, фото немесе бейнеге сілтеме қосыңыз.',
          ru: 'Заголовок и текст — на казахском и русском, добавьте фото или ссылку на видео.',
        },
        { kk: '«Жариялау» түймесін басыңыз — жаңалық бірден сайтта.', ru: 'Нажмите «Опубликовать» — новость сразу на сайте.' },
      ],
    },
    {
      title: { kk: 'Жеке доменді қалай жалғау керек', ru: 'Как подключить свой домен' },
      steps: [
        {
          kk: 'Доменді .kz тіркеушісінен ұйымның атына сатып алыңыз: nursat.kz немесе nursat.edu.kz (edu.kz аймағы — білім беру ұйымдарына, құжаттар қажет).',
          ru: 'Купите домен у регистратора .kz на свою организацию: nursat.kz или nursat.edu.kz (зона edu.kz — для организаций образования, понадобятся документы).',
        },
        serverIp
          ? {
              kk: `Домен баптауларында A-жазба жасаңыз: ${serverIp}. www-мен де ашылсын десеңіз — www үшін де сондай жазба.`,
              ru: `В настройках домена создайте A-запись на адрес ${serverIp}. Чтобы открывалось и с www — такую же запись для www.`,
            }
          : {
              kk: 'A-жазба үшін IP мекенжайын береміз.',
              ru: 'IP-адрес для A-записи сообщим.',
            },
        {
          kk: 'Доменді бізге хабарлаңыз — қосамыз, қауіпсіздік сертификаты автоматты беріледі.',
          ru: 'Сообщите нам домен — подключим, сертификат безопасности выпустится автоматически.',
        },
        {
          kk: `Бұрынғы ${exampleKk} мекенжайы да жұмыс істей береді.`,
          ru: `Прежний адрес ${example} тоже продолжит работать.`,
        },
      ],
    },
    {
      title: { kk: 'Қалай төлеу керек', ru: 'Как оплатить' },
      steps: [
        {
          kk: 'Бухгалтерияға шарт, шот және акт береміз — екі тілде, бір нөмірмен.',
          ru: 'Для бухгалтерии даём договор, счёт и акт — на двух языках, под одним номером.',
        },
        { kk: 'Шот бойынша 10 жұмыс күні ішінде төлеңіз.', ru: 'Оплатите по счёту в течение 10 рабочих дней.' },
        {
          kk: 'Жазылым бір жылға. Аяқталуынан 30, 14 және 3 күн бұрын еске саламыз.',
          ru: 'Подписка на год. Напомним за 30, 14 и 3 дня до окончания.',
        },
        {
          kk: 'Жеңілдік күндері жоқ: төленбесе, мерзімнің соңғы күнінен кейін сайт жабылады. Төлем түскен соң бірден ашылады.',
          ru: 'Льготных дней нет: без оплаты сайт закрывается на следующий день после окончания срока. После оплаты открывается сразу.',
        },
      ],
    },
  ] as const;

  const FILES = [
    { href: '/downloads/edusad-instrukciya.pdf', label: T.fileGuide, meta: 'PDF', download: true },
    { href: '/downloads/edusad-anketa.xlsx', label: T.fileAnketa, meta: 'Excel', download: true },
    { href: '/downloads/edusad-anketa-obrazec.xlsx', label: T.fileSample, meta: 'Excel', download: true },
    { href: withLocale('/offer', locale), label: T.fileOffer, meta: locale === 'kk' ? 'бет' : 'страница', download: false },
  ] as const;

  return (
    <PortalPage locale={locale} pathname="/connect">
      <div className="container-page max-w-4xl py-12">
        {/* ── коротко: что и сколько ────────────────────────────────── */}
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-ink">{T.eyebrow[locale]}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          {T.titleBefore[locale]}{' '}
          <span className="text-brand-ink">{formatMoney(env.planPrices.BASIC)}</span>
          {locale === 'kk' ? '' : ' '}
          {T.titleAfter[locale]}
        </h1>
        <p className="mt-3 text-muted">
          {T.lead[locale].replace('%s', locale === 'kk' ? exampleKk : example)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale('/apply', locale)} className="btn-primary">{T.apply[locale]}</Link>
          <a href="/downloads/edusad-instrukciya.pdf" className="btn-secondary" download>{T.guidePdf[locale]}</a>
        </div>

        {/* ── стоимость ─────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">{T.priceTitle[locale]}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PLAN_CODES.map((code) => (
              <Link
                key={code}
                href={withLocale(`/apply?plan=${code}`, locale)}
                className="card flex flex-col p-5 transition hover:shadow-lift"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-bold">{PLAN_INFO[code].name[locale]}</span>
                  <span className="whitespace-nowrap font-display text-xl font-extrabold text-brand-ink">
                    {formatMoney(env.planPrices[code])}
                    <span className="ml-1 text-sm font-semibold text-muted">/ {T.perYear[locale]}</span>
                  </span>
                </span>
                <span className="mt-1 text-sm text-muted">{PLAN_INFO[code].tagline[locale]}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            {T.priceBoth[locale]}{' '}
            <Link href={withLocale('/pricing', locale)} className="font-semibold text-brand-ink">
              {T.comparePlans[locale]}
            </Link>
          </p>
        </section>

        {/* ── шаги ──────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">{T.stepsTitle[locale]}</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title.ru} className="card p-5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand font-display font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 font-bold">{step.title[locale]}</p>
                <p className="mt-1 text-sm text-muted">{step.text[locale]}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── мини-инструкции ───────────────────────────────────────── */}
        {/* Свёрнуты: заведующей нужна одна из четырёх, а не все сразу.
            <details> работает без скриптов и раскрывается поиском по странице. */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">{T.howtoTitle[locale]}</h2>
          <div className="mt-4 space-y-2">
            {HOWTO.map((item) => (
              <details key={item.title.ru} className="card group overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-bold">
                  <span className="min-w-0 flex-1">{item.title[locale]}</span>
                  <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>▾</span>
                </summary>
                <ol className="list-decimal space-y-1.5 border-t border-line px-5 py-4 pl-10 text-sm">
                  {item.steps.map((step) => (
                    <li key={step.ru}>{step[locale]}</li>
                  ))}
                </ol>
              </details>
            ))}
          </div>
        </section>

        {/* ── файлы ─────────────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">{T.filesTitle[locale]}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FILES.map((file) => (
              <li key={file.href}>
                {file.download ? (
                  <a href={file.href} download className="card flex items-center justify-between gap-3 px-5 py-4 transition hover:shadow-lift">
                    <span className="font-semibold">{file.label[locale]}</span>
                    <span className="badge bg-brand-soft text-brand-ink">{file.meta}</span>
                  </a>
                ) : (
                  <Link href={file.href} className="card flex items-center justify-between gap-3 px-5 py-4 transition hover:shadow-lift">
                    <span className="font-semibold">{file.label[locale]}</span>
                    <span className="badge bg-slate-100 text-slate-600">{file.meta}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ── вопросы ───────────────────────────────────────────────── */}
        <section className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-brand/30 bg-brand-soft px-6 py-6 sm:px-8">
          <div>
            <h2 className="font-display text-xl font-extrabold text-brand-ink">{T.questions[locale]}</h2>
            <p className="mt-1 text-brand-ink/80">{T.questionsText[locale]}</p>
            {settings.phone ? (
              <p className="mt-1 text-sm text-brand-ink/80">
                {T.phone[locale]}:{' '}
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-bold text-brand-ink">
                  {settings.phone}
                </a>
              </p>
            ) : null}
          </div>
          <Link href={withLocale('/apply', locale)} className="btn-primary">{T.apply[locale]}</Link>
        </section>
      </div>
    </PortalPage>
  );
}
