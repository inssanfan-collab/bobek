import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Жол картасы', ru: 'Как добраться' },
  open: { kk: '2ГИС-те ашу', ru: 'Открыть в 2ГИС' },
  route: { kk: 'Бағыт құру', ru: 'Построить маршрут' },
} as const;

/**
 * Карта проезда. Встраиваем 2ГИС — в Казахстане им пользуются чаще, чем картами Google.
 * Если координат нет, карта не показывается: пустая рамка хуже её отсутствия.
 */
export function RouteMap({
  lat,
  lng,
  address,
  locale,
}: {
  lat: number | null;
  lng: number | null;
  address: string;
  locale: Locale;
}) {
  if (lat == null || lng == null) return null;

  const point = `${lng},${lat}`;

  return (
    <section className="card overflow-hidden">
      <h2 className="px-6 pt-6 font-display text-2xl font-extrabold">{T.title[locale]}</h2>
      {address ? <p className="px-6 pt-1 text-muted">{address}</p> : null}

      <iframe
        src={`https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(
          JSON.stringify({ pos: { lat, lon: lng, zoom: 16 }, opt: { city: 'aktobe' }, org: '' }),
        )}`}
        title={T.title[locale]}
        loading="lazy"
        className="mt-4 h-80 w-full border-0"
      />

      <div className="flex flex-wrap gap-2 p-6 pt-4">
        <a
          href={`https://2gis.kz/aktobe/geo/${point}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          {T.open[locale]}
        </a>
        <a
          href={`https://2gis.kz/aktobe/directions/points/|${point}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm"
        >
          {T.route[locale]}
        </a>
      </div>
    </section>
  );
}
