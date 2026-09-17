import { describe, expect, it } from 'vitest';
import { sanitizeContent, toPlainText } from '@/lib/sanitize';

describe('sanitizeContent', () => {
  it('вырезает скрипты и обработчики событий', () => {
    expect(sanitizeContent('<p>Привет</p><script>alert(1)</script>')).toBe('<p>Привет</p>');
    expect(sanitizeContent('<p onclick="alert(1)">Текст</p>')).toBe('<p>Текст</p>');
  });

  it('оставляет разметку, нужную саду', () => {
    const html = sanitizeContent('<h2>Режим дня</h2><ul><li>Завтрак</li></ul><strong>важно</strong>');
    expect(html).toContain('<h2>Режим дня</h2>');
    expect(html).toContain('<li>Завтрак</li>');
    expect(html).toContain('<strong>важно</strong>');
  });

  it('запрещает javascript: в ссылках', () => {
    expect(sanitizeContent('<a href="javascript:alert(1)">клик</a>')).not.toContain('javascript:');
  });

  it('добавляет ссылкам защиту от подмены вкладки', () => {
    const html = sanitizeContent('<a href="https://egov.kz">egov</a>');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it('переводит устаревшие теги в современные', () => {
    expect(sanitizeContent('<b>жирный</b>')).toBe('<strong>жирный</strong>');
  });
});

describe('toPlainText', () => {
  it('делает анонс из разметки', () => {
    expect(toPlainText('<p>Привет,   <strong>мир</strong></p>')).toBe('Привет, мир');
  });

  it('обрезает по границе слова', () => {
    const result = toPlainText('<p>' + 'слово '.repeat(50) + '</p>', 20);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('фото из редактора', () => {
  it('раскладка сохраняется, служебные пометки и чужие классы — нет', () => {
    const html = sanitizeContent('<img src="/api/media/abc" alt="Утренник" class="img-left evil" data-selected="">');
    expect(html).toContain('class="img-left"');
    expect(html).not.toContain('evil');
    expect(html).not.toContain('data-selected');
  });

  it('таблица, цитата и линия проходят', () => {
    const html = sanitizeContent('<blockquote>Важно</blockquote><hr><table><thead><tr><th>Время</th></tr></thead><tbody><tr><td>08:00</td></tr></tbody></table>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<hr />');
    expect(html).toContain('<th>Время</th>');
  });
});
