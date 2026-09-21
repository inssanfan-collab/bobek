import { describe, expect, it } from 'vitest';
import {
  canMoveFolder, childrenByParent, deepDocCounts, flattenTree, folderPath, subtreeIds, titleFromFileName,
} from '@/lib/doc-tree';

// I
// ├ II          (position 1)
// IV
// ├ 2024        (position 1)
// ├ 2023        (position 0)
// │ └ Группы
const folders = [
  { id: 'I', parentId: null, position: 0 },
  { id: 'IV', parentId: null, position: 1 },
  { id: 'II', parentId: 'I', position: 1 },
  { id: '2024', parentId: 'IV', position: 1 },
  { id: '2023', parentId: 'IV', position: 0 },
  { id: 'groups', parentId: '2023', position: 0 },
];

describe('дерево папок документов', () => {
  it('раскладывает по родителям в порядке position', () => {
    const map = childrenByParent(folders);
    expect(map.get(null)!.map((f) => f.id)).toEqual(['I', 'IV']);
    expect(map.get('IV')!.map((f) => f.id)).toEqual(['2023', '2024']);
  });

  it('папка с исчезнувшим родителем всплывает наверх, а не теряется', () => {
    const map = childrenByParent([...folders, { id: 'lost', parentId: 'нет-такой', position: 5 }]);
    expect(map.get(null)!.map((f) => f.id)).toContain('lost');
  });

  it('строит путь для хлебных крошек', () => {
    expect(folderPath(folders, 'groups').map((f) => f.id)).toEqual(['IV', '2023', 'groups']);
    expect(folderPath(folders, null)).toEqual([]);
    expect(folderPath(folders, 'нет')).toEqual([]);
  });

  it('кольцо в данных не вешает сайт', () => {
    const ring = [
      { id: 'a', parentId: 'b', position: 0 },
      { id: 'b', parentId: 'a', position: 0 },
    ];
    expect(folderPath(ring, 'a').length).toBe(2);
    expect(deepDocCounts(ring, [{ folderId: 'a' }]).get('a')).toBe(1);
  });

  it('не даёт положить папку в саму себя или во вложенную', () => {
    expect(canMoveFolder(folders, 'IV', 'IV')).toBe(false);
    expect(canMoveFolder(folders, 'IV', 'groups')).toBe(false);
    expect(canMoveFolder(folders, '2023', 'I')).toBe(true);
    expect(canMoveFolder(folders, '2023', null)).toBe(true);
    expect(canMoveFolder(folders, '2023', 'чужая')).toBe(false);
    expect([...subtreeIds(folders, 'IV')].sort()).toEqual(['2023', '2024', 'IV', 'groups']);
  });

  it('считает документы вместе с вложенными папками', () => {
    const docs = [{ folderId: 'groups' }, { folderId: '2023' }, { folderId: '2024' }, { folderId: null }];
    const counts = deepDocCounts(folders, docs);
    expect(counts.get('IV')).toBe(3);
    expect(counts.get('2023')).toBe(2);
    expect(counts.get('I')).toBe(0);
  });

  it('выстраивает список для выбора в порядке дерева', () => {
    expect(flattenTree(folders).map(({ folder, depth }) => `${depth}:${folder.id}`)).toEqual([
      '0:I', '1:II', '0:IV', '1:2023', '2:groups', '1:2024',
    ]);
    // При переносе папки её саму и вложенные предлагать нельзя.
    expect(flattenTree(folders, subtreeIds(folders, '2023')).map(({ folder }) => folder.id)).toEqual([
      'I', 'II', 'IV', '2024',
    ]);
  });
});

describe('название документа из имени файла', () => {
  it('убирает расширение и лишние пробелы', () => {
    expect(titleFromFileName('Айша. Бағалау  парағы.pdf')).toBe('Айша. Бағалау парағы');
    expect(titleFromFileName('2023 - 2024. № 2 қосымша.PDF')).toBe('2023 - 2024. № 2 қосымша');
    expect(titleFromFileName('Отчёт_за_год.docx')).toBe('Отчёт за год');
  });
});
