import type { DocumentCategory, TenantKind, TenantStatus, Role, FeedbackStatus } from '@prisma/client';

export const KIND_LABEL: Record<TenantKind, string> = {
  NURSERY_GARDEN: 'Ясли-сад',
  KINDERGARTEN: 'Детский сад',
  MINI_CENTER: 'Мини-центр',
  PRIVATE: 'Частный сад',
  FAMILY: 'Семейный ясли-сад',
};

export const STATUS_LABEL: Record<TenantStatus, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Работает',
  SUSPENDED: 'Приостановлен',
  ARCHIVED: 'В архиве',
};

export const STATUS_TONE: Record<TenantStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-slate-200 text-slate-700',
};

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: 'Администратор портала',
  TENANT_ADMIN: 'Администратор сада',
  TENANT_EDITOR: 'Редактор',
};

export const DOC_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  CHARTER: 'Устав',
  LICENSE: 'Лицензия',
  ORDERS: 'Приказы',
  RULES: 'Правила приёма',
  PROCUREMENT: 'Государственные закупки',
  REPORTS: 'Отчёты',
  TRUSTEE: 'Попечительский совет',
  ANTICORRUPTION: 'Противодействие коррупции',
  OTHER: 'Прочее',
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  NEW: 'Новое',
  IN_PROGRESS: 'В работе',
  ANSWERED: 'Отвечено',
};

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${formatDate(d)}, ${time}`;
}

/** Возраст группы хранится в месяцах — показываем «от 2 до 3 лет». */
export function formatAgeRange(from: number | null, to: number | null): string | null {
  if (from == null && to == null) return null;
  const toYears = (m: number) => (m % 12 === 0 ? `${m / 12}` : (m / 12).toFixed(1).replace('.0', ''));
  if (from != null && to != null) return `от ${toYears(from)} до ${toYears(to)} лет`;
  if (from != null) return `от ${toYears(from)} лет`;
  return `до ${toYears(to as number)} лет`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₸`;
}
