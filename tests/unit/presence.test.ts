import { describe, expect, it } from 'vitest';
import { adminPlace, deviceName } from '@/lib/presence';

describe('adminPlace — что открыто в админке', () => {
  it('называет раздел так же, как меню', () => {
    expect(adminPlace('/admin/clubs', 'ru')).toBe('Кружки и услуги');
    expect(adminPlace('/admin', 'ru')).toBe('Обзор');
    expect(adminPlace('/admin/subscriptions', 'kk')).toBe('Жазылымдар');
  });

  it('отличает новости от объявлений и правку от новой записи', () => {
    expect(adminPlace('/admin/posts?type=ANNOUNCEMENT', 'ru')).toBe('Объявления');
    expect(adminPlace('/admin/posts/new?type=NEWS', 'ru')).toBe('Новости · новая запись');
    expect(adminPlace('/admin/posts/abc123', 'ru')).toBe('Новости · редактирование');
  });

  it('незнакомый путь показывает как есть, пустой — прочерком', () => {
    expect(adminPlace('/admin/something', 'ru')).toBe('/admin/something');
    expect(adminPlace(null, 'ru')).toBe('—');
  });
});

describe('deviceName', () => {
  it('коротко называет систему и браузер', () => {
    expect(deviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36')).toBe('Windows · Chrome');
    expect(deviceName(null)).toBe('—');
  });
});
