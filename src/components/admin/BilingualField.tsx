'use client';

import { useState, type ReactNode } from 'react';

/**
 * Вкладки ҚАЗ/РУС в одной форме. Оба поля отправляются всегда — переключение
 * только прячет одно из них, поэтому случайно потерять перевод нельзя.
 */
export function BilingualField({
  label,
  hint,
  kk,
  ru,
}: {
  label: string;
  hint?: string;
  kk: ReactNode;
  ru: ReactNode;
}) {
  const [tab, setTab] = useState<'ru' | 'kk'>('ru');

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-ink">{label}</span>
        <div className="flex rounded-lg border border-line p-0.5" role="tablist">
          {(['ru', 'kk'] as const).map((code) => (
            <button
              key={code}
              type="button"
              role="tab"
              aria-selected={tab === code}
              onClick={() => setTab(code)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                tab === code ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft'
              }`}
            >
              {code === 'ru' ? 'РУС' : 'ҚАЗ'}
            </button>
          ))}
        </div>
      </div>

      <div hidden={tab !== 'ru'}>{ru}</div>
      <div hidden={tab !== 'kk'}>{kk}</div>

      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
