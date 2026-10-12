/**
 * Ручной порядок списков админки (педагоги, группы, кружки, вопросы).
 *
 * Клиент присылает порядок целиком, но доверять ему нельзя: в списке могут
 * оказаться чужие номера, повторы, а пока заведующая перетаскивала карточку,
 * коллега в другой вкладке мог что-то добавить или удалить. Поэтому основа —
 * записи самого сада: присланное берём только то, что у сада есть, а записи,
 * которых в присланном нет, остаются в конце в прежнем порядке.
 */
export function mergeOrder(existing: readonly string[], requested: readonly string[]): string[] {
  const own = new Set(existing);
  const result: string[] = [];
  const seen = new Set<string>();
  for (const id of requested) {
    if (own.has(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  for (const id of existing) if (!seen.has(id)) result.push(id);
  return result;
}

/** Переставляет элемент с места `from` на место `to` — для стрелок и перетаскивания. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}
