import { toYandexPoint } from '@/lib/map';
import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Жол картасы', ru: 'Как добраться' },
  open2gis: { kk: '2ГИС-те ашу', ru: 'Открыть в 2ГИС' },
  route: { kk: 'Бағыт құру', ru: 'Построить маршрут' },
} as const;

/**
 * Карта проезда на сайте сада.
 *
 * Был виджет 2ГИС типа firmsonmap. Он ждёт идентификатор организации,
 * а сад — не организация в справочнике 2ГИС, и мы передавали пустую строку:
 * виджет грузился, но вместо карты показывал «Something went wrong».
 *
 * Теперь тот же виджет Яндекса, что и в каталоге портала. Ключа он
 * не требует и к домену не привязан — это важно, потому что у сада может
 * быть собственный домен, а ключ JavaScript API выдаётся под конкретный.
 * Координаты и так приходят от геокодера Яндекса при сохранении профиля,
 * поэтому метка стоит ровно там, где Яндекс считает адрес.
 *
 * Кнопка 2ГИС осталась: в Казахстане им часто пользуются для навигации.
 *
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

  const point = toYandexPoint({ lat, lng });

  const widget = new URL('https://yandex.ru/map-widget/v1/');
  widget.searchParams.set('ll', point);
  widget.searchParams.set('z', '16');
  widget.searchParams.set('pt', `${point},pm2rdm`);
  // Казахского у виджета Яндекса нет, поэтому подписи на карте всегда русские.
  widget.searchParams.set('lang', 'ru_RU');

  return (
    <section className="card overflow-hidden">
      <h2 className="px-6 pt-6 font-display text-2xl font-extrabold">{T.title[locale]}</h2>
      {address ? <p className="px-6 pt-1 text-muted">{address}</p> : null}

      <iframe
        src={widget.toString()}
        title={T.title[locale]}
        loading="lazy"
        className="mt-4 h-80 w-full border-0"
      />

      <div className="flex flex-wrap gap-2 p-6 pt-4">
        <a
          href={`https://2gis.kz/aktobe/geo/${lng},${lat}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          {T.open2gis[locale]}
        </a>
        <a
          href={`https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`}
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
