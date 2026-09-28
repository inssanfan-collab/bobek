import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { portalUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

/**
 * Карта портала. Сайты садов сюда не попадают: они на своих доменах и у каждого
 * свой sitemap — чужие домены поисковики из карты всё равно игнорируют. Каталог
 * на них ссылается, этого для обхода достаточно.
 */

/** Страницы, которые есть всегда. Заявка и оферта — тоже точки входа из поиска. */
// /connect, /pricing и /apply ведут на главную — в карте сайта им не место.
const STATIC_PATHS = ['/', '/guide', '/catalog', '/parents', '/news', '/contacts', '/offer'];

/** & в адресе — сущностью: иначе XML карты не разберётся. */
const xml = (url: string) => url.replace(/&/g, '&amp;');

export async function GET() {
  const [posts, lastGarden] = await Promise.all([
    prisma.portalPost.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    }),
    // Каталог меняется, когда появляется или обновляется сад.
    prisma.tenantProfile.findFirst({
      where: { tenant: { status: 'ACTIVE', isDemo: false } },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ]);

  const pages: { path: string; lastmod: Date | null }[] = [
    ...STATIC_PATHS.map((path) => ({
      path,
      lastmod: path === '/catalog' ? lastGarden?.updatedAt ?? null : null,
    })),
    ...posts.map((post) => ({ path: `/news/${post.slug}`, lastmod: post.updatedAt })),
  ];

  // Каждая страница — на двух языках (казахская — ?lang=kk), и у каждой версии
  // ссылки на обе: так поисковик показывает казахскую тем, кто ищет по-казахски,
  // и не считает её копией русской.
  const entries = pages.flatMap(({ path, lastmod }) =>
    (['ru', 'kk'] as const).map((locale) =>
      [
        '  <url>',
        `    <loc>${xml(portalUrl(path, locale))}</loc>`,
        lastmod ? `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : null,
        `    <xhtml:link rel="alternate" hreflang="ru" href="${xml(portalUrl(path, 'ru'))}"/>`,
        `    <xhtml:link rel="alternate" hreflang="kk" href="${xml(portalUrl(path, 'kk'))}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(portalUrl(path, 'ru'))}"/>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
  );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
  ].join('\n');

  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
