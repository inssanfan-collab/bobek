import { describe, expect, it } from 'vitest';
import { auditDetails, changedKeys } from '@/lib/audit-details';

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

  it('папки и документы', () => {
    expect(auditDetails({ action: 'content.create', entity: 'folder', meta: { title: 'Жылдық жоспар 2026-2027' } }, 'ru')).toBe(
      'Папка «Жылдық жоспар 2026-2027»',
    );
    expect(auditDetails({ action: 'content.delete', entity: 'document', meta: { title: 'Приказ' } }, 'kk')).toBe('Құжат «Приказ»');
  });

  it('паспорт сада — какие поля поменяли, пары языков одним словом', () => {
    const changed = changedKeys(
      { nameRu: 'Сад', nameKk: 'Бақша', phone: null, langKk: true, lat: 50.1 },
      { nameRu: 'Сад №1', nameKk: 'Бақша №1', phone: '', langKk: false, lat: 50.2 },
    );
    expect(changed).toEqual(['nameRu', 'nameKk', 'langKk', 'lat']);
    expect(auditDetails({ action: 'tenant.update', entity: 'profile', meta: { changed } }, 'ru')).toBe(
      'Паспорт сада · изменено: название, казахский язык, точка на карте',
    );
    expect(auditDetails({ action: 'tenant.update', entity: 'profile', meta: { changed: [] } }, 'ru')).toBe(
      'Паспорт сада · ничего не изменилось',
    );
  });

  it('по-казахски', () => {
    expect(auditDetails({ action: 'content.create', entity: 'post', meta: { title: 'Күз сыйы' } }, 'kk')).toBe('Жаңалық «Күз сыйы»');
  });
});
