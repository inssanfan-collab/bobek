import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { parseSearchQuery } from '@/lib/search-query';

/**
 * Полнотекстовый поиск на tsvector-колонках (миграция fulltext_search).
 *
 * Живёт рядом со scope.ts и по тем же правилам: сырой SQL мимо scoped() —
 * единственный способ обратиться к чужому саду, поэтому tenantId подставляется
 * здесь и параметром запроса, а не приходит из вызывающего кода в виде where.
 */

/** Совпадение по вектору `simple` (по началу слова) или `russian` (по основе). */
function tsQuery(prefix: string, plain: string): Prisma.Sql {
  return Prisma.sql`(to_tsquery('simple', ${prefix}) || plainto_tsquery('russian', ${plain}))`;
}

export type SiteSearchResults = {
  posts: {
    id: string;
    slug: string;
    titleKk: string;
    titleRu: string;
    publishedAt: Date | null;
    sectionSlug: string;
  }[];
  pages: { id: string; sectionSlug: string; titleKk: string; titleRu: string }[];
  documents: { id: string; titleKk: string; titleRu: string }[];
  staff: { id: string; fullName: string; positionKk: string; positionRu: string }[];
};

const EMPTY: SiteSearchResults = { posts: [], pages: [], documents: [], staff: [] };

/**
 * Поиск по публичной части сайта одного сада.
 *
 * Разделы с isVisible = false отфильтрованы: их страницы отдают 404,
 * и ссылка из поиска вела бы в никуда.
 */
export async function searchSite(tenantId: string, query: string): Promise<SiteSearchResults> {
  if (!tenantId) throw new Error('searchSite() вызван без tenantId');

  const parsed = parseSearchQuery(query);
  if (!parsed) return EMPTY;

  const q = tsQuery(parsed.prefix, parsed.plain);

  const [posts, pages, documents, staff] = await Promise.all([
    prisma.$queryRaw<SiteSearchResults['posts']>`
      SELECT p."id", p."slug", p."titleKk", p."titleRu", p."publishedAt",
             s."slug" AS "sectionSlug"
        FROM "Post" p
        JOIN "Section" s ON s."id" = p."sectionId"
       WHERE p."tenantId" = ${tenantId}
         AND s."isVisible" = true
         AND p."status" = 'PUBLISHED'
         AND p."publishedAt" <= now()
         AND p."searchVector" @@ ${q}
       ORDER BY ts_rank_cd(p."searchVector", ${q}) DESC, p."publishedAt" DESC
       LIMIT 20`,

    // Заголовок страницы хранится в разделе, поэтому совпадение засчитывается
    // и по тексту страницы, и по названию раздела.
    prisma.$queryRaw<SiteSearchResults['pages']>`
      SELECT g."id", s."slug" AS "sectionSlug", s."titleKk", s."titleRu"
        FROM "Page" g
        JOIN "Section" s ON s."id" = g."sectionId"
       WHERE g."tenantId" = ${tenantId}
         AND s."isVisible" = true
         AND (g."searchVector" @@ ${q} OR s."searchVector" @@ ${q})
       ORDER BY greatest(ts_rank_cd(s."searchVector", ${q}),
                         ts_rank_cd(g."searchVector", ${q})) DESC
       LIMIT 10`,

    prisma.$queryRaw<SiteSearchResults['documents']>`
      SELECT "id", "titleKk", "titleRu"
        FROM "Document"
       WHERE "tenantId" = ${tenantId}
         AND "searchVector" @@ ${q}
       ORDER BY ts_rank_cd("searchVector", ${q}) DESC, "position" ASC
       LIMIT 10`,

    prisma.$queryRaw<SiteSearchResults['staff']>`
      SELECT "id", "fullName", "positionKk", "positionRu"
        FROM "StaffMember"
       WHERE "tenantId" = ${tenantId}
         AND "isVisible" = true
         AND "searchVector" @@ ${q}
       ORDER BY ts_rank_cd("searchVector", ${q}) DESC, "position" ASC
       LIMIT 10`,
  ]);

  return { posts, pages, documents, staff };
}

/**
 * Поиск сада в каталоге портала. Возвращает id по убыванию релевантности —
 * фильтры каталога (район, тип, свободные места) остаются на стороне Prisma.
 * Пустой список означает «ничего не нашлось», а не «фильтра нет».
 */
export async function searchTenantIds(query: string): Promise<string[]> {
  const parsed = parseSearchQuery(query);
  if (!parsed) return [];

  const q = tsQuery(parsed.prefix, parsed.plain);

  const rows = await prisma.$queryRaw<{ tenantId: string }[]>`
    SELECT "tenantId"
      FROM "TenantProfile"
     WHERE "searchVector" @@ ${q}
     ORDER BY ts_rank_cd("searchVector", ${q}) DESC
     LIMIT 200`;

  return rows.map((row) => row.tenantId);
}
