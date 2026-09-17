import { describe, expect, it } from 'vitest';
import {
  canDeleteSection, isValidSectionSlug, normalizeLinkUrl, sectionLink, sectionSettings,
} from '@/lib/sections';

describe('normalizeLinkUrl', () => {
  it('принимает адрес так, как его вставляет человек', () => {
    expect(normalizeLinkUrl('darabala.kz')).toBe('https://darabala.kz/');
    expect(normalizeLinkUrl('  https://instagram.com/aisha  ')).toBe('https://instagram.com/aisha');
    expect(normalizeLinkUrl('/contacts')).toBe('/contacts');
  });

  it('не пропускает схемы, которыми через меню можно навредить', () => {
    expect(normalizeLinkUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeLinkUrl('data:text/html,<script>')).toBeNull();
  });

  it('«//сайт» — это внешний адрес, а не страница нашего сайта', () => {
    // Иначе ссылка открылась бы как внутренняя, без новой вкладки и rel=noopener.
    expect(normalizeLinkUrl('//instagram.com/aisha')).toBe('https://instagram.com/aisha');
  });

  it('отсеивает мусор', () => {
    expect(normalizeLinkUrl('')).toBeNull();
    expect(normalizeLinkUrl('просто текст')).toBeNull();
    expect(normalizeLinkUrl('localhost')).toBeNull();
  });
});

describe('isValidSectionSlug', () => {
  it('латиница, цифры и дефис', () => {
    expect(isValidSectionSlug('logoped')).toBe(true);
    expect(isValidSectionSlug('materialy-samoocenki')).toBe(true);
    expect(isValidSectionSlug('ab')).toBe(true);
  });

  it('адреса самого сайта заняты', () => {
    for (const slug of ['admin', 'search', 'doc', 'unavailable', 'api']) {
      expect(isValidSectionSlug(slug)).toBe(false);
    }
  });

  it('кривые адреса не проходят', () => {
    expect(isValidSectionSlug('a')).toBe(false);
    expect(isValidSectionSlug('-logoped')).toBe(false);
    expect(isValidSectionSlug('logo--ped')).toBe(false);
    expect(isValidSectionSlug('Логопед')).toBe(false);
  });
});

describe('удаление разделов', () => {
  it('страницу, ссылку и свой раздел удалить можно', () => {
    expect(canDeleteSection({ type: 'PAGE', settings: {} })).toBe(true);
    expect(canDeleteSection({ type: 'LINK', settings: {} })).toBe(true);
    expect(canDeleteSection({ type: 'DOCUMENTS', settings: { custom: true, folderId: 'f1' } })).toBe(true);
  });

  it('ленты, галерею и общие документы — только скрыть', () => {
    expect(canDeleteSection({ type: 'NEWS', settings: {} })).toBe(false);
    expect(canDeleteSection({ type: 'GALLERY', settings: {} })).toBe(false);
    expect(canDeleteSection({ type: 'DOCUMENTS', settings: {} })).toBe(false);
  });
});

describe('sectionSettings и sectionLink', () => {
  it('мусор в настройках не роняет сайт', () => {
    expect(sectionSettings(null)).toEqual({ custom: false, folderId: null, url: null });
    expect(sectionSettings('строка')).toEqual({ custom: false, folderId: null, url: null });
    expect(sectionSettings({ custom: 'да', url: 42 })).toEqual({ custom: false, folderId: null, url: null });
  });

  it('ссылка ведёт наружу, остальные разделы — на свой адрес с языком', () => {
    const withLang = (path: string) => `${path}?lang=kk`;
    expect(sectionLink({ type: 'LINK', slug: 'darabala', settings: { url: 'https://darabala.kz/' } }, withLang))
      .toEqual({ href: 'https://darabala.kz/', external: true });
    expect(sectionLink({ type: 'PAGE', slug: 'logoped', settings: {} }, withLang))
      .toEqual({ href: '/logoped?lang=kk', external: false });
  });
});
