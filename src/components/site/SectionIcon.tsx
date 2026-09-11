import type { SectionType } from '@prisma/client';

/**
 * Иконки разделов сайта сада.
 *
 * Рисованные, а не эмодзи: эмодзи каждая система показывает по-своему
 * (на Windows у сада будет один рисунок, на телефоне заведующей — другой),
 * они не красятся в цвет палитры и разъезжаются по размеру. Здесь один
 * стиль на весь набор: сетка 24, штрих 1.7, скруглённые концы.
 */
const PATHS: Partial<Record<SectionType, React.ReactNode>> = {
  NEWS: (
    <>
      <path d="M4 5h11v14H5a1 1 0 0 1-1-1z" />
      <path d="M15 9h4v8a2 2 0 0 1-4 0" />
      <path d="M7 9h5M7 13h5" />
    </>
  ),
  ANNOUNCEMENT: (
    <>
      <path d="M4 10v4h3l5 4V6l-5 4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  STAFF: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M17 14.5c2.3 0 4 1.9 4 4.2" />
    </>
  ),
  GROUPS: (
    <>
      <rect x="3.5" y="13" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13" width="7" height="7" rx="1.5" />
      <rect x="8.5" y="4" width="7" height="7" rx="1.5" />
    </>
  ),
  GALLERY: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 17 4.2-4.2a1.6 1.6 0 0 1 2.2 0l2.3 2.3" />
      <path d="m13 15 2.2-2.2a1.6 1.6 0 0 1 2.2 0L20 15.4" />
    </>
  ),
  DOCUMENTS: (
    <>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  MENU_FOOD: (
    <>
      <path d="M4 9a8 8 0 0 1 16 0" />
      <path d="M3 12h18" />
      <path d="M5 15h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3" />
      <path d="M12 5V3" />
    </>
  ),
  CLUBS: (
    <>
      <path d="M12 4.5 14.2 9l5 .7-3.6 3.5.9 5-4.5-2.4L7.5 18l.9-5L4.8 9.7 9.8 9z" />
    </>
  ),
  VACANCIES: (
    <>
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9.5 20v-5.5h5V20" />
      <path d="M4 20h16" />
    </>
  ),
  FAQ: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6A2.5 2.5 0 0 1 14.5 10c0 1.7-2.5 2-2.5 3.5" />
      <path d="M12 17h.01" />
    </>
  ),
  FEEDBACK: (
    <>
      <path d="M4 6h16v10a2 2 0 0 1-2 2H8l-4 3z" />
      <path d="m7 10 5 3 5-3" />
    </>
  ),
  CONTACTS: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  TRUSTEE_BOARD: (
    <>
      <path d="M3.5 20h17" />
      <path d="M5.5 20v-8M18.5 20v-8M9.5 20v-8M14.5 20v-8" />
      <path d="m12 3.5 8 4.5H4z" />
    </>
  ),
  ANTICORRUPTION: (
    <>
      <path d="M12 3.5 19 6v6c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z" />
      <path d="m9.5 12 1.8 1.8 3.5-3.6" />
    </>
  ),
  PAGE: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
};

export function SectionIcon({ type, className }: { type: SectionType; className?: string }) {
  return (
    <svg
      className={className ?? 'h-6 w-6'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[type] ?? PATHS.PAGE}
    </svg>
  );
}
