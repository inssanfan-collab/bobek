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
};

export const THEME_CATALOG: ThemeInfo[] = [
  {
    code: 'obrazec',
    nameRu: 'Образец',
    nameKk: 'Үлгі',
    noteRu: 'Пример индивидуальной темы: своя шапка, главная и подвал. Для показа и проверки движка, не для садов.',
  },
];

export function findThemeInfo(code: string | null | undefined): ThemeInfo | null {
  if (!code) return null;
  return THEME_CATALOG.find((theme) => theme.code === code) ?? null;
}
