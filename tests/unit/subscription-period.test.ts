import { describe, expect, it } from 'vitest';
import { periodIsOver } from '@/lib/subscription-period';

describe('periodIsOver', () => {
  // Подписка «до 10 сентября»: так её видит сад в карточке и в договоре.
  const end = new Date('2027-09-10T00:00:00+05:00');

  it('последний оплаченный день сад работает целиком', () => {
    expect(periodIsOver(end, new Date('2027-09-10T09:00:00+05:00').getTime())).toBe(false);
    expect(periodIsOver(end, new Date('2027-09-10T23:59:00+05:00').getTime())).toBe(false);
  });

  it('со следующего дня подписка закончилась — льготных дней нет', () => {
    expect(periodIsOver(end, new Date('2027-09-11T00:00:00+05:00').getTime())).toBe(true);
    expect(periodIsOver(end, new Date('2027-09-11T09:00:00+05:00').getTime())).toBe(true);
  });

  it('до окончания — действует', () => {
    expect(periodIsOver(end, new Date('2027-08-01T12:00:00+05:00').getTime())).toBe(false);
  });
});
