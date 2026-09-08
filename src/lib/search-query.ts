/**
 * Разбор пользовательского запроса для полнотекстового поиска.
 *
 * Отдельный модуль, потому что здесь нет ни базы, ни Next: это единственное
 * место, где текст из адресной строки превращается в синтаксис tsquery,
 * и его хочется покрыть юнит-тестами.
 */

/** Больше слов в запросе родитель не набирает, а tsquery от них тяжелеет. */
const MAX_TERMS = 8;

/** Длинные «слова» приходят только от ботов и мусорных вставок. */
const MAX_TERM_LENGTH = 64;

/** Всё, что не буква и не цифра, считаем разделителем — вместе с операторами tsquery. */
const SEPARATOR = /[^\p{L}\p{N}]+/u;

export type SearchQuery = {
  /** Термы через `&` с префиксом `:*` — для конфигурации simple. */
  prefix: string;
  /** Те же слова строкой — для plainto_tsquery('russian', ...). */
  plain: string;
};

/**
 * Слова запроса приводятся к tsquery вида `наурыз:* & мерек:*`.
 *
 * Префикс `:*` здесь не украшение: словаря казахского языка в PostgreSQL нет,
 * казахские слова лежат в индексе как есть, и «мерекес» найдёт «мерекесі»
 * только поиском по началу слова. Русские словоформы отдельно ищутся через
 * plainto_tsquery('russian', ...) — по основе слова.
 *
 * Возвращает null, если искать нечего: пустая строка или одни разделители.
 */
export function parseSearchQuery(raw: string): SearchQuery | null {
  const terms = raw
    .toLowerCase()
    .split(SEPARATOR)
    .filter(Boolean)
    .map((term) => term.slice(0, MAX_TERM_LENGTH))
    .slice(0, MAX_TERMS);

  if (terms.length === 0) return null;

  return {
    prefix: terms.map((term) => `${term}:*`).join(' & '),
    plain: terms.join(' '),
  };
}

/**
 * Границы найденного фрагмента в ответе ts_headline.
 *
 * Управляющие символы взяты намеренно: в санитизированном тексте сада их не
 * бывает, поэтому подсветку нельзя подделать, написав в новости «<mark>».
 */
export const HIGHLIGHT_START = '\u0001';
export const HIGHLIGHT_END = '\u0002';

/** Настройки ts_headline: один фрагмент в пару строк, чтобы карточка не разъезжалась. */
export const HEADLINE_OPTIONS =
  `MaxWords=22, MinWords=10, MaxFragments=1, StartSel=${HIGHLIGHT_START}, StopSel=${HIGHLIGHT_END}`;

export type SnippetPart = { text: string; match: boolean };

/** Режет фрагмент на куски обычного текста и совпадений — для отрисовки без innerHTML. */
export function splitHighlight(snippet: string): SnippetPart[] {
  const parts: SnippetPart[] = [];
  let rest = snippet;

  while (rest.length > 0) {
    const start = rest.indexOf(HIGHLIGHT_START);
    if (start === -1) {
      parts.push({ text: rest, match: false });
      break;
    }
    if (start > 0) parts.push({ text: rest.slice(0, start), match: false });

    const end = rest.indexOf(HIGHLIGHT_END, start + 1);
    if (end === -1) {
      // Обрезанный маркер: остаток честнее показать как совпадение, чем потерять.
      parts.push({ text: rest.slice(start + 1), match: true });
      break;
    }
    parts.push({ text: rest.slice(start + 1, end), match: true });
    rest = rest.slice(end + 1);
  }

  return parts.filter((part) => part.text.length > 0);
}
