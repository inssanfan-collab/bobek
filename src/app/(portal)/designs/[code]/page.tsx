import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { portalAlternates } from '@/lib/seo';
import { DESIGNS, designImage, designLiveUrl, findDesign } from '@/lib/designs';

const T = {
  title: { kk: '«%s» дизайны', ru: 'Дизайн «%s»' },
  hint: {
    kk: 'Беттің толық көрінісі «Балапан» демо-балабақшасында: суреттің ішінде төмен қарай жылжытыңыз.',
    ru: 'Страница целиком на демо-саде «Балапан»: прокручивайте снимок внутри рамки.',
  },
  desk: { kk: 'Компьютерде', ru: 'На компьютере' },
  mob: { kk: 'Телефонда', ru: 'На телефоне' },
  live: { kk: 'Тірі нұсқасын ашу', ru: 'Открыть вживую' },
  newTab: { kk: 'жаңа терезеде', ru: 'в новой вкладке' },
  all: { kk: 'Барлық дизайндар', ru: 'Все дизайны' },
  prev: { kk: 'Алдыңғы', ru: 'Предыдущий' },
  next: { kk: 'Келесі', ru: 'Следующий' },
  shotAlt: { kk: '«%s» дизайнындағы сайттың басты беті, %s', ru: 'Главная сайта в дизайне «%s», %s' },
} as const;

const fill = (template: string, ...values: string[]) => values.reduce((text, value) => text.replace('%s', value), template);

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ code }, search] = await Promise.all([params, searchParams]);
  const design = findDesign(code);
  if (!design) return {};
  const locale = localeFromParam(search.lang);
  const name = locale === 'kk' ? design.nameKk : design.nameRu;
  return {
    title: fill(T.title[locale], name),
    description: design.showcase[locale],
    alternates: portalAlternates(`/designs/${code}`, locale),
  };
}

export default async function DesignPage({ params, searchParams }: Props) {
  const [{ code }, search] = await Promise.all([params, searchParams]);
  const design = findDesign(code);
  if (!design) notFound();
  const locale = localeFromParam(search.lang);
  const nameOf = (item: (typeof DESIGNS)[number]) => (locale === 'kk' ? item.nameKk : item.nameRu);
  const name = nameOf(design);
  const index = DESIGNS.indexOf(design);
  const prev = DESIGNS[(index - 1 + DESIGNS.length) % DESIGNS.length];
  const next = DESIGNS[(index + 1) % DESIGNS.length];

  return (
    <SalesPage
      locale={locale}
      pathname={`/designs/${code}`}
      title={fill(T.title[locale], name)}
      lead={<>{design.showcase[locale]}<br />{T.hint[locale]}</>}
    >
      <div className="dz-actions dz-actions-top">
        <a className="sbtn sbtn-primary" href={designLiveUrl(design.code)} target="_blank" rel="noopener">
          {T.live[locale]} ↗<span className="sr-only"> ({T.newTab[locale]})</span>
        </a>
        <a className="sbtn sbtn-secondary" href={withLocale('/designs', locale)}>← {T.all[locale]}</a>
      </div>

      <div className="dz-view">
        <figure className="dz-desk">
          <figcaption>{T.desk[locale]}</figcaption>
          <div className="browser">
            <div className="bar" aria-hidden="true"><i /><i /><i /></div>
            {/* tabIndex: рамку с прокруткой можно листать и с клавиатуры */}
            <div className="dz-scrollbox" tabIndex={0} aria-label={fill(T.shotAlt[locale], name, T.desk[locale])}>
              {/* eslint-disable-next-line @next/next/no-img-element -- длинный снимок, свой размер */}
              <img src={designImage(design.code, 'desk')} width={design.shot.desk[0]} height={design.shot.desk[1]} alt={fill(T.shotAlt[locale], name, T.desk[locale])} />
            </div>
          </div>
        </figure>
        <figure className="dz-mob">
          <figcaption>{T.mob[locale]}</figcaption>
          <div className="dz-phone">
            <div className="dz-scrollbox" tabIndex={0} aria-label={fill(T.shotAlt[locale], name, T.mob[locale])}>
              {/* eslint-disable-next-line @next/next/no-img-element -- длинный снимок, свой размер */}
              <img src={designImage(design.code, 'mob')} width={design.shot.mob[0]} height={design.shot.mob[1]} alt={fill(T.shotAlt[locale], name, T.mob[locale])} loading="lazy" />
            </div>
          </div>
        </figure>
      </div>

      <nav className="dz-pager" aria-label={T.all[locale]}>
        <a href={withLocale(`/designs/${prev.code}`, locale)}>← {T.prev[locale]}: {nameOf(prev)}</a>
        <a href={withLocale(`/designs/${next.code}`, locale)}>{T.next[locale]}: {nameOf(next)} →</a>
      </nav>
    </SalesPage>
  );
}
