import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { formatMoney, formatDate } from '@/lib/labels';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam } from '@/lib/i18n';
import { OFFER, OFFER_REVISION } from '@/lib/offer';
import { portalSettings } from '@/server/docs/contract';

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
  notFilled: {
    kk: 'Деректемелер толтырылу үстінде.',
    ru: 'Реквизиты заполняются.',
  },
  bin: { kk: 'ЖСН/БСН', ru: 'ИИН/БИН' },
  address: { kk: 'Мекенжайы', ru: 'Адрес' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  bank: { kk: 'Банк', ru: 'Банк' },
} as const;

export default async function OfferPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);
  const settings = await portalSettings();

  // Подстановки делаем здесь: цена и отсрочка живут в настройках приложения,
  // и дублировать их в тексте оферты значило бы однажды разойтись с правдой.
  const fill = (text: string) =>
    text
      .replaceAll('%domain%', env.portalDomain)
      .replaceAll('%priceBasic%', formatMoney(env.planPrices.BASIC))
      .replaceAll('%priceManaged%', formatMoney(env.planPrices.MANAGED))
      .replaceAll('%grace%', String(env.subscriptionGraceDays));

  const company = locale === 'kk' ? settings.companyNameKk : settings.companyNameRu;
  const owner = locale === 'kk' ? settings.ownerNameKk : settings.ownerNameRu;
  const address = locale === 'kk' ? settings.addressKk : settings.addressRu;
  const bank = locale === 'kk' ? settings.bankNameKk : settings.bankNameRu;
  const taxNote = locale === 'kk' ? settings.taxNoteKk : settings.taxNoteRu;

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

          <h2>{T.requisites[locale]}</h2>
          {company ? (
            <ul>
              <li>{company}</li>
              {owner ? <li>{owner}</li> : null}
              {settings.taxId ? <li>{T.bin[locale]}: {settings.taxId}</li> : null}
              {address ? <li>{T.address[locale]}: {address}</li> : null}
              {settings.phone ? <li>{T.phone[locale]}: {settings.phone}</li> : null}
              {settings.email ? <li>E-mail: {settings.email}</li> : null}
              {bank ? <li>{T.bank[locale]}: {bank}{settings.iban ? `, ИИК ${settings.iban}` : ''}{settings.bic ? `, БИК ${settings.bic}` : ''}</li> : null}
              {taxNote ? <li>{taxNote}</li> : null}
            </ul>
          ) : (
            <p>{T.notFilled[locale]}</p>
          )}
        </div>
      </div>
    </PortalPage>
  );
}
