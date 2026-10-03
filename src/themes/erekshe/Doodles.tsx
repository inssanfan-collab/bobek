/* Рисунки «Ерекше» (образец №6): облако контуром, искры у слова, точки-маркеры. Все — aria-hidden. */

/** Облако контуром — над кругом с фото. */
export function CloudOutline({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 80" fill="none" aria-hidden>
      <path d="M28 70h62c13 0 23-9 23-21s-10-21-23-21h-1C87 14 75 5 61 5 47 5 36 14 33 27h-2C17 27 6 36 6 48s10 22 22 22Z" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round" />
      <path d="M28 70h62c13 0 23-9 23-21" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" transform="translate(4 4)" />
    </svg>
  );
}

/** Три штриха-искры у выделенного слова. */
export function Sparks({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 30 30" fill="none" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M6 20 2 26M14 18l-1 8M21 20l5 4" />
    </svg>
  );
}

/** Знак вместо логотипа: разноцветный кружок с ростком. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#22D3EE" />
      <path d="M24 36V22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 24c0-6-4-9-10-9 0 6 4 9 10 9Z" fill="#FACC15" />
      <path d="M24 22c0-6.5 4.5-10.5 11-10.5 0 6.5-4.5 10.5-11 10.5Z" fill="#F472B6" />
    </svg>
  );
}
