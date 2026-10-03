/*
 * Значки и украшения «Жасыл» (образец №2): знак с детьми, значки полосы
 * и карточек, будильник распорядка, галочки, кавычка. Все — aria-hidden.
 */

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Знак без логотипа: двое детей за руку в рамке, как у образца. */
export function Kids() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <rect x="2" y="6" width="44" height="36" rx="6" fill="#fff" stroke="#D83A16" strokeWidth="3" />
      <path d="M8 2 14 8M40 2l-6 6" stroke="#0278B8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="17" r="4.5" fill="#F6B73C" />
      <circle cx="31" cy="17" r="4.5" fill="#F6B73C" />
      <path d="M11 34l6-12 6 12Z" fill="#D83A16" />
      <path d="M25 34l6-12 6 12Z" fill="#0278B8" />
      <path d="M20 27h8" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 34v5M20 34v5M28 34v5M34 34v5" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Pin() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...STROKE} aria-hidden><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" /></svg>;
}

export function Mail() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...STROKE} aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}

export function Phone() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...STROKE} aria-hidden><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>;
}

const ICONS: Record<string, string> = {
  home: 'M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6',
  teacher: 'M3 4h18v12H3zM8 20l4-4 4 4M7 9l3 3 3-4 4 3',
  puzzle: 'M9 3h4v2.5a1.5 1.5 0 1 0 3 0V3h3v6h-2.5a1.5 1.5 0 1 0 0 3H19v7h-6v-2.5a1.5 1.5 0 1 0-3 0V19H4v-6h2.5a1.5 1.5 0 1 0 0-3H4V3h5Z',
  hands: 'M7 12V6a1.5 1.5 0 0 1 3 0v5M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 14a1.6 1.6 0 0 1 2.6-1.8L7 13.5',
  food: 'M4 19h16M12 5v2M5 16a7 7 0 0 1 14 0ZM3 16h18',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6ZM9 12l2 2 4-4',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2ZM4 21V5M9 7h6',
};

export function Icon({ name, className = 'h-7 w-7' }: { name: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} {...STROKE} aria-hidden><path d={ICONS[name] ?? ICONS.puzzle} /></svg>;
}

/** Будильник над распорядком — красный круг, как в образце. */
export function Alarm() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...STROKE} strokeWidth={2} aria-hidden>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9.5V13l2.5 1.5M4 5.5 7 3M20 5.5 17 3M7 19.5 5.5 21M17 19.5l1.5 1.5" />
    </svg>
  );
}

/** Три кружка над заголовком секции: красный, розовый, голубой. */
export function Dots() {
  return (
    <svg viewBox="0 0 40 30" className="decor mx-auto h-7 w-9" aria-hidden>
      <circle cx="13" cy="10" r="8" fill="#D83A16" fillOpacity="0.9" />
      <circle cx="27" cy="10" r="8" fill="#D4198F" fillOpacity="0.85" />
      <circle cx="20" cy="21" r="8" fill="#1EB5F0" fillOpacity="0.85" />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
      <path d="m3 10 4.5 4.5L17 4" fill="none" stroke="#D4198F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bell() {
  return (
    <svg viewBox="0 0 48 48" className="decor mx-auto h-12 w-12" fill="none" stroke="#D4198F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M24 4v4M14 18a10 10 0 0 1 20 0v9l4 7H10l4-7ZM20 38a4 4 0 0 0 8 0" />
      <path d="m19 22 5-4 5 4v6h-10Z" />
      <path d="M8 14c-2 3-2 7 0 10M40 14c2 3 2 7 0 10" />
    </svg>
  );
}

export function Chevron() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE} strokeWidth={2.4} aria-hidden><path d="m6 9 6 6 6-6" /></svg>;
}
