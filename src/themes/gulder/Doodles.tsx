/* Рисунки «Гүлдер» (образец №8): сердечки и бабочки поверх фото, кавычки отзыва. Все — aria-hidden. */

/** Нарисованные поверх фото сердце-петля и бабочка, как в образце. */
export function HeartLoop({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 90 140" fill="none" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M45 40C30 14 4 22 8 44c3 18 22 30 37 44 15-14 34-26 37-44 4-22-22-30-37-4Z" />
      <path d="M45 88v48M38 136h14" />
      <path d="M40 96h10v40H40Z" fill="#F9A8D4" strokeWidth="3" />
    </svg>
  );
}

export function Butterfly({ className, color = '#A855F7' }: { className?: string; color?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 60 50" aria-hidden>
      <path d="M30 25C22 8 6 4 4 14s10 14 22 12C14 30 8 42 18 44s12-12 12-19Z" fill={color} fillOpacity="0.85" />
      <path d="M30 25c8-17 24-21 26-11S46 28 34 26c12 4 18 16 8 18s-12-12-12-19Z" fill={color} fillOpacity="0.85" />
      <path d="M30 16v22M30 16l-4-8M30 16l4-8" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5-1-2 0-3s3 0 4-1 3-3 3-5c0-4-4-7-9-7ZM7.5 11h.01M10 7h.01M15 7h.01M17 11h.01',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6ZM9 12l2 2 4-4',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
};

export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.bulb} />
    </svg>
  );
}
