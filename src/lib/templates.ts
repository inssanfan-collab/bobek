export type TemplateCode = 'klassik' | 'zhuldyz' | 'ertegi' | 'bulaq' | 'alatau' | 'kagaz';

export type TemplateMeta = {
  code: TemplateCode;
  nameRu: string;
  nameKk: string;
  descriptionRu: string;
  descriptionKk: string;
};

/**
 * Шаблоны отличаются композицией главной страницы и шапкой, а не цветом —
 * палитра выбирается отдельно, чтобы 3 шаблона × 6 палитр давали 18 непохожих сайтов
 * без дублирования кода.
 */
export const TEMPLATES: TemplateMeta[] = [
  {
    code: 'klassik',
    nameRu: 'Классик',
    nameKk: 'Классик',
    descriptionRu:
      'Строгий и привычный: широкая шапка, новости колонкой, крупные плитки разделов. Подходит государственным садам.',
    descriptionKk:
      'Қатаң әрі таныс: кең тақырыпша, жаңалықтар бағанмен, бөлімдердің ірі тақтайшалары. Мемлекеттік балабақшаларға қолайлы.',
  },
  {
    code: 'zhuldyz',
    nameRu: 'Жұлдыз',
    nameKk: 'Жұлдыз',
    descriptionRu:
      'Живой и современный: большая обложка на весь экран, лента новостей карточками, акцент на фотографиях.',
    descriptionKk:
      'Жанды әрі заманауи: бүкіл экранға арналған үлкен мұқаба, жаңалықтар карточка түрінде, фотосуреттерге екпін.',
  },
  {
    code: 'ertegi',
    nameRu: 'Ертегі',
    nameKk: 'Ертегі',
    descriptionRu:
      'Самый тёплый: мягкие волны, крупные иллюстрации и скругления. Хорош для частных садов и мини-центров.',
    descriptionKk:
      'Ең жылысы: жұмсақ толқындар, ірі суреттер мен дөңгеленген бұрыштар. Жеке балабақшалар мен шағын орталықтарға жақсы.',
  },
  {
    code: 'bulaq',
    nameRu: 'Бұлақ',
    nameKk: 'Бұлақ',
    descriptionRu:
      'Фотография во весь экран, название поверх неё. Подойдёт саду с хорошим снимком здания или площадки.',
    descriptionKk:
      'Бүкіл экранға фотосурет, атауы соның үстінде. Ғимараттың немесе алаңның жақсы суреті бар балабақшаға қолайлы.',
  },
  {
    code: 'alatau',
    nameRu: 'Алатау',
    nameKk: 'Алатау',
    descriptionRu:
      'Две колонки: слева новости и разделы, справа карточка с телефоном и свободными местами — она едет за прокруткой.',
    descriptionKk:
      'Екі баған: солда жаңалықтар мен бөлімдер, оңда телефон мен бос орындар картасы — ол айналдырумен бірге жылжиды.',
  },
  {
    code: 'kagaz',
    nameRu: 'Қағаз',
    nameKk: 'Қағаз',
    descriptionRu:
      'Без карточек и теней — только текст и тонкие линии. На нём лучше всего виден фоновый узор.',
    descriptionKk:
      'Карточкасыз және көлеңкесіз — тек мәтін мен жіңішке сызықтар. Фондық өрнек осында ең жақсы көрінеді.',
  },
];

export type PaletteCode = 'mandarin' | 'mint' | 'berry' | 'sky' | 'meadow' | 'sun';

export const PALETTES: { code: PaletteCode; nameRu: string; nameKk: string; swatch: string }[] = [
  { code: 'mandarin', nameRu: 'Мандарин', nameKk: 'Мандарин', swatch: '#ea7a2a' },
  { code: 'mint', nameRu: 'Мята', nameKk: 'Жалбыз', swatch: '#189e96' },
  { code: 'berry', nameRu: 'Ягода', nameKk: 'Жидек', swatch: '#c74a76' },
  { code: 'sky', nameRu: 'Небо', nameKk: 'Аспан', swatch: '#307ad0' },
  { code: 'meadow', nameRu: 'Луг', nameKk: 'Шалғын', swatch: '#4c983e' },
  { code: 'sun', nameRu: 'Солнце', nameKk: 'Күн', swatch: '#d69814' },
];


/**
 * Какая часть обложки остаётся видимой при кадрировании.
 *
 * На широком экране обложка показывается почти целиком, а на телефоне блок
 * становится почти квадратным, и от панорамы 1920×815 остаётся узкая середина.
 * Кадрирует браузер, и единственное, чем можно управлять, — какую часть
 * он оставит.
 */
export type CoverFocus = 'center' | 'top' | 'bottom' | 'left' | 'right';

export const COVER_FOCUS: { code: CoverFocus; nameRu: string; nameKk: string; css: string }[] = [
  { code: 'center', nameRu: 'По центру', nameKk: 'Ортасы', css: 'center' },
  { code: 'top', nameRu: 'Верх фото', nameKk: 'Жоғарғы жағы', css: 'center top' },
  { code: 'bottom', nameRu: 'Низ фото', nameKk: 'Төменгі жағы', css: 'center bottom' },
  { code: 'left', nameRu: 'Левая часть', nameKk: 'Сол жағы', css: 'left center' },
  { code: 'right', nameRu: 'Правая часть', nameKk: 'Оң жағы', css: 'right center' },
];

export function isCoverFocus(value: string): value is CoverFocus {
  return COVER_FOCUS.some((item) => item.code === value);
}

/** CSS-значение object-position для выбранной части. */
export function coverPosition(value: string | null | undefined): string {
  return COVER_FOCUS.find((item) => item.code === value)?.css ?? 'center';
}

export type PatternCode =
  | 'none' | 'dots' | 'confetti' | 'grid' | 'zigzag' | 'waves' | 'rhombus' | 'oyu' | 'stripes';

/**
 * Узор фона выбирается отдельно от палитры: та же гамма с другим узором
 * даёт непохожий сайт, и соседние сады перестают выглядеть одинаково.
 * Узоры рисуются градиентами в цвете палитры — см. globals.css.
 */
export const PATTERNS: { code: PatternCode; nameRu: string; nameKk: string }[] = [
  { code: 'none', nameRu: 'Без узора', nameKk: 'Өрнексіз' },
  { code: 'dots', nameRu: 'Горошек', nameKk: 'Бұршақ' },
  { code: 'confetti', nameRu: 'Конфетти', nameKk: 'Конфетти' },
  { code: 'grid', nameRu: 'Клетка', nameKk: 'Торкөз' },
  { code: 'zigzag', nameRu: 'Зигзаг', nameKk: 'Ирек' },
  { code: 'waves', nameRu: 'Волны', nameKk: 'Толқын' },
  { code: 'rhombus', nameRu: 'Ромбы', nameKk: 'Ромб' },
  { code: 'oyu', nameRu: 'Ою-өрнек', nameKk: 'Ою-өрнек' },
  { code: 'stripes', nameRu: 'Полоски', nameKk: 'Жолақ' },
];

export function isPatternCode(value: string): value is PatternCode {
  return PATTERNS.some((p) => p.code === value);
}

export function isTemplateCode(value: string): value is TemplateCode {
  return TEMPLATES.some((t) => t.code === value);
}

export function isPaletteCode(value: string): value is PaletteCode {
  return PALETTES.some((p) => p.code === value);
}
