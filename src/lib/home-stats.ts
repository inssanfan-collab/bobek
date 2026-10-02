import type { TenantProfile } from '@prisma/client';
import type { Locale } from '@/lib/i18n';

/** Счётчики для блока на главной (StatsRow в src/components/site/home-blocks.tsx). */
const T = {
  groups: { kk: 'топ', ru: 'групп' },
  staff: { kk: 'педагог', ru: 'педагогов' },
  places: { kk: 'орын', ru: 'мест' },
} as const;

export type HomeCounts = { staff: number; groups: number };
export type Stat = { value: string; label: string };

/**
 * «4 топ · 15 педагог · 95 орын» — только из настоящих данных: групп
 * и педагогов в базе, мест из паспорта. Чего нет — того не показываем.
 */
export function homeStats(profile: TenantProfile | null, counts: HomeCounts | undefined, locale: Locale): Stat[] {
  const stats: Stat[] = [];
  const groups = counts?.groups || profile?.groupsCount || 0;
  if (groups) stats.push({ value: String(groups), label: T.groups[locale] });
  if (counts?.staff) stats.push({ value: String(counts.staff), label: T.staff[locale] });
  if (profile?.placesTotal) stats.push({ value: String(profile.placesTotal), label: T.places[locale] });
  return stats;
}
