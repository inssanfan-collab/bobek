'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/lib/i18n';

const T = {
  heading: { kk: 'Сайтта қалай көрінеді', ru: 'Как это увидят на сайте' },
  desktop: { kk: '🖥 Компьютер', ru: '🖥 Компьютер' },
  mobile: { kk: '📱 Телефон', ru: '📱 Телефон' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
  note: {
    kk: 'Сақталмаған өзгерістер де көрсетіледі. Сайттың тақырыбы мен төменгі бөлігі жасырылған.',
    ru: 'Показаны и несохранённые правки. Шапка и подвал сайта скрыты.',
  },
  untitled: { kk: 'Тақырыпсыз', ru: 'Без заголовка' },
} as const;

type Mode = 'desktop' | 'mobile';

/** Ширина окна, в которой показываем страницу: обычный ноутбук и обычный телефон. */
const WIDTH: Record<Mode, number> = { desktop: 1280, mobile: 390 };

/**
 * Предпросмотр текста в настоящих стилях сайта. Страница рисуется в iframe
 * нужной ширины: так срабатывают те же медиазапросы, что у родителя
 * на телефоне, — уменьшенная копия в div их бы не включила.
 *
 * Стили не собираются заново, а копируются со страницы админки: она живёт
 * на домене сада и уже несёт его палитру, шрифты и всю сборку Tailwind.
 * Скрипты во фрейме запрещены — текст ещё не прошёл серверную очистку.
 */
export function EditorPreview({
  html,
  title,
  locale,
  onClose,
}: {
  html: string;
  title: string;
  locale: Locale;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>('desktop');
  const [box, setBox] = useState({ width: 0, height: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  function fill() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    for (const attr of Array.from(document.documentElement.attributes)) {
      doc.documentElement.setAttribute(attr.name, attr.value);
    }
    doc.documentElement.setAttribute('lang', locale === 'kk' ? 'kk' : 'ru');
    doc.head.replaceChildren(
      ...Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((node) => node.cloneNode(true)),
    );
    doc.body.className = document.body.className;

    const main = doc.createElement('main');
    main.className = 'container-page py-8';
    const h1 = doc.createElement('h1');
    h1.className = 'font-display text-3xl font-extrabold sm:text-4xl';
    h1.textContent = title || T.untitled[locale];
    const body = doc.createElement('div');
    body.className = 'prose-content mt-6 max-w-3xl';
    body.innerHTML = html;
    main.append(h1, body);
    doc.body.replaceChildren(main);
  }

  // Страница шире места на экране — уменьшаем её целиком, как миниатюру.
  const width = WIDTH[mode];
  const mobile = mode === 'mobile';
  // У телефона рамка по 10px с каждой стороны и отступ сверху и снизу.
  const bezel = mobile ? 20 : 0;
  const available = { width: box.width - bezel - (mobile ? 16 : 0), height: box.height - bezel - (mobile ? 24 : 0) };
  const scale = available.width > 0 ? Math.min(1, available.width / width) : 1;
  const visibleHeight = mobile ? Math.min(800, available.height) : available.height;
  const frameHeight = visibleHeight / scale;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={T.heading[locale]}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-card shadow-lift">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-lg font-bold">{T.heading[locale]}</h2>
          <div className="flex rounded-xl border border-line p-0.5" role="group">
            {(['desktop', 'mobile'] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={mode === code}
                onClick={() => setMode(code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  mode === code ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft'
                }`}
              >
                {T[code][locale]}
              </button>
            ))}
          </div>
          <p className="hidden text-xs text-muted md:block">{T.note[locale]}</p>
          <button type="button" onClick={onClose} className="btn-secondary ml-auto">
            ✕ {T.close[locale]}
          </button>
        </div>

        <div ref={stageRef} className="relative flex-1 overflow-hidden bg-surface p-0">
          {box.width > 0 ? (
            <div
              className={`mx-auto overflow-hidden bg-white ${
                mobile ? 'mt-3 rounded-[2rem] border-[10px] border-ink shadow-lift' : ''
              }`}
              style={{ width: width * scale + bezel, height: visibleHeight + bezel }}
            >
              <iframe
                key={mode}
                ref={frameRef}
                title={T.heading[locale]}
                sandbox="allow-same-origin"
                srcDoc="<!doctype html><html><head></head><body></body></html>"
                onLoad={fill}
                style={{
                  width,
                  height: frameHeight,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  border: 0,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
