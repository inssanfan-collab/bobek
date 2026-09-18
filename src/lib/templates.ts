export type TemplateCode = 'klassik' | 'zhuldyz' | 'ertegi' | 'bulaq' | 'alatau' | 'kagaz' | 'mozaika' | 'zharqyn';

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
  {
    code: 'mozaika',
    nameRu: 'Мозаика',
    nameKk: 'Мозаика',
    descriptionRu:
      'Главная из разноцветных плиток разного размера: обложка, новости, места, разделы. Яркая и современная.',
    descriptionKk:
      'Басты бет әр түрлі өлшемдегі түрлі-түсті тақтайшалардан: мұқаба, жаңалықтар, орындар, бөлімдер. Жарқын әрі заманауи.',
  },
  {
    code: 'zharqyn',
    nameRu: 'Жарқын',
    nameKk: 'Жарқын',
    descriptionRu:
      'Крупное название на цветной волне, большие круглые кнопки разделов и новости с крупными фото. Самый детский.',
    descriptionKk:
      'Түрлі-түсті толқындағы ірі атау, бөлімдердің үлкен дөңгелек батырмалары және ірі суретті жаңалықтар. Ең балалық.',
  },
];

export type PaletteCode =
  | 'mandarin' | 'mint' | 'berry' | 'sky' | 'meadow' | 'sun'
  | 'nauryz' | 'cherry' | 'lavender' | 'sea' | 'steppe' | 'sage' | 'tulip'
  | 'night' | 'cocoa' | 'lime' | 'lagoon' | 'plum' | 'graphite'
  | 'custom';

/**
 * Палитры. Значения токенов — в globals.css ([data-palette='…']), здесь —
 * название и образец для админки. `accent` — второй цвет, для образца.
 * Контраст каждой палитры проверяет tests/unit/palettes.test.ts.
 * `custom` — «свой цвет»: токены строятся из Tenant.brandColor (src/lib/colors.ts).
 */
export const PALETTES: { code: PaletteCode; nameRu: string; nameKk: string; swatch: string; accent?: string }[] = [
  { code: 'mandarin', nameRu: 'Мандарин', nameKk: 'Мандарин', swatch: '#ea7a2a', accent: '#2ea49e' },
  { code: 'mint', nameRu: 'Мята', nameKk: 'Жалбыз', swatch: '#189e96', accent: '#ee8a3c' },
  { code: 'berry', nameRu: 'Ягода', nameKk: 'Жидек', swatch: '#c74a76', accent: '#5c8ad6' },
  { code: 'sky', nameRu: 'Небо', nameKk: 'Аспан', swatch: '#307ad0', accent: '#f0a034' },
  { code: 'meadow', nameRu: 'Луг', nameKk: 'Шалғын', swatch: '#4c983e', accent: '#e27c3a' },
  { code: 'sun', nameRu: 'Солнце', nameKk: 'Күн', swatch: '#d69814', accent: '#4692be' },
  { code: 'nauryz', nameRu: 'Наурыз', nameKk: 'Наурыз', swatch: '#0f8386', accent: '#e0a526' },
  { code: 'cherry', nameRu: 'Вишня', nameKk: 'Шие', swatch: '#b8324f', accent: '#2f8f83' },
  { code: 'lavender', nameRu: 'Лаванда', nameKk: 'Лаванда', swatch: '#7456c0', accent: '#e59a3a' },
  { code: 'sea', nameRu: 'Море', nameKk: 'Теңіз', swatch: '#1f5a96', accent: '#ef6f5c' },
  { code: 'steppe', nameRu: 'Степь', nameKk: 'Дала', swatch: '#b5561f', accent: '#3d8b8a' },
  { code: 'sage', nameRu: 'Полынь', nameKk: 'Жусан', swatch: '#4f7d5e', accent: '#d0864a' },
  { code: 'tulip', nameRu: 'Тюльпан', nameKk: 'Қызғалдақ', swatch: '#cc3434', accent: '#3a7bd5' },
  { code: 'night', nameRu: 'Ночное небо', nameKk: 'Түнгі аспан', swatch: '#3b4cb8', accent: '#f2b705' },
  { code: 'cocoa', nameRu: 'Какао', nameKk: 'Какао', swatch: '#86573a', accent: '#4f9a8e' },
  { code: 'lime', nameRu: 'Лайм', nameKk: 'Лайм', swatch: '#4a8519', accent: '#8a4fd0' },
  { code: 'lagoon', nameRu: 'Лагуна', nameKk: 'Лагуна', swatch: '#07809f', accent: '#f28b30' },
  { code: 'plum', nameRu: 'Слива', nameKk: 'Алхоры', swatch: '#8e3a80', accent: '#e8a33b' },
  { code: 'graphite', nameRu: 'Графит', nameKk: 'Графит', swatch: '#3f4a5a', accent: '#e2723b' },
];

/** Палитра «свой цвет» — отдельно: у неё нет готовых токенов в CSS. */
export const CUSTOM_PALETTE = { code: 'custom' as const, nameRu: 'Свой цвет', nameKk: 'Өз түсіңіз' };

/**
 * Пары шрифтов: заголовки + текст. Каждый шрифт проверен измерением глифов
 * на все казахские буквы (ә ғ қ ң ө ұ ү һ і и заглавные) в начертаниях
 * 400 и 700 — см. CLAUDE.md, «unicode-range…». Не прошли: Unbounded, Jost,
 * Playfair Display, Sofia Sans, Manrope, Russo One, Tenor Sans, Wix Madefor.
 *
 * `google` — параметры family= для Google Fonts: грузим только выбранную пару.
 */
export type FontPairCode =
  | 'soft' | 'friendly' | 'hand' | 'script' | 'modern' | 'round' | 'classic' | 'elegant' | 'official' | 'fresh';

export const FONT_PAIRS: {
  code: FontPairCode;
  nameRu: string;
  nameKk: string;
  display: string;
  text: string;
  google: string;
}[] = [
  { code: 'soft', nameRu: 'Мягкий', nameKk: 'Жұмсақ', display: 'Comfortaa', text: 'Nunito Sans', google: 'family=Comfortaa:wght@600;700&family=Nunito+Sans:wght@400;600;700' },
  { code: 'friendly', nameRu: 'Дружелюбный', nameKk: 'Мейірімді', display: 'Nunito', text: 'Nunito', google: 'family=Nunito:wght@400;600;700;800' },
  { code: 'hand', nameRu: 'Нарисованный', nameKk: 'Салынған', display: 'Balsamiq Sans', text: 'Nunito', google: 'family=Balsamiq+Sans:wght@400;700&family=Nunito:wght@400;600;700' },
  { code: 'script', nameRu: 'Рукописный', nameKk: 'Қолжазба', display: 'Caveat', text: 'Golos Text', google: 'family=Caveat:wght@600;700&family=Golos+Text:wght@400;600;700' },
  { code: 'modern', nameRu: 'Современный', nameKk: 'Заманауи', display: 'Montserrat', text: 'Inter', google: 'family=Montserrat:wght@600;700;800&family=Inter:wght@400;600;700' },
  { code: 'round', nameRu: 'Округлый', nameKk: 'Дөңгелек', display: 'Rubik', text: 'Rubik', google: 'family=Rubik:wght@400;500;600;700;800' },
  { code: 'classic', nameRu: 'Классический', nameKk: 'Классикалық', display: 'Literata', text: 'Golos Text', google: 'family=Literata:wght@600;700;800&family=Golos+Text:wght@400;600;700' },
  { code: 'elegant', nameRu: 'Изящный', nameKk: 'Сәнді', display: 'Lora', text: 'Mulish', google: 'family=Lora:wght@600;700&family=Mulish:wght@400;600;700' },
  { code: 'official', nameRu: 'Официальный', nameKk: 'Ресми', display: 'PT Sans', text: 'PT Sans', google: 'family=PT+Sans:wght@400;700' },
  { code: 'fresh', nameRu: 'Свежий', nameKk: 'Сергек', display: 'Geologica', text: 'Golos Text', google: 'family=Geologica:wght@600;700;800&family=Golos+Text:wght@400;600;700' },
];

export function isFontPairCode(value: string): value is FontPairCode {
  return FONT_PAIRS.some((f) => f.code === value);
}

export function fontPair(code: string | null | undefined) {
  return FONT_PAIRS.find((f) => f.code === code) ?? FONT_PAIRS[0]!;
}

/** Форма элементов: скругления, тени, рамки. Токены — в globals.css ([data-shape]). */
export type ShapeCode = 'soft' | 'round' | 'sharp' | 'outline';

export const SHAPES: { code: ShapeCode; nameRu: string; nameKk: string; hintRu: string; hintKk: string }[] = [
  { code: 'soft', nameRu: 'Мягкая', nameKk: 'Жұмсақ', hintRu: 'Скругления и лёгкие тени', hintKk: 'Дөңгелектеу мен жеңіл көлеңке' },
  { code: 'round', nameRu: 'Круглая', nameKk: 'Дөңгелек', hintRu: 'Сильные скругления, кнопки-таблетки', hintKk: 'Қатты дөңгелектеу, таблетка батырмалар' },
  { code: 'sharp', nameRu: 'Строгая', nameKk: 'Қатаң', hintRu: 'Почти прямые углы, без теней', hintKk: 'Тік бұрыштарға жақын, көлеңкесіз' },
  { code: 'outline', nameRu: 'Контурная', nameKk: 'Контурлы', hintRu: 'Чёткая обводка и цветная тень, как в детской книжке', hintKk: 'Айқын жиек пен түрлі-түсті көлеңке, балалар кітабындағыдай' },
];

export function isShapeCode(value: string): value is ShapeCode {
  return SHAPES.some((s) => s.code === value);
}

/** Шапка сайта: светлая, в цвет палитры или тёмная. CSS — [data-header-style]. */
export type HeaderStyleCode = 'light' | 'brand' | 'dark';

export const HEADER_STYLES: { code: HeaderStyleCode; nameRu: string; nameKk: string }[] = [
  { code: 'light', nameRu: 'Светлая', nameKk: 'Ашық' },
  { code: 'brand', nameRu: 'Цветная', nameKk: 'Түрлі-түсті' },
  { code: 'dark', nameRu: 'Тёмная', nameKk: 'Қараңғы' },
];

export function isHeaderStyleCode(value: string): value is HeaderStyleCode {
  return HEADER_STYLES.some((h) => h.code === value);
}


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
  | 'none' | 'dots' | 'confetti' | 'grid' | 'zigzag' | 'waves' | 'rhombus' | 'oyu' | 'stripes'
  | 'stars' | 'clouds' | 'leaves' | 'hearts';

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
  { code: 'stars', nameRu: 'Звёзды', nameKk: 'Жұлдыздар' },
  { code: 'clouds', nameRu: 'Облака', nameKk: 'Бұлттар' },
  { code: 'leaves', nameRu: 'Листья', nameKk: 'Жапырақтар' },
  { code: 'hearts', nameRu: 'Сердечки', nameKk: 'Жүрекшелер' },
];

/**
 * Готовые стили: подобранные сочетания всех настроек. Нажали — форма
 * заполнилась, дальше можно поправить любую часть. Каждое значение проверяет
 * tests/unit/palettes.test.ts — опечатка в коде стиля не пройдёт.
 */
export const PRESETS: {
  code: string;
  nameRu: string;
  nameKk: string;
  templateCode: TemplateCode;
  palette: Exclude<PaletteCode, 'custom'>;
  pattern: PatternCode;
  fontPair: FontPairCode;
  shape: ShapeCode;
  headerStyle: HeaderStyleCode;
}[] = [
  { code: 'sunny', nameRu: 'Солнечный', nameKk: 'Шуақты', templateCode: 'zharqyn', palette: 'mandarin', pattern: 'clouds', fontPair: 'friendly', shape: 'round', headerStyle: 'light' },
  { code: 'fairy', nameRu: 'Сказка', nameKk: 'Ертегі', templateCode: 'ertegi', palette: 'lavender', pattern: 'stars', fontPair: 'hand', shape: 'round', headerStyle: 'brand' },
  { code: 'state', nameRu: 'Государственный', nameKk: 'Мемлекеттік', templateCode: 'klassik', palette: 'sea', pattern: 'none', fontPair: 'official', shape: 'sharp', headerStyle: 'brand' },
  { code: 'nauryz', nameRu: 'Наурыз', nameKk: 'Наурыз', templateCode: 'bulaq', palette: 'nauryz', pattern: 'oyu', fontPair: 'classic', shape: 'soft', headerStyle: 'dark' },
  { code: 'eco', nameRu: 'Эко', nameKk: 'Эко', templateCode: 'alatau', palette: 'sage', pattern: 'leaves', fontPair: 'fresh', shape: 'soft', headerStyle: 'light' },
  { code: 'book', nameRu: 'Детская книжка', nameKk: 'Балалар кітабы', templateCode: 'mozaika', palette: 'tulip', pattern: 'dots', fontPair: 'round', shape: 'outline', headerStyle: 'light' },
  { code: 'night', nameRu: 'Ночное небо', nameKk: 'Түнгі аспан', templateCode: 'zhuldyz', palette: 'night', pattern: 'stars', fontPair: 'modern', shape: 'round', headerStyle: 'dark' },
  { code: 'notebook', nameRu: 'Тетрадка', nameKk: 'Дәптер', templateCode: 'kagaz', palette: 'cocoa', pattern: 'grid', fontPair: 'script', shape: 'sharp', headerStyle: 'light' },
];

export function isPatternCode(value: string): value is PatternCode {
  return PATTERNS.some((p) => p.code === value);
}

export function isTemplateCode(value: string): value is TemplateCode {
  return TEMPLATES.some((t) => t.code === value);
}

export function isPaletteCode(value: string): value is PaletteCode {
  return value === CUSTOM_PALETTE.code || PALETTES.some((p) => p.code === value);
}
