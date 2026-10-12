import { describe, expect, it } from 'vitest';
import { auditDetails } from '@/lib/audit-details';

describe('auditDetails — подробности журнала человеческим языком', () => {
  it('материал — вид и название из meta', () => {
    expect(auditDetails({ action: 'content.create', entity: 'post', meta: { title: 'Дары осени' } }, 'ru')).toBe(
      'Новость «Дары осени»',
    );
  });

  it('старая запись без названия берёт нынешнее, удалённая — только вид', () => {
    expect(auditDetails({ action: 'content.update', entity: 'post', meta: {}, currentTitle: 'Наурыз' }, 'ru')).toBe(
      'Новость «Наурыз»',
    );
    expect(auditDetails({ action: 'content.delete', entity: 'post', meta: {} }, 'ru')).toBe(
      'Новость (название не записано)',
    );
  });

  it('вход под садом, вход с кодом, смена темы и оплата', () => {
    expect(auditDetails({ action: 'tenant.impersonate', entity: 'user', meta: { host: 'akku.edusad.kz', login: 'akku' } }, 'ru')).toBe(
      'akku.edusad.kz · логин: akku',
    );
    expect(auditDetails({ action: 'auth.login', entity: null, meta: { mfa: 'telegram' } }, 'ru')).toBe('с кодом из Telegram');
    expect(auditDetails({ action: 'tenant.theme', entity: null, meta: { from: null, to: 'oyin' } }, 'ru')).toBe('тема: нет → oyin');
    // toLocaleString ставит между разрядами неразрывный пробел.
    expect(auditDetails({ action: 'payment.record', entity: 'subscription', meta: { amount: 90000 } }, 'ru')).toMatch(
      /^сумма: 90\s000 ₸$/,
    );
  });

  it('по-казахски', () => {
    expect(auditDetails({ action: 'content.create', entity: 'post', meta: { title: 'Күз сыйы' } }, 'kk')).toBe('Жаңалық «Күз сыйы»');
  });
});
