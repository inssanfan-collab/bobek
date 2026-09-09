import type { Metadata } from 'next';
import { csrfToken } from '@/server/auth/csrf';
import { ApplyForm } from './ApplyForm';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam } from '@/lib/i18n';

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
  searchParams: Promise<{ lang?: string }>;
}) {
  const [csrf, search] = await Promise.all([csrfToken(), searchParams]);
  const locale = localeFromParam(search.lang);

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
              <p className="font-display text-3xl font-extrabold">
                {formatMoney(env.subscriptionPrice)} {T.perYear[locale]}
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.addressLine[locale]}{env.portalDomain}</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.adminLine[locale]}</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> {T.hostingLine[locale]}</li>
            </ul>
            <p className="text-sm text-muted">{T.ownDomain[locale]}</p>
          </div>
        </div>

        <ApplyForm csrf={csrf} locale={locale} />
        </div>
      </div>
    </PortalPage>
  );
}
