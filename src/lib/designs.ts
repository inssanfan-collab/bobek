import { env } from '@/lib/env';
import { THEME_CATALOG, type ThemeInfo } from '@/themes/catalog';
import shots from './design-shots.json';

/**
 * Витрина дизайнов (/designs): индивидуальные темы с описанием `showcase`,
 * снятые на демо-саде «Балапан» (`pnpm designs:shots`). Снимков у темы
 * нет — на витрину она не попадает, пока её не переснимут.
 */

type Size = [number, number];
export type DesignShot = { desk: Size; mob: Size };
export type Design = ThemeInfo & { showcase: { kk: string; ru: string }; shot: DesignShot };

const SHOTS = shots as unknown as Record<string, DesignShot>;

export const DESIGNS: Design[] = THEME_CATALOG.flatMap((theme) =>
  theme.showcase && SHOTS[theme.code] ? [{ ...theme, showcase: theme.showcase, shot: SHOTS[theme.code] }] : [],
);

export function findDesign(code: string): Design | undefined {
  return DESIGNS.find((design) => design.code === code);
}

export const designImage = (code: string, kind: 'desk' | 'mob') => `/images/designs/${code}-${kind}.webp`;

/** Тема вживую — на демо-саде: примерка ?theme= на боевом работает только там. */
export const designLiveUrl = (code: string) => `https://demo.${env.portalDomain}/?theme=${code}`;
