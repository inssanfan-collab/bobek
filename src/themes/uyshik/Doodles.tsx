/*
 * Рисованные детали «Үйшік»: знак-домик для шапки, флажок на крыше, облачко
 * и солнце. Цвета — переменные темы; все украшения aria-hidden и в версии
 * для слабовидящих прячутся классом decor.
 */
import type { CSSProperties } from 'react';

const fill = (name: string): CSSProperties => ({ fill: `rgb(var(--uyshik-${name}))` });

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="9" y="22" width="30" height="20" rx="2" style={fill('mustard')} />
      <path d="M4 24 24 7l20 17z" style={fill('roof')} />
      <rect x="31" y="9" width="5" height="9" style={fill('plum')} />
      <path d="M20 42V32a4 4 0 0 1 8 0v10z" style={fill('teal')} />
      <rect x="12" y="27" width="6" height="6" rx="1" style={fill('cream')} />
      <rect x="30" y="27" width="6" height="6" rx="1" style={fill('cream')} />
    </svg>
  );
}

export function Flag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 64" className={`decor ${className ?? ''}`} aria-hidden>
      <path d="M8 4v58" stroke="rgb(var(--uyshik-plum))" strokeWidth="3" strokeLinecap="round" />
      {/* Жёлтый с красной полосой: бирюзовый с жёлтым кругом читался как флаг страны,
          а государственный символ тема рисовать не должна. */}
      <path d="M10 6c8-3 14 3 22 0v18c-8 3-14-3-22 0z" style={fill('mustard')} />
      <path d="M10 12.5c8-3 14 3 22 0v5c-8 3-14-3-22 0z" style={fill('roof')} />
    </svg>
  );
}

export function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={`decor ${className ?? ''}`} aria-hidden>
      <path d="M26 54a20 20 0 0 1-2-39.9A28 28 0 0 1 77 12a22 22 0 0 1 21 27 15 15 0 0 1-4 15z" style={fill('white')} />
    </svg>
  );
}

export function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`decor ${className ?? ''}`} aria-hidden>
      <g stroke="rgb(var(--uyshik-mustard))" strokeWidth="5" strokeLinecap="round">
        <path d="M40 4v10M40 66v10M4 40h10M66 40h10M14.5 14.5l7 7M58.5 58.5l7 7M65.5 14.5l-7 7M21.5 58.5l-7 7" />
      </g>
      <circle cx="40" cy="40" r="17" style={fill('mustard')} />
    </svg>
  );
}
