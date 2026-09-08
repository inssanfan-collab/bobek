import { env } from '@/lib/env';
import { mapView, toYandexPoint } from '@/lib/map';
import { CatalogMapInteractive, type MapGarden } from './CatalogMapInteractive';

/**
 * Карта садов в каталоге. Координаты приходят от геокодера при сохранении
 * профиля сада (см. src/server/maps/yandex.ts).
 *
 * С ключом JavaScript API карта интерактивная: метки пронумерованы так же,
 * как карточки ниже, и по клику открывается сайт сада. Без ключа остаётся
 * виджет в iframe — он ключа не требует и лимитов не имеет, поэтому портал
 * не ломается на сервере, где ключ не завели.
 *
 * Сады без координат на карту не попадают: метка наугад увела бы родителя
 * не туда. В списке карточек они есть как обычно.
 */

/** Меток больше на карте города не разглядеть, а адрес виджета не резиновый. */
const MAX_MARKS = 60;

export function CatalogMap({ gardens }: { gardens: MapGarden[] }) {
  const shown = gardens.slice(0, MAX_MARKS);
  if (shown.length === 0) return null;

  return (
    <section className="card mt-8 overflow-hidden" data-testid="catalog-map">
      {env.yandexMapsKey ? (
        <CatalogMapInteractive gardens={shown} apiKey={env.yandexMapsKey} />
      ) : (
        <WidgetMap gardens={shown} />
      )}

      {gardens.length > shown.length ? (
        <p className="px-5 py-3 text-sm text-muted">
          На карте первые {shown.length} садов из {gardens.length}. Уточните поиск, чтобы увидеть нужный.
        </p>
      ) : null}
    </section>
  );
}

function WidgetMap({ gardens }: { gardens: MapGarden[] }) {
  const view = mapView(gardens);
  if (!view) return null;

  const src = new URL('https://yandex.ru/map-widget/v1/');
  src.searchParams.set('ll', toYandexPoint(view));
  src.searchParams.set('z', String(view.zoom));
  src.searchParams.set('pt', gardens.map((garden) => `${toYandexPoint(garden)},pm2rdm`).join('~'));
  src.searchParams.set('lang', 'ru_RU');

  return (
    <iframe
      src={src.toString()}
      title="Детские сады Актобе на карте"
      loading="lazy"
      className="h-72 w-full border-0 sm:h-96"
    />
  );
}
