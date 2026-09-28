'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Locale } from '@/lib/i18n';

const T = {
  chooseOne: { kk: 'Файлды таңдау', ru: 'Выбрать файл' },
  chooseMany: { kk: 'Файлдарды таңдау', ru: 'Выбрать файлы' },
  none: { kk: 'Файл таңдалмаған', ru: 'Файл не выбран' },
  chosen: { kk: 'Таңдалды', ru: 'Выбрано' },
} as const;

/**
 * Поле выбора файла с подписями на языке админки. У браузерного поля
 * надпись («Choose File», «Выберите файл») — на языке Windows, а не сайта:
 * в казахской админке сотрудник видел английскую кнопку.
 *
 * Настоящее поле остаётся в форме и доступно с клавиатуры (спрятано
 * визуально, но не display:none — иначе браузер не покажет подсказку
 * «заполните поле» у обязательного файла). Имя, required, accept и onChange
 * работают как у обычного input.
 */
export function FileInput({
  id,
  name,
  locale,
  accept,
  multiple = false,
  required = false,
  disabled = false,
  onChange,
}: {
  id: string;
  name: string;
  locale: Locale;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);

  // После отправки React очищает форму — список выбранных тоже очищаем.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const clear = () => setNames([]);
    form.addEventListener('reset', clear);
    return () => form.removeEventListener('reset', clear);
  }, []);

  const summary = names.length === 0
    ? T.none[locale]
    : names.length === 1
      ? names[0]
      : `${T.chosen[locale]}: ${names.length} — ${names.join(', ')}`;

  return (
    <div data-file-field className="field flex items-center gap-3 py-2">
      <input
        ref={input}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        className="peer sr-only"
        onChange={(event) => {
          setNames(Array.from(event.target.files ?? [], (file) => file.name));
          onChange?.(event);
        }}
      />
      <label
        htmlFor={id}
        className={`btn-secondary shrink-0 px-3 py-1.5 text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
      >
        {multiple ? T.chooseMany[locale] : T.chooseOne[locale]}
      </label>
      {/* w-0 + flex-1: длинный список имён не распирает поле — иначе колонка
          формы растёт и наезжает на соседнюю (так было в «Документах»). */}
      <span className={`w-0 min-w-0 flex-1 truncate text-sm ${names.length ? 'text-ink' : 'text-muted'}`} title={names.join('\n')}>
        {summary}
      </span>
    </div>
  );
}
