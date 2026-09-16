import { describe, expect, it } from 'vitest';
import { amountInWords } from '@/lib/amount-words';

describe('amountInWords', () => {
  it('годовая подписка — то, что печатается чаще всего', () => {
    expect(amountInWords(50000, 'ru')).toBe('Пятьдесят тысяч тенге 00 тиын');
    expect(amountInWords(50000, 'kk')).toBe('Елу мың теңге 00 тиын');
  });

  it('согласует тысячи по-русски: «одна», «две», а не «один», «два»', () => {
    expect(amountInWords(1000, 'ru')).toBe('Одна тысяча тенге 00 тиын');
    expect(amountInWords(2000, 'ru')).toBe('Две тысячи тенге 00 тиын');
    expect(amountInWords(5000, 'ru')).toBe('Пять тысяч тенге 00 тиын');
  });

  it('по-казахски единица перед «мың» и «жүз» не ставится', () => {
    expect(amountInWords(1000, 'kk')).toBe('Мың теңге 00 тиын');
    expect(amountInWords(100, 'kk')).toBe('Жүз теңге 00 тиын');
    expect(amountInWords(200, 'kk')).toBe('Екі жүз теңге 00 тиын');
  });

  it('разряды и остаток', () => {
    expect(amountInWords(123456, 'ru')).toBe('Сто двадцать три тысячи четыреста пятьдесят шесть тенге 00 тиын');
    expect(amountInWords(123456, 'kk')).toBe('Жүз жиырма үш мың төрт жүз елу алты теңге 00 тиын');
  });

  it('подростковые числа и ноль', () => {
    expect(amountInWords(14, 'ru')).toBe('Четырнадцать тенге 00 тиын');
    expect(amountInWords(14, 'kk')).toBe('Он төрт теңге 00 тиын');
    expect(amountInWords(0, 'ru')).toBe('Ноль тенге 00 тиын');
  });

  it('тиыны показываются двумя знаками', () => {
    expect(amountInWords(50000.5, 'ru')).toBe('Пятьдесят тысяч тенге 50 тиын');
    expect(amountInWords(99.9, 'kk')).toBe('Тоқсан тоғыз теңге 90 тиын');
  });
});
