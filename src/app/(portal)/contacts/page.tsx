import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { portalSettings } from '@/server/docs/contract';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Байланыс' : 'Контакты',
  };
}

const T = {
  title: { kk: 'Байланыс', ru: 'Контакты' },
  lead: {
    kk: 'Сайт қосу, жазылымды ұзарту немесе кіру мүмкіндігін қалпына келтіру — қоңырау шалыңыз не өтінім қалдырыңыз.',
    ru: 'Подключить сайт, продлить подписку или восстановить доступ — позвоните или оставьте заявку.',
  },
  forGardens: { kk: 'Балабақшаларға', ru: 'Для детских садов' },
  forGardensText: {
    kk: 'Сайтты қосу, жазылымды ұзарту, кіру мүмкіндігін қалпына келтіру, жеке доменді жалғау.',
    ru: 'Подключение сайта, продление подписки, восстановление доступа, подключение собственного домена.',
  },
  company: { kk: 'Орындаушы', ru: 'Исполнитель' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  forParents: { kk: 'Ата-аналарға', ru: 'Для родителей' },
  forParentsText: {
    kk: 'Нақты балабақшаға қатысты сұрақтарды сол балабақша сайтындағы «Виртуалды қабылдау» бөліміне жазыңыз. Сонда өтініш бірден меңгерушіге жетеді.',
    ru: 'По вопросам конкретного сада пишите прямо в его виртуальную приёмную — на сайте сада в разделе «Виртуальная приёмная». Так обращение попадёт сразу к заведующей.',
  },
  portalLine: { kk: 'Портал: %s · Ақтөбе қ., Ақтөбе облысы', ru: 'Портал: %s · г. Актобе, Актюбинская область' },
} as const;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);
  const settings = await portalSettings();
  // Как в оферте: на открытой странице только кто исполнитель и как
  // связаться. ИИН, адрес и счёт уходят саду в договоре и счёте.
  const company = locale === 'kk' ? settings.companyNameKk || settings.companyNameRu : settings.companyNameRu || settings.companyNameKk;
  const owner = locale === 'kk' ? settings.ownerNameKk || settings.ownerNameRu : settings.ownerNameRu || settings.ownerNameKk;

  return (
    <SalesPage locale={locale} pathname="/contacts" title={T.title[locale]} lead={T.lead[locale]}>
      <div className="cards">
        <section className="card-s">
          <h2>{T.forGardens[locale]}</h2>
          <p>{T.forGardensText[locale]}</p>
          <dl>
            {company ? (
              <>
                <dt>{T.company[locale]}</dt>
                <dd>{company}{owner ? <><br />{owner}</> : null}</dd>
              </>
            ) : null}
            {settings.phone ? (
              <>
                <dt>{T.phone[locale]}</dt>
                <dd><a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>{settings.phone}</a></dd>
              </>
            ) : null}
          </dl>
          <a className="sbtn sbtn-primary" href={`${withLocale('/', locale)}#zayavka`}>{T.apply[locale]}</a>
        </section>
        <section className="card-s">
          <h2>{T.forParents[locale]}</h2>
          <p>{T.forParentsText[locale]}</p>
        </section>
      </div>
      <p className="note">{T.portalLine[locale].replace('%s', env.portalDomain)}</p>
    </SalesPage>
  );
}
