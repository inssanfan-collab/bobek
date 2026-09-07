import { describe, expect, it } from 'vitest';
import { classifyHost, isValidSlug, normalizeHost, subdomainFor } from '@/lib/host';

const PORTAL = 'bobegim.kz';

describe('classifyHost', () => {
  it('узнаёт домен портала и www', () => {
    expect(classifyHost('bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
    expect(classifyHost('www.bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
  });

  it('выделяет поддомен сада', () => {
    expect(classifyHost('sad12.bobegim.kz', PORTAL)).toEqual({ kind: 'subdomain', slug: 'sad12' });
  });

  it('отбрасывает порт и регистр', () => {
    expect(classifyHost('SAD12.Bobegim.KZ:3000', PORTAL)).toEqual({ kind: 'subdomain', slug: 'sad12' });
  });

  it('считает купленный садом домен собственным', () => {
    expect(classifyHost('sad12-aqtobe.kz', PORTAL)).toEqual({ kind: 'custom', host: 'sad12-aqtobe.kz' });
  });

  it('не отдаёт сад по многоуровневому поддомену', () => {
    // a.b.bobegim.kz не должен резолвиться в сад «b»: иначе адресация становится неоднозначной.
    expect(classifyHost('a.b.bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
  });

  it('служебные имена не становятся садами', () => {
    expect(classifyHost('admin.bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
    expect(classifyHost('api.bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
    expect(classifyHost('mail.bobegim.kz', PORTAL)).toEqual({ kind: 'portal' });
  });

  it('пустой Host считает порталом, а не падает', () => {
    expect(classifyHost(null, PORTAL)).toEqual({ kind: 'portal' });
    expect(classifyHost('', PORTAL)).toEqual({ kind: 'portal' });
  });
});

describe('isValidSlug', () => {
  it('принимает нормальные адреса', () => {
    expect(isValidSlug('sad12')).toBe(true);
    expect(isValidSlug('kunshuaq-2')).toBe(true);
  });

  it('отклоняет служебные и некорректные', () => {
    expect(isValidSlug('www')).toBe(false);
    expect(isValidSlug('admin')).toBe(false);
    expect(isValidSlug('-sad')).toBe(false);
    expect(isValidSlug('sad-')).toBe(false);
    expect(isValidSlug('sad--12')).toBe(false);
    expect(isValidSlug('Сад12')).toBe(false);
    expect(isValidSlug('a')).toBe(false);
  });
});

describe('normalizeHost и subdomainFor', () => {
  it('нормализует хост', () => {
    expect(normalizeHost('  Sad12.Bobegim.KZ:3000 ')).toBe('sad12.bobegim.kz');
    expect(normalizeHost('sad12.bobegim.kz.')).toBe('sad12.bobegim.kz');
  });

  it('собирает адрес сада', () => {
    expect(subdomainFor('sad12', 'Bobegim.KZ')).toBe('sad12.bobegim.kz');
  });
});
