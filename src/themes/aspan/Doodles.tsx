/* Рисунки «Аспан»: солнышко с улыбкой (оно же логотип) и облако. Украшения — aria-hidden. */

export function SunFace({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 80 80" fill="none" aria-hidden>
      <g stroke="#FFC83D" strokeWidth="5" strokeLinecap="round">
        <path d="M40 4v9M40 67v9M4 40h9M67 40h9M14.6 14.6l6.4 6.4M59 59l6.4 6.4M14.6 65.4l6.4-6.4M59 21l6.4-6.4" />
      </g>
      <circle cx="40" cy="40" r="19" fill="#FFC83D" />
      <circle cx="33.5" cy="37" r="2.2" fill="#16324F" />
      <circle cx="46.5" cy="37" r="2.2" fill="#16324F" />
      <path d="M32.5 45c4 3.6 11 3.6 15 0" stroke="#16324F" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 96 56" aria-hidden>
      <path d="M22 48h52c9 0 16-6.5 16-15s-7-15-16-15c-1.3 0-2.5.1-3.7.4C67.6 10.7 60.5 5 52 5c-9.2 0-16.8 6.6-18.3 15.4A14 14 0 0 0 22 20C13.7 20 7 26.3 7 34s6.7 14 15 14Z" fill="currentColor" />
    </svg>
  );
}

/** Облачный край над подвалом: закрашен currentColor. */
export function CloudEdge({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
      <path d="M0 80V52c40-26 90-30 130-8 30-30 90-34 130-4 40-34 110-30 140 6 36-26 96-24 124 8 40-30 106-32 142 2 34-28 92-26 120 6 44-34 118-30 150 4 30-24 86-22 116 6 40-30 104-28 136 2 32-24 84-22 112 8 38-28 94-26 140-4V80Z" fill="currentColor" />
    </svg>
  );
}
