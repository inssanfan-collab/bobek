/*
 * Рисунки «Қуаныш» (образец №4): знак-телевизор с детьми, облачные края,
 * облачные плашки карточек и счётчиков, самолётик, ракета, значки.
 * Все — aria-hidden.
 */

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Знак без логотипа: рамка-телевизор с антенной и двумя детьми. */
export function Mark() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <path d="m16 4 8 7 8-7" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="3" y="11" width="42" height="33" rx="7" fill="#fff" stroke="#1E2A5A" strokeWidth="3" />
      <circle cx="17" cy="22" r="4" fill="#F59E0B" />
      <circle cx="31" cy="22" r="4" fill="#F59E0B" />
      <path d="M11 38c0-6 3-9 6-9s6 3 6 9Z" fill="#DC2626" />
      <path d="M25 38c0-6 3-9 6-9s6 3 6 9Z" fill="#16A34A" />
    </svg>
  );
}

/** Облачный край: закрашен currentColor, выпуклости вверх. */
export function CloudEdge({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
      <path d="M0 90V58c26-30 84-40 120-14 24-34 92-40 124-6 30-32 100-36 128 2 34-28 98-26 120 8 30-30 96-34 126 0 34-34 106-36 136 4 26-24 80-26 108 4 30-34 104-38 136 0 34-30 96-30 122 6 30-28 86-28 112 2 32-28 88-26 108 8V90Z" fill="currentColor" />
    </svg>
  );
}

export function Plane({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 90" fill="none" aria-hidden>
      <path d="M8 84c20-8 32-22 40-36" stroke="#16A34A" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
      <path d="m112 6-70 34 22 8 6 22 12-16 18 10Z" fill="#14B8A6" />
      <path d="m64 48 48-42-30 58" fill="#0F766E" />
    </svg>
  );
}

export function Rocket({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 80 80" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M52 10c10 0 18 8 18 18-6 8-16 18-26 22L30 36c4-10 14-20 22-26Z" />
      <circle cx="52" cy="28" r="5" />
      <path d="m30 36-10 2-8 10 12 2M44 50l-2 10-10 8-2-12M24 56c-6 2-10 8-12 14 6-2 12-6 14-12" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  medal: 'M8 3h8l-2 6h-4ZM12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3Z',
  blocks: 'M4 13h7v7H4zM13 13h7v7h-7zM8.5 4h7v7h-7zM7 16.5h1M16 16.5h1M11.5 7.5h1',
  game: 'M6 12h4M8 10v4M15 11h.01M18 13h.01M7 6h10a5 5 0 0 1 4.6 7l-1.4 3.2a2.5 2.5 0 0 1-4 .8L14 15h-4l-2.2 2a2.5 2.5 0 0 1-4-.8L2.4 13A5 5 0 0 1 7 6Z',
  book: 'M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2ZM20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2ZM4 21V5M20 21V5',
  slide: 'M5 20V8a3 3 0 0 1 6 0v12M5 12h6M11 9c4 0 6 3 7 6l2 5',
  run: 'M14 4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM6 21l4-6 3 2v4M8 11l3-3 4 2 2 3h3M13 17l-2-5',
  arrow: 'M7 17 17 7M9 7h8v8',
  mail: 'M3 5h18v14H3zM4 7l8 6 8-6',
  phone: 'M7 2.5h10v19H7zM11 18.5h2',
};

export function Icon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} {...STROKE} aria-hidden><path d={ICONS[name] ?? ICONS.blocks} /></svg>;
}

/** Три красные полоски над заголовком «Занятия». */
export function Stripes() {
  return (
    <svg viewBox="0 0 48 24" className="decor mx-auto h-6 w-12" aria-hidden>
      <path d="M6 4h36M2 12h28M18 20h28" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
