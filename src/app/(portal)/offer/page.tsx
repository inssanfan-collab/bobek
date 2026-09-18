import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { formatMoney, formatDate } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam } from '@/lib/i18n';
import { OFFER, OFFER_REVISION } from '@/lib/offer';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Жария оферта' : 'Публичная оферта',
    description: locale === 'kk'
      ? 'Мектепке дейінгі ұйымдарға сайт жүргізу қызметін ұсыну шарттары.'
      : 'Условия оказания услуги ведения сайта для дошкольных организаций.',
  };
}

const T = {
  title: { kk: 'Жария оферта', ru: 'Публичная оферта' },
  revision: { kk: 'Редакция күні', ru: 'Редакция от' },
  requisites: { kk: 'Орындаушының деректемелері', ru: 'Реквизиты Исполнителя' },
  requisitesNote: {
    kk: 'Орындаушының деректемелері Тапсырыс берушіге қосылу кезінде жіберілетін шартта және төлем шотында көрсетіледі.',
    ru: 'Реквизиты Исполнителя указываются в договоре и счёте на оплату, которые направляются Заказчику при подключении.',
  },
} as const;

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  // Подстановки делаем здесь: цены живут в настройках приложения,
  // и дублировать их в тексте оферты значило бы однажды разойтись с правдой.
  const fill = (text: string) =>
    text
      .replaceAll('%domain%', env.portalDomain)
      .replaceAll('%priceBasic%', formatMoney(env.planPrices.BASIC))
      .replaceAll('%priceManaged%', formatMoney(env.planPrices.MANAGED));

  return (
    <PortalPage locale={locale} pathname="/offer">
      <div className="container-page max-w-3xl py-12">
        <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
        <p className="mt-2 text-sm text-muted">
          {T.revision[locale]}: {formatDate(new Date(OFFER_REVISION), locale)}
        </p>

        <div className="prose-content mt-8">
          {OFFER.map((section) => (
            <section key={section.title.ru}>
              <h2>{section.title[locale]}</h2>
              {section.items.map((item) => (
                <p key={item.ru}>{fill(item[locale])}</p>
              ))}
            </section>
          ))}

          {/* Реквизиты владельца на открытой странице не публикуем: их видит
              любой посетитель. Сад получает их в договоре и счёте. */}
          <h2>{T.requisites[locale]}</h2>
          <p>{T.requisitesNote[locale]}</p>
        </div>
      </div>
    </PortalPage>
  );
}
