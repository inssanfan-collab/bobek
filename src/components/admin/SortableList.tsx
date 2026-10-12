'use client';

import { createContext, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
  type Announcements, type DragEndEvent, type DraggableAttributes, type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderList, type SortableKind } from '@/app/(tenant)/s/[host]/admin/(shell)/actions';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { moveItem } from '@/lib/reorder';
import type { Locale } from '@/lib/i18n';

const T = {
  hint: {
    kk: 'Ретін өзгерту үшін ⠿ белгісінен ұстап сүйреңіз немесе ↑ ↓ батырмаларын басыңыз.',
    ru: 'Чтобы поменять порядок, перетащите за ⠿ или нажмите ↑ ↓.',
  },
  homeNote: {
    kk: 'Тізімнің басындағылар сайттың басты бетінде шығады.',
    ru: 'Первые в списке показываются на главной странице сайта.',
  },
  drag: { kk: 'Ұстап сүйреңіз', ru: 'Перетащить' },
  up: { kk: 'Жоғары', ru: 'Выше' },
  down: { kk: 'Төмен', ru: 'Ниже' },
  saving: { kk: 'Сақталуда…', ru: 'Сохраняем…' },
  saved: { kk: 'Реті сақталды', ru: 'Порядок сохранён' },
  instructions: {
    kk: 'Жылжыту үшін бос орын пернесін басыңыз, содан кейін бағыттауыштармен жылжытыңыз. Қою — бос орын, болдырмау — Escape.',
    ru: 'Чтобы переместить, нажмите пробел, затем стрелки. Пробел — положить, Escape — отменить.',
  },
} as const;

type Item = { id: string; content: ReactNode };

type ItemControls = {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  locale: Locale;
};

const ItemContext = createContext<ItemControls | null>(null);

/**
 * Список с ручным порядком: карточку тянут за ручку ⠿ (мышью, пальцем,
 * с клавиатуры) или двигают стрелками ↑ ↓. Порядок сохраняется сразу после
 * каждого перемещения — кнопки «Сохранить» нет, о ней легко забыть.
 *
 * Карточки рисует сервер, как и раньше; ручку и стрелки страница ставит
 * сама — компонентом `SortHandle` внутри карточки, там, где им удобно стоять.
 * Без прав на правку (`disabled`) список выводится как обычный.
 */
export function SortableList({
  kind, host, csrf, locale, items, layout, className, tableClassName, head, onHome = false, disabled = false,
}: {
  kind: SortableKind;
  host: string;
  csrf: string;
  locale: Locale;
  items: Item[];
  /** grid — карточки в несколько колонок, list — друг под другом, table — строки таблицы (каждая — свой tbody). */
  layout: 'grid' | 'list' | 'table';
  className?: string;
  /** Для layout="table": className — обёртке таблицы, это — самой таблице. */
  tableClassName?: string;
  /** Шапка таблицы (thead) — только для layout="table". */
  head?: ReactNode;
  /** Подсказать, что первые из списка стоят на главной. */
  onHome?: boolean;
  disabled?: boolean;
}) {
  const propsIds = items.map((item) => item.id);
  const [order, setOrder] = useState(propsIds);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | { error: string }>('idle');
  const [, startTransition] = useTransition();
  const serverIds = useRef(propsIds);
  serverIds.current = propsIds;

  // Свой порядок держим, пока набор карточек тот же. Добавили или удалили
  // карточку — берём порядок сервера: он уже знает о новой записи.
  const sameSet = order.length === propsIds.length && propsIds.every((id) => order.includes(id));
  const ids = sameSet ? order : propsIds;
  const byId = new Map(items.map((item) => [item.id, item]));

  useEffect(() => {
    if (status !== 'saved') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function save(next: string[]) {
    setOrder(next);
    setStatus('saving');
    startTransition(async () => {
      const formData = new FormData();
      formData.set(CSRF_FIELD, csrf);
      formData.set('host', host);
      formData.set('kind', kind);
      for (const id of next) formData.append('ids', id);
      const result = await reorderList(formData);
      if (result.error) {
        setOrder(serverIds.current);
        setStatus({ error: result.error });
      } else {
        setStatus('saved');
      }
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= ids.length || from === to) return;
    save(moveItem(ids, from, to));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  }

  const place = (id: string | number) => `${ids.indexOf(String(id)) + 1} / ${ids.length}`;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${place(active.id)}`,
    onDragOver: ({ over }) => (over ? place(over.id) : undefined),
    onDragEnd: ({ over }) => (over ? `${T.saved[locale]}: ${place(over.id)}` : undefined),
    onDragCancel: ({ active }) => place(active.id),
  };

  const Wrapper = layout === 'table' ? 'tbody' : 'div';
  const rows = ids.map((id, index) => {
    const item = byId.get(id);
    if (!item) return null;
    return disabled ? (
      <Wrapper key={id}>{item.content}</Wrapper>
    ) : (
      <SortableItem key={id} id={id} as={Wrapper} index={index} count={ids.length} move={move} locale={locale}>
        {item.content}
      </SortableItem>
    );
  });

  const list =
    layout === 'table' ? (
      <div className={className}>
        <table className={tableClassName}>
          {head}
          {rows}
        </table>
      </div>
    ) : (
      <div className={className}>{rows}</div>
    );

  if (disabled) return list;

  return (
    <>
      {ids.length > 1 ? (
        <p className="mb-3 text-sm text-muted">
          {T.hint[locale]}
          {onHome ? ` ${T.homeNote[locale]}` : ''}
        </p>
      ) : null}
      <DndContext
        id={`sort-${kind}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{ announcements, screenReaderInstructions: { draggable: T.instructions[locale] } }}
      >
        <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
          {list}
        </SortableContext>
      </DndContext>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {status === 'idle' ? null : (
          <p
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
              typeof status === 'object' ? 'bg-red-600 text-white' : 'bg-ink text-white'
            }`}
          >
            {typeof status === 'object' ? status.error : status === 'saving' ? T.saving[locale] : T.saved[locale]}
          </p>
        )}
      </div>
    </>
  );
}

function SortableItem({
  id, as: Wrapper, index, count, move, locale, children,
}: {
  id: string;
  as: 'div' | 'tbody';
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  locale: Locale;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <ItemContext.Provider value={{ attributes, listeners, setActivatorNodeRef, index, count, move, locale }}>
      <Wrapper
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          position: 'relative',
          zIndex: isDragging ? 20 : undefined,
        }}
        className={isDragging ? 'opacity-90 shadow-xl [&>*]:ring-2 [&>*]:ring-brand' : undefined}
      >
        {children}
      </Wrapper>
    </ItemContext.Provider>
  );
}

/**
 * Ручка ⠿ и стрелки ↑ ↓ для карточки внутри `SortableList`. Вне списка
 * или без прав на правку ничего не рисует — страница может ставить её всегда.
 */
export function SortHandle({ className = '' }: { className?: string }) {
  const controls = useContext(ItemContext);
  if (!controls) return null;
  const { attributes, listeners, setActivatorNodeRef, index, count, move, locale } = controls;
  const arrow = 'btn-ghost grid h-9 w-9 place-items-center p-0 text-base disabled:opacity-30';
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={T.drag[locale]}
        title={T.drag[locale]}
        className="btn-ghost grid h-9 w-9 cursor-grab touch-none place-items-center p-0 text-muted active:cursor-grabbing"
      >
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="currentColor">
          <circle cx="7" cy="4" r="1.6" /><circle cx="13" cy="4" r="1.6" />
          <circle cx="7" cy="10" r="1.6" /><circle cx="13" cy="10" r="1.6" />
          <circle cx="7" cy="16" r="1.6" /><circle cx="13" cy="16" r="1.6" />
        </svg>
      </button>
      <button type="button" className={arrow} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={T.up[locale]} title={T.up[locale]}>
        ↑
      </button>
      <button type="button" className={arrow} disabled={index === count - 1} onClick={() => move(index, index + 1)} aria-label={T.down[locale]} title={T.down[locale]}>
        ↓
      </button>
    </div>
  );
}
