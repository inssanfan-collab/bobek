'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';

export type GuideStep = {
  img: string;
  caption: string;
  box: { x: number; y: number; width: number; height: number } | null;
  action: 'click' | 'type' | 'upload' | 'look';
};

const T = {
  prev: { kk: 'Артқа', ru: 'Назад' },
  next: { kk: 'Келесі', ru: 'Далее' },
  play: { kk: 'Өзі көрсетсін', ru: 'Показать подряд' },
  pause: { kk: 'Тоқтату', ru: 'Пауза' },
  again: { kk: 'Басынан', ru: 'Сначала' },
  step: { kk: 'қадам', ru: 'шаг' },
} as const;

/** Размер окна, в котором снимались кадры (scripts/guide/record.ts). */
const W = 1280;
const H = 800;

/**
 * Инструкция по шагам: снимок настоящей админки, курсор подъезжает к нужной
 * кнопке и «щёлкает», рядом — что сделать. Можно листать самому или
 * смотреть подряд. Кадры и подписи — из того же прогона, что и видео.
 */
export function StepPlayer({ steps, base, locale }: { steps: GuideStep[]; base: string; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [clicked, setClicked] = useState(false);
  const cursor = useRef({ x: W * 0.62, y: H * 0.45 });
  const [pos, setPos] = useState(cursor.current);
  const step = steps[index]!;
  const last = index === steps.length - 1;

  // Курсор едет к цели шага, потом «щелчок». Без цели — стоит, где был.
  useEffect(() => {
    setClicked(false);
    if (!step.box) return;
    const target = { x: step.box.x + Math.min(step.box.width / 2, 60), y: step.box.y + step.box.height / 2 };
    const move = window.setTimeout(() => { cursor.current = target; setPos(target); }, 80);
    const click = step.action === 'look' ? 0 : window.setTimeout(() => setClicked(true), 900);
    return () => { clearTimeout(move); clearTimeout(click); };
  }, [index, step]);

  // Показ подряд: шаг держится столько, чтобы успели прочитать подпись.
  useEffect(() => {
    if (!playing) return;
    if (last) { setPlaying(false); return; }
    const hold = Math.min(5200, Math.max(2600, step.caption.length * 55 + 1200));
    const timer = window.setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), hold);
    return () => clearTimeout(timer);
  }, [playing, index, last, step.caption.length, steps.length]);

  // Следующий кадр — заранее, чтобы при переходе не мигало белым.
  useEffect(() => {
    const next = steps[index + 1];
    if (next) new Image().src = `${base}${next.img}`;
  }, [index, steps, base]);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="stepper">
      <div className="stepper-screen" onClick={() => !last && setIndex(index + 1)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${base}${step.img}`} alt="" width={W} height={H} />
        {step.box ? (
          <span
            key={`box-${index}`}
            className="stepper-box"
            style={{ left: pct(step.box.x - 6, W), top: pct(step.box.y - 6, H), width: pct(step.box.width + 12, W), height: pct(step.box.height + 12, H) }}
          />
        ) : null}
        {clicked ? <span key={`ring-${index}`} className="stepper-ring" style={{ left: pct(pos.x, W), top: pct(pos.y, H) }} /> : null}
        <svg className="stepper-cursor" viewBox="0 0 24 24" style={{ left: pct(pos.x, W), top: pct(pos.y, H) }} aria-hidden="true">
          <path d="M4 2.5 20 13l-7 .9L17 21l-3.2 1.5-4-7.3L4 20.5z" fill="#fff" stroke="#15123A" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="stepper-bar">
        <p className="stepper-caption" aria-live="polite">
          <span className="stepper-num">{index + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: step.caption }} />
        </p>
        <div className="stepper-controls">
          <button type="button" className="sbtn sbtn-secondary" onClick={() => { setPlaying(false); setIndex(Math.max(0, index - 1)); }} disabled={index === 0}>
            ← {T.prev[locale]}
          </button>
          {last ? (
            <button type="button" className="sbtn sbtn-secondary" onClick={() => { setIndex(0); setPlaying(false); }}>{T.again[locale]}</button>
          ) : (
            <button type="button" className="sbtn sbtn-secondary" onClick={() => setPlaying(!playing)}>
              {playing ? T.pause[locale] : T.play[locale]}
            </button>
          )}
          <button type="button" className="sbtn sbtn-primary" onClick={() => { setPlaying(false); setIndex(Math.min(steps.length - 1, index + 1)); }} disabled={last}>
            {T.next[locale]} →
          </button>
          <span className="stepper-count">{index + 1} / {steps.length}</span>
        </div>
      </div>
    </div>
  );
}
