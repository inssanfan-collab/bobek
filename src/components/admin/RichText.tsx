'use client';

import { useEffect, useRef, useState } from 'react';

type Command = { label: string; title: string; run: (exec: (cmd: string, value?: string) => void) => void };

const COMMANDS: Command[] = [
  { label: 'Ж', title: 'Полужирный', run: (e) => e('bold') },
  { label: 'К', title: 'Курсив', run: (e) => e('italic') },
  { label: 'H2', title: 'Подзаголовок', run: (e) => e('formatBlock', 'h2') },
  { label: 'H3', title: 'Малый подзаголовок', run: (e) => e('formatBlock', 'h3') },
  { label: '¶', title: 'Обычный текст', run: (e) => e('formatBlock', 'p') },
  { label: '• Список', title: 'Маркированный список', run: (e) => e('insertUnorderedList') },
  { label: '1. Список', title: 'Нумерованный список', run: (e) => e('insertOrderedList') },
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
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
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
    const url = window.prompt('Адрес ссылки (например, https://egov.kz)');
    if (url) exec('createLink', url);
  }

  return (
    <div className={`rounded-xl border border-line bg-card ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap gap-1 border-b border-line p-2">
        {COMMANDS.map((command) => (
          <button
            key={command.label}
            type="button"
            title={command.title}
            disabled={disabled}
            onClick={() => command.run(exec)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand-ink"
          >
            {command.label}
          </button>
        ))}
        <button
          type="button"
          title="Ссылка"
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
        aria-label={placeholder ?? 'Текст'}
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
