import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Тарифы',
  description: 'Сайт детского сада за 20 000 ₸ в год: движок, админка, хостинг, поддержка, адрес на домене портала.',
};

const T = {
  title: { kk: 'Тариф', ru: 'Тариф' },
  lead: {
    kk: 'Жасырын қосымша төлемсіз және жаңалықтар мен фото санына шектеусіз бір тариф.',
    ru: 'Один тариф без скрытых доплат и ограничений по количеству новостей и фото.',
  },
  product: { kk: 'Балабақша сайты', ru: 'Сайт детского сада' },
  perYear: { kk: 'жылына', ru: 'в год' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  payment: {
    kk: 'Шот бойынша немесе Kaspi арқылы төлеу. Сайтты бір жұмыс күні ішінде іске қосамыз.',
    ru: 'Оплата по счёту или на Kaspi. Сайт запускаем в течение одного рабочего дня.',
  },
  included: { kk: 'Не кіреді', ru: 'Что входит' },
  notIncluded: { kk: 'Не кірмейді', ru: 'Что не входит' },
  faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
} as const;

const INCLUDED = [
  { kk: 'сіздің-балабақша.' + env.portalDomain + ' түріндегі мекенжай', ru: 'Адрес вида ваш-сад.' + env.portalDomain },
  { kk: 'Дайын жүйе: 3 үлгі және 6 түс палитрасы', ru: 'Готовый движок: 3 шаблона и 6 цветовых палитр' },
  {
    kk: 'Толтыруға арналған әкімші бөлімі — жаңалықтар, галерея, құжаттар, педагогтар, мәзір',
    ru: 'Админка для наполнения — новости, галерея, документы, педагоги, меню',
  },
  { kk: 'Қос тілділік: қазақша және орысша', ru: 'Двуязычие: казахский и русский' },
  { kk: 'Нашар көретіндерге арналған нұсқа', ru: 'Версия для слабовидящих' },
  { kk: 'Хостинг, жаңартулар және сақтық көшірмелер', ru: 'Хостинг, обновления и резервные копии' },
  { kk: 'Қолдау және қол жеткізуді қалпына келтіру', ru: 'Поддержка и восстановление доступа' },
] as const;

const NOT_INCLUDED = [
  {
    kk: 'Жеке домен (мысалы, сіздің-балабақша.kz) — балабақша өзі сатып алады, біз тегін жалғаймыз',
    ru: 'Собственный домен (например, ваш-сад.kz) — сад покупает сам, мы бесплатно подключаем',
  },
  { kk: 'Балабақшаның кәсіби фотосуреті', ru: 'Профессиональная фотосъёмка сада' },
  {
    kk: 'Сіздің орныңызға мазмұнмен толтыру (бөлек ақыға жасай аламыз)',
    ru: 'Наполнение контентом за вас (можем сделать за отдельную плату)',
  },
] as const;

const FAQ = [
  {
    q: { kk: 'Жазылымды ұзартпасақ не болады?', ru: 'Что будет, если не продлить подписку?' },
    a: {
      kk: 'Сайт тағы %s күн жұмыс істей береді, бірақ әкімші бөлімі тек оқу режиміне ауысады. Біз алдын ала — 30, 14 және 3 күн бұрын еске саламыз.',
      ru: 'Сайт продолжит работать ещё %s дней, но админка перейдёт в режим только чтения. Мы напомним заранее — за 30, 14 и 3 дня до окончания.',
    },
  },
  {
    q: { kk: 'Сайтты өз доменіме көшіруге бола ма?', ru: 'Можно ли перенести сайт на свой домен?' },
    a: {
      kk: 'Иә. Балабақша доменді қазақстандық тіркеушіден сатып алып, өзіне рәсімдейді, A-жазбасын көрсетеді — біз тегін жалғаймыз. Бұрынғы мекенжай жұмыс істей береді.',
      ru: 'Да. Сад покупает домен у казахстанского регистратора и оформляет его на себя, прописывает A-запись — мы подключаем бесплатно. Прежний адрес продолжит работать.',
    },
  },
  {
    q: { kk: 'Сайтты кім толтырады?', ru: 'Кто заполняет сайт?' },
    a: {
      kk: 'Балабақша қызметкері әкімші бөлімі арқылы. Ол әдіскерге немесе тәрбиешіге есептелген — арнайы білім қажет емес.',
      ru: 'Сотрудник сада через админку. Она рассчитана на методиста или воспитателя — специальных знаний не нужно.',
    },
  },
  {
    q: { kk: 'Құпия сөзді ұмыттық — не істеу керек?', ru: 'Забыли пароль — что делать?' },
    a: {
      kk: 'Портал әкімшісіне қоңырау шалыңыз: ол құпия сөзді тастап, жаңасын айтады. Мұндай әрекеттердің бәрі журналға жазылады.',
      ru: 'Позвоните администратору портала: он сбросит пароль и продиктует новый. Все такие действия фиксируются в журнале.',
    },
  },
] as const;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  return (
    <PortalPage locale={locale} pathname="/pricing">
      <div className="container-page py-12">
        <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
        <p className="mt-2 max-w-2xl text-muted">{T.lead[locale]}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="card border-brand/40 bg-brand-soft p-8">
            <p className="font-semibold text-brand-ink">{T.product[locale]}</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-brand-ink">
              {formatMoney(env.subscriptionPrice)}
            </p>
            <p className="mt-1 text-brand-ink/80">{T.perYear[locale]}</p>
            <Link href={withLocale('/apply', locale)} className="btn-primary mt-6 w-full">
              {T.apply[locale]}
            </Link>
            <p className="mt-3 text-sm text-brand-ink/70">{T.payment[locale]}</p>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold">{T.included[locale]}</h2>
              <ul className="mt-4 space-y-2">
                {INCLUDED.map((item) => (
                  <li key={item.ru} className="flex gap-2 text-sm">
                    <span className="text-emerald-600" aria-hidden>✓</span>
                    <span>{item[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-xl font-bold">{T.notIncluded[locale]}</h2>
              <ul className="mt-4 space-y-2">
                {NOT_INCLUDED.map((item) => (
                  <li key={item.ru} className="flex gap-2 text-sm text-muted">
                    <span aria-hidden>—</span>
                    <span>{item[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card mt-8 p-6">
          <h2 className="font-display text-xl font-bold">{T.faq[locale]}</h2>
          <dl className="mt-4 space-y-5">
            {FAQ.map((item) => (
              <div key={item.q.ru}>
                <dt className="font-semibold">{item.q[locale]}</dt>
                <dd className="mt-1 text-sm text-muted">
                  {item.a[locale].replace('%s', String(env.subscriptionGraceDays))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PortalPage>
  );
}
