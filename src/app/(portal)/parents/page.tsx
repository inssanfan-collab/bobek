import type { Metadata } from 'next';
import Link from 'next/link';
import { PortalPage } from '@/components/portal/PortalChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    title: locale === 'kk' ? 'Ата-аналарға' : 'Родителям',
    description: locale === 'kk' ? 'Ақтөбеде Darabala.kz арқылы балабақшаға кезекке қалай тұру керек, қандай құжаттар қажет және балабақшаны қалай таңдау керек.' : 'Как встать в очередь в детский сад в Актобе через Darabala.kz, какие документы нужны и как выбрать сад.',
  };
}

const T = {
  title: { kk: 'Ата-аналарға', ru: 'Родителям' },
  lead: {
    kk: 'Қазақстанда балабақшаға түсу қалай ұйымдастырылғаны және нақты балабақша туралы ақпаратты қайдан қарау керектігі жайлы қысқаша.',
    ru: 'Коротко о том, как устроено попадание в детский сад в Казахстане, и где смотреть информацию о конкретном саде.',
  },
  noQueueTitle: { kk: 'Біз кезек жүргізбейміз', ru: 'Мы не ведём очередь' },
  noQueueText: {
    kk: 'Кезекке қою және жолдама беру — мемлекеттік қызмет. Біздің портал балабақшалардың ресми сайттарын көрсетеді: байланыс, педагогтар, құжаттар, мәзір және бос орындар.',
    ru: 'Постановка в очередь и выдача направлений — государственная услуга. Наш портал показывает официальные сайты садов: контакты, педагогов, документы, меню и свободные места.',
  },
  openCatalog: { kk: 'Балабақшалар каталогын ашу', ru: 'Открыть каталог садов' },
} as const;

const STEPS = [
  {
    title: { kk: 'Кезекке тұру', ru: 'Встать в очередь' },
    text: {
      kk: 'Кезекті мемлекет Darabala.kz порталында жүргізеді. Баланың ЖСН-і мен ЭЦҚ қажет. Төрт балабақшаға дейін таңдауға болады.',
      ru: 'Очередь ведётся государством на портале Darabala.kz. Понадобятся ИИН ребёнка и ЭЦП. Можно выбрать до четырёх садов.',
    },
    link: {
      href: 'https://darabala.kz',
      label: { kk: 'Darabala.kz сайтындағы нұсқаулық', ru: 'Инструкция на Darabala.kz' },
    },
  },
  {
    title: { kk: 'Жолдаманы күту', ru: 'Дождаться направления' },
    text: {
      kk: 'Кезек жеткенде бос орын туралы хабарлама келеді. Жолдаманы мерзімінде растау керек, әйтпесе ол кезектегі келесі балаға өтеді.',
      ru: 'Когда подойдёт очередь, придёт уведомление о свободном месте. Направление нужно подтвердить в срок, иначе оно уйдёт следующему в очереди.',
    },
    link: {
      href: 'https://balabaqsha.snation.kz/',
      label: { kk: 'Мектепке дейінгі білім порталы', ru: 'Портал дошкольного образования' },
    },
  },
  {
    title: { kk: 'Құжаттарды жинау', ru: 'Собрать документы' },
    text: {
      kk: 'Әдетте қажет: туу туралы куәлік, баланың денсаулық паспорты, денсаулық жағдайы туралы анықтама және ата-ананың бірінің құжаты. Нақты тізімді балабақшадан нақтылаңыз.',
      ru: 'Обычно нужны: свидетельство о рождении, паспорт здоровья ребёнка, справка о состоянии здоровья и документ одного из родителей. Точный список уточняйте в саду.',
    },
    link: null,
  },
] as const;

export default async function ParentsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  return (
    <PortalPage locale={locale} pathname="/parents">
      <div className="container-page py-12">
        <h1 className="font-display text-4xl font-extrabold">{T.title[locale]}</h1>
        <p className="mt-2 max-w-2xl text-muted">{T.lead[locale]}</p>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title.ru} className="card flex gap-4 p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand font-display text-lg font-extrabold text-white">
                {index + 1}
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">{step.title[locale]}</h2>
                <p className="mt-1.5 text-sm text-muted">{step.text[locale]}</p>
                {step.link ? (
                  <a
                    href={step.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-semibold text-brand underline"
                  >
                    {step.link.label[locale]} →
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-soft p-6">
          <h2 className="font-display text-xl font-bold text-brand-ink">{T.noQueueTitle[locale]}</h2>
          <p className="mt-2 text-sm text-brand-ink/80">{T.noQueueText[locale]}</p>
          <Link href={withLocale('/catalog', locale)} className="btn-primary mt-4">
            {T.openCatalog[locale]}
          </Link>
        </div>
      </div>
    </PortalPage>
  );
}
