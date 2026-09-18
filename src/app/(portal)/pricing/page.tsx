import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { EDU_DOMAIN_NOTE, PLAN_CODES, PLAN_COMMON, PLAN_INFO } from '@/lib/plans';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Тарифтер' : 'Тарифы',
    description:
      locale === 'kk'
        ? `Балабақша сайты жылына ${formatMoney(env.planPrices.BASIC)}-ден бастап. Екі тариф: толтыруды өзіңіз жүргізесіз немесе біз жасаймыз.`
        : `Сайт детского сада от ${formatMoney(env.planPrices.BASIC)} в год. Два тарифа: наполняете сами или наполняем мы.`,
  };
}

const T = {
  title: { kk: 'Тарифтер', ru: 'Тарифы' },
  lead: {
    kk: 'Екі тарифте сайт бірдей. Айырмашылығы біреу — оны кім толтырады. Жасырын қосымша төлем және жаңалықтар мен фото санына шектеу жоқ.',
    ru: 'Сайт в обоих тарифах одинаковый. Отличие одно — кто его наполняет. Без скрытых доплат и ограничений по количеству новостей и фото.',
  },
  perYear: { kk: 'жылына', ru: 'в год' },
  both: { kk: 'Екі тарифке де кіреді', ru: 'Входит в оба тарифа' },
  popular: { kk: 'Уақытты үнемдейді', ru: 'Экономит время' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  payment: {
    kk: 'Шот бойынша немесе Kaspi арқылы төлеу. Сайтты бір жұмыс күні ішінде іске қосамыз.',
    ru: 'Оплата по счёту или на Kaspi. Сайт запускаем в течение одного рабочего дня.',
  },
  notIncluded: { kk: 'Не кірмейді', ru: 'Что не входит' },
  faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
} as const;

const NOT_INCLUDED = [
  EDU_DOMAIN_NOTE,
  { kk: 'Балабақшаның кәсіби фотосуреті', ru: 'Профессиональная фотосъёмка сада' },
] as const;

const FAQ = [
  {
    q: { kk: 'Жазылымды ұзартпасақ не болады?', ru: 'Что будет, если не продлить подписку?' },
    a: {
      kk: 'Жазылымның соңғы күнінен кейін сайт келушілер үшін жабылады, ал әкімші бөлімі тек қарау режиміне ауысады. Мазмұны толық сақталады: төлем түскен соң сайт бірден ашылады. Біз алдын ала — 30, 14 және 3 күн бұрын еске саламыз.',
      ru: 'На следующий день после окончания подписки сайт закрывается для посетителей, а админка переходит в режим только просмотра. Всё содержимое сохраняется: после оплаты сайт откроется сразу. Мы напомним заранее — за 30, 14 и 3 дня до окончания.',
    },
  },
  {
    q: { kk: 'Сайтты өз доменіме көшіруге бола ма?', ru: 'Можно ли перенести сайт на свой домен?' },
    a: {
      kk: 'Иә. .kz немесе edu.kz аймағындағы доменді өзіңіз сатып аласыз және өзіңізге рәсімдейсіз, ал біз баптауға көмектесеміз. Бұрынғы мекенжай жұмыс істей береді.',
      ru: 'Да. Домен .kz или edu.kz покупаете сами и оформляете на организацию, а мы поможем настроить. Прежний адрес продолжит работать.',
    },
  },
  {
    q: { kk: 'Сайтты кім толтырады?', ru: 'Кто заполняет сайт?' },
    a: {
      kk: '«Базалық» тарифте — балабақша қызметкері әкімші бөлімі арқылы: ол әдіскерге немесе тәрбиешіге есептелген, арнайы білім қажет емес. «Толтырумен» тарифте материалдарды жібересіз, ал сайтқа біз орналастырамыз.',
      ru: 'В тарифе «Базовый» — сотрудник сада через админку: она рассчитана на методиста или воспитателя, специальных знаний не нужно. В тарифе «С наполнением» вы присылаете материалы, а на сайте их размещаем мы.',
    },
  },
  {
    q: { kk: 'Тарифті ауыстыруға бола ма?', ru: 'Можно ли сменить тариф?' },
    a: {
      kk: 'Иә, келесі кезеңге ұзарту кезінде. Сайт пен оның барлық мазмұны сақталады — тек толтыруды кім жүргізетіні өзгереді.',
      ru: 'Да, при продлении на следующий период. Сайт и всё его содержимое сохраняются — меняется только то, кто его наполняет.',
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

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PLAN_CODES.map((code) => {
            const plan = PLAN_INFO[code];
            // Второй тариф выделен не как «лучший», а как тот, где за сад
            // работаем мы: это и есть его смысл, и так его проще отличить.
            const featured = code === 'MANAGED';
            return (
              <div
                key={code}
                className={`card flex flex-col p-8 ${featured ? 'border-brand/40 bg-brand-soft' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`font-display text-xl font-bold ${featured ? 'text-brand-ink' : ''}`}>
                    {plan.name[locale]}
                  </p>
                  {featured ? (
                    <span className="badge bg-brand text-white">{T.popular[locale]}</span>
                  ) : null}
                </div>
                <p className={`mt-1 text-sm ${featured ? 'text-brand-ink/80' : 'text-muted'}`}>
                  {plan.tagline[locale]}
                </p>

                <p className={`mt-6 font-display text-5xl font-extrabold ${featured ? 'text-brand-ink' : ''}`}>
                  {formatMoney(env.planPrices[code])}
                </p>
                <p className={featured ? 'text-brand-ink/80' : 'text-muted'}>{T.perYear[locale]}</p>

                <p className={`mt-6 flex-1 text-sm ${featured ? 'text-brand-ink' : ''}`}>{plan.whoFills[locale]}</p>

                <Link
                  href={withLocale(`/apply?plan=${code}`, locale)}
                  className={`mt-6 w-full ${featured ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {T.apply[locale]}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted">{T.payment[locale]}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">{T.both[locale]}</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PLAN_COMMON.map((item) => (
                <li key={item.ru} className="flex gap-2 text-sm">
                  <span className="text-emerald-600" aria-hidden>✓</span>
                  <span>{item[locale].replace('%domain%', env.portalDomain)}</span>
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

        <div className="card mt-8 p-6">
          <h2 className="font-display text-xl font-bold">{T.faq[locale]}</h2>
          <dl className="mt-4 space-y-5">
            {FAQ.map((item) => (
              <div key={item.q.ru}>
                <dt className="font-semibold">{item.q[locale]}</dt>
                <dd className="mt-1 text-sm text-muted">
                  {item.a[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PortalPage>
  );
}
