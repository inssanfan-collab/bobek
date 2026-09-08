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
