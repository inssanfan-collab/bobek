import type { Metadata } from 'next';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { localeFromParam, withLocale, type Locale } from '@/lib/i18n';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { GuideTask } from '@/components/portal/sales/GuideTask';
import type { GuideStep } from '@/components/portal/sales/StepPlayer';
import { GUIDE_PDF } from '@/lib/guide';
import { portalAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Балабақшаға арналған нұсқаулық', ru: 'Инструкция для сада' },
  lead: {
    kk: 'Әкімші бөлімінде ең жиі жасалатын істер — бейне және қадамдап. Мысалдар «Балапан» демо-балабақшасында түсірілген.',
    ru: 'Самые частые дела в админке — видео и по шагам. Сняты на демо-саде «Балапан»: всё как у вас, только данные выдуманные.',
  },
  contents: { kk: 'Мазмұны', ru: 'Содержание' },
  pdf: { kk: 'Толық нұсқаулық, PDF', ru: 'Полная инструкция, PDF' },
  pdfHint: {
    kk: 'Барлық бөлімдер бір файлда — басып шығаруға ыңғайлы.',
    ru: 'Все разделы в одном файле — удобно распечатать.',
  },
  demo: { kk: 'Демо-сайтты ашу', ru: 'Открыть демо-сайт' },
  none: {
    kk: 'Бейненұсқаулықтар дайындалып жатыр. Әзірге PDF нұсқаулықты пайдаланыңыз.',
    ru: 'Видеоинструкции готовятся. Пока пользуйтесь инструкцией в PDF.',
  },
  otherLang: { kk: 'Бұл бейне әзірге орысша ғана.', ru: 'Это видео пока только на казахском.' },
} as const;

type Manifest = {
  tasks: Record<string, {
    title: Record<Locale, string>;
    sub: Record<Locale, string>;
    video: Partial<Record<Locale, string>>;
    steps: Partial<Record<Locale, GuideStep[]>>;
  }>;
};

/**
 * Файлы инструкции (ролики, кадры, manifest.json) собирает pnpm guide:record
 * и кладёт в public/guide. В git они не входят — на сервер копируются
 * отдельно, поэтому страница спокойно переживает их отсутствие.
 */
async function readManifest(): Promise<Manifest | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), 'public', 'guide', 'manifest.json'), 'utf8')) as Manifest;
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return { title: T.title[locale], description: T.lead[locale], alternates: portalAlternates('/guide', locale) };
}

export default async function GuidePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  const manifest = await readManifest();
  const other: Locale = locale === 'kk' ? 'ru' : 'kk';
  const tasks = Object.entries(manifest?.tasks ?? {});

  return (
    <SalesPage
      locale={locale}
      pathname="/guide"
      title={T.title[locale]}
      lead={T.lead[locale]}
    >
      <div className="guide-top">
        {tasks.length ? (
          <nav aria-label={T.contents[locale]} className="guide-toc">
            {tasks.map(([id, task], i) => (
              <a key={id} href={`#${id}`}><b>{i + 1}</b>{task.title[locale]}</a>
            ))}
          </nav>
        ) : (
          <p className="note">{T.none[locale]}</p>
        )}
        <div className="guide-side">
          <a className="sbtn sbtn-secondary" href={GUIDE_PDF[locale]} download>{T.pdf[locale]}</a>
          <p className="note">{T.pdfHint[locale]}</p>
          <a className="link" href={`https://demo.edusad.kz${locale === 'ru' ? '/?lang=ru' : '/'}`} target="_blank" rel="noopener">{T.demo[locale]} →</a>
        </div>
      </div>

      {tasks.map(([id, task]) => {
        // Нет записи на языке страницы — показываем на втором, с пометкой.
        const lang: Locale = task.video[locale] || task.steps[locale] ? locale : other;
        const video = task.video[lang] ?? null;
        return (
          <div key={id}>
            {lang !== locale ? <p className="note">{T.otherLang[locale]}</p> : null}
            <GuideTask
              id={id}
              title={task.title[locale]}
              sub={task.sub[locale]}
              video={video ? `/guide/video/${video}` : null}
              poster={video ? `/guide/video/${video.replace(/\.mp4$/, '.jpg')}` : null}
              steps={task.steps[lang] ?? null}
              stepsBase={`/guide/steps/${lang}/${id}/`}
              locale={locale}
            />
          </div>
        );
      })}

      <p className="note">
        <a className="link" href={withLocale('/contacts', locale)}>{locale === 'kk' ? 'Сұрақ қалды ма? Байланыс →' : 'Остались вопросы? Контакты →'}</a>
      </p>
    </SalesPage>
  );
}
