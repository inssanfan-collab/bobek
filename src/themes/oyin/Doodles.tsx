/*
 * Рисунки «Ойын алаңы»: облака, облачный край секции и простые значки
 * для фактов о саде (забота, дети, места, часы, язык). Всё — aria-hidden.
 */

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 96 56" fill="none" aria-hidden>
      <path
        d="M22 48h52c9 0 16-6.5 16-15s-7-15-16-15c-1.3 0-2.5.1-3.7.4C67.6 10.7 60.5 5 52 5c-9.2 0-16.8 6.6-18.3 15.4A14 14 0 0 0 22 20C13.7 20 7 26.3 7 34s6.7 14 15 14Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/** Край секции из пухлых облаков: закрашен currentColor — цветом следующей части. */
export function CloudEdge({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 80V52c40-26 90-30 130-8 30-30 90-34 130-4 40-34 110-30 140 6 36-26 96-24 124 8 40-30 106-32 142 2 34-28 92-26 120 6 44-34 118-30 150 4 30-24 86-22 116 6 40-30 104-28 136 2 32-24 84-22 112 8 38-28 94-26 140-4V80Z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICON = {
  kids: (
    <>
      <circle cx="8" cy="7" r="3" />
      <circle cx="16.5" cy="8.5" r="2.5" />
      <path d="M3 20c0-3.3 2.2-6 5-6s5 2.7 5 6M13 20c.3-2.7 1.8-4.5 3.5-4.5S20 17.3 20 20" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  talk: (
    <>
      <path d="M4 5h16v10H9l-5 4Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
} as const;

/** Сердце в ладонях — «Забота о ребёнке», по значку из образца. Правая ладонь — зеркало левой. */
function CareIcon({ className }: { className?: string }) {
  const hand = (
    <>
      <path d="M8.5 24c0-4.4 4.8-4.4 4.8-.4" />
      <path d="M8.5 24c-.6 6.5 1.4 12 6.5 16.3l7.6 6.6c1.5 1.3 2.3 3.2 2.3 5.2V57" />
      <path d="M13.3 23.6c.4 5 3 9.3 7.4 12.6l8 5.6c2.1 1.6 3.3 4 3.3 6.7V57" />
      <path d="M9 30.5c1.7.1 3.3.9 4.7 2.2" />
      <path d="M10.8 36.3c1.7.2 3.2 1 4.6 2.3" />
    </>
  );
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M32 39C21.8 32.8 16.5 27.3 16.5 21c0-4.3 3.4-7.7 7.6-7.7 3.3 0 6.2 2 7.9 5 1.7-3 4.6-5 7.9-5 4.2 0 7.6 3.4 7.6 7.7 0 6.3-5.3 11.8-15.5 18Z" />
      {hand}
      <g transform="translate(64 0) scale(-1 1)">{hand}</g>
    </svg>
  );
}

export type FactIconName = keyof typeof ICON | 'care';

/** stroke — толщина линии: крупным значкам фактов тоньше, мелким в карточке — жирнее. */
export function FactIcon({ name, className, stroke = 1.35 }: { name: FactIconName; className?: string; stroke?: number }) {
  if (name === 'care') return <CareIcon className={className} />;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICON[name]}
    </svg>
  );
}
