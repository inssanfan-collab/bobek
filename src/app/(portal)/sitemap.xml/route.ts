import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Карта портала. Сайты садов сюда не попадают: они на своих доменах и у каждого
 * свой sitemap — чужие домены поисковики из карты всё равно игнорируют. Каталог
 * на них ссылается, этого для обхода достаточно.
 */

/** Страницы, которые есть всегда. Заявка и оферта — тоже точки входа из поиска. */
const STATIC_PATHS = ['', '/catalog', '/parents', '/pricing', '/news', '/contacts', '/apply', '/offer'];

export async function GET() {
  const base = `https://${env.portalDomain}`;

  const [posts, lastGarden] = await Promise.all([
    prisma.portalPost.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    }),
    // Каталог меняется, когда появляется или обновляется сад.
    prisma.tenantProfile.findFirst({
      where: { tenant: { status: 'ACTIVE' } },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ]);

  const urls: { loc: string; lastmod: Date | null }[] = [
    ...STATIC_PATHS.map((path) => ({
      loc: `${base}${path}`,
      lastmod: path === '/catalog' ? lastGarden?.updatedAt ?? null : null,
    })),
    ...posts.map((post) => ({ loc: `${base}/news/${post.slug}`, lastmod: post.updatedAt })),
  ];

  // Без hreflang, в отличие от карты сайта сада: портал существует только
  // по-русски, и объявлять казахскую версию значило бы обещать поисковику
  // страницу, которой нет.
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
