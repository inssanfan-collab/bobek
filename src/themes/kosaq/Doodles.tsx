/*
 * Рисунки «Қосақ» (образец №5): рамка-«ромашка» для круглых фото,
 * солнце линией, радуга, самолётик, облачные значки, зелёная волна под
 * заголовком, галочки. Все — aria-hidden.
 */

/** Контур «ромашки» в долях 0…1: круг из выпуклостей. */
function scallopPath(count: number, radius: number): string {
  const point = (index: number) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return [0.5 + radius * Math.cos(angle), 0.5 + radius * Math.sin(angle)];
  };
  const [x0, y0] = point(0);
  const chord = 2 * radius * Math.sin(Math.PI / count);
  const bump = (chord / 2) * 1.08;
  let d = `M${x0.toFixed(4)} ${y0.toFixed(4)}`;
  for (let index = 1; index <= count; index += 1) {
    const [x, y] = point(index);
    d += `A${bump.toFixed(4)} ${bump.toFixed(4)} 0 0 1 ${x.toFixed(4)} ${y.toFixed(4)}`;
  }
  return `${d}Z`;
}

// Выпуклости должны уместиться в рамку элемента: 0,41 + выпуклость ≈ 0,5.
const SCALLOP = scallopPath(16, 0.41);

/** Определение формы — один раз на странице; используют классы .kosaq-scallop. */
export function ScallopDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id="kosaq-scallop" clipPathUnits="objectBoundingBox">
          <path d={SCALLOP} />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Sun({ className, color = '#F0447C' }: { className?: string; color?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" aria-hidden>
      <circle cx="50" cy="50" r="18" />
      <path d="M50 8v14M50 78v14M8 50h14M78 50h14M20 20l10 10M70 70l10 10M20 80l10-10M70 30l10-10" />
      <path d="M43 47h.01M57 47h.01M44 56c4 3 8 3 12 0" strokeWidth="3.5" />
    </svg>
  );
}

/** Солнце с рожицей — заливкой, у фото «О нас». */
export function SunFace({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 100 100" aria-hidden>
      <g stroke="#F43F5E" strokeWidth="4" strokeLinecap="round">
        <path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M19 81l8-8M73 27l8-8" />
      </g>
      <circle cx="50" cy="50" r="22" fill="#FB7185" />
      <circle cx="42" cy="46" r="2.6" fill="#7F1D1D" />
      <circle cx="58" cy="46" r="2.6" fill="#7F1D1D" />
      <path d="M41 56c5 5 13 5 18 0" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Rainbow({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 200 110" fill="none" strokeWidth="12" aria-hidden>
      <path d="M14 106a86 86 0 0 1 172 0" stroke="#FBCFE8" />
      <path d="M26 106a74 74 0 0 1 148 0" stroke="#FDE68A" />
      <path d="M38 106a62 62 0 0 1 124 0" stroke="#BBF7D0" />
      <path d="M50 106a50 50 0 0 1 100 0" stroke="#BAE6FD" />
    </svg>
  );
}

export function Plane({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 60 40" fill="none" stroke="#F0447C" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="m3 20 54-17-16 34-9-11Z M32 26l25-23" />
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 64" aria-hidden>
      <path d="M26 58h70c11 0 19-8 19-18s-8-18-19-18h-1C92 11 82 4 70 4 58 4 48 12 46 23a17 17 0 0 0-28 7C9 30 3 37 3 44s8 14 23 14Z" fill="#fff" />
    </svg>
  );
}

/** Зелёная волна под заголовком секции. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 80 14" fill="none" aria-hidden>
      <path d="M3 9c12-8 24-8 37-3s25 5 37-3" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="m3 10 4.5 4.5L17 4" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  child: 'M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 10l5 1 5-1M12 11v5M9 21l3-5 3 5',
  teacher: 'M8 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM4 21a7 7 0 0 1 14 0M18 4h3v6h-3',
  event: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4M9 15l2 2 4-4',
  binoculars: 'M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM9 17h6M5 14l2-8h3l1 8M19 14l-2-8h-3l-1 8',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.5-1-2 0-3s3 0 4-1 3-3 3-5c0-4-4-7-9-7ZM7.5 11h.01M10 7h.01M15 7h.01M17 11h.01',
  star: 'm12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8Z',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  abacus: 'M4 4v16M20 4v16M4 8h16M4 12h16M4 16h16M8 6v4M12 10v4M15 14v4',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  chevron: 'm6 9 6 6 6-6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
};

export function Icon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.star} />
    </svg>
  );
}

/** Значок в облачке-контуре, как у шести пунктов образца. */
export function CloudBadge({ name, color }: { name: string; color: string }) {
  return (
    <span className="kosaq-badge" style={{ color }} aria-hidden>
      <svg viewBox="0 0 80 64" className="kosaq-badge-cloud" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M20 56h40c9 0 16-7 16-15 0-7-5-13-12-14 0-10-8-18-18-18-7 0-13 4-16 10-2-1-4-2-6-2-7 0-13 6-13 13v1C6 32 3 37 3 42c0 8 7 14 17 14Z" fill={`${color}14`} />
      </svg>
      <Icon name={name} className="kosaq-badge-icon" />
    </span>
  );
}
