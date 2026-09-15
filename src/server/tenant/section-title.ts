import 'server-only';
import type { SectionType } from '@prisma/client';
import { prisma } from '@/server/db';
import { pick, type Locale } from '@/lib/i18n';

/**
 * Название раздела так, как его назвал сам сад.
 *
 * Сад переименовывает разделы под себя: «Документы» становятся «Материалами
 * самооценки». Если в админке оставить зашитую подпись, сотрудник ищет свой
 * раздел и не находит — на сайте он называется иначе.
 *
 * Если раздела нет или он без названия, возвращается наша подпись.
 */
export async function sectionTitle(
  tenantId: string,
  type: SectionType,
  locale: Locale,
  fallback: string,
): Promise<string> {
  const section = await prisma.section.findFirst({
    where: { tenantId, type },
    orderBy: { position: 'asc' },
    select: { titleKk: true, titleRu: true },
  });
  return (section && pick(locale, section.titleKk, section.titleRu)) || fallback;
}
