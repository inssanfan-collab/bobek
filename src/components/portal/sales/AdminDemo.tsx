'use client';

import { useEffect, useRef, useState } from 'react';
import type { GuideStep } from './StepPlayer';

export type DemoTask = {
  id: string;
  title: string;
  time: string | null;
  text: string;
  color: string;
  alt: string;
  path: string;
  /** Снимок экрана — показывается, если кадров инструкции нет. */
  still: string;
  /** Кадры из инструкции (public/guide/steps/<язык>/<дело>/) и адрес папки. */
  steps: GuideStep[] | null;
  base: string;
};

/** Размер окна, в котором снимались кадры (scripts/guide/record.ts). */
const W = 1280;
const H = 800;

/**
 * Живая админка на главной: настоящие кадры из инструкции сменяют друг
 * друга сами, курсор подъезжает к нужной кнопке и «нажимает», внизу —
 * подпись, что происходит. Дела идут по кругу: новость → меню → документы;
 * у текущего полоска показывает, сколько осталось.
 *
 * Крутится, только пока раздел на экране и мышь не над кадром (чтобы
 * дочитать подпись). При «уменьшить движение» — стоит, листается кликом.
 * Кадров нет (их копируют на сервер отдельно) — обычный снимок экрана.
 */
export function AdminDemo({ tasks, host, label, children }: { tasks: DemoTask[]; host: string; label: string; children?: React.ReactNode }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [still, setStill] = useState(true);
  const [clicked, setClicked] = useState(false);
  const cursor = useRef({ x: W * 0.62, y: H * 0.45 });
  const [pos, setPos] = useState(cursor.current);
  const box = useRef<HTMLDivElement>(null);

  const task = tasks[taskIndex]!;
  const steps = task.steps;
  const step = steps?.[stepIndex] ?? null;

  // Движение только для тех, кто его не отключал.
  useEffect(() => setStill(matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  // Показ идёт, пока раздел виден.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Курсор едет к цели шага, потом «щелчок».
  useEffect(() => {
    setClicked(false);
    if (!step?.box) return;
    const target = { x: step.box.x + Math.min(step.box.width / 2, 60), y: step.box.y + step.box.height / 2 };
    const move = window.setTimeout(() => { cursor.current = target; setPos(target); }, 60);
    const click = step.action === 'look' ? 0 : window.setTimeout(() => setClicked(true), 850);
    return () => { clearTimeout(move); clearTimeout(click); };
  }, [step]);

  // Следующий шаг — сам; после последнего — следующее дело.
  useEffect(() => {
    if (!visible || hover || still) return;
    const hold = step ? Math.min(4200, Math.max(2300, step.caption.length * 38 + 1300)) : 5200;
    const timer = window.setTimeout(() => {
      if (steps && stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        setTaskIndex((taskIndex + 1) % tasks.length);
        setStepIndex(0);
      }
    }, hold);
    return () => clearTimeout(timer);
  }, [visible, hover, still, step, steps, stepIndex, taskIndex, tasks.length]);

  // Следующий кадр — заранее, чтобы при смене не мигало.
  useEffect(() => {
    const next = steps?.[stepIndex + 1] ?? tasks[(taskIndex + 1) % tasks.length]?.steps?.[0];
    const base = steps?.[stepIndex + 1] ? task.base : tasks[(taskIndex + 1) % tasks.length]?.base;
    if (next && base) new Image().src = `${base}${next.img}`;
  }, [steps, stepIndex, taskIndex, tasks, task.base]);

  const choose = (i: number) => { setTaskIndex(i); setStepIndex(0); };
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const progress = steps ? (stepIndex + 1) / steps.length : 1;

  return (
    <div className="admin" ref={box}>
      <div>
        <div className="tasks" role="tablist" aria-label={label} data-self>
          {tasks.map((t, i) => (
            <button
              key={t.id}
              className="task"
              type="button"
              role="tab"
              id={`task-tab-${t.id}`}
              aria-controls="task-screen"
              aria-selected={i === taskIndex}
              onClick={() => choose(i)}
            >
              <span className="n" style={{ '--nc': t.color } as React.CSSProperties}>{i + 1}</span>
              <b>{t.title}{t.time ? <small>{t.time}</small> : null}</b>
              <span>{t.text}</span>
              {i === taskIndex && steps ? <i className="task-progress" style={{ '--p': progress } as React.CSSProperties} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
        {children}
      </div>
      <div className="stage">
        <div className="frame" role="tabpanel" id="task-screen" aria-labelledby={`task-tab-${task.id}`}>
          <div className="browser">
            <div className="bar">
              <i /><i /><i />
              <span className="url">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z" /></svg>
                {host}{task.path}
              </span>
            </div>
            {step ? (
              <div
                className="live-screen"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => (steps && stepIndex < steps.length - 1 ? setStepIndex(stepIndex + 1) : choose((taskIndex + 1) % tasks.length))}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={`${task.id}-${stepIndex}`} src={`${task.base}${step.img}`} alt={task.alt} width={W} height={H} />
                {step.box ? (
                  <span
                    key={`box-${task.id}-${stepIndex}`}
                    className="stepper-box"
                    style={{ left: pct(step.box.x - 6, W), top: pct(step.box.y - 6, H), width: pct(step.box.width + 12, W), height: pct(step.box.height + 12, H) }}
                  />
                ) : null}
                {clicked ? <span key={`ring-${task.id}-${stepIndex}`} className="stepper-ring" style={{ left: pct(pos.x, W), top: pct(pos.y, H) }} /> : null}
                <svg className="stepper-cursor" viewBox="0 0 24 24" style={{ left: pct(pos.x, W), top: pct(pos.y, H) }} aria-hidden="true">
                  <path d="M4 2.5 20 13l-7 .9L17 21l-3.2 1.5-4-7.3L4 20.5z" fill="#fff" stroke="#3A3363" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                <p key={`cap-${task.id}-${stepIndex}`} className="live-cap" aria-live="polite">
                  <b>{stepIndex + 1}</b>
                  <span dangerouslySetInnerHTML={{ __html: step.caption }} />
                </p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={task.still} width={1280} height={800} alt={task.alt} loading="lazy" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
