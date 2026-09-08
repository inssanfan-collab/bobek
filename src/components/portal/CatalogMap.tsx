import { mapView, toYandexPoint, type MapPoint } from '@/lib/map';

/**
 * Карта садов в каталоге. Встраиваем виджет Яндекса — он не требует ключа
 * и грузится только когда доедет до экрана. Координаты приходят от геокодера
 * при сохранении профиля сада (см. src/server/maps/yandex.ts).
 *
 * Сады без координат на карте не появляются: метка наугад в центре города
 * увела бы родителя не туда. В списке карточек ниже они есть как обычно.
 */

/** Меток больше на карте города не разглядеть, а адрес виджета не резиновый. */
const MAX_MARKS = 60;

export function CatalogMap({ points }: { points: MapPoint[] }) {
  const shown = points.slice(0, MAX_MARKS);
  const view = mapView(shown);
  if (!view) return null;

  const src = new URL('https://yandex.ru/map-widget/v1/');
  src.searchParams.set('ll', toYandexPoint(view));
  src.searchParams.set('z', String(view.zoom));
  src.searchParams.set('pt', shown.map((point) => `${toYandexPoint(point)},pm2rdm`).join('~'));
  src.searchParams.set('lang', 'ru_RU');

  return (
    <section className="card mt-8 overflow-hidden">
      <iframe
        src={src.toString()}
        title="Детские сады Актобе на карте"
        loading="lazy"
        className="h-72 w-full border-0 sm:h-96"
      />
      {points.length > shown.length ? (
        <p className="px-5 py-3 text-sm text-muted">
          На карте первые {shown.length} садов из {points.length}. Уточните поиск, чтобы увидеть нужный.
        </p>
      ) : null}
    </section>
  );
}
