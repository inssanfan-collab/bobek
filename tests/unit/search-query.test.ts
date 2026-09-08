import { describe, expect, it } from 'vitest';
import {
  HIGHLIGHT_END,
  HIGHLIGHT_START,
  parseSearchQuery,
  splitHighlight,
} from '@/lib/search-query';

/** Так же, как это делает ts_headline. */
const hl = (text: string) => `${HIGHLIGHT_START}${text}${HIGHLIGHT_END}`;

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

describe('splitHighlight', () => {
  it('разделяет текст и совпадения', () => {
    expect(splitHighlight(`Приглашаем ${hl('родителей')} всех групп`)).toEqual([
      { text: 'Приглашаем ', match: false },
      { text: 'родителей', match: true },
      { text: ' всех групп', match: false },
    ]);
  });

  it('находит несколько совпадений и совпадение в начале', () => {
    expect(splitHighlight(`${hl('Наурыз')} мейрамы ${hl('өтті')}`)).toEqual([
      { text: 'Наурыз', match: true },
      { text: ' мейрамы ', match: false },
      { text: 'өтті', match: true },
    ]);
  });

  it('отдаёт текст без разметки одним куском', () => {
    // Совпадение было только в заголовке — ts_headline вернул начало текста.
    expect(splitHighlight('Утро началось с зарядки во дворе')).toEqual([
      { text: 'Утро началось с зарядки во дворе', match: false },
    ]);
  });

  it('переживает обрезанный маркер', () => {
    expect(splitHighlight(`Обсудим ${HIGHLIGHT_START}подготовку`)).toEqual([
      { text: 'Обсудим ', match: false },
      { text: 'подготовку', match: true },
    ]);
  });

  it('на пустом фрагменте не отдаёт ничего', () => {
    expect(splitHighlight('')).toEqual([]);
    expect(splitHighlight(hl(''))).toEqual([]);
  });
});
