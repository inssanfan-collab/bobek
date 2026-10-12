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

/**
 * В бесплатной базе города только по-английски. Крупные города Казахстана
 * переводим, остальные — как есть. Уточнение района в скобках убираем:
 * «Almaty (Almaly Audany)» → «Алматы».
 */
const CITY_RU: Record<string, string> = {
  Almaty: 'Алматы', Astana: 'Астана', 'Nur-Sultan': 'Астана', Shymkent: 'Шымкент', Aktobe: 'Актобе',
  Karaganda: 'Караганда', Qaraghandy: 'Караганда', Taraz: 'Тараз', Pavlodar: 'Павлодар',
  'Ust-Kamenogorsk': 'Усть-Каменогорск', Oskemen: 'Усть-Каменогорск', Semey: 'Семей', Atyrau: 'Атырау',
  Kostanay: 'Костанай', Qostanay: 'Костанай', Kyzylorda: 'Кызылорда', Oral: 'Уральск', Uralsk: 'Уральск',
  Petropavl: 'Петропавловск', Petropavlovsk: 'Петропавловск', Aktau: 'Актау', Temirtau: 'Темиртау',
  Turkistan: 'Туркестан', Kokshetau: 'Кокшетау', Taldykorgan: 'Талдыкорган', Ekibastuz: 'Экибастуз',
  Rudnyy: 'Рудный', Rudny: 'Рудный', Zhezkazgan: 'Жезказган', Balkhash: 'Балхаш', Zhitikara: 'Житикара',
  Kaskelen: 'Каскелен', Konayev: 'Конаев', Kapchagay: 'Конаев', Satpayev: 'Сатпаев', Stepnogorsk: 'Степногорск',
  Zhanaozen: 'Жанаозен', Kandyagash: 'Кандыагаш', Khromtau: 'Хромтау', Shchuchinsk: 'Щучинск',
};
const cityName = (names: Names) => {
  const raw = name(names).replace(/\s*\(.*\)\s*$/, '');
  return CITY_RU[raw] ?? raw;
};

/** «Шымкент, Казахстан»; пусто — не определить. */
export async function cityOf(ip: string | null): Promise<string> {
  if (!ip || !maxmind.validate(ip)) return '';
  const db = await open();
  const found = db?.get(ip);
  if (!found) return '';
  return [cityName(found.city?.names as Names), name(found.country?.names as Names)].filter(Boolean).join(', ');
}
