'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { StepPlayer, type GuideStep } from './StepPlayer';

const T = {
  video: { kk: 'Бейне', ru: 'Видео' },
  steps: { kk: 'Қадамдап', ru: 'По шагам' },
  view: { kk: 'Қалай көрсету', ru: 'Как показать' },
} as const;

/**
 * Одно дело в инструкции: ролик или те же шаги по одному. Ролик грузится,
 * только когда его запустили (preload="none"): на странице их десяток,
 * и заведующей с мобильного интернета не нужно качать все сразу.
 */
export function GuideTask({
  id,
  title,
  sub,
  video,
  poster,
  steps,
  stepsBase,
  locale,
}: {
  id: string;
  title: string;
  sub: string;
  video: string | null;
  poster: string | null;
  steps: GuideStep[] | null;
  stepsBase: string;
  locale: Locale;
}) {
  const [mode, setMode] = useState<'video' | 'steps'>(video ? 'video' : 'steps');

  return (
    <section className="guide-task" id={id}>
      <div className="guide-head">
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
        {video && steps ? (
          <div className="guide-tabs" role="tablist" aria-label={T.view[locale]}>
            {(['video', 'steps'] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
                {m === 'video' ? T.video[locale] : T.steps[locale]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {mode === 'video' && video ? (
        <video className="guide-video" controls preload="none" playsInline poster={poster ?? undefined} src={video} />
      ) : steps ? (
        // Подписи шагов — наши же строки из scripts/guide/scenarios.ts
        // (жирным выделены названия кнопок), чужой текст сюда не попадает.
        <StepPlayer steps={steps} base={stepsBase} locale={locale} />
      ) : null}
    </section>
  );
}
