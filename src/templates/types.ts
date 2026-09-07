import type { Section, TenantProfile } from '@prisma/client';
import type { Locale } from '@/lib/i18n';
import type { AlbumWithCover, PostWithCover } from '@/components/site/blocks';

/** Один и тот же набор данных получают все шаблоны — различается только вёрстка. */
export type HomeProps = {
  profile: TenantProfile | null;
  sections: Section[];
  news: PostWithCover[];
  announcements: PostWithCover[];
  albums: AlbumWithCover[];
  locale: Locale;
  coverUrl: string | null;
};
