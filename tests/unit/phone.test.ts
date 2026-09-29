import { describe, expect, it } from 'vitest';
import { formatPhone, phoneHref } from '@/lib/labels';

describe('formatPhone', () => {
  it('раскладывает номер по группам, как бы его ни записали', () => {
    expect(formatPhone('+77087685707')).toBe('+7 708 768 57 07');
    expect(formatPhone('8 (708) 768-57-07')).toBe('+7 708 768 57 07');
    expect(formatPhone(' +7 708 768 57 07 ')).toBe('+7 708 768 57 07');
  });

  it('незнакомый номер оставляет как есть', () => {
    expect(formatPhone('+996 555 123 456')).toBe('+996 555 123 456');
    expect(formatPhone('')).toBe('');
  });

  it('ссылка для звонка — без пробелов и скобок', () => {
    expect(phoneHref('+7 (708) 768-57-07')).toBe('tel:+77087685707');
  });
});
