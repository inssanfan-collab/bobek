/*
 * Рисунки «Мамық» (образец №9): рамка-«ромашка» для круглых фото,
 * линейные розовые рисунки (солнце, цветок, бабочка, звезда, самолётик,
 * домик, вертушка), значки разделов. Все — aria-hidden.
 */

/** Контур «ромашки» в долях 0…1: круг из мелких выпуклостей. */
function scallopPath(count: number, radius: number): string {
  const point = (index: number) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return [0.5 + radius * Math.cos(angle), 0.5 + radius * Math.sin(angle)];
  };
  const [x0, y0] = point(0);
  const bump = radius * Math.sin(Math.PI / count) * 1.1;
  let d = `M${x0.toFixed(4)} ${y0.toFixed(4)}`;
  for (let index = 1; index <= count; index += 1) {
    const [x, y] = point(index);
    d += `A${bump.toFixed(4)} ${bump.toFixed(4)} 0 0 1 ${x.toFixed(4)} ${y.toFixed(4)}`;
  }
  return `${d}Z`;
}

// Выпуклости должны уместиться в рамку элемента: 0,42 + выпуклость ≈ 0,5.
const SCALLOP = scallopPath(18, 0.42);

export function ScallopDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id="mamyq-scallop" clipPathUnits="objectBoundingBox">
          <path d={SCALLOP} />
        </clipPath>
      </defs>
    </svg>
  );
}

const LINE = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function SunLine({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 100 100" stroke="#F9C27A" {...LINE} aria-hidden>
      <circle cx="50" cy="50" r="16" />
      <path d="M50 10v14M50 76v14M10 50h14M76 50h14M22 22l10 10M68 68l10 10M22 78l10-10M68 32l10-10" />
    </svg>
  );
}

export function FlowerLine({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 60 60" stroke="#F6D36B" {...LINE} aria-hidden>
      <circle cx="30" cy="30" r="6" />
      <path d="M30 24c-6-12 6-18 6-6M36 30c12-6 18 6 6 6M30 36c6 12-6 18-6 6M24 30c-12 6-18-6-6-6M34 26c8-8 16 0 6 6M34 34c8 8 0 16-6 6M26 34c-8 8-16 0-6-6M26 26c-8-8 0-16 6-6" />
    </svg>
  );
}

export function ButterflyLine({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 60 50" stroke="#C4B5FD" {...LINE} aria-hidden>
      <path d="M30 25C22 8 6 4 4 14s10 14 22 12C14 30 8 42 18 44s12-12 12-19ZM30 25c8-17 24-21 26-11S46 28 34 26c12 4 18 16 8 18s-12-12-12-19ZM30 16v22" />
    </svg>
  );
}

export function StarLine({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 60 60" stroke="#F9A8D4" {...LINE} aria-hidden>
      <path d="m30 6 7 15 16 2-12 11 3 16-14-8-14 8 3-16L7 23l16-2Z" />
    </svg>
  );
}

export function PlaneLine({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 80 50" stroke="#F9A8D4" {...LINE} aria-hidden>
      <path d="m4 26 72-22-22 42-12-14Zm38 6L76 4" />
    </svg>
  );
}

/** Значки миссии — линией, розовым, как в образце. */
const MISSION: Record<string, string> = {
  house: 'M8 30 32 10l24 20M14 26v28h36V26M26 54V40h12v14M24 30h6v6h-6zM34 30h6v6h-6z',
  sun: 'M32 22a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM32 6v8M32 50v8M6 32h8M50 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6',
  pinwheel: 'M32 32V58M32 32C32 18 40 10 50 12 48 22 42 30 32 32ZM32 32C46 32 54 40 52 50 42 48 34 42 32 32ZM32 32C18 32 10 24 12 14 22 16 30 22 32 32Z',
};

export function MissionIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 64 64" className="mamyq-mission-icon" stroke="#DB2777" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={MISSION[name] ?? MISSION.sun} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12l3 3 5-6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21ZM12 7.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  phone: 'M7 2.5h10v19H7zM11 18.5h2',
  chat: 'M4 5h16v11H9l-5 4Z',
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z',
  group: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0',
};

export function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.sparkle} />
    </svg>
  );
}
