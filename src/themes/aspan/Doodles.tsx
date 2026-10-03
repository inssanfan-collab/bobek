/*
 * Рисунки «Аспан» (образец №3): солнце, облака, верёвка с флажками,
 * пазл в середине круга, мяч, звёзды на нитке, волнистая стрелка, значки.
 * Все — aria-hidden.
 */

export function Sun({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 120" aria-hidden>
      <g stroke="#FFC81E" strokeWidth="6" strokeLinecap="round">
        <path d="M60 6v14M60 100v14M6 60h14M100 60h14M22 22l10 10M88 88l10 10M22 98l10-10M88 32l10-10" />
      </g>
      <circle cx="60" cy="60" r="27" fill="#FFD43B" />
      <circle cx="60" cy="60" r="27" fill="none" stroke="#FFB300" strokeWidth="3" />
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 64" aria-hidden>
      <path d="M26 58h70c11 0 19-8 19-18s-8-18-19-18h-1C92 11 82 4 70 4 58 4 48 12 46 23a17 17 0 0 0-28 7C9 30 3 37 3 44s8 14 23 14Z" fill="#fff" />
    </svg>
  );
}

/** Облачный край секции: закрашен currentColor. */
export function CloudEdge({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden>
      <path d="M0 70V40c30-30 80-36 110-10 22-34 86-38 112-4 30-30 92-30 116 4 28-34 96-34 120 0 26-30 88-32 114 2 30-34 96-34 122 0 28-30 90-30 116 4 30-34 94-34 120 0 28-30 92-30 118 2 28-32 92-32 118 0 26-26 70-26 94 0V70Z" fill="currentColor" />
    </svg>
  );
}

/** Верёвка, на которой висят флажки первого экрана. */
export function Rope({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 800 80" preserveAspectRatio="none" fill="none" aria-hidden>
      <path d="M0 10c120 60 300 66 420 40S700 0 800 30" stroke="#3B3B4F" strokeWidth="3" />
      <circle cx="0" cy="10" r="6" fill="#3B3B4F" />
    </svg>
  );
}

/** Пазл из четырёх цветных деталей — в середине круга из фото. */
export function Puzzle() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
      <path d="M8 8h12a5 5 0 1 1 8 0h4v12a5 5 0 1 0 0 8v4H20a5 5 0 1 0-8 0H8Z" fill="#F59E0B" />
      <path d="M32 8h24v24h-4a5 5 0 1 0-8 0H32V20a5 5 0 1 1 0-8Z" fill="#EF4444" />
      <path d="M8 32h4a5 5 0 1 1 8 0h12v4a5 5 0 1 0 0 8v12H8Z" fill="#22C55E" />
      <path d="M32 44a5 5 0 1 1 0-8v-4h12a5 5 0 1 0 8 0h4v24H32Z" fill="#3B82F6" />
    </svg>
  );
}

/** Мяч с рожицей — в углу секции «Орта». */
export function Ball({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="44" fill="#fff" stroke="#1F1F2E" strokeWidth="3" />
      <path d="M50 6c-14 12-20 26-18 44M50 6c16 10 24 24 26 40M8 40c14 2 24 6 24 10M92 40c-8 0-16 2-16 6" fill="none" stroke="#1F1F2E" strokeWidth="3" />
      <path d="M50 6C36 18 32 30 32 50L8 40C12 24 28 8 50 6Z" fill="#EF4444" />
      <path d="M50 6c16 10 24 24 26 40l16-6C88 22 72 8 50 6Z" fill="#FACC15" />
      <path d="M76 46c-2 18-10 32-26 48 22-2 38-16 42-48Z" fill="#3B82F6" />
      <circle cx="42" cy="62" r="3" fill="#1F1F2E" />
      <circle cx="58" cy="62" r="3" fill="#1F1F2E" />
      <path d="M44 72c4 3 8 3 12 0" stroke="#1F1F2E" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Звёзды на нитке — слева над секцией «Орта». */
export function Stars({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 30 140" aria-hidden>
      <path d="M15 0v140" stroke="#14B8A6" strokeWidth="1.5" />
      <path d="m15 30 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#14B8A6" />
      <path d="M11 70h8" stroke="#14B8A6" strokeWidth="2" />
      <path d="m15 104 4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1Z" fill="#14B8A6" />
    </svg>
  );
}

/** Волнистая стрелка рядом с кнопкой. */
export function WavyArrow({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 130 30" fill="none" aria-hidden>
      <path d="M2 16c8-10 14-10 20 0s14 10 20 0 14-10 20 0 14 10 20 0 14-10 20 0 12 8 24 0" stroke="#7E22CE" strokeWidth="3" strokeLinecap="round" />
      <path d="m114 6 12 10-12 10" stroke="#7E22CE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  game: 'M6 12h4M8 10v4M15 11h.01M18 13h.01M7 6h10a5 5 0 0 1 4.6 7l-1.4 3.2a2.5 2.5 0 0 1-4 .8L14 15h-4l-2.2 2a2.5 2.5 0 0 1-4-.8L2.4 13A5 5 0 0 1 7 6Z',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6ZM9 12l2 2 4-4',
  blocks: 'M4 13h7v7H4zM13 13h7v7h-7zM8.5 4h7v7h-7z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  leaf: 'M5 19c0-9 6-14 15-14 0 9-6 14-15 14Zm0 0 8-8',
  pyramid: 'M12 3 3 20h18ZM7.5 12h9M5 16h14',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5-1-2 0-3s3 0 4-1 3-3 3-5c0-4-4-7-9-7ZM7.5 11h.01M10 7h.01M15 7h.01M17 11h.01',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  food: 'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 0-3 2-3 6s1 5 3 5v7',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2ZM4 21V5M9 7h6',
  arrow: 'M7 17 17 7M9 7h8v8',
};

export function Icon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.blocks} />
    </svg>
  );
}

/** Значок к пункту распорядка — по смыслу: еда, сон, прогулка, занятие. */
export function routineIcon(title: string): string {
  const t = title.toLowerCase();
  // Сон — первым: в «Тихий час» есть буквы «ас», а «ас» — это «еда».
  if (/ұйқы|сон|тихий/.test(t)) return 'moon';
  if (/(^|\s)ас(\s|$)|тамақ|завтрак|обед|полдник|ужин/.test(t)) return 'food';
  if (/серуен|прогулк|ойын/.test(t)) return 'sun';
  if (/сурет|рисов|өнер/.test(t)) return 'palette';
  return 'book';
}
