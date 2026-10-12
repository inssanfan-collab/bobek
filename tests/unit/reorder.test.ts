import { describe, expect, it } from 'vitest';
import { mergeOrder, moveItem } from '@/lib/reorder';

describe('mergeOrder', () => {
  it('принимает присланный порядок своих записей', () => {
    expect(mergeOrder(['a', 'b', 'c'], ['c', 'a', 'b'])).toEqual(['c', 'a', 'b']);
  });

  it('чужие номера и повторы отбрасывает', () => {
    expect(mergeOrder(['a', 'b'], ['x', 'b', 'b', 'a'])).toEqual(['b', 'a']);
  });

  it('добавленное в другой вкладке остаётся в конце', () => {
    expect(mergeOrder(['a', 'b', 'new'], ['b', 'a'])).toEqual(['b', 'a', 'new']);
  });

  it('удалённое в другой вкладке не воскрешает', () => {
    expect(mergeOrder(['a', 'c'], ['c', 'b', 'a'])).toEqual(['c', 'a']);
  });
});

describe('moveItem', () => {
  it('поднимает и опускает', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('за край не уводит', () => {
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 1, 2)).toEqual(['a', 'b']);
  });
});
