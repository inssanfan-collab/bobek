import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';

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
  forGardens: { kk: 'Балабақшаларға', ru: 'Для детских садов' },
  forGardensText: {
    kk: 'Сайтты қосу, жазылымды ұзарту, кіру мүмкіндігін қалпына келтіру, жеке доменді жалғау.',
    ru: 'Подключение сайта, продление подписки, восстановление доступа, подключение собственного домена.',
  },
  apply: { kk: 'Өтінім қалдыру', ru: 'Оставить заявку' },
  forParents: { kk: 'Ата-аналарға', ru: 'Для родителей' },
  forParentsText: {
    kk: 'Нақты балабақшаға қатысты сұрақтарды сол балабақша сайтындағы «Виртуалды қабылдау» бөліміне жазыңыз. Сонда өтініш бірден меңгерушіге жетеді.',
    ru: 'По вопросам конкретного сада пишите прямо в его виртуальную приёмную — на сайте сада в разделе «Виртуальная приёмная». Так обращение попадёт сразу к заведующей.',
  },
  findGarden: { kk: 'Балабақша табу', ru: 'Найти сад' },
  portalLine: { kk: 'Портал: %s · Ақтөбе қ., Ақтөбе облысы', ru: 'Портал: %s · г. Актобе, Актюбинская область' },
} as const;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  return (
    <PortalPage locale={locale} pathname="/contacts">
      <div className="container-page py-12">
        <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">{T.forGardens[locale]}</h2>
            <p className="mt-2 text-sm text-muted">{T.forGardensText[locale]}</p>
            <Link href={withLocale('/apply', locale)} className="btn-primary mt-4">{T.apply[locale]}</Link>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">{T.forParents[locale]}</h2>
            <p className="mt-2 text-sm text-muted">{T.forParentsText[locale]}</p>
            <Link href={withLocale('/catalog', locale)} className="btn-secondary mt-4">{T.findGarden[locale]}</Link>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted">{T.portalLine[locale].replace('%s', env.portalDomain)}</p>
      </div>
    </PortalPage>
  );
}
