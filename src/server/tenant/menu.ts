import 'server-only';
import type { Section } from '@prisma/client';
import type { TenantScope } from '@/server/db/scope';

export type MenuSection = Section & { children: Section[] };

/**
 * Меню сайта сада: разделы верхнего уровня, у каждого — вложенные.
 *
 * Вложенность одна: раздел внутри раздела, не глубже. Больше уровней
 * на телефоне не помещаются, а родитель в трёх щелчках от нужной страницы
 * просто её не находит.
 *
 * Вложенный раздел скрытого родителя не показывается: заведующая скрыла
 * ветку целиком, и вытаскивать её детей в корень меню было бы сюрпризом.
 */
export async function siteMenu(db: TenantScope): Promise<MenuSection[]> {
  const rows = await db.sections.findMany({
    where: { isVisible: true },
    orderBy: { position: 'asc' },
  });

  return rows
    .filter((section) => !section.parentId)
    .map((section) => ({
      ...section,
      children: rows.filter((child) => child.parentId === section.id),
    }));
}
