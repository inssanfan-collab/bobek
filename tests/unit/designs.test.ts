import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEME_CATALOG } from '@/themes/catalog';
import shots from '@/lib/design-shots.json';

/*
 * Витрина дизайнов (/designs): тема с описанием `showcase` обязана иметь
 * снимки — иначе она молча пропадёт с витрины. Новая тема — `pnpm designs:shots`.
 */

const PUBLIC = path.resolve(__dirname, '../../public/images/designs');
const manifest = shots as unknown as Record<string, { desk: [number, number]; mob: [number, number] }>;

describe('витрина дизайнов', () => {
  for (const theme of THEME_CATALOG.filter((item) => item.showcase)) {
    it(`${theme.code}: описание на двух языках и снимки`, () => {
      expect(theme.showcase?.kk.trim()).not.toBe('');
      expect(theme.showcase?.ru.trim()).not.toBe('');
      expect(manifest[theme.code], 'нет в src/lib/design-shots.json — pnpm designs:shots').toBeTruthy();
      for (const kind of ['desk', 'mob'] as const) {
        expect(existsSync(path.join(PUBLIC, `${theme.code}-${kind}.webp`)), `${theme.code}-${kind}.webp`).toBe(true);
      }
    });
  }
});
