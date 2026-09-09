'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';

export type PickableMedia = { id: string; origName: string };

/**
 * Выбор обложки: либо загрузить файл прямо здесь, либо взять уже загруженный.
 * Библиотека показывается по кнопке — воспитателю не нужен экран с сотней картинок,
 * пока он просто пишет новость.
 */
const T = {
  cover: { kk: 'Мұқаба', ru: 'Обложка' },
  remove: { kk: 'Мұқабаны алып тастау', ru: 'Убрать обложку' },
  none: {
    kk: 'Мұқаба таңдалмаған — тізімде жаңалық түсті фонмен көрсетіледі.',
    ru: 'Обложка не выбрана — в списке новость покажется с цветной заливкой.',
  },
  upload: { kk: 'Жаңа фото жүктеу', ru: 'Загрузить новое фото' },
  hideLibrary: { kk: 'Жүктелгендерді жасыру', ru: 'Скрыть загруженные' },
  openLibrary: { kk: 'Жүктелгендерден таңдау', ru: 'Выбрать из загруженных' },
} as const;

export function CoverPicker({
  name = 'coverMediaId',
  fileName = 'coverFile',
  defaultMediaId = '',
  library,
  disabled = false,
  locale,
}: {
  name?: string;
  fileName?: string;
  defaultMediaId?: string;
  library: PickableMedia[];
  disabled?: boolean;
  locale: Locale;
}) {
  const [selected, setSelected] = useState(defaultMediaId);
  const [preview, setPreview] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const currentSrc = preview ?? (selected ? `/api/media/${selected}` : null);

  return (
    <div>
      <span className="field-label">{T.cover[locale]}</span>

      {currentSrc ? (
        <div className="mb-3 flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentSrc} alt="" className="h-32 w-48 rounded-2xl border border-line object-cover" />
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelected('');
              setPreview(null);
            }}
            className="btn-ghost text-sm text-red-600"
          >
            {T.remove[locale]}
          </button>
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted">{T.none[locale]}</p>
      )}

      <input type="hidden" name={name} value={selected} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="field-hint mb-1 block" htmlFor={fileName}>{T.upload[locale]}</label>
          <input
            id={fileName}
            name={fileName}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="field"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return setPreview(null);
              // Локальный предпросмотр до сохранения: файл уходит на сервер вместе с формой.
              setPreview(URL.createObjectURL(file));
              setSelected('');
            }}
          />
        </div>

        {library.length > 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setLibraryOpen((open) => !open)}
            className="btn-secondary text-sm"
          >
            {libraryOpen ? T.hideLibrary[locale] : T.openLibrary[locale]}
          </button>
        ) : null}
      </div>

      {libraryOpen ? (
        <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-line p-3 sm:grid-cols-5">
          {library.map((media) => (
            <button
              key={media.id}
              type="button"
              title={media.origName}
              onClick={() => {
                setSelected(media.id);
                setPreview(null);
                setLibraryOpen(false);
              }}
              className={`overflow-hidden rounded-xl border-2 transition ${
                selected === media.id ? 'border-brand' : 'border-transparent hover:border-line'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/${media.id}`} alt={media.origName} className="h-20 w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
