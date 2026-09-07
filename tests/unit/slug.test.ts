import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from '@/lib/slug';

describe('slugify', () => {
  it('переводит казахскую и русскую кириллицу в латиницу', () => {
    expect(slugify('Наурыз мейрамы')).toBe('nauryz-meiramy');
    expect(slugify('Бөбекжай №12')).toBe('bobekzhai-12');
    expect(slugify('Қамқоршылық кеңес')).toBe('qamqorshylyq-kenes');
  });

  it('схлопывает разделители и обрезает края', () => {
    expect(slugify('  ---Привет,   мир!!!  ')).toBe('privet-mir');
  });
});

describe('uniqueSlug', () => {
  it('добавляет суффикс, пока адрес занят', async () => {
    const taken = new Set(['novost', 'novost-2']);
    const result = await uniqueSlug('Новость', async (candidate) => taken.has(candidate));
    expect(result).toBe('novost-3');
  });

  it('возвращает исходный адрес, если он свободен', async () => {
    expect(await uniqueSlug('Новость', async () => false)).toBe('novost');
  });
});
