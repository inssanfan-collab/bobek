'use client';

import type { Locale } from '@/lib/i18n';
import { PALETTES, PRESETS } from '@/lib/templates';

const T = {
  hint: {
    kk: 'Басыңыз — төмендегі баптаулар толтырылады. Кез келген бөлігін кейін өзгертуге болады, содан кейін «Сақтау».',
    ru: 'Нажмите — настройки ниже заполнятся. Любую часть можно поправить, потом «Сохранить».',
  },
  applied: { kk: 'Қолданылды — енді сақтаңыз', ru: 'Применено — теперь сохраните' },
} as const;

type Preset = (typeof PRESETS)[number];

/**
 * Готовые стили. Ничего не сохраняет сам — только отмечает нужные варианты
 * в форме ниже: заведующая видит, что поменялось, и может поправить.
 */
export function PresetPicker({ locale }: { locale: Locale }) {
  function apply(preset: Preset, button: HTMLButtonElement) {
    const form = button.closest('form');
    if (!form) return;
    const values: Record<string, string> = {
      templateCode: preset.templateCode,
      palette: preset.palette,
      pattern: preset.pattern,
      fontPair: preset.fontPair,
      shape: preset.shape,
      headerStyle: preset.headerStyle,
      headerLayout: preset.headerLayout,
    };
    for (const [name, value] of Object.entries(values)) {
      const input = form.querySelector<HTMLInputElement>(`input[type="radio"][name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    }
    form.querySelectorAll('[data-preset-status]').forEach((el) => {
      el.textContent = '';
    });
    const status = button.parentElement?.querySelector('[data-preset-status]');
    if (status) status.textContent = T.applied[locale];
  }

  return (
    <div>
      <p className="text-sm text-muted">{T.hint[locale]}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRESETS.map((preset) => {
          const palette = PALETTES.find((p) => p.code === preset.palette);
          return (
            <div key={preset.code}>
              <button
                type="button"
                onClick={(event) => apply(preset, event.currentTarget)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left transition hover:border-brand hover:shadow-soft"
              >
                <span className="flex shrink-0 -space-x-2" aria-hidden>
                  <span className="h-8 w-8 rounded-full ring-2 ring-card" style={{ background: palette?.swatch }} />
                  <span className="h-8 w-8 rounded-full ring-2 ring-card" style={{ background: palette?.accent }} />
                </span>
                <span className="font-semibold">{locale === 'kk' ? preset.nameKk : preset.nameRu}</span>
              </button>
              <p data-preset-status className="mt-1 min-h-4 text-xs font-semibold text-brand-ink" aria-live="polite" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
