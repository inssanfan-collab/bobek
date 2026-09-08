import { describe, expect, it } from 'vitest';
import { mapView, parseYandexPoint, toYandexPoint } from '@/lib/map';

const SAD12 = { lat: 50.202621, lng: 57.286689 };
const ERTEGI = { lat: 50.288753, lng: 57.159056 };

describe('mapView', () => {
  it('без точек карты нет', () => {
    // Пустая карта в центре города хуже её отсутствия.
    expect(mapView([])).toBeNull();
  });

  it('на одном саде показывает город вокруг него', () => {
    expect(mapView([SAD12])).toEqual({ ...SAD12, zoom: 14 });
  });

  it('на нескольких садах центрируется между ними', () => {
    const view = mapView([SAD12, ERTEGI]);
    expect(view?.lat).toBeCloseTo((SAD12.lat + ERTEGI.lat) / 2, 6);
    expect(view?.lng).toBeCloseTo((SAD12.lng + ERTEGI.lng) / 2, 6);
  });

  it('отдаляется, когда сады разъехались по области', () => {
    const city = mapView([SAD12, ERTEGI])?.zoom ?? 0;
    const region = mapView([SAD12, { lat: 48.8, lng: 58.1 }])?.zoom ?? 0;
    expect(region).toBeLessThan(city);
    expect(region).toBeGreaterThanOrEqual(4);
  });

  it('не приближается вплотную к совпавшим координатам', () => {
    // У соседних садов адрес часто резолвится в одну и ту же точку улицы.
    expect(mapView([SAD12, SAD12])?.zoom).toBeLessThanOrEqual(16);
  });
});

describe('toYandexPoint', () => {
  it('ставит долготу перед широтой', () => {
    // Порядок обратный привычному: перепутанные местами координаты
    // отправляют сад в Индийский океан.
    expect(toYandexPoint(SAD12)).toBe('57.286689,50.202621');
  });
});

describe('parseYandexPoint', () => {
  it('читает ответ геокодера «долгота широта»', () => {
    expect(parseYandexPoint('57.159056 50.288753')).toEqual(ERTEGI);
  });

  it('на мусоре возвращает null, а не NaN', () => {
    expect(parseYandexPoint(undefined)).toBeNull();
    expect(parseYandexPoint('')).toBeNull();
    expect(parseYandexPoint('где-то там')).toBeNull();
  });
});
