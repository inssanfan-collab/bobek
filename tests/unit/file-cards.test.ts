import { describe, expect, it } from 'vitest';
import { mediaIdsIn, renderFileCards, type FileInfo } from '@/lib/file-cards';
import { sanitizeContent } from '@/lib/sanitize';

const pdf: FileInfo = { mime: 'application/pdf', size: 245 * 1024, origName: 'plan.pdf' };
const docx: FileInfo = {
  mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  size: 3 * 1024 * 1024,
  origName: 'prikaz.docx',
};
const photo: FileInfo = { mime: 'image/webp', size: 1000, origName: 'a.webp' };

describe('карточки файлов в тексте', () => {
  // Так ссылку сохраняет редактор после серверной очистки.
  const saved = sanitizeContent('<p>Смотрите: <a href="/api/media/abc">📎 План закупок.pdf</a>&nbsp;</p>');

  it('PDF открывается в браузере, есть размер и «Скачать»', () => {
    const html = renderFileCards(saved, 'ru', new Map([['abc', pdf]]));
    expect(html).toContain('data-kind="pdf"');
    expect(html).toContain('>План закупок<');
    expect(html).not.toContain('📎');
    expect(html).toContain('PDF · 245 КБ');
    expect(html).toContain('href="/api/media/abc"');
    expect(html).toContain('href="/api/media/abc?download=1"');
  });

  it('Word открывается на странице просмотра, по-казахски — с языком', () => {
    const html = renderFileCards('<a href="/api/media/d1">📎 prikaz.docx</a>', 'kk', new Map([['d1', docx]]));
    expect(html).toContain('href="/doc/d1?lang=kk"');
    expect(html).toContain('Word · 3.0 МБ');
    expect(html).toContain('>Жүктеу<');
  });

  it('фото, чужие и удалённые файлы остаются обычными ссылками', () => {
    const source = '<a href="/api/media/p1">фото</a><a href="/api/media/zzz">чужой</a>';
    const html = renderFileCards(source, 'ru', new Map([['p1', photo]]));
    expect(html).toBe(source);
  });

  it('предпросмотр без базы угадывает вид по расширению', () => {
    const html = renderFileCards('<a href="/api/media/x">📎 menu.xlsx</a>', 'ru', null);
    expect(html).toContain('data-kind="excel"');
  });

  it('собирает id без повторов', () => {
    expect(mediaIdsIn('<a href="/api/media/a">1</a><a href="/api/media/a?download=1">2</a><a href="/x">3</a>')).toEqual(['a']);
  });
});
