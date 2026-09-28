/*
 * Рисунки «Акварели»: солнышко, облачко, звёздочка, бумажный кораблик.
 * Нарисованы линией «от руки» и стоят по краям первого экрана и подвала —
 * украшение, а не содержание, поэтому aria-hidden.
 */

export function Sun({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="12" fill="#FFD66B" stroke="#E0A43B" strokeWidth="2.5" />
      <g stroke="#E0A43B" strokeWidth="3" strokeLinecap="round">
        <path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.6 13.6l5 5M45.4 45.4l5 5M13.6 50.4l5-5M45.4 18.6l5-5" />
      </g>
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 96 56" fill="none" aria-hidden>
      <path
        d="M22 48h52c9 0 16-6.5 16-15s-7-15-16-15c-1.3 0-2.5.1-3.7.4C67.6 10.7 60.5 5 52 5c-9.2 0-16.8 6.6-18.3 15.4A14 14 0 0 0 22 20C13.7 20 7 26.3 7 34s6.7 14 15 14Z"
        fill="#FFFFFF"
        stroke="#9ED8C2"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="m20 4 4.6 10 10.9 1.2-8.1 7.4 2.3 10.8L20 27.9 10.3 33.4l2.3-10.8-8.1-7.4L15.4 14Z"
        fill="#C9BFF0"
        stroke="#8E7CD0"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Boat({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 80 56" fill="none" aria-hidden>
      <path d="M8 34h64l-9 16H17Z" fill="#FFE1D2" stroke="#E9765A" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M40 34V6l20 22H40" fill="#FFFFFF" stroke="#E9765A" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M40 12 26 28h14" fill="#FFF3C7" stroke="#E9765A" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Волнистый край секции: закрашен цветом следующей части страницы (currentColor). */
export function Wave({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden>
      <path d="M0 56h1440V20c-120 20-240 30-360 22S840 8 720 10 480 40 360 42 120 22 0 14Z" fill="currentColor" />
    </svg>
  );
}
