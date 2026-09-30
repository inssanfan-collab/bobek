/*
 * Рисунки «Аққу»: лебедь на волнах (он же логотип, если своего у сада нет),
 * пёрышко, облачко, звёздочка и волнистый край секции. Украшение, а не
 * содержание, поэтому aria-hidden; лебедь нарисован по логотипу из Stitch.
 */

export function Swan({ className, round = false }: { className?: string; round?: boolean }) {
  return (
    // Без круга лишнее поле вокруг лебедя обрезано, чтобы он не терялся.
    <svg className={`decor ${className ?? ''}`} viewBox={round ? '0 0 160 160' : '20 34 120 100'} fill="none" aria-hidden>
      <defs>
        <linearGradient id="akku-swan-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EDE6FA" />
          <stop offset=".5" stopColor="#DCEEFB" />
          <stop offset="1" stopColor="#FBE3EA" />
        </linearGradient>
        <linearGradient id="akku-swan-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F3F0FA" />
        </linearGradient>
      </defs>
      {round ? <circle cx="80" cy="80" r="76" fill="url(#akku-swan-bg)" stroke="#FFFFFF" strokeWidth="4" /> : null}
      <path d="M25 118q20-6 40 0t40 0 30 0" stroke="#BCE3F7" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M35 128q20-4 40 0t40 0" stroke="#D3C9F2" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M52 108c-7-12 0-26 20-26s46 8 50 23c2 7-7 11-24 11-23 0-38-2-46-8Z" fill="url(#akku-swan-wing)" stroke="#E6E0F5" strokeWidth="1.5" />
      <path d="M70 88c14 0 34 7 36 18-10 2-24-2-32-9Z" fill="#FFFFFF" stroke="#E6E0F5" strokeWidth="1.5" />
      <path d="M60 98c-5-12-8-34 3-46 7-8 16-6 13 4-3 10-6 22 2 32" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="68" cy="50" r="6" fill="#FFFFFF" />
      <path d="M63 50 53 53l10 3Z" fill="#E07A98" />
      <circle cx="67" cy="49" r="1.4" fill="#2D3A66" />
      <circle cx="70" cy="53" r="2.2" fill="#F8B4C8" opacity=".6" />
      <path d="m69 40 2 4h4l-3 2 1 4-4-3-4 3 1-4-3-2h4Z" fill="#FFD166" />
    </svg>
  );
}

export function Feather({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 48 80" fill="none" aria-hidden>
      <path d="M24 4C8 18 6 42 14 62c4 8 8 12 10 14 2-2 6-6 10-14 8-20 6-44-10-58Z" fill="#FFFFFF" stroke="#D3C9F2" strokeWidth="2" />
      <path d="M24 10v66M24 30l-8-6M24 42l-9-6M24 54l-8-5M24 30l8-6M24 42l9-6M24 54l8-5" stroke="#D3C9F2" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 96 56" fill="none" aria-hidden>
      <path
        d="M22 48h52c9 0 16-6.5 16-15s-7-15-16-15c-1.3 0-2.5.1-3.7.4C67.6 10.7 60.5 5 52 5c-9.2 0-16.8 6.6-18.3 15.4A14 14 0 0 0 22 20C13.7 20 7 26.3 7 34s6.7 14 15 14Z"
        fill="#FFFFFF"
        opacity=".92"
      />
    </svg>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 2c1 8 6 13 14 14-8 1-13 6-14 14-1-8-6-13-14-14 8-1 13-6 14-14Z" fill="#FFD166" opacity=".85" />
    </svg>
  );
}

/** Волнистый край секции, как рябь на воде: закрашен currentColor. */
export function Ripple({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden>
      <path d="M0 56h1440V24c-90 14-180 18-270 10S990 10 900 12 720 34 630 36 450 20 360 14 180 16 90 26 0 30 0 30Z" fill="currentColor" />
    </svg>
  );
}
