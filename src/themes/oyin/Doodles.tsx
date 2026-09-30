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
  care: (
    <>
      <path d="M12 13.6c-2.7-1.9-5.1-4-5.1-6.6A2.8 2.8 0 0 1 12 5.4 2.8 2.8 0 0 1 17.1 7c0 2.6-2.4 4.7-5.1 6.6Z" fill="currentColor" />
      <path d="M2.5 10v5.6c0 1 .4 2 1.1 2.7L6.4 21H11v-3.9c0-1-.4-2-1.1-2.7l-2.8-2.8" />
      <path d="M21.5 10v5.6c0 1-.4 2-1.1 2.7L17.6 21H13v-3.9c0-1 .4-2 1.1-2.7l2.8-2.8" />
    </>
  ),
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

export type FactIconName = keyof typeof ICON;

export function FactIcon({ name, className }: { name: FactIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICON[name]}
    </svg>
  );
}
