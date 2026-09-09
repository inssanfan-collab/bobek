import type { DocumentCategory, TenantKind, TenantStatus, Role, FeedbackStatus } from '@prisma/client';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

/**
 * Подписи к перечислениям и форматирование дат — на обоих языках.
 *
 * Дата по-казахски начинается с года: «2026 жылғы 3 қыркүйек», поэтому
 * formatDate не сводится к подстановке названия месяца в общий шаблон.
 */

type Phrase = { kk: string; ru: string };

export const KIND: Record<TenantKind, Phrase> = {
  NURSERY_GARDEN: { kk: 'Бөбекжай', ru: 'Ясли-сад' },
  KINDERGARTEN: { kk: 'Балабақша', ru: 'Детский сад' },
  MINI_CENTER: { kk: 'Шағын орталық', ru: 'Мини-центр' },
  PRIVATE: { kk: 'Жеке балабақша', ru: 'Частный сад' },
  FAMILY: { kk: 'Отбасылық бөбекжай', ru: 'Семейный ясли-сад' },
};

export const STATUS: Record<TenantStatus, Phrase> = {
  DRAFT: { kk: 'Жоба', ru: 'Черновик' },
  ACTIVE: { kk: 'Жұмыс істейді', ru: 'Работает' },
  SUSPENDED: { kk: 'Тоқтатылған', ru: 'Приостановлен' },
  ARCHIVED: { kk: 'Мұрағатта', ru: 'В архиве' },
};

export const ROLE: Record<Role, Phrase> = {
  SUPERADMIN: { kk: 'Портал әкімшісі', ru: 'Администратор портала' },
  TENANT_ADMIN: { kk: 'Балабақша әкімшісі', ru: 'Администратор сада' },
  TENANT_EDITOR: { kk: 'Редактор', ru: 'Редактор' },
};

export const DOC_CATEGORY: Record<DocumentCategory, Phrase> = {
  CHARTER: { kk: 'Жарғы', ru: 'Устав' },
  LICENSE: { kk: 'Лицензия', ru: 'Лицензия' },
  ORDERS: { kk: 'Бұйрықтар', ru: 'Приказы' },
  RULES: { kk: 'Қабылдау қағидалары', ru: 'Правила приёма' },
  PROCUREMENT: { kk: 'Мемлекеттік сатып алулар', ru: 'Государственные закупки' },
  REPORTS: { kk: 'Есептер', ru: 'Отчёты' },
  TRUSTEE: { kk: 'Қамқоршылық кеңес', ru: 'Попечительский совет' },
  ANTICORRUPTION: { kk: 'Сыбайлас жемқорлыққа қарсы іс-қимыл', ru: 'Противодействие коррупции' },
  OTHER: { kk: 'Басқа', ru: 'Прочее' },
};

export const FEEDBACK_STATUS: Record<FeedbackStatus, Phrase> = {
  NEW: { kk: 'Жаңа', ru: 'Новое' },
  IN_PROGRESS: { kk: 'Жұмыста', ru: 'В работе' },
  ANSWERED: { kk: 'Жауап берілді', ru: 'Отвечено' },
};

export const STATUS_TONE: Record<TenantStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-slate-200 text-slate-700',
};

const MONTHS: Record<Locale, string[]> = {
  ru: [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ],
  kk: [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан',
  ],
};

/**
 * Дата словами. По-казахски год ставится первым — «2026 жылғы 22 наурыз»,
 * поэтому одной строкой с подстановкой тут не обойтись.
 */
export function formatDate(date: Date | string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = MONTHS[locale][d.getMonth()];
  return locale === 'kk'
    ? `${d.getFullYear()} жылғы ${d.getDate()} ${month}`
    : `${d.getDate()} ${month} ${d.getFullYear()}`;
}

export function formatDateTime(date: Date | string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${formatDate(d, locale)}, ${time}`;
}

/** Возраст группы хранится в месяцах — показываем «от 2 до 3 лет». */
export function formatAgeRange(
  from: number | null,
  to: number | null,
  locale: Locale = DEFAULT_LOCALE,
): string | null {
  if (from == null && to == null) return null;
  const toYears = (m: number) => (m % 12 === 0 ? `${m / 12}` : (m / 12).toFixed(1).replace('.0', ''));

  if (locale === 'kk') {
    if (from != null && to != null) return `${toYears(from)} жастан ${toYears(to)} жасқа дейін`;
    if (from != null) return `${toYears(from)} жастан`;
    return `${toYears(to as number)} жасқа дейін`;
  }

  if (from != null && to != null) return `от ${toYears(from)} до ${toYears(to)} лет`;
  if (from != null) return `от ${toYears(from)} лет`;
  return `до ${toYears(to as number)} лет`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₸`;
}
