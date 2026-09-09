export type TemplateCode = 'klassik' | 'zhuldyz' | 'ertegi';

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

export function isTemplateCode(value: string): value is TemplateCode {
  return TEMPLATES.some((t) => t.code === value);
}

export function isPaletteCode(value: string): value is PaletteCode {
  return PALETTES.some((p) => p.code === value);
}
