import type { Locale } from '@/lib/i18n';

/**
 * Раздел «Онлайн» админки портала: кто сейчас в админках (см. /api/presence).
 * Вкладка отмечается раз в 30 секунд, фоновую браузер будит раз в минуту —
 * «в админке сейчас» считаем того, кто отметился за последние 2,5 минуты.
 */
export const ONLINE_MS = 150_000;

/** Разделы админки сада — те же подписи, что в её меню. */
const TENANT_PLACES: Record<string, { kk: string; ru: string }> = {
  '': { kk: 'Шолу', ru: 'Обзор' },
  instagram: { kk: 'Instagram-нан', ru: 'Из Instagram' },
  gallery: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  documents: { kk: 'Құжаттар', ru: 'Документы' },
  media: { kk: 'Файлдар', ru: 'Файлы' },
  staff: { kk: 'Педагогтар', ru: 'Педагоги' },
  groups: { kk: 'Топтар', ru: 'Группы' },
  menu: { kk: 'Тамақтану мәзірі', ru: 'Меню питания' },
  clubs: { kk: 'Үйірмелер мен қызметтер', ru: 'Кружки и услуги' },
  faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
  reviews: { kk: 'Ата-аналар пікірлері', ru: 'Отзывы родителей' },
  prices: { kk: 'Бағалар', ru: 'Стоимость' },
  routine: { kk: 'Күн тәртібі (басты бет)', ru: 'Распорядок (главная)' },
  pages: { kk: 'Беттер', ru: 'Страницы' },
  sections: { kk: 'Мәзір бөлімдері', ru: 'Разделы меню' },
  feedback: { kk: 'Өтініштер', ru: 'Обращения' },
  notice: { kk: 'Шұғыл хабарландыру', ru: 'Срочное объявление' },
  stats: { kk: 'Сайтқа кірулер', ru: 'Посещаемость' },
  homepage: { kk: 'Басты бет', ru: 'Главная страница' },
  appearance: { kk: 'Сыртқы көрінісі', ru: 'Внешний вид' },
  profile: { kk: 'Балабақша төлқұжаты', ru: 'Паспорт сада' },
  account: { kk: 'Менің профилім', ru: 'Мой профиль' },
  login: { kk: 'Кіру беті', ru: 'Страница входа' },
};

/** Разделы админки портала. */
const PORTAL_PLACES: Record<string, { kk: string; ru: string }> = {
  tenants: { kk: 'Балабақшалар', ru: 'Детские сады' },
  users: { kk: 'Пайдаланушылар', ru: 'Пользователи' },
  subscriptions: { kk: 'Жазылымдар', ru: 'Подписки' },
  leads: { kk: 'Өтінімдер', ru: 'Заявки' },
  news: { kk: 'Портал жаңалықтары', ru: 'Новости портала' },
  feed: { kk: 'Балабақшалардың жарияланымдары', ru: 'Публикации садов' },
  audit: { kk: 'Әрекеттер журналы', ru: 'Журнал действий' },
  requisites: { kk: 'Деректемелер', ru: 'Реквизиты' },
  system: { kk: 'Сервер', ru: 'Сервер' },
  notifications: { kk: 'Хабарламалар', ru: 'Уведомления' },
  online: { kk: 'Онлайн', ru: 'Онлайн' },
};

const EXTRA = {
  news: { kk: 'Жаңалықтар', ru: 'Новости' },
  announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
  editing: { kk: 'өңдеу', ru: 'редактирование' },
  creating: { kk: 'жаңасы', ru: 'новая запись' },
};

/**
 * Что открыто в админке — по пути вкладки, человеческими словами:
 * «Кружки и услуги», «Новости · редактирование». Путь у админки сада
 * и портала одинаковый (/admin/…), поэтому раздел смотрим в обоих
 * словарях: сначала сада, потом портала.
 */
export function adminPlace(path: string | null, locale: Locale): string {
  if (!path) return '—';
  const url = new URL(path, 'https://x');
  const parts = url.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const [section = '', second] = parts;

  let place: string;
  if (section === 'posts') {
    place = (url.searchParams.get('type') === 'ANNOUNCEMENT' ? EXTRA.announcements : EXTRA.news)[locale];
  } else {
    const known = TENANT_PLACES[section] ?? PORTAL_PLACES[section];
    place = known ? known[locale] : url.pathname;
  }
  if (second === 'new') return `${place} · ${EXTRA.creating[locale]}`;
  if (second || url.searchParams.has('edit')) return `${place} · ${EXTRA.editing[locale]}`;
  return place;
}

/** Что за устройство — по строке браузера, коротко: «iPhone · Safari». */
export function deviceName(userAgent: string | null): string {
  const ua = userAgent ?? '';
  const system = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '—';
  const browser = /Edg\//.test(ua) ? 'Edge' : /YaBrowser/.test(ua) ? 'Яндекс' : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
  return browser ? `${system} · ${browser}` : system;
}
