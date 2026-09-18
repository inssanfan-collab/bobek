import type { Section, TenantProfile } from '@prisma/client';
import type { Locale } from '@/lib/i18n';
import type { AlbumWithCover, PostWithCover } from '@/components/site/blocks';

/** Один и тот же набор данных получают все шаблоны — различается только вёрстка. */
export type HomeProps = {
  profile: TenantProfile | null;
  news: PostWithCover[];
  announcements: PostWithCover[];
  albums: AlbumWithCover[];
  locale: Locale;
  coverUrl: string | null;
  /** Готовое значение object-position: какую часть обложки оставить при кадрировании. */
  coverPosition: string;
  /**
   * Разделы для блока «Разделы сайта» — уже отобранные садом в «Оформлении».
   * Пустой список — блока нет (SectionTiles сам ничего не рисует).
   */
  sections: Section[];
  /** Показывать ли блок «Контакты» — выбор сада в «Оформлении». */
  showContacts: boolean;
};
