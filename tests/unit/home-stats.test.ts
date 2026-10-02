import { describe, expect, it } from 'vitest';
import type { TenantProfile } from '@prisma/client';
import { homeStats } from '@/lib/home-stats';

const profile = (patch: Partial<TenantProfile>) => ({ groupsCount: null, placesTotal: null, ...patch }) as TenantProfile;

describe('homeStats — счётчики на главной только из настоящих данных', () => {
  it('берёт группы и педагогов из базы, места — из паспорта', () => {
    expect(homeStats(profile({ placesTotal: 95 }), { groups: 4, staff: 15 }, 'kk')).toEqual([
      { value: '4', label: 'топ' },
      { value: '15', label: 'педагог' },
      { value: '95', label: 'орын' },
    ]);
  });

  it('без групп в базе берёт число групп из паспорта', () => {
    expect(homeStats(profile({ groupsCount: 6 }), { groups: 0, staff: 0 }, 'ru')).toEqual([{ value: '6', label: 'групп' }]);
  });

  it('ничего не выдумывает, если данных нет', () => {
    expect(homeStats(null, undefined, 'ru')).toEqual([]);
    expect(homeStats(profile({}), { groups: 0, staff: 0 }, 'kk')).toEqual([]);
  });
});
