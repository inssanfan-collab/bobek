import type { Locale } from '@/lib/i18n';

/**
 * «Полезные ссылки» — плитки госресурсов, которые сад включает в админке
 * («Полезные ссылки», `admin/(shell)/links`) и которые сайт показывает перед
 * подвалом (`UsefulLinks` в src/components/site/UsefulLinks.tsx).
 *
 * Каталог ведём мы, а не сады: адрес госсайта поменялся — правим здесь один
 * раз для всех. Номера и адреса сверены с официальными сайтами 15.10.2026.
 * Герба и логотипов госорганов на плитках нет — только свои значки:
 * государственные символы на сайте частного сада неуместны (так же решено
 * в теме «Акорда»).
 *
 * Обязательного требования к таким баннерам в нормативных актах нет — это
 * распространённая практика сайтов организаций образования, так о ней и говорим.
 */

type Phrase = { kk: string; ru: string };

export type UsefulIcon = 'building' | 'egov' | 'mail' | 'scales' | 'phone' | 'shield' | 'school' | 'link';

export type UsefulGroup = 'gov' | 'children' | 'anticorruption' | 'region';

/** Цвет баннера: по группе плиток (вариант «А» — широкие цветные баннеры, 15.10.2026). */
export type UsefulTone = 'blue' | 'teal' | 'coral' | 'violet' | 'neutral';

export const GROUP_TONE: Record<UsefulGroup, UsefulTone> = {
  gov: 'blue',
  children: 'teal',
  anticorruption: 'coral',
  region: 'violet',
};

export type CatalogLink = {
  key: string;
  group: UsefulGroup;
  icon: UsefulIcon;
  title: Phrase;
  /** Телефон: номер крупно, как на плакате, а рядом — подпись без номера. */
  number?: string;
  label?: Phrase;
  note: Phrase;
  /** Адрес или tel:; у плитки региона адрес свой у каждого сада — тогда null. */
  href: Phrase | null;
};

export const USEFUL_GROUPS: { group: UsefulGroup; title: Phrase }[] = [
  { group: 'gov', title: { kk: 'Мемлекеттік ресурстар', ru: 'Государственные ресурсы' } },
  { group: 'children', title: { kk: 'Балалар мен отбасыны қорғау', ru: 'Защита детей и семьи' } },
  { group: 'anticorruption', title: { kk: 'Сыбайлас жемқорлыққа қарсы іс-қимыл', ru: 'Противодействие коррупции' } },
  { group: 'region', title: { kk: 'Өз өңіріңіз', ru: 'Ваш регион' } },
];

const same = (href: string): Phrase => ({ kk: href, ru: href });

export const USEFUL_CATALOG: CatalogLink[] = [
  {
    key: 'minedu',
    group: 'gov',
    icon: 'building',
    title: { kk: 'ҚР Оқу-ағарту министрлігі', ru: 'Министерство просвещения РК' },
    note: { kk: 'Ресми жаңалықтар мен құжаттар', ru: 'Официальные новости и документы' },
    href: {
      kk: 'https://www.gov.kz/memleket/entities/edu?lang=kk',
      ru: 'https://www.gov.kz/memleket/entities/edu?lang=ru',
    },
  },
  {
    key: 'egov',
    group: 'gov',
    icon: 'egov',
    title: { kk: 'Электрондық үкімет eGov', ru: 'Электронное правительство eGov' },
    note: { kk: 'Мемлекеттік қызметтер онлайн', ru: 'Государственные услуги онлайн' },
    href: { kk: 'https://egov.kz/kk', ru: 'https://egov.kz/ru' },
  },
  {
    key: 'eotinish',
    group: 'gov',
    icon: 'mail',
    title: { kk: 'eOtinish', ru: 'eOtinish' },
    note: { kk: 'Мемлекеттік органдарға өтініш', ru: 'Обращения в государственные органы' },
    href: { kk: 'https://eotinish.kz/kk', ru: 'https://eotinish.kz/ru' },
  },
  {
    key: 'adilet',
    group: 'gov',
    icon: 'scales',
    title: { kk: '«Әділет» құқықтық базасы', ru: 'Правовая база «Әділет»' },
    note: { kk: 'Заңдар мен бұйрықтардың мәтіндері', ru: 'Тексты законов и приказов' },
    href: { kk: 'https://adilet.zan.kz/kaz', ru: 'https://adilet.zan.kz/rus' },
  },
  {
    key: 'tel111',
    number: '111',
    label: { kk: 'Бірыңғай байланыс орталығы', ru: 'Единый контакт-центр' },
    group: 'children',
    icon: 'phone',
    title: { kk: '111 — бірыңғай байланыс орталығы', ru: '111 — единый контакт-центр' },
    note: {
      kk: 'Отбасы, әйелдер және балалар құқығын қорғау мәселелері',
      ru: 'Вопросы семьи, женщин и защиты прав детей',
    },
    href: same('tel:111'),
  },
  {
    key: 'tel150',
    number: '150',
    label: { kk: 'Сенім телефоны', ru: 'Телефон доверия' },
    group: 'children',
    icon: 'phone',
    title: { kk: '150 — сенім телефоны', ru: '150 — телефон доверия' },
    note: {
      kk: 'Балаларға, жастарға және ата-аналарға, тегін және жасырын',
      ru: 'Для детей, молодёжи и родителей, бесплатно и анонимно',
    },
    href: same('tel:150'),
  },
  {
    key: 'tel112',
    number: '112',
    label: { kk: 'Шұғыл көмек', ru: 'Экстренная помощь' },
    group: 'children',
    icon: 'phone',
    title: { kk: '112 — шұғыл көмек', ru: '112 — экстренная помощь' },
    note: { kk: 'Өмірге қауіп төнгенде', ru: 'При угрозе жизни и здоровью' },
    href: same('tel:112'),
  },
  {
    key: 'anticor',
    group: 'anticorruption',
    icon: 'shield',
    title: {
      kk: 'Сыбайлас жемқорлыққа қарсы іс-қимыл агенттігі',
      ru: 'Агентство по противодействию коррупции',
    },
    note: { kk: 'Ресми сайт', ru: 'Официальный сайт' },
    href: {
      kk: 'https://www.gov.kz/memleket/entities/anticorruption?lang=kk',
      ru: 'https://www.gov.kz/memleket/entities/anticorruption?lang=ru',
    },
  },
  {
    key: 'tel1424',
    number: '1424',
    label: { kk: 'Сыбайлас жемқорлық туралы хабарлау', ru: 'Сообщить о коррупции' },
    group: 'anticorruption',
    icon: 'phone',
    title: { kk: '1424 — байланыс орталығы', ru: '1424 — колл-центр' },
    note: {
      kk: 'Сыбайлас жемқорлық туралы хабарлау, тәулік бойы, тегін',
      ru: 'Сообщить о коррупции, круглосуточно, бесплатно',
    },
    href: same('tel:1424'),
  },
  {
    key: 'region',
    group: 'region',
    icon: 'school',
    title: { kk: 'Білім басқармасы', ru: 'Управление образования' },
    note: { kk: 'Өңіріңіздің білім басқармасының сайты', ru: 'Сайт управления образования вашего региона' },
    href: null,
  },
];

export const CATALOG_BY_KEY = new Map(USEFUL_CATALOG.map((item) => [item.key, item]));

/** Плитки антикоррупционной группы — их страница «Противодействие коррупции» показывает всегда. */
export const ANTICORRUPTION_KEYS = USEFUL_CATALOG.filter((item) => item.group === 'anticorruption').map((item) => item.key);

export const USEFUL_PLACES = ['home', 'all'] as const;
export type UsefulPlace = (typeof USEFUL_PLACES)[number];

export function isUsefulPlace(value: unknown): value is UsefulPlace {
  return typeof value === 'string' && (USEFUL_PLACES as readonly string[]).includes(value);
}

/**
 * Адрес сайта управления образования: только https и только домены .kz —
 * региональные управления живут на gov.kz и edu.kz, а плитка подписана как
 * государственная, поэтому чужой домен сюда не пускаем. Пусто — null.
 */
export function regionUrl(input: string | null | undefined): string | null {
  const url = parseHttps(input);
  if (!url) return null;
  return url.hostname === 'kz' || url.hostname.endsWith('.kz') ? url.toString() : null;
}

/** Адрес своего баннера: https или http, любой домен. Пусто или мусор — null. */
export function customUrl(input: string | null | undefined): string | null {
  const url = parseHttps(input, true);
  return url ? url.toString() : null;
}

function parseHttps(input: string | null | undefined, allowHttp = false): URL | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) return null;
    if (!url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

export type UsefulLinkRow = {
  id: string;
  catalogKey: string | null;
  titleKk: string | null;
  titleRu: string | null;
  noteKk: string | null;
  noteRu: string | null;
  url: string | null;
  mediaSrc: string | null;
};

export type ResolvedLink = {
  id: string;
  icon: UsefulIcon;
  tone: UsefulTone;
  /** Номер телефона крупно (111, 1424); тогда title — подпись без номера. */
  number: string | null;
  title: string;
  note: string | null;
  href: string;
  /** Телефон — открывается звонком, а не в новой вкладке. */
  isPhone: boolean;
  image: string | null;
};

const pickText = (locale: Locale, kk: string | null, ru: string | null) =>
  (locale === 'kk' ? kk || ru : ru || kk) || null;

/**
 * Строки сада → плитки для сайта на нужном языке. Плитка без адреса
 * (регион, адрес не указан) и устаревший ключ каталога пропускаются:
 * лучше без плитки, чем плитка в никуда.
 */
export function resolveUsefulLinks(rows: UsefulLinkRow[], locale: Locale): ResolvedLink[] {
  const out: ResolvedLink[] = [];
  for (const row of rows) {
    if (row.catalogKey) {
      const item = CATALOG_BY_KEY.get(row.catalogKey);
      if (!item) continue;
      const href = item.href ? item.href[locale] : regionUrl(row.url);
      if (!href) continue;
      const own = pickText(locale, row.titleKk, row.titleRu);
      out.push({
        id: row.id,
        icon: item.icon,
        tone: GROUP_TONE[item.group],
        number: item.number ?? null,
        title: own ?? (item.label ?? item.title)[locale],
        note: item.note[locale],
        href,
        isPhone: href.startsWith('tel:'),
        image: null,
      });
      continue;
    }
    const href = customUrl(row.url);
    const title = pickText(locale, row.titleKk, row.titleRu);
    if (!href || !title) continue;
    out.push({
      id: row.id,
      icon: 'link',
      tone: 'neutral',
      number: null,
      title,
      note: pickText(locale, row.noteKk, row.noteRu),
      href,
      isPhone: false,
      image: row.mediaSrc,
    });
  }
  return out;
}
