'use client';

import { useEffect, useRef, useState } from 'react';
import { mapView, type MapPoint } from '@/lib/map';

/**
 * Интерактивная карта каталога на JavaScript API Яндекса 2.1.
 *
 * Клиентский компонент: API рисует карту только в браузере. Скрипт грузится
 * один раз на вкладку — в dev React монтирует эффекты дважды, и без общего
 * промиса на странице оказалось бы две карты.
 *
 * Карта строится по нажатию, а не сразу. У бесплатного тарифа сто запросов
 * в сутки, и на каждый заход в каталог их хватило бы на сотню родителей:
 * сто первый увидел бы пустое место. По клику тот же лимит расходуется только
 * на тех, кому карта действительно нужна, а страница остаётся лёгкой.
 */

export type MapGarden = MapPoint & {
  number: number;
  name: string;
  address: string;
  href: string;
};

type YMaps = {
  ready: (callback: () => void) => void;
  Map: new (el: HTMLElement, state: object, options?: object) => YMap;
  Placemark: new (coords: [number, number], props: object, options: object) => unknown;
};

type YMap = {
  geoObjects: { add: (object: unknown) => void };
  destroy: () => void;
};

declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

let loading: Promise<YMaps> | null = null;

function loadApi(key: string): Promise<YMaps> {
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      const api = window.ymaps;
      if (api) api.ready(() => resolve(api));
      else reject(new Error('Карты Яндекса загрузились без ymaps'));
    };
    script.onerror = () => reject(new Error('Карты Яндекса не загрузились'));
    document.head.appendChild(script);
  });

  return loading;
}

export function CatalogMapInteractive({
  gardens,
  apiKey,
}: {
  gardens: MapGarden[];
  apiKey: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const element = container.current;
    if (!element) return;

    // Масштаб считаем от настоящей ширины контейнера: на телефоне и на ноутбуке
    // одни и те же три сада требуют разного приближения.
    const view = mapView(gardens, element.clientWidth);
    if (!view) return;

    let map: YMap | null = null;
    let cancelled = false;

    loadApi(apiKey)
      .then((ymaps) => {
        if (cancelled || !container.current) return;

        map = new ymaps.Map(
          container.current,
          {
            center: [view.lat, view.lng],
            zoom: view.zoom,
            controls: ['zoomControl'],
            // Без scrollZoom: карта во всю ширину иначе перехватывает прокрутку
            // страницы, и на телефоне список садов становится не пролистать.
            // Приблизить можно кнопками и пальцами.
            behaviors: ['drag', 'dblClickZoom', 'multiTouch'],
          },
          { suppressMapOpenBlock: true },
        );

        for (const garden of gardens) {
          map.geoObjects.add(
            new ymaps.Placemark(
              [garden.lat, garden.lng],
              {
                iconContent: String(garden.number),
                hintContent: escapeHtml(garden.name),
                balloonContentHeader: escapeHtml(garden.name),
                balloonContentBody: escapeHtml(garden.address),
                balloonContentFooter: `<a href="${escapeHtml(garden.href)}">Открыть сайт →</a>`,
              },
              { preset: 'islands#redCircleIcon' },
            ),
          );
        }
      })
      .catch((error) => {
        // Карта — не единственный способ найти сад: ниже тот же список карточками.
        console.warn('Карта каталога не построилась:', error);
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [open, gardens, apiKey]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-brand-soft/40"
      >
        <span aria-hidden className="text-2xl">🗺️</span>
        <span>
          <span className="block font-semibold">Показать на карте</span>
          <span className="block text-sm text-muted">
            Садов с адресом на карте: {gardens.length}. Номер метки совпадает с номером карточки.
          </span>
        </span>
      </button>
    );
  }

  return <div ref={container} className="h-72 w-full sm:h-96" style={{ minHeight: 288 }} />;
}

/** Название и адрес сад вводит сам, а балун принимает HTML. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
