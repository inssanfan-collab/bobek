/**
 * Каталог индивидуальных тем: коды и названия, без вёрстки. Его читают
 * админка портала, проверка ошибок и тесты — им компоненты темы не нужны.
 * Вёрстка подключается в src/themes/index.ts по тем же кодам.
 */
export type ThemeInfo = {
  code: string;
  nameRu: string;
  nameKk: string;
  /** Для кого сделана и что меняет — видно в карточке сада в админке портала. */
  noteRu: string;
  /**
   * Шрифты темы — запрос к Google Fonts (часть после css2?). Задан — сайт
   * грузит их вместо пары, выбранной садом. Каждую гарнитуру сначала
   * проверить на казахские буквы (CLAUDE.md, «unicode-range…»).
   */
  fonts?: string;
};

export const THEME_CATALOG: ThemeInfo[] = [
  {
    code: 'obrazec',
    nameRu: 'Образец',
    nameKk: 'Үлгі',
    noteRu: 'Пример индивидуальной темы: своя шапка, главная и подвал. Для показа и проверки движка, не для садов.',
  },
  {
    code: 'dala',
    nameRu: 'Дала',
    nameKk: 'Дала',
    noteRu: 'Степь и ою-өрнек: бирюза, шафран и терракота на тёплом кремовом, фото в арках. Официально и тепло — подходит и частному, и государственному саду.',
    fonts: 'family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;600;700',
  },
  {
    code: 'akvarel',
    nameRu: 'Акварель',
    nameKk: 'Акварель',
    noteRu: 'Акварельная сказка: пастельные разводы, облачка и звёзды, фото в мягкой форме. Самый мягкий и «детский» вид.',
    fonts: 'family=Nunito:wght@700;800;900&family=Nunito+Sans:wght@400;600;700',
  },
  {
    code: 'konstruktor',
    nameRu: 'Конструктор',
    nameKk: 'Құрастырғыш',
    noteRu: 'Яркие блоки как деревянные игрушки: кобальт, жёлтый и красный, толстые обводки. Самый смелый и запоминающийся.',
    fonts: 'family=Rubik:wght@400;500;600;700;800;900',
  },
];

export function findThemeInfo(code: string | null | undefined): ThemeInfo | null {
  if (!code) return null;
  return THEME_CATALOG.find((theme) => theme.code === code) ?? null;
}
