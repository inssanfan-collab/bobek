/*
 * Орнамент «Далы» — қошқар мүйіз (бараний рог): два завитка от общего
 * стебля. Тот же мотив, что у узора «Ою-өрнек» в «Оформлении», только
 * линией в цвет темы. Рисуется тонко и редко — как разделитель и знак,
 * а не сплошным ковром: иначе сайт становится сувенирным.
 */

const HORN = (
  <>
    <path d="M60 88V62" />
    <path d="M60 62C60 44 68 34 82 34 95 34 104 43 104 55c0 10-7 17-15 17-7 0-12-5-12-11 0-5 4-9 9-8" />
    <path d="M60 62C60 44 52 34 38 34 25 34 16 43 16 55c0 10 7 17 15 17 7 0 12-5 12-11 0-5-4-9-9-8" />
    <circle cx="60" cy="96" r="3.5" />
  </>
);

/** Знак сада, когда своего логотипа нет: рог в круге. */
export function DalaMark({ className }: { className?: string }) {
  return (
    <span className={`dala-mark ${className ?? ''}`} aria-hidden>
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {HORN}
      </svg>
    </span>
  );
}

/** Разделитель секций: линия — рог — линия. */
export function DalaDivider() {
  return (
    <div className="dala-divider decor" aria-hidden>
      <span />
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {HORN}
      </svg>
      <span />
    </div>
  );
}

/** Уголок-завиток у фотографии первого экрана. */
export function DalaCorner({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {HORN}
    </svg>
  );
}
