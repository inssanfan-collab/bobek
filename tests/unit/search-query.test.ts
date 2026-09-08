import { describe, expect, it } from 'vitest';
import { parseSearchQuery } from '@/lib/search-query';

describe('parseSearchQuery', () => {
  it('строит поиск по началу слова', () => {
    // Префикс нужен казахскому: словаря в PostgreSQL нет, и «мерекес»
    // найдёт «мерекесі» только так.
    expect(parseSearchQuery('Наурыз мерекес')).toEqual({
      prefix: 'наурыз:* & мерекес:*',
      plain: 'наурыз мерекес',
    });
  });

  it('сохраняет казахские буквы', () => {
    expect(parseSearchQuery('Жаңалықтар')?.prefix).toBe('жаңалықтар:*');
  });

  it('выкидывает операторы tsquery вместе с прочей пунктуацией', () => {
    // Иначе запрос из адресной строки ломает синтаксис to_tsquery,
    // и страница поиска отвечает ошибкой базы.
    expect(parseSearchQuery("сад & 12 | !(смена):*")).toEqual({
      prefix: 'сад:* & 12:* & смена:*',
      plain: 'сад 12 смена',
    });
  });

  it('возвращает null, когда искать нечего', () => {
    expect(parseSearchQuery('')).toBeNull();
    expect(parseSearchQuery('   ')).toBeNull();
    expect(parseSearchQuery('!!! &&& ***')).toBeNull();
  });

  it('ограничивает число и длину слов', () => {
    const many = parseSearchQuery('раз два три четыре пять шесть семь восемь девять десять');
    expect(many?.prefix.split(' & ')).toHaveLength(8);

    const long = parseSearchQuery('а'.repeat(200));
    expect(long?.prefix).toBe(`${'а'.repeat(64)}:*`);
  });
});
