import type { AlbumItem, Club, Document, FaqItem, Group, Media, PricePlan, Review, RoutineItem, Section, TenantProfile } from '@prisma/client';
import type { Locale } from '@/lib/i18n';
import type { HeroContent } from '@/lib/hero';
import type { AlbumWithCover, PostWithCover } from '@/components/site/blocks';
import type { StaffWithPhoto } from '@/components/site/home-blocks';
import type { HomeCounts } from '@/lib/home-stats';

/** Документ с файлом — для блока «Последние документы». */
export type DocumentWithMedia = Document & { media: Media };

/** Фото из альбома — для блока «Фотогалерея» на главной (последние загруженные). */
export type LatestPhoto = AlbumItem & { media: Media; album: { slug: string; titleKk: string; titleRu: string } };

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
  /** Тексты первого экрана — заголовок, описание, кнопки (src/lib/hero.ts). */
  hero: HeroContent;
  /**
   * Последние документы и все разделы меню — для главных, которые их
   * показывают (официальная тема: «Последние документы», «Важно»).
   * Шаблонам не обязательны.
   */
  documents?: DocumentWithMedia[];
  menu?: Section[];
  /**
   * Лента новостей подлиннее (до девяти) — для тем, где новостей на главной
   * больше обычного. `news` при этом остаётся прежней длины, чтобы
   * стандартные шаблоны не менялись.
   */
  newsFeed?: PostWithCover[];
  /** Последние загруженные фото галереи (до трёх). */
  photos?: LatestPhoto[];
  /**
   * Данные для блоков главной (src/components/site/home-blocks.tsx):
   * только видимые записи, в порядке, заданном садом.
   */
  staff?: StaffWithPhoto[];
  groups?: Group[];
  clubs?: Club[];
  faq?: FaqItem[];
  reviews?: Review[];
  prices?: PricePlan[];
  routine?: RoutineItem[];
  counts?: HomeCounts;
};
