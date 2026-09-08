import { env } from '@/lib/env';
import { parseYandexPoint, type MapPoint } from '@/lib/map';

/**
 * Геокодер Яндекса: адрес -> координаты.
 *
 * Нужен потому, что заведующая своих координат не знает, а без них сад не
 * появится ни на карте каталога, ни в блоке «Как добраться». Поля широты и
 * долготы в админке остаются: геокодер иногда ошибается на одинаковых названиях
 * улиц, и заведующая должна иметь возможность поправить точку руками.
 */

const ENDPOINT = 'https://geocode-maps.yandex.ru/1.x/';

/** Актюбинская область целиком — сад может стоять и в райцентре, не только в Актобе. */
const REGION_BBOX = '53.0,46.0~62.5,51.5';

/**
 * Точность хуже уличной — это «где-то в городе». Ставить такую точку на карту
 * хуже, чем не ставить: родитель поедет по ложному адресу.
 */
const ACCEPTED_PRECISION = new Set(['exact', 'number', 'near', 'range']);

/** Сохранение профиля не должно ждать чужой сервис дольше нескольких секунд. */
const TIMEOUT_MS = 5000;

type GeocoderResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: {
        GeoObject?: {
          Point?: { pos?: string };
          metaDataProperty?: { GeocoderMetaData?: { precision?: string } };
        };
      }[];
    };
  };
};

/**
 * Возвращает координаты адреса или null — если ключа нет, сервис недоступен,
 * адрес не найден или найден слишком приблизительно.
 *
 * Никогда не бросает исключение: вызывается из сохранения профиля, и падение
 * геокодера не должно мешать саду сохранить свои данные.
 */
export async function geocodeAddress(address: string): Promise<MapPoint | null> {
  const query = address.trim();
  if (!query || !env.yandexGeocoderKey) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set('apikey', env.yandexGeocoderKey);
  url.searchParams.set('geocode', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('results', '1');
  url.searchParams.set('lang', 'ru_RU');
  // rspn=1 — не искать за пределами области: иначе «улица Абая, 12»
  // находится где-нибудь в Калифорнии.
  url.searchParams.set('bbox', REGION_BBOX);
  url.searchParams.set('rspn', '1');

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) {
      console.warn(`Геокодер ответил ${response.status} на адрес «${query}»`);
      return null;
    }

    const data = (await response.json()) as GeocoderResponse;
    const found = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

    const precision = found?.metaDataProperty?.GeocoderMetaData?.precision;
    if (!found || !precision || !ACCEPTED_PRECISION.has(precision)) return null;

    return parseYandexPoint(found.Point?.pos);
  } catch (error) {
    console.warn(`Геокодер недоступен для адреса «${query}»:`, error);
    return null;
  }
}
