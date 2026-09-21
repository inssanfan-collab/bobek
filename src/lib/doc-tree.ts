/**
 * Дерево папок документов — как в проводнике.
 *
 * Всё считается в памяти по плоскому списку папок сада: у сада их десятки,
 * а не тысячи, и один запрос дешевле рекурсивного SQL. Функции чистые —
 * их одинаково зовут сайт, админка и тесты.
 */

export type FolderNode = { id: string; parentId: string | null; position: number };
export type DocNode = { folderId: string | null };

/** Вложенные папки по родителю, уже в порядке `position`. Ключ `null` — верхний уровень. */
export function childrenByParent<F extends FolderNode>(folders: F[]): Map<string | null, F[]> {
  const ids = new Set(folders.map((f) => f.id));
  const map = new Map<string | null, F[]>();
  for (const folder of folders) {
    // Родитель не найден (удалён, чужой) — папка всплывает наверх, а не теряется.
    const key = folder.parentId && ids.has(folder.parentId) ? folder.parentId : null;
    const list = map.get(key) ?? [];
    list.push(folder);
    map.set(key, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.position - b.position);
  return map;
}

/** Путь от верхнего уровня до папки включительно. Пустой — если папки нет. */
export function folderPath<F extends FolderNode>(folders: F[], id: string | null): F[] {
  if (!id) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const path: F[] = [];
  const seen = new Set<string>();
  let current = byId.get(id);
  // seen — страховка от кольца в данных: бесконечный цикл положил бы сайт.
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

/** Сама папка и все вложенные в неё на любой глубине. */
export function subtreeIds<F extends FolderNode>(folders: F[], id: string): Set<string> {
  const children = childrenByParent(folders);
  const result = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    if (result.has(current)) continue;
    result.add(current);
    for (const child of children.get(current) ?? []) stack.push(child.id);
  }
  return result;
}

/**
 * Можно ли переложить папку в другую. Нельзя в саму себя и в собственную
 * вложенную: папка оказалась бы внутри себя и пропала бы из дерева целиком.
 */
export function canMoveFolder<F extends FolderNode>(folders: F[], id: string, newParentId: string | null): boolean {
  if (!newParentId) return true;
  if (!folders.some((f) => f.id === newParentId)) return false;
  return !subtreeIds(folders, id).has(newParentId);
}

/** Сколько документов в папке вместе со всеми вложенными. */
export function deepDocCounts<F extends FolderNode>(folders: F[], docs: DocNode[]): Map<string, number> {
  const direct = new Map<string, number>();
  for (const doc of docs) {
    if (doc.folderId) direct.set(doc.folderId, (direct.get(doc.folderId) ?? 0) + 1);
  }
  const children = childrenByParent(folders);
  const total = new Map<string, number>();
  const visiting = new Set<string>();
  const count = (id: string): number => {
    const known = total.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    let sum = direct.get(id) ?? 0;
    for (const child of children.get(id) ?? []) sum += count(child.id);
    total.set(id, sum);
    return sum;
  };
  for (const folder of folders) count(folder.id);
  return total;
}

/**
 * Папки списком для выпадающего меню — в порядке дерева, с отступом
 * по глубине: «IV. Учебно-методическая работа», «   2024 - 2025».
 */
export function flattenTree<F extends FolderNode>(folders: F[], skip?: Set<string>): { folder: F; depth: number }[] {
  const children = childrenByParent(folders);
  const result: { folder: F; depth: number }[] = [];
  const seen = new Set<string>();
  const walk = (parentId: string | null, depth: number) => {
    for (const folder of children.get(parentId) ?? []) {
      if (seen.has(folder.id) || skip?.has(folder.id)) continue;
      seen.add(folder.id);
      result.push({ folder, depth });
      walk(folder.id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}

/** Отступ для <option>: пробелы в начале браузер съедает, неразрывные — нет. */
export function indentLabel(label: string, depth: number): string {
  return `${'\u00a0\u00a0\u00a0'.repeat(depth)}${depth > 0 ? '└ ' : ''}${label}`;
}

/**
 * «Айша. Бағалау  парағы.pdf» → «Айша. Бағалау парағы». Имя файла у садов
 * обычно и есть название документа, только с расширением и двойными пробелами.
 */
export function titleFromFileName(name: string): string {
  return name
    .replace(/\.[a-z0-9]{2,5}$/i, '')
    .replace(/[_\s]+/g, ' ')
    .trim()
    .slice(0, 200);
}
