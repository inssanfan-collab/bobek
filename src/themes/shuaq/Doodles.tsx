/* Рисунки «Шуақ»: солнце (оно же логотип, если своего нет) и звёздочка. Украшения — aria-hidden. */

export function Sun({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="13" fill="#FFC93C" />
      <g stroke="#FFC93C" strokeWidth="4" strokeLinecap="round">
        <path d="M32 5v8M32 51v8M5 32h8M51 32h8M12.9 12.9l5.7 5.7M45.4 45.4l5.7 5.7M12.9 51.1l5.7-5.7M45.4 18.6l5.7-5.7" />
      </g>
      <circle cx="27.5" cy="30" r="1.8" fill="#1E2A33" />
      <circle cx="36.5" cy="30" r="1.8" fill="#1E2A33" />
      <path d="M27 36c2.8 2.6 7.2 2.6 10 0" stroke="#1E2A33" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 2c1 8 6 13 14 14-8 1-13 6-14 14-1-8-6-13-14-14 8-1 13-6 14-14Z" fill="currentColor" />
    </svg>
  );
}

/** Волна над подвалом: закрашена currentColor. */
export function Wave({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden>
      <path d="M0 56h1440V20c-120 20-240 30-360 22S840 8 720 10 480 40 360 42 120 22 0 14Z" fill="currentColor" />
    </svg>
  );
}
