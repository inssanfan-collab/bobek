'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';

type Phrase = { kk: string; ru: string };
type Command = { label: Phrase; title: Phrase; run: (exec: (cmd: string, value?: string) => void) => void };

const T = {
  link: { kk: 'Сілтеме', ru: 'Ссылка' },
  linkPrompt: {
    kk: 'Сілтеме мекенжайы (мысалы, https://egov.kz)',
    ru: 'Адрес ссылки (например, https://egov.kz)',
  },
  text: { kk: 'Мәтін', ru: 'Текст' },
} as const;

const COMMANDS: Command[] = [
  { label: { kk: 'Ж', ru: 'Ж' }, title: { kk: 'Қалың', ru: 'Полужирный' }, run: (e) => e('bold') },
  { label: { kk: 'К', ru: 'К' }, title: { kk: 'Көлбеу', ru: 'Курсив' }, run: (e) => e('italic') },
  { label: { kk: 'H2', ru: 'H2' }, title: { kk: 'Ішкі тақырып', ru: 'Подзаголовок' }, run: (e) => e('formatBlock', 'h2') },
  { label: { kk: 'H3', ru: 'H3' }, title: { kk: 'Кіші ішкі тақырып', ru: 'Малый подзаголовок' }, run: (e) => e('formatBlock', 'h3') },
  { label: { kk: '¶', ru: '¶' }, title: { kk: 'Кәдімгі мәтін', ru: 'Обычный текст' }, run: (e) => e('formatBlock', 'p') },
  { label: { kk: '• Тізім', ru: '• Список' }, title: { kk: 'Таңбаланған тізім', ru: 'Маркированный список' }, run: (e) => e('insertUnorderedList') },
  { label: { kk: '1. Тізім', ru: '1. Список' }, title: { kk: 'Нөмірленген тізім', ru: 'Нумерованный список' }, run: (e) => e('insertOrderedList') },
];

/**
 * Простой визуальный редактор на contenteditable. Намеренно без тяжёлой библиотеки:
 * сотруднику сада нужны жирный, списки, подзаголовки и ссылка, а всё остальное
 * только мешает. HTML в любом случае санитизируется на сервере при сохранении.
 */
export function RichText({
  name,
  defaultValue = '',
  placeholder,
  disabled = false,
  locale,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  locale: Locale;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
    // Значение приходит с сервера один раз при монтировании формы.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, argument?: string) {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    sync();
  }

  function sync() {
    setValue(editorRef.current?.innerHTML ?? '');
  }

  function addLink() {
    const url = window.prompt(T.linkPrompt[locale]);
    if (url) exec('createLink', url);
  }

  return (
    <div className={`rounded-xl border border-line bg-card ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap gap-1 border-b border-line p-2">
        {COMMANDS.map((command) => (
          <button
            key={command.label.ru}
            type="button"
            title={command.title[locale]}
            disabled={disabled}
            onClick={() => command.run(exec)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand-ink"
          >
            {command.label[locale]}
          </button>
        ))}
        <button
          type="button"
          title={T.link[locale]}
          disabled={disabled}
          onClick={addLink}
          className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand-ink"
        >
          🔗
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder ?? T.text[locale]}
        data-placeholder={placeholder}
        onInput={sync}
        onBlur={sync}
        onPaste={(event) => {
          // Вставка из Word тащит горы разметки — берём только текст.
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          sync();
        }}
        className="prose-content min-h-48 px-4 py-3 focus:outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
      />

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
