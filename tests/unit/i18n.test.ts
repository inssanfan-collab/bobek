import { describe, expect, it } from 'vitest';
import { isLocale, pick, pickOrNull } from '@/lib/i18n';

describe('pick', () => {
  it('берёт нужный язык', () => {
    expect(pick('kk', 'Жаңалықтар', 'Новости')).toBe('Жаңалықтар');
    expect(pick('ru', 'Жаңалықтар', 'Новости')).toBe('Новости');
  });

  it('подставляет второй язык, если перевода нет', () => {
    // Сад сохранил форму, не заполнив одну из вкладок: показать текст на другом языке
    // лучше, чем пустое место в меню.
    expect(pick('kk', '', 'Новости')).toBe('Новости');
    expect(pick('kk', '   ', 'Новости')).toBe('Новости');
    expect(pick('ru', 'Жаңалықтар', null)).toBe('Жаңалықтар');
  });

  it('возвращает пустую строку, когда нет ничего', () => {
    expect(pick('ru', null, undefined)).toBe('');
    expect(pickOrNull('ru', null, undefined)).toBeNull();
  });
});

describe('isLocale', () => {
  it('пропускает только известные языки', () => {
    expect(isLocale('kk')).toBe(true);
    expect(isLocale('ru')).toBe(true);
    expect(isLocale('en')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
