/**
 * Расчёт вида карты по набору точек. Вынесено из компонента: подобрать масштаб,
 * при котором в кадр попадают все сады, — единственная нетривиальная часть карты,
 * и её хочется проверить тестами.
 */

export type MapPoint = { lat: number; lng: number };

export type MapView = { lat: number; lng: number; zoom: number };

/** Дальше не приближаемся: у соседних садов координаты совпадают до улицы. */
const MAX_ZOOM = 16;

/** Ближе, чем область целиком, показывать нечего. */
const MIN_ZOOM = 4;

/** Когда сад один, город вокруг него полезнее, чем двор. */
const SINGLE_POINT_ZOOM = 14;

/**
 * Ширина карты, когда измерить её неоткуда: на сервере вёрстка ещё не разложена.
 * Типичная ширина колонки каталога на ноутбуке.
 */
const DEFAULT_WIDTH = 900;

/** Уже этого карта не бывает даже на телефоне — защита от нулевой ширины. */
const MIN_WIDTH = 320;

/**
 * Центр и масштаб, при которых в кадр попадают все точки.
 *
 * `width` — ширина карты в пикселях. В браузере её стоит померить у контейнера:
 * на узкой колонке масштаб, посчитанный под ноутбук, оставит метки за краем.
 */
export function mapView(points: MapPoint[], width = DEFAULT_WIDTH): MapView | null {
  if (points.length === 0) return null;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const center = { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };

  // Широта на экране «сжимается» ближе к полюсам, поэтому её разброс приводим
  // к долготной шкале — иначе вытянутый с севера на юг список обрежется.
  const spanLng = maxLng - minLng;
  const spanLat = (maxLat - minLat) / Math.cos((center.lat * Math.PI) / 180);
  const span = Math.max(spanLng, spanLat);

  if (span <= 0) return { ...center, zoom: SINGLE_POINT_ZOOM };

  // Один тайл — 256 пикселей и 360 градусов на нулевом масштабе.
  const zoom = Math.log2((360 * Math.max(width, MIN_WIDTH)) / (256 * span));

  return { ...center, zoom: clamp(Math.floor(zoom), MIN_ZOOM, MAX_ZOOM) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Яндекс отдаёт точку строкой «долгота широта» — именно в таком порядке. */
export function parseYandexPoint(pos: string | undefined): MapPoint | null {
  const [lng, lat] = (pos ?? '').split(' ').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Координаты для Яндекса: сначала долгота, потом широта. */
export function toYandexPoint({ lat, lng }: MapPoint): string {
  return `${round(lng)},${round(lat)}`;
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
