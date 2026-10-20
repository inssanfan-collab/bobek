import type { Locale } from '@/lib/i18n';
import { STATUS } from '@/lib/labels';
import type { TenantStatus } from '@prisma/client';

/**
 * «Детали» журнала действий (админка портала, /admin/audit) — человеческим
 * языком, а не JSON из `AuditLog.meta`: что именно создали, изменили или
 * удалили, под каким садом вошли, сколько заплатили.
 *
 * Название материала пишется в meta.title с 12.10.2026; у прежних записей
 * его нет — тогда страница подставляет нынешнее название по entityId,
 * а у удалённых остаётся только вид материала.
 */

type Phrase = { kk: string; ru: string };

const ENTITY: Record<string, Phrase> = {
  post: { kk: 'Жаңалық', ru: 'Новость' },
  media: { kk: 'Файл', ru: 'Файл' },
  section: { kk: 'Бөлім', ru: 'Раздел' },
  page: { kk: 'Бет', ru: 'Страница' },
  folder: { kk: 'Бума', ru: 'Папка' },
  document: { kk: 'Құжат', ru: 'Документ' },
  homepage: { kk: 'Басты бет', ru: 'Главная страница' },
  profile: { kk: 'Балабақша паспорты', ru: 'Паспорт сада' },
  portalSettings: { kk: 'Портал деректемелері', ru: 'Реквизиты портала' },
};

const KEY: Record<string, Phrase> = {
  host: { kk: 'мекенжай', ru: 'адрес' },
  login: { kk: 'логин', ru: 'логин' },
  slug: { kk: 'атауы', ru: 'имя' },
  status: { kk: 'мәртебе', ru: 'статус' },
  attempts: { kk: 'әрекет', ru: 'попытка' },
  amount: { kk: 'сома', ru: 'сумма' },
  plan: { kk: 'тариф', ru: 'тариф' },
  method: { kk: 'тәсіл', ru: 'способ' },
  invoiceNo: { kk: 'шот №', ru: 'счёт №' },
  number: { kk: '№', ru: '№' },
  periodEnd: { kk: 'дейін', ru: 'оплачено до' },
  field: { kk: 'өріс', ru: 'поле' },
  certStatus: { kk: 'сертификат', ru: 'сертификат' },
  lastError: { kk: 'қате', ru: 'ошибка' },
  groups: { kk: 'топтар', ru: 'групп' },
  staff: { kk: 'педагогтар', ru: 'педагогов' },
};

/**
 * Поля паспорта сада — для «что поменяли» (meta.changed). Пары Kk/Ru
 * сливаются в одно: «название», а не «название, название».
 */
const PROFILE_FIELD: Record<string, Phrase> = {
  name: { kk: 'атауы', ru: 'название' },
  shortName: { kk: 'қысқа атауы', ru: 'краткое название' },
  bin: { kk: 'БСН', ru: 'БИН' },
  licenseNo: { kk: 'лицензия', ru: 'лицензия' },
  address: { kk: 'мекенжай', ru: 'адрес' },
  district: { kk: 'аудан', ru: 'район' },
  phone: { kk: 'телефон', ru: 'телефон' },
  phoneExtra: { kk: 'қосымша телефон', ru: 'доп. телефон' },
  email: { kk: 'пошта', ru: 'почта' },
  workHours: { kk: 'жұмыс уақыты', ru: 'часы работы' },
  headName: { kk: 'меңгеруші', ru: 'заведующая' },
  groupsCount: { kk: 'топтар саны', ru: 'число групп' },
  langKk: { kk: 'қазақ тілі', ru: 'казахский язык' },
  langRu: { kk: 'орыс тілі', ru: 'русский язык' },
  about: { kk: 'сипаттама', ru: 'описание' },
  whatsapp: { kk: 'WhatsApp', ru: 'WhatsApp' },
  instagram: { kk: 'Instagram', ru: 'Instagram' },
  youtube: { kk: 'YouTube', ru: 'YouTube' },
  facebook: { kk: 'Facebook', ru: 'Facebook' },
  telegram: { kk: 'Telegram', ru: 'Telegram' },
  lat: { kk: 'картадағы нүкте', ru: 'точка на карте' },
  lng: { kk: 'картадағы нүкте', ru: 'точка на карте' },
};

/** Ключи, у которых значение изменилось. Пусто и null — одно и то же. */
export function changedKeys(before: object | null, after: Record<string, unknown>): string[] {
  const old = (before ?? {}) as Record<string, unknown>;
  return Object.keys(after).filter((key) => String(old[key] ?? '') !== String(after[key] ?? ''));
}

const T = {
  noTitle: { kk: 'атауы жазылмаған', ru: 'название не записано' },
  telegram: { kk: 'Telegram кодымен', ru: 'с кодом из Telegram' },
  instagram: { kk: 'Instagram-нан', ru: 'из Instagram' },
  notFound: { kk: 'мұндай логин жоқ немесе өшірілген', ru: 'нет такого логина или он отключён' },
  none: { kk: 'жоқ', ru: 'нет' },
  yes: { kk: 'иә', ru: 'да' },
  no: { kk: 'жоқ', ru: 'нет' },
  extended: { kk: 'мерзімі ұзартылды', ru: 'период продлён' },
  theme: { kk: 'тақырып', ru: 'тема' },
  changed: { kk: 'өзгертілді', ru: 'изменено' },
  nothing: { kk: 'ештеңе өзгермеді', ru: 'ничего не изменилось' },
} as const;

/** Пропускаем служебное: код поста Instagram, флаг ручного продления. */
const SKIP = new Set(['title', 'code', 'manual', 'mfa', 'source', 'reason', 'from', 'to', 'extended', 'changed']);

function plain(value: unknown, locale: Locale): string {
  if (value === null || value === undefined || value === '') return T.none[locale];
  if (typeof value === 'boolean') return value ? T.yes[locale] : T.no[locale];
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString(locale === 'kk' ? 'kk-KZ' : 'ru-RU');
  }
  return String(value);
}

export type AuditDetailsInput = {
  action: string;
  entity: string | null;
  meta: unknown;
  /** Нынешнее название записи — для старых записей журнала без meta.title. */
  currentTitle?: string | null;
};

/** Что сделано — одной строкой: «Новость «Дары осени»», «akku.edusad.kz · логин akku». */
export function auditDetails({ action, entity, meta, currentTitle }: AuditDetailsInput, locale: Locale): string {
  const m = (meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {}) as Record<string, unknown>;
  const parts: string[] = [];

  if (action.startsWith('content.') || entity === 'profile' || entity === 'portalSettings') {
    const label = entity ? ENTITY[entity]?.[locale] ?? entity : '';
    const title = typeof m.title === 'string' && m.title ? m.title : currentTitle;
    if (label && title) parts.push(`${label} «${title}»`);
    else if (label && entity !== 'homepage' && entity !== 'profile' && entity !== 'portalSettings') {
      parts.push(`${label} (${T.noTitle[locale]})`);
    } else if (label) parts.push(label);
  }

  if (Array.isArray(m.changed)) {
    const fields = [
      ...new Set(
        m.changed.map((key) => {
          const base = String(key).replace(/(Ru|Kk)$/, '');
          return (PROFILE_FIELD[base] ?? PROFILE_FIELD[String(key)])?.[locale] ?? String(key);
        }),
      ),
    ];
    parts.push(fields.length > 0 ? `${T.changed[locale]}: ${fields.join(', ')}` : T.nothing[locale]);
  }

  if (m.source === 'instagram') parts.push(T.instagram[locale]);
  if (m.mfa === 'telegram') parts.push(T.telegram[locale]);
  if (m.reason === 'not_found_or_inactive') parts.push(T.notFound[locale]);
  if (m.extended === true) parts.push(T.extended[locale]);
  if ('from' in m || 'to' in m) {
    const what = action === 'tenant.theme' ? T.theme[locale] : typeof m.field === 'string' ? m.field : '';
    parts.push(`${what ? `${what}: ` : ''}${plain(m.from, locale)} → ${plain(m.to, locale)}`);
  }

  for (const [key, value] of Object.entries(m)) {
    if (SKIP.has(key) || (key === 'field' && ('from' in m || 'to' in m))) continue;
    if (key === 'host') {
      parts.push(String(value));
      continue;
    }
    if (key === 'status' && typeof value === 'string' && value in STATUS) {
      parts.push(`${KEY.status[locale]}: ${STATUS[value as TenantStatus][locale]}`);
      continue;
    }
    if (key === 'amount' && typeof value === 'number') {
      parts.push(`${KEY.amount[locale]}: ${value.toLocaleString('ru-RU')} ₸`);
      continue;
    }
    parts.push(`${KEY[key]?.[locale] ?? key}: ${plain(value, locale)}`);
  }

  return parts.join(' · ');
}
