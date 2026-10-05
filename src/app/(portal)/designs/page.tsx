import type { Metadata } from 'next';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { portalAlternates } from '@/lib/seo';
import { DESIGNS, designImage, designLiveUrl } from '@/lib/designs';

const T = {
  title: { kk: 'Сайт дизайндары', ru: 'Дизайны сайта' },
  lead: {
    kk: 'Балабақшаға арналған барлық жеке дизайндар. Мысалдар «Балапан» демо-балабақшасында көрсетілген — сіздің сайтыңызда өз мәтіндеріңіз бен фотоларыңыз болады. Тышқанды суреттің үстіне апарсаңыз, бет төмен қарай жылжиды.',
    ru: 'Все индивидуальные дизайны для детского сада. Показаны на демо-саде «Балапан» — на вашем сайте будут ваши тексты и фото. Наведите на снимок — страница прокрутится вниз.',
  },
  open: { kk: 'Толық қарау', ru: 'Смотреть целиком' },
  live: { kk: 'Тірі нұсқасы', ru: 'Открыть вживую' },
  newTab: { kk: 'жаңа терезеде', ru: 'в новой вкладке' },
  how: {
    kk: 'Ұнаған дизайнды өтінімде жазыңыз немесе бізге хабарласыңыз — сайтыңызды соған көшіреміз.',
    ru: 'Понравился дизайн — напишите о нём в заявке или свяжитесь с нами, переведём ваш сайт на него.',
  },
  contacts: { kk: 'Байланыс', ru: 'Контакты' },
} as const;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return { title: T.title[locale], description: T.lead[locale], alternates: portalAlternates('/designs', locale) };
}

export default async function DesignsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  const name = (design: (typeof DESIGNS)[number]) => (locale === 'kk' ? design.nameKk : design.nameRu);

  return (
    <SalesPage locale={locale} pathname="/designs" title={T.title[locale]} lead={T.lead[locale]}>
      <ul className="dz-grid">
        {DESIGNS.map((design) => {
          // Чем длиннее страница, тем медленнее прокрутка: скорость одна для всех.
          const [w, h] = design.shot.desk;
          const seconds = Math.max(4, Math.round((h / w) * 2.2));
          return (
            <li key={design.code} className="dz-card">
              <a href={withLocale(`/designs/${design.code}`, locale)} className="dz-shot" aria-label={`${name(design)} — ${T.open[locale]}`}>
                <span className="bar" aria-hidden="true"><i /><i /><i /></span>
                <span className="dz-window" style={{ '--dz-dur': `${seconds}s` } as React.CSSProperties}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- длинный снимок, свой размер */}
                  <img src={designImage(design.code, 'desk')} width={w} height={h} alt="" loading="lazy" decoding="async" />
                </span>
              </a>
              <div className="dz-body">
                <h2>{name(design)}</h2>
                <p>{design.showcase[locale]}</p>
                <div className="dz-actions">
                  <a className="sbtn sbtn-secondary" href={withLocale(`/designs/${design.code}`, locale)}>{T.open[locale]}</a>
                  <a className="dz-live" href={designLiveUrl(design.code)} target="_blank" rel="noopener">
                    {T.live[locale]} ↗<span className="sr-only"> ({T.newTab[locale]})</span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="dz-how">
        {T.how[locale]} <a href={withLocale('/contacts', locale)}>{T.contacts[locale]}</a>
      </p>
    </SalesPage>
  );
}
