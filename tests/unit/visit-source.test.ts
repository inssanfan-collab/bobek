import { describe, expect, it } from 'vitest';
import { sourceOf } from '@/lib/visit-source';

describe('sourceOf — откуда пришёл посетитель', () => {
  it('реклама — по gclid, даже если пришёл с google.com', () => {
    expect(sourceOf('https://www.google.com/', '/?gclid=abc')).toBe('реклама Google');
  });
  it('поисковики, соцсети и сайты садов', () => {
    expect(sourceOf('https://www.google.kz/', '/')).toBe('Google, поиск');
    expect(sourceOf('https://yandex.kz/search/', '/attestaciya')).toBe('Яндекс, поиск');
    expect(sourceOf('https://l.instagram.com/', '/')).toBe('Instagram');
    expect(sourceOf('https://aisha.edu.kz/news', '/')).toBe('с сайта сада aisha.edu.kz');
    expect(sourceOf('https://alan.edusad.kz/', '/')).toBe('с сайта сада alan.edusad.kz');
  });
  it('без страницы-источника — прямой заход, utm — как есть', () => {
    expect(sourceOf('', '/')).toMatch(/^прямой заход/);
    expect(sourceOf('', '/?utm_source=whatsapp')).toBe('метка utm: whatsapp');
  });
});
