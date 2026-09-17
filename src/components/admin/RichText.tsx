'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { EditorPreview } from '@/components/admin/EditorPreview';

/** Ответ загрузки файла в текст: адрес готового файла или понятная ошибка. */
export type EditorUpload =
  | { url: string; name: string; image: boolean; width: number | null; height: number | null }
  | { error: string };

/**
 * Загрузка фото и файлов прямо в текст. Передаётся только там, где есть
 * куда складывать файлы, — в админке сада. Без неё кнопки «Фото» и «Файл»
 * просто не показываются.
 */
export type EditorUploadConfig = {
  action: (formData: FormData) => Promise<EditorUpload>;
  csrf: string;
  host: string;
};

type ImageLayout = '' | 'img-left' | 'img-right' | 'img-small';

const T = {
  undo: { kk: 'Болдырмау', ru: 'Отменить' },
  redo: { kk: 'Қайтару', ru: 'Повторить' },
  bold: { kk: 'Қалың', ru: 'Полужирный' },
  italic: { kk: 'Көлбеу', ru: 'Курсив' },
  underline: { kk: 'Асты сызылған', ru: 'Подчёркнутый' },
  strike: { kk: 'Сызылған', ru: 'Зачёркнутый' },
  h2: { kk: 'Ішкі тақырып', ru: 'Подзаголовок' },
  h3: { kk: 'Кіші ішкі тақырып', ru: 'Малый подзаголовок' },
  paragraph: { kk: 'Кәдімгі мәтін', ru: 'Обычный текст' },
  bullets: { kk: 'Таңбаланған тізім', ru: 'Маркированный список' },
  numbers: { kk: 'Нөмірленген тізім', ru: 'Нумерованный список' },
  quote: { kk: 'Дәйексөз немесе маңызды ескерту', ru: 'Цитата или важная заметка' },
  rule: { kk: 'Бөлгіш сызық', ru: 'Разделительная линия' },
  link: { kk: 'Сілтеме', ru: 'Ссылка' },
  unlink: { kk: 'Сілтемені алып тастау', ru: 'Убрать ссылку' },
  clear: { kk: 'Пішімдеуді тазалау', ru: 'Очистить оформление' },
  photo: { kk: 'Фото', ru: 'Фото' },
  photoTitle: { kk: 'Фото қосу (бірнешеуін таңдауға болады)', ru: 'Вставить фото (можно несколько сразу)' },
  file: { kk: 'Файл', ru: 'Файл' },
  fileTitle: { kk: 'PDF, Word немесе Excel файлын тіркеу', ru: 'Прикрепить PDF, Word или Excel' },
  table: { kk: 'Кесте', ru: 'Таблица' },
  preview: { kk: 'Алдын ала қарау', ru: 'Предпросмотр' },
  linkPrompt: {
    kk: 'Сілтеме мекенжайы (мысалы, darabala.kz)',
    ru: 'Адрес ссылки (например, darabala.kz)',
  },
  text: { kk: 'Мәтін', ru: 'Текст' },
  uploading: { kk: 'Жүктеліп жатыр…', ru: 'Загружаем…' },
  uploadFailed: { kk: 'Жүктеу мүмкін болмады. Қайталап көріңіз.', ru: 'Не удалось загрузить. Попробуйте ещё раз.' },
  dropHint: {
    kk: 'Фотоны мәтінге сүйреп апаруға немесе көшіріп қоюға болады.',
    ru: 'Фото можно перетащить прямо в текст или вставить из буфера.',
  },
  imageTools: { kk: 'Фото:', ru: 'Фото:' },
  layoutFull: { kk: 'Толық ені', ru: 'Во всю ширину' },
  layoutLeft: { kk: 'Сол жақта, мәтін оң жақта', ru: 'Слева, текст справа' },
  layoutRight: { kk: 'Оң жақта, мәтін сол жақта', ru: 'Справа, текст слева' },
  layoutSmall: { kk: 'Кішкентай', ru: 'Маленькое' },
  alt: { kk: 'Сипаттама', ru: 'Описание' },
  altPrompt: {
    kk: 'Фотода не бейнеленген? Көзі нашар көретіндерге және іздеу жүйелеріне арналған.',
    ru: 'Что на фото? Это прочитают незрячим посетителям и поисковики.',
  },
  remove: { kk: 'Жою', ru: 'Удалить' },
  tableTools: { kk: 'Кесте:', ru: 'Таблица:' },
  addRow: { kk: '+ жол', ru: '+ строка' },
  addCol: { kk: '+ баған', ru: '+ столбец' },
  delRow: { kk: '− жол', ru: '− строка' },
  delCol: { kk: '− баған', ru: '− столбец' },
  delTable: { kk: 'Кестені жою', ru: 'Удалить таблицу' },
  heading: { kk: 'Бағана', ru: 'Столбец' },
} as const;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Люди пишут адрес без https:// — дописываем, иначе ссылка поведёт на страницу нашего же сайта. */
function normalizeHref(raw: string): string {
  const value = raw.trim();
  if (/^(https?:|mailto:|tel:|\/(?!\/))/i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  return `https://${value.replace(/^\/+/, '')}`;
}

/**
 * Визуальный редактор на contenteditable. Намеренно без тяжёлой библиотеки:
 * сотруднику сада нужны подзаголовки, списки, фото, таблица для режима дня
 * и файл приказа — всё это умеет сам браузер. HTML в любом случае
 * санитизируется на сервере при сохранении.
 */
export function RichText({
  name,
  defaultValue = '',
  placeholder,
  disabled = false,
  locale,
  upload,
  previewTitle,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  locale: Locale;
  upload?: EditorUploadConfig;
  /** Заголовок в предпросмотре. Без него берётся из поля title<Ru|Kk> той же формы. */
  previewTitle?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null);
  const [preview, setPreview] = useState<{ html: string; title: string } | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
    // Значение приходит с сервера один раз при монтировании формы.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Запоминаем, где стоял курсор: кнопка «Фото» открывает окно выбора файла,
  // и к моменту загрузки фокус из текста давно ушёл.
  useEffect(() => {
    function onSelectionChange() {
      const editor = editorRef.current;
      const selection = document.getSelection();
      if (!editor || !selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) return;
      rangeRef.current = range.cloneRange();
      const node = range.startContainer;
      const element = node instanceof Element ? node : node.parentElement;
      const found = element?.closest('td, th');
      setCell(found && editor.contains(found) ? (found as HTMLTableCellElement) : null);
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  /** HTML без служебных пометок редактора. */
  function readHtml(): string {
    const editor = editorRef.current;
    if (!editor) return '';
    const copy = editor.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[data-selected]').forEach((el) => el.removeAttribute('data-selected'));
    return copy.innerHTML;
  }

  function sync() {
    setValue(readHtml());
  }

  function restoreSelection() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = document.getSelection();
    if (!selection) return;
    const saved = rangeRef.current;
    selection.removeAllRanges();
    if (saved && editor.contains(saved.commonAncestorContainer)) {
      selection.addRange(saved);
    } else {
      const end = document.createRange();
      end.selectNodeContents(editor);
      end.collapse(false);
      selection.addRange(end);
    }
  }

  function exec(command: string, argument?: string) {
    if (disabled) return;
    restoreSelection();
    document.execCommand(command, false, argument);
    sync();
  }

  function insertHtml(html: string) {
    exec('insertHTML', html);
  }

  function addLink() {
    const raw = window.prompt(T.linkPrompt[locale]);
    if (!raw?.trim()) return;
    const href = normalizeHref(raw);
    restoreSelection();
    const selection = document.getSelection();
    if (selection && !selection.isCollapsed) {
      document.execCommand('createLink', false, href);
    } else {
      document.execCommand('insertHTML', false, `<a href="${escapeHtml(href)}">${escapeHtml(raw.trim())}</a>&nbsp;`);
    }
    sync();
  }

  function clearFormatting() {
    exec('removeFormat');
    exec('formatBlock', 'p');
  }

  function insertTable() {
    const head = [1, 2, 3].map((n) => `<th>${T.heading[locale]} ${n}</th>`).join('');
    const row = '<tr><td><br></td><td><br></td><td><br></td></tr>';
    insertHtml(`<table><thead><tr>${head}</tr></thead><tbody>${row}${row}</tbody></table><p><br></p>`);
  }

  // ─── Фото и файлы ───

  async function uploadFiles(files: File[]) {
    if (!upload || disabled || files.length === 0) return;
    setNotice(null);
    for (const file of files) {
      setBusy((count) => count + 1);
      try {
        const formData = new FormData();
        formData.set(CSRF_FIELD, upload.csrf);
        formData.set('host', upload.host);
        formData.set('file', file);
        const result = await upload.action(formData);
        if ('error' in result) {
          setNotice(`${file.name}: ${result.error}`);
        } else if (result.image) {
          const size = result.width && result.height ? ` width="${result.width}" height="${result.height}"` : '';
          insertHtml(`<img src="${escapeHtml(result.url)}" alt=""${size} loading="lazy">`);
        } else {
          insertHtml(`<a href="${escapeHtml(result.url)}">📎 ${escapeHtml(result.name)}</a>&nbsp;`);
        }
      } catch {
        setNotice(`${file.name}: ${T.uploadFailed[locale]}`);
      } finally {
        setBusy((count) => count - 1);
      }
    }
  }

  function selectImage(next: HTMLImageElement | null) {
    image?.removeAttribute('data-selected');
    next?.setAttribute('data-selected', '');
    setImage(next);
  }

  function setImageLayout(layout: ImageLayout) {
    if (!image) return;
    image.classList.remove('img-left', 'img-right', 'img-small');
    if (layout) image.classList.add(layout);
    if (!image.classList.length) image.removeAttribute('class');
    sync();
  }

  function editAlt() {
    if (!image) return;
    const alt = window.prompt(T.altPrompt[locale], image.alt);
    if (alt === null) return;
    image.alt = alt.trim();
    sync();
  }

  function removeImage() {
    if (!image) return;
    image.remove();
    setImage(null);
    sync();
  }

  // ─── Таблица ───

  function tableOp(op: 'addRow' | 'addCol' | 'delRow' | 'delCol' | 'delTable') {
    const table = cell?.closest('table');
    const row = cell?.parentElement as HTMLTableRowElement | null;
    if (!cell || !table || !row) return;
    const index = cell.cellIndex;
    const rows = Array.from(table.rows);

    if (op === 'addRow') {
      const fresh = document.createElement('tr');
      for (let i = 0; i < row.cells.length; i += 1) {
        fresh.appendChild(document.createElement('td')).innerHTML = '<br>';
      }
      // Строка под шапкой встаёт в начало тела таблицы, а не в саму шапку.
      if (row.parentElement?.tagName === 'THEAD') {
        const body = table.tBodies[0] ?? table.appendChild(document.createElement('tbody'));
        body.insertBefore(fresh, body.firstChild);
      } else {
        row.after(fresh);
      }
    } else if (op === 'addCol') {
      for (const each of rows) {
        const ref = each.cells[Math.min(index, each.cells.length - 1)];
        const created = document.createElement(each.parentElement?.tagName === 'THEAD' ? 'th' : 'td');
        created.innerHTML = '<br>';
        if (ref) ref.after(created);
        else each.appendChild(created);
      }
    } else if (op === 'delRow') {
      if (rows.length <= 1) table.remove();
      else row.remove();
    } else if (op === 'delCol') {
      if (row.cells.length <= 1) table.remove();
      else for (const each of rows) each.cells[index]?.remove();
    } else {
      table.remove();
    }
    setCell(null);
    sync();
  }

  function openPreview() {
    const suffix = name.slice(-2);
    const form = editorRef.current?.closest('form');
    const titleField = form?.querySelector<HTMLInputElement>(`[name="title${suffix}"]`);
    const fallback = suffix === 'Kk' ? form?.querySelector<HTMLInputElement>('[name="titleRu"]') : null;
    const title = previewTitle || titleField?.value || fallback?.value || '';
    setPreview({ html: readHtml(), title });
  }

  const button = (label: ReactNode, title: string, onClick: () => void, extra = '') => (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      // Не отдаём фокус кнопке, иначе выделенный текст теряется до команды.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded-lg px-2 py-1.5 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand-ink disabled:cursor-not-allowed ${extra}`}
    >
      {label}
    </button>
  );
  const divider = <span className="mx-1 hidden w-px self-stretch bg-line sm:block" aria-hidden />;

  return (
    <div className={`rounded-xl border border-line bg-card ${disabled ? 'opacity-60' : ''}`}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-line bg-card p-2">
        {button('↶', T.undo[locale], () => exec('undo'))}
        {button('↷', T.redo[locale], () => exec('redo'))}
        {divider}
        {button(<b>Ж</b>, T.bold[locale], () => exec('bold'))}
        {button(<i>К</i>, T.italic[locale], () => exec('italic'))}
        {button(<u>Ч</u>, T.underline[locale], () => exec('underline'))}
        {button(<s>З</s>, T.strike[locale], () => exec('strikeThrough'))}
        {divider}
        {button('H2', T.h2[locale], () => exec('formatBlock', 'h2'))}
        {button('H3', T.h3[locale], () => exec('formatBlock', 'h3'))}
        {button('¶', T.paragraph[locale], () => exec('formatBlock', 'p'))}
        {button('•', T.bullets[locale], () => exec('insertUnorderedList'))}
        {button('1.', T.numbers[locale], () => exec('insertOrderedList'))}
        {button('❝', T.quote[locale], () => exec('formatBlock', 'blockquote'))}
        {button('—', T.rule[locale], () => exec('insertHorizontalRule'))}
        {divider}
        {button('🔗', T.link[locale], addLink)}
        {button(<span className="line-through">🔗</span>, T.unlink[locale], () => exec('unlink'))}
        {upload ? button(`🖼 ${T.photo[locale]}`, T.photoTitle[locale], () => photoInputRef.current?.click()) : null}
        {upload ? button(`📎 ${T.file[locale]}`, T.fileTitle[locale], () => fileInputRef.current?.click()) : null}
        {button(`▦ ${T.table[locale]}`, T.table[locale], insertTable)}
        {button('⌫', T.clear[locale], clearFormatting)}
        <span className="ml-auto" />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={openPreview}
          className="rounded-lg border border-line px-2.5 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-soft"
        >
          👁 {T.preview[locale]}
        </button>
      </div>

      {image ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-brand-soft/40 px-2 py-1.5 text-sm">
          <span className="px-1 font-semibold">{T.imageTools[locale]}</span>
          {button(T.layoutFull[locale], T.layoutFull[locale], () => setImageLayout(''))}
          {button(T.layoutLeft[locale], T.layoutLeft[locale], () => setImageLayout('img-left'))}
          {button(T.layoutRight[locale], T.layoutRight[locale], () => setImageLayout('img-right'))}
          {button(T.layoutSmall[locale], T.layoutSmall[locale], () => setImageLayout('img-small'))}
          {button(`✎ ${T.alt[locale]}`, T.altPrompt[locale], editAlt)}
          {button(T.remove[locale], T.remove[locale], removeImage, 'text-red-700')}
        </div>
      ) : null}

      {cell && !image ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-brand-soft/40 px-2 py-1.5 text-sm">
          <span className="px-1 font-semibold">{T.tableTools[locale]}</span>
          {button(T.addRow[locale], T.addRow[locale], () => tableOp('addRow'))}
          {button(T.addCol[locale], T.addCol[locale], () => tableOp('addCol'))}
          {button(T.delRow[locale], T.delRow[locale], () => tableOp('delRow'))}
          {button(T.delCol[locale], T.delCol[locale], () => tableOp('delCol'))}
          {button(T.delTable[locale], T.delTable[locale], () => tableOp('delTable'), 'text-red-700')}
        </div>
      ) : null}

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
        onClick={(event) => {
          const target = event.target;
          selectImage(target instanceof HTMLImageElement ? target : null);
        }}
        onKeyDown={(event) => {
          if (image && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault();
            removeImage();
          }
        }}
        onPaste={(event) => {
          // Скриншот или фото из буфера — загружаем как обычное фото.
          const pasted = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith('image/'));
          if (pasted.length > 0 && upload) {
            event.preventDefault();
            void uploadFiles(pasted);
            return;
          }
          // Вставка из Word тащит горы разметки — берём только текст.
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          sync();
        }}
        onDragOver={(event) => {
          if (upload && event.dataTransfer.types.includes('Files')) event.preventDefault();
        }}
        onDrop={(event) => {
          if (!upload || event.dataTransfer.files.length === 0) return;
          event.preventDefault();
          // Ставим курсор туда, куда бросили файл.
          const dropped = document.caretRangeFromPoint?.(event.clientX, event.clientY);
          if (dropped) rangeRef.current = dropped;
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className="rich-editor prose-content min-h-64 px-4 py-3 focus:outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
      />

      {upload || busy > 0 || notice ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-xs" aria-live="polite">
          {busy > 0 ? <span className="font-semibold text-brand-ink">⏳ {T.uploading[locale]}</span> : null}
          {notice ? <span className="font-semibold text-red-700">{notice}</span> : null}
          {upload && busy === 0 && !notice ? <span className="text-muted">{T.dropHint[locale]}</span> : null}
        </div>
      ) : null}

      {upload ? (
        <>
          <input
            ref={photoInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            hidden
            onChange={(event) => {
              void uploadFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_ACCEPT}
            multiple
            hidden
            onChange={(event) => {
              void uploadFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
        </>
      ) : null}

      <input type="hidden" name={name} value={value} />

      {preview ? (
        <EditorPreview html={preview.html} title={preview.title} locale={locale} onClose={() => setPreview(null)} />
      ) : null}
    </div>
  );
}
