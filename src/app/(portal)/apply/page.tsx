import type { Metadata } from 'next';
import { csrfToken } from '@/server/auth/csrf';
import { ApplyForm } from './ApplyForm';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam } from '@/lib/i18n';
import { isPlanCode, PLAN_CODES, PLAN_INFO } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Балабақшаны қосу', ru: 'Подключить детский сад' },
  lead: {
    kk: 'Нысанды толтырыңыз — қоңырау шалып, атауын нақтылап, сайт жасаймыз. Әдетте бұл бір жұмыс күнін алады.',
    ru: 'Заполните форму — перезвоним, уточним название и создадим сайт. Обычно это занимает один рабочий день.',
  },
  price: { kk: 'Құны', ru: 'Стоимость' },
  perYear: { kk: '/ жылына', ru: '/ год' },
  addressLine: { kk: 'Мекенжай: сіздің-балабақша.', ru: 'Адрес ваш-сад.' },
  adminLine: { kk: 'Әкімші бөлімі және телефон арқылы оқыту', ru: 'Админка и обучение по телефону' },
  hostingLine: { kk: 'Хостинг, көшірмелер, қолдау', ru: 'Хостинг, копии, поддержка' },
  ownDomain: {
    kk: 'edu.kz аймағындағы доменді өзіңіз сатып аласыз — біз баптауға көмектесеміз.',
    ru: 'Домен на EDU.KZ покупаете сами, а мы поможем настроить.',
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Қосылуға өтінім' : 'Заявка на подключение',
    description: locale === 'kk' ? 'Өтінім қалдырыңыз — әкімші бөлімі бар балабақша сайтын дайындап, кіру деректерін береміз.' : 'Оставьте заявку — подготовим сайт детского сада с админкой и выдадим доступы.',
  };
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; plan?: string }>;
}) {
  const [csrf, search] = await Promise.all([csrfToken(), searchParams]);
  const locale = localeFromParam(search.lang);
  // Из карточки тарифа приходят с ?plan= — выбор уже сделан, не заставляем делать его заново.
  const plan = isPlanCode(search.plan) ? search.plan : null;
  const prices = { BASIC: env.planPrices.BASIC, MANAGED: env.planPrices.MANAGED };

  return (
    <PortalPage locale={locale} pathname="/apply">
      <div className="container-page py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
          <p className="mt-3 text-muted">{T.lead[locale]}</p>

          <div className="card mt-6 space-y-4 p-6">
            <div>
              <p className="text-sm text-muted">{T.price[locale]}</p>
              <dl className="mt-2 space-y-2">
                {PLAN_CODES.map((code) => (
                  <div key={code} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <dt className="font-semibold">{PLAN_INFO[code].name[locale]}</dt>
                    <dd className="font-display text-2xl font-extrabold">
                      {formatMoney(prices[code])} <span className="text-sm font-normal text-muted">{T.perYear[locale]}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.addressLine[locale]}{env.portalDomain}</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.adminLine[locale]}</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.hostingLine[locale]}</li>
            </ul>
            <p className="text-sm text-muted">{T.ownDomain[locale]}</p>
          </div>
        </div>

        <ApplyForm csrf={csrf} locale={locale} plan={plan} prices={prices} />
        </div>
      </div>
    </PortalPage>
  );
}
