import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { publicSiteContext, localeFrom, withLocale } from '@/server/tenant/context';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { isOfficeDoc } from '@/lib/media-kind';
import { pick } from '@/lib/i18n';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

const T = {
  back: { kk: 'Құжаттарға оралу', ru: 'Ко всем документам' },
  download: { kk: 'Жүктеу', ru: 'Скачать' },
  newTab: { kk: 'Жеке бетте ашу', ru: 'Открыть в новой вкладке' },
  hint: {
    kk: 'Құжат Microsoft көрсеткішімен ашылады — бағдарлама орнатудың қажеті жоқ.',
    ru: 'Документ показывает просмотрщик Microsoft — устанавливать ничего не нужно.',
  },
} as const;

type Params = { host: string; id: string };

async function load(host: string, id: string) {
  const context = await publicSiteContext(host);
  // Через scoped: документ ищется только внутри своего сада, чужой id не откроется.
  const doc = await context.db.documents.findFirst({ where: { id }, include: { media: true } });
  if (!doc || !isOfficeDoc(doc.media.mime)) notFound();
  return { context, doc };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { host, id } = await params;
  const { doc } = await load(host, id);
  return { title: doc.titleRu, robots: { index: false } };
}

export default async function DocumentViewPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ host, id }, search] = await Promise.all([params, searchParams]);
  const locale = localeFrom(search.lang);
  const { context, doc } = await load(host, id);
  const { profile, primaryHost } = context;

  const sections = await context.db.sections.findMany({
    where: { isVisible: true },
    orderBy: { position: 'asc' },
  });

  const title = pick(locale, doc.titleKk, doc.titleRu);
  const fileUrl = `https://${primaryHost}/api/media/${doc.mediaId}`;
  const viewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  const documentsSection = sections.find((s) => s.type === 'DOCUMENTS');

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <SiteHeader profile={profile} sections={sections} locale={locale} pathname={`/doc/${id}`} />
      <main id="main" className="container-page py-8">
        {documentsSection ? (
          <Link
            href={withLocale(`/${documentsSection.slug}`, locale)}
            className="text-sm font-semibold text-brand-ink"
          >
            ← {T.back[locale]}
          </Link>
        ) : null}

        <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`/api/media/${doc.mediaId}?download=1`} className="btn-secondary text-sm">
            {T.download[locale]}
          </a>
          <a href={viewer} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
            {T.newTab[locale]}
          </a>
        </div>

        {/* Просмотрщик Microsoft: документ он забирает по ссылке выше, поэтому
            файл обязан быть доступен снаружи — /api/media открыт всем. */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-card">
          <iframe
            src={viewer}
            title={title}
            className="h-[75vh] min-h-[28rem] w-full border-0"
            allowFullScreen
          />
        </div>

        <p className="mt-3 text-sm text-muted">{T.hint[locale]}</p>
      </main>
      <SiteFooter profile={profile} sections={sections} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}
