'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/lib/i18n';

const T = {
  zoom: { kk: 'Суретті үлкейту', ru: 'Увеличить фото' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
  prev: { kk: 'Алдыңғы сурет', ru: 'Предыдущее фото' },
  next: { kk: 'Келесі сурет', ru: 'Следующее фото' },
} as const;

/** Расстояние в пикселях, после которого движение пальцем считается перелистыванием. */
const SWIPE = 50;

type Photo = { src: string; alt: string };

/**
 * Увеличение фотографий по нажатию. Оборачивает готовую разметку и сама
 * находит в ней снимки: помеченные `data-zoom` и все, что сад вставил
 * в текст записи (`.prose-content`). Список в пропсах пришлось бы собирать
 * отдельно от разметки — а текст записи приходит уже готовым HTML,
 * и разобрать его на стороне сервера значило бы описывать картинки дважды.
 *
 * Снимки внутри ссылок пропускаются: обложка новости в ленте ведёт
 * на саму новость, и подменять переход увеличением нельзя.
 */
export function PhotoZoom({ locale, children }: { locale: Locale; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  const collect = useCallback((): HTMLImageElement[] => {
    const host = hostRef.current;
    if (!host) return [];
    const found = host.querySelectorAll<HTMLImageElement>('img[data-zoom], .prose-content img');
    return Array.from(found).filter((img) => !img.closest('a'));
  }, []);

  // Курсор и доступность с клавиатуры проставляем на готовых узлах:
  // разметку рисует сервер, а <img> сам по себе фокус не принимает.
  useEffect(() => {
    for (const img of collect()) {
      img.classList.add('cursor-zoom-in');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', img.alt ? `${T.zoom[locale]}: ${img.alt}` : T.zoom[locale]);
    }
  }, [collect, locale]);

  const openFrom = useCallback(
    (img: HTMLImageElement) => {
      const items = collect();
      const index = items.indexOf(img);
      if (index < 0) return;
      openerRef.current = img;
      setPhotos(items.map((el) => ({ src: el.currentSrc || el.src, alt: el.alt })));
      setCurrent(index);
    },
    [collect],
  );

  const close = useCallback(() => {
    setCurrent(null);
    // Возвращаем фокус туда, откуда открыли, иначе после закрытия
    // клавиатура начнёт обход страницы заново.
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  // Листаем по кругу: из последнего снимка альбома стрелка ведёт к первому.
  const go = useCallback(
    (delta: number) => {
      setCurrent((prev) => (prev === null ? prev : (prev + delta + photos.length) % photos.length));
    },
    [photos.length],
  );

  useEffect(() => {
    if (current === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'ArrowLeft') go(-1);
    };

    document.addEventListener('keydown', onKey);
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = scroll;
    };
  }, [current, close, go]);

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const img = (event.target as HTMLElement).closest('img');
    if (!(img instanceof HTMLImageElement) || img.closest('a')) return;
    if (!img.matches('[data-zoom]') && !img.closest('.prose-content')) return;
    event.preventDefault();
    openFrom(img);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.getAttribute('role') !== 'button') return;
    event.preventDefault();
    openFrom(img);
  };

  const photo = current === null ? null : photos[current];
  const position = current === null ? 0 : current + 1;

  return (
    <div ref={hostRef} onClick={onClick} onKeyDown={onKeyDown}>
      {children}

      {photo && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={photo.alt || T.zoom[locale]}
              className="fixed inset-0 z-[100] flex flex-col bg-black/90"
              onClick={(event) => {
                // Закрываем по фону, но не по самому снимку.
                if (event.target === event.currentTarget) close();
              }}
              onTouchStart={(event) => {
                touchX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const start = touchX.current;
                const end = event.changedTouches[0]?.clientX;
                touchX.current = null;
                if (start === null || end === undefined || photos.length < 2) return;
                if (Math.abs(end - start) > SWIPE) go(end < start ? 1 : -1);
              }}
            >
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-white">
                <span className="text-sm text-white/70">
                  {photos.length > 1 ? `${position} / ${photos.length}` : ''}
                </span>
                <button
                  type="button"
                  onClick={close}
                  autoFocus
                  aria-label={T.close[locale]}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>

              <div
                className="flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
                onClick={(event) => {
                  if (event.target === event.currentTarget) close();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- тот же файл, что уже показан на странице */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>

              {photo.alt ? (
                <p className="px-4 pb-2 text-center text-sm text-white/80">{photo.alt}</p>
              ) : null}

              {photos.length > 1 ? (
                <>
                  <ArrowButton side="left" label={T.prev[locale]} onClick={() => go(-1)} />
                  <ArrowButton side="right" label={T.next[locale]} onClick={() => go(1)} />
                </>
              ) : null}

              <div className="h-4" />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function ArrowButton({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20 ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {side === 'left' ? '‹' : '›'}
    </button>
  );
}
