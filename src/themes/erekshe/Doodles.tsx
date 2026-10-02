/* Рисунки «Ерекше»: росчерк-подчёркивание, звёздочка и знак-логотип. Украшения — aria-hidden. */

export function Scribble({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 220 16" fill="none" aria-hidden>
      <path d="M3 11c34-7 72-9 110-5s70 4 104-3" stroke="#FFD25A" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#F07A2E" />
      <path d="m24 12 3.4 7.3 8 .9-5.9 5.4 1.6 7.9L24 29.6l-7.1 3.9 1.6-7.9-5.9-5.4 8-.9Z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Знак вместо логотипа: разноцветный кружок с ростком. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#2F80ED" />
      <path d="M24 36V22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 24c0-6-4-9-10-9 0 6 4 9 10 9Z" fill="#FFD25A" />
      <path d="M24 22c0-6.5 4.5-10.5 11-10.5 0 6.5-4.5 10.5-11 10.5Z" fill="#F07A2E" />
    </svg>
  );
}
