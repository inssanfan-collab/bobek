import { describe, expect, it } from 'vitest';
import {
  ANTICORRUPTION_KEYS,
  USEFUL_CATALOG,
  customUrl,
  regionUrl,
  resolveUsefulLinks,
  type UsefulLinkRow,
} from '@/lib/useful-links';

const row = (over: Partial<UsefulLinkRow>): UsefulLinkRow => ({
  id: 'r1', catalogKey: null, titleKk: null, titleRu: null, noteKk: null, noteRu: null, url: null, mediaSrc: null,
  ...over,
});

describe('каталог «Полезных ссылок»', () => {
  it('ключи уникальны, у каждой плитки оба языка, адреса — https или tel', () => {
    const keys = USEFUL_CATALOG.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const item of USEFUL_CATALOG) {
      expect(item.title.kk && item.title.ru && item.note.kk && item.note.ru).toBeTruthy();
      if (item.href) for (const href of [item.href.kk, item.href.ru]) expect(href).toMatch(/^(https:\/\/|tel:\d+$)/);
    }
  });

  it('антикоррупционная группа — агентство и 1424', () => {
    expect(ANTICORRUPTION_KEYS).toEqual(['anticor', 'tel1424']);
  });
});

describe('адреса', () => {
  it('управление образования — только https и только .kz', () => {
    expect(regionUrl('https://www.gov.kz/memleket/entities/aktobe-bilim')).toBe('https://www.gov.kz/memleket/entities/aktobe-bilim');
    expect(regionUrl('www.gov.kz/x')).toBe('https://www.gov.kz/x');
    expect(regionUrl('http://www.gov.kz/x')).toBeNull();
    expect(regionUrl('https://example.com/kz')).toBeNull();
    expect(regionUrl('javascript:alert(1)')).toBeNull();
    expect(regionUrl('')).toBeNull();
  });

  it('свой баннер — https или http, без javascript: и мусора', () => {
    expect(customUrl('akimat.kz/news')).toBe('https://akimat.kz/news');
    expect(customUrl('http://site.example.org')).toBe('http://site.example.org/');
    expect(customUrl('javascript:alert(1)')).toBeNull();
    expect(customUrl('просто текст')).toBeNull();
  });
});

describe('resolveUsefulLinks', () => {
  it('плитка каталога берёт название и адрес из каталога на языке страницы', () => {
    const [ru] = resolveUsefulLinks([row({ catalogKey: 'minedu' })], 'ru');
    expect(ru).toMatchObject({ title: 'Министерство просвещения РК', isPhone: false });
    expect(ru!.href).toContain('lang=ru');
    const [kk] = resolveUsefulLinks([row({ catalogKey: 'minedu' })], 'kk');
    expect(kk!.title).toBe('ҚР Оқу-ағарту министрлігі');
  });

  it('телефон — tel:, без новой вкладки, номер крупно и подпись без номера', () => {
    expect(resolveUsefulLinks([row({ catalogKey: 'tel111' })], 'ru')[0]).toMatchObject({
      href: 'tel:111', isPhone: true, number: '111', title: 'Единый контакт-центр', tone: 'teal',
    });
    expect(resolveUsefulLinks([row({ catalogKey: 'tel1424' })], 'kk')[0]).toMatchObject({ number: '1424', tone: 'coral' });
  });

  it('цвет баннера — по группе, свой баннер — нейтральный', () => {
    const links = resolveUsefulLinks(
      [row({ id: 'a', catalogKey: 'egov' }), row({ id: 'b', titleRu: 'Акимат', url: 'akimat.kz' })],
      'ru',
    );
    expect(links.map((link) => link.tone)).toEqual(['blue', 'neutral']);
  });

  it('регион без адреса и устаревший ключ пропускаются, свой баннер — с картинкой', () => {
    const links = resolveUsefulLinks(
      [
        row({ id: 'a', catalogKey: 'region' }),
        row({ id: 'b', catalogKey: 'region', url: 'https://www.gov.kz/r', titleRu: 'Управление образования Актюбинской области' }),
        row({ id: 'c', catalogKey: 'больше-нет' }),
        row({ id: 'd', titleRu: 'Акимат района', url: 'akimat.kz', mediaSrc: '/api/media/1' }),
        row({ id: 'e', titleRu: 'Без адреса' }),
      ],
      'kk',
    );
    expect(links.map((link) => link.id)).toEqual(['b', 'd']);
    expect(links[0]!.title).toBe('Управление образования Актюбинской области');
    expect(links[1]).toMatchObject({ title: 'Акимат района', href: 'https://akimat.kz/', image: '/api/media/1', icon: 'link' });
  });
});
