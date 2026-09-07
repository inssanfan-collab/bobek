import { NextResponse } from 'next/server';
import { publicSiteContext } from '@/server/tenant/context';

export const dynamic = 'force-dynamic';

/** Карта сайта на тенанта: у каждого сада свой домен, значит и свой sitemap. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const { host } = await params;
  const { db, primaryHost } = await publicSiteContext(host);
  const base = `https://${primaryHost}`;

  const [sections, posts, albums] = await Promise.all([
    db.sections.findMany({ where: { isVisible: true }, orderBy: { position: 'asc' } }),
    db.posts.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      include: { section: true },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    }),
    db.albums.findMany({ where: { isVisible: true } }),
  ]);

  const gallerySlug = sections.find((s) => s.type === 'GALLERY')?.slug;

  const urls = [
    { loc: base, lastmod: null as Date | null },
    ...sections.map((s) => ({ loc: `${base}/${s.slug}`, lastmod: s.updatedAt })),
    ...posts.map((p) => ({ loc: `${base}/${p.section.slug}/${p.slug}`, lastmod: p.updatedAt })),
    ...(gallerySlug
      ? albums.map((a) => ({ loc: `${base}/${gallerySlug}/${a.slug}`, lastmod: a.updatedAt }))
      : []),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}
    <xhtml:link rel="alternate" hreflang="ru" href="${loc}"/>
    <xhtml:link rel="alternate" hreflang="kk" href="${loc}${loc.includes('?') ? '&amp;' : '?'}lang=kk"/>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
