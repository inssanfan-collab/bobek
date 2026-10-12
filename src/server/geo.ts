import 'server-only';
import { existsSync } from 'node:fs';
import maxmind, { type CityResponse, type Reader } from 'maxmind';

/**
 * Город посетителя по IP — для сводки владельцу о посетителях портала
 * (src/server/visits.ts). База DB-IP Lite (бесплатная, CC BY 4.0, ссылка
 * на источник — на /privacy) лежит на нашем сервере: адреса никуда не
 * отправляются, а в сводку попадает только город, сам IP — нет.
 *
 * Файл — GEOIP_DB_PATH или /var/lib/edusad/geo/dbip-city-lite.mmdb;
 * обновляется раз в месяц (deploy/vsesad-geoip). Нет файла — города нет.
 */

const DB_PATH = process.env.GEOIP_DB_PATH ?? '/var/lib/edusad/geo/dbip-city-lite.mmdb';

let reader: Promise<Reader<CityResponse> | null> | null = null;

function open(): Promise<Reader<CityResponse> | null> {
  reader ??= existsSync(DB_PATH)
    ? maxmind.open<CityResponse>(DB_PATH, { watchForUpdates: true }).catch((error) => {
        console.error('[geo] база не открылась:', (error as Error).message);
        return null;
      })
    : Promise.resolve(null);
  return reader;
}

type Names = Record<string, string> | undefined;
const name = (names: Names) => names?.ru ?? names?.en ?? '';

/** «Шымкент, Казахстан»; пусто — не определить. */
export async function cityOf(ip: string | null): Promise<string> {
  if (!ip || !maxmind.validate(ip)) return '';
  const db = await open();
  const found = db?.get(ip);
  if (!found) return '';
  return [name(found.city?.names as Names), name(found.country?.names as Names)].filter(Boolean).join(', ');
}
