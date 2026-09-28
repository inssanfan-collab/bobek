/*
 * Фигуры «Конструктора»: арка, квадрат и круг — как деревянные кубики.
 * Знак сада (если своего логотипа нет) и украшения по краям.
 */

/** Знак: синяя арка, жёлтый квадрат и красный круг в рамке. */
export function KonMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 56" fill="none" aria-hidden>
      <rect x="2" y="2" width="92" height="52" rx="14" fill="#FFFFFF" stroke="#14142B" strokeWidth="3" />
      <path d="M12 44V28a10 10 0 0 1 20 0v16Z" fill="#2F5BEA" stroke="#14142B" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="38" y="20" width="20" height="24" rx="3" fill="#FFC53D" stroke="#14142B" strokeWidth="2.5" />
      <circle cx="74" cy="32" r="11" fill="#D23A22" stroke="#14142B" strokeWidth="2.5" />
    </svg>
  );
}

/** Три кубика в ряд — украшение подвала. */
export function KonBlocksRow({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 150 40" fill="none" aria-hidden>
      <path d="M4 38V22a14 14 0 0 1 28 0v16Z" fill="#2F5BEA" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="44" y="12" width="26" height="26" rx="4" fill="#FFC53D" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="96" cy="25" r="13" fill="#D23A22" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M122 38 134 14l12 24Z" fill="#2BC48A" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
