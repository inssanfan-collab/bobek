import type { SectionType } from '@prisma/client';

export type SectionMeta = {
  type: SectionType;
  slug: string;
  titleKk: string;
  titleRu: string;
  /** Подсказка в админке: зачем этот раздел и что туда класть. */
  hintRu: string;
  hintKk: string;
  /** Создаётся ли автоматически при создании сада. */
  defaultOn: boolean;
  /** Раздел существует в единственном экземпляре (нельзя добавить второй). */
  singleton: boolean;
  icon: string;
};

/**
 * Набор разделов собран по практике сайтов дошкольных организаций РК:
 * паспорт, нормативные документы, педсостав, вакантные места, меню питания,
 * попечительский совет, антикоррупция и виртуальная приёмная — то, что
 * спрашивают проверяющие и ищут родители.
 */
export const SECTION_CATALOG: SectionMeta[] = [
  {
    type: 'PAGE', slug: 'about', titleKk: 'Біз туралы', titleRu: 'О саде',
    hintRu: 'История, миссия, режим работы, руководство. Первое, что читают родители.',
    hintKk: 'Тарих, миссия, жұмыс режимі, басшылық. Ата-аналар бірінші оқитыны.',
    defaultOn: true, singleton: false, icon: '🏡',
  },
  {
    type: 'NEWS', slug: 'news', titleKk: 'Жаңалықтар', titleRu: 'Новости',
    hintRu: 'Утренники, конкурсы, будни групп. Главный повод возвращаться на сайт.',
    hintKk: 'Ертеңгіліктер, байқаулар, топтардың күнделігі. Сайтқа қайта оралудың басты себебі.',
    defaultOn: true, singleton: true, icon: '📰',
  },
  {
    type: 'ANNOUNCEMENT', slug: 'announcements', titleKk: 'Хабарландырулар', titleRu: 'Объявления',
    hintRu: 'Карантин, собрание, изменение режима. Короткие срочные сообщения.',
    hintKk: 'Карантин, жиналыс, режимнің өзгеруі. Қысқа шұғыл хабарламалар.',
    defaultOn: true, singleton: true, icon: '📢',
  },
  {
    type: 'STAFF', slug: 'staff', titleKk: 'Педагогтар', titleRu: 'Педагогический состав',
    hintRu: 'ФИО, должность, образование, стаж, категория. Требуется при проверках.',
    hintKk: 'Аты-жөні, лауазымы, білімі, өтілі, санаты. Тексеру кезінде талап етіледі.',
    defaultOn: true, singleton: true, icon: '👩‍🏫',
  },
  {
    type: 'GROUPS', slug: 'groups', titleKk: 'Топтар', titleRu: 'Группы',
    hintRu: 'Возраст, язык обучения, воспитатели, количество мест.',
    hintKk: 'Жасы, оқыту тілі, тәрбиешілер, орын саны.',
    defaultOn: true, singleton: true, icon: '🧸',
  },
  {
    type: 'GALLERY', slug: 'gallery', titleKk: 'Фотогалерея', titleRu: 'Фотогалерея',
    hintRu: 'Альбомы с праздников и занятий. Публикуйте только с согласия родителей.',
    hintKk: 'Мерекелер мен сабақтардың альбомдары. Тек ата-аналардың келісімімен жариялаңыз.',
    defaultOn: true, singleton: true, icon: '📷',
  },
  {
    type: 'DOCUMENTS', slug: 'documents', titleKk: 'Құжаттар', titleRu: 'Документы',
    hintRu: 'Устав, лицензия, правила приёма, приказы, госзакупки, отчёты.',
    hintKk: 'Жарғы, лицензия, қабылдау қағидалары, бұйрықтар, сатып алулар, есептер.',
    defaultOn: true, singleton: true, icon: '📄',
  },
  {
    type: 'PAGE', slug: 'parents', titleKk: 'Ата-аналарға', titleRu: 'Родителям',
    hintRu: 'Как встать в очередь через Darabala.kz, что взять в сад, режим дня, оплата.',
    hintKk: 'Darabala.kz арқылы кезекке қалай тұру керек, балабақшаға не алып келу керек, күн тәртібі, төлем.',
    defaultOn: true, singleton: false, icon: '👪',
  },
  {
    type: 'MENU_FOOD', slug: 'menu', titleKk: 'Ас мәзірі', titleRu: 'Меню питания',
    hintRu: 'Меню по дням или скан утверждённого меню. Частый вопрос родителей.',
    hintKk: 'Күн бойынша мәзір немесе бекітілген мәзірдің сканы. Ата-аналардың жиі сұрағы.',
    defaultOn: true, singleton: true, icon: '🍎',
  },
  {
    type: 'PAGE', slug: 'daily-routine', titleKk: 'Күн тәртібі', titleRu: 'Режим дня',
    hintRu: 'Распорядок по времени: приём детей, занятия, прогулка, сон, ужин.',
    hintKk: 'Уақыт бойынша тәртіп: балаларды қабылдау, сабақтар, серуен, ұйқы, кешкі ас.',
    defaultOn: true, singleton: false, icon: '🕗',
  },
  {
    type: 'CLUBS', slug: 'clubs', titleKk: 'Үйірмелер', titleRu: 'Кружки и услуги',
    hintRu: 'Дополнительные занятия: английский, хореография, логопед. С ценой или бесплатные.',
    hintKk: 'Қосымша сабақтар: ағылшын тілі, хореография, логопед. Ақылы немесе тегін.',
    defaultOn: false, singleton: true, icon: '🎨',
  },
  {
    type: 'FAQ', slug: 'faq', titleKk: 'Жиі қойылатын сұрақтар', titleRu: 'Частые вопросы',
    hintRu: 'Ответы на повторяющиеся вопросы родителей — снимает часть звонков.',
    hintKk: 'Ата-аналардың қайталанатын сұрақтарына жауаптар — қоңыраулардың бір бөлігін азайтады.',
    defaultOn: false, singleton: true, icon: '❓',
  },
  {
    type: 'VACANCIES', slug: 'vacancies', titleKk: 'Бос орындар', titleRu: 'Свободные места',
    hintRu: 'Свободные места по группам и вакансии для сотрудников.',
    hintKk: 'Топтар бойынша бос орындар және қызметкерлерге арналған бос жұмыс орындары.',
    defaultOn: true, singleton: true, icon: '🪑',
  },
  {
    type: 'TRUSTEE_BOARD', slug: 'trustee', titleKk: 'Қамқоршылық кеңес', titleRu: 'Попечительский совет',
    hintRu: 'Положение, состав совета, протоколы и отчёты о средствах.',
    hintKk: 'Ереже, кеңес құрамы, хаттамалар және қаражат туралы есептер.',
    defaultOn: false, singleton: true, icon: '🤝',
  },
  {
    type: 'ANTICORRUPTION', slug: 'anticorruption', titleKk: 'Сыбайлас жемқорлыққа қарсы', titleRu: 'Противодействие коррупции',
    hintRu: 'План мероприятий, телефон доверия, порядок обращения.',
    hintKk: 'Іс-шаралар жоспары, сенім телефоны, өтініш беру тәртібі.',
    defaultOn: false, singleton: true, icon: '⚖️',
  },
  {
    type: 'FEEDBACK', slug: 'feedback', titleKk: 'Виртуалды қабылдау', titleRu: 'Виртуальная приёмная',
    hintRu: 'Форма обращения родителей. Ответы приходят вам в админку.',
    hintKk: 'Ата-аналардың өтініш нысаны. Жауаптар әкімші бөліміне келеді.',
    defaultOn: true, singleton: true, icon: '✉️',
  },
  {
    type: 'CONTACTS', slug: 'contacts', titleKk: 'Байланыс', titleRu: 'Контакты',
    hintRu: 'Адрес, телефоны, карта проезда, часы приёма.',
    hintKk: 'Мекенжай, телефондар, жол картасы, қабылдау сағаттары.',
    defaultOn: true, singleton: true, icon: '📍',
  },
];

export function sectionMeta(type: SectionType, slug?: string): SectionMeta | undefined {
  if (slug) {
    const bySlug = SECTION_CATALOG.find((s) => s.slug === slug && s.type === type);
    if (bySlug) return bySlug;
  }
  return SECTION_CATALOG.find((s) => s.type === type);
}

export const DEFAULT_SECTIONS = SECTION_CATALOG.filter((s) => s.defaultOn);

/** Разделы, которые ведут на список записей, а не на статическую страницу. */
export const FEED_TYPES: SectionType[] = ['NEWS', 'ANNOUNCEMENT'];

// ─────────────────────────── Свои разделы сада ───────────────────────────

/**
 * Настройки раздела, которые не ложатся в колонки таблицы. Лежат в
 * Section.settings (JSON), поэтому разбираются здесь, а не читаются напрямую:
 * в базе может оказаться что угодно, и сайт не должен падать из-за мусора.
 */
export type SectionSettings = {
  /** Раздел создан садом, а не взят из стандартного набора. */
  custom: boolean;
  /** «Документы из папки»: какую папку показывать. */
  folderId: string | null;
  /** «Ссылка»: куда ведёт пункт меню. */
  url: string | null;
};

export function sectionSettings(raw: unknown): SectionSettings {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    custom: value.custom === true,
    folderId: typeof value.folderId === 'string' && value.folderId ? value.folderId : null,
    url: typeof value.url === 'string' && value.url ? value.url : null,
  };
}

/** Виды разделов, которые сад создаёт сам — сколько угодно раз. */
export const CUSTOM_KINDS = [
  {
    kind: 'page',
    type: 'PAGE',
    icon: '📝',
    title: { kk: 'Мәтіндік бет', ru: 'Текстовая страница' },
    hint: {
      kk: 'Мәтін, фото, кестелер. Мысалы: «Логопед», «Мемлекеттік сатып алу», «Инклюзивті білім».',
      ru: 'Текст, фото, таблицы. Например: «Логопед», «Госзакупки», «Инклюзивное образование».',
    },
  },
  {
    kind: 'folder',
    type: 'DOCUMENTS',
    icon: '🗂',
    title: { kk: 'Бумадағы құжаттар', ru: 'Документы из папки' },
    hint: {
      kk: 'Мәзірдің жеке тармағы бір буманың құжаттарын көрсетеді. Мысалы: «Өзін-өзі бағалау материалдары».',
      ru: 'Отдельный пункт меню показывает документы одной папки. Например: «Материалы самооценки».',
    },
  },
  {
    kind: 'link',
    type: 'LINK',
    icon: '🔗',
    title: { kk: 'Сілтеме', ru: 'Ссылка' },
    hint: {
      kk: 'Мәзір тармағы басқа мекенжайға апарады: Darabala.kz, балабақшаның Instagram парақшасы.',
      ru: 'Пункт меню ведёт на другой адрес: Darabala.kz, Instagram сада.',
    },
  },
] as const;

export type CustomKind = (typeof CUSTOM_KINDS)[number]['kind'];

export function isCustomKind(value: unknown): value is CustomKind {
  return CUSTOM_KINDS.some((item) => item.kind === value);
}

/**
 * Адреса, которые раздел занять не может: по ним живёт сам сайт сада.
 * Раздел «search» перекрыл бы поиск, «admin» — вход в админку.
 */
export const RESERVED_SECTION_SLUGS = new Set([
  'admin', 'api', 'search', 'doc', 'unavailable', 'sitemap.xml', 'robots.txt', '_next', 's',
]);

const SECTION_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$/;

export function isValidSectionSlug(slug: string): boolean {
  return SECTION_SLUG_RE.test(slug) && !slug.includes('--') && !RESERVED_SECTION_SLUGS.has(slug);
}

/**
 * Можно ли удалить раздел. Страницы, ссылки и свои разделы — да. Ленты,
 * галерею, педагогов и прочие — нет: вместе с разделом ушли бы все новости
 * или альбомы, а такое случайно делать нельзя. Их можно скрыть.
 */
export function canDeleteSection(section: { type: SectionType; settings: unknown }): boolean {
  if (section.type === 'PAGE' || section.type === 'LINK') return true;
  return sectionSettings(section.settings).custom;
}

/**
 * Приводит адрес ссылки к рабочему виду. Принимает то, что вставляет человек:
 * «darabala.kz», «https://…», «/contacts». Возвращает null для мусора и для
 * javascript:, data: и прочих схем, которыми через меню можно навредить.
 */
export function normalizeLinkUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return null;
    if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Куда ведёт пункт меню. Внешняя ссылка открывается в новой вкладке. */
export function sectionLink(
  section: { type: SectionType; slug: string; settings: unknown },
  withLang: (href: string) => string,
): { href: string; external: boolean } {
  if (section.type === 'LINK') {
    const url = sectionSettings(section.settings).url;
    if (url) return { href: url, external: !url.startsWith('/') };
  }
  return { href: withLang(`/${section.slug}`), external: false };
}
