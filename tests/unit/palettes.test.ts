import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrast, derivePalette, MIN_CONTRAST, parseHex } from '@/lib/colors';
import {
  FONT_PAIRS, HEADER_STYLES, isFontPairCode, isHeaderLayoutCode, isHeaderStyleCode, isPaletteCode, isPatternCode, isShapeCode,
  isTemplateCode, PALETTES, PATTERNS, PRESETS, SHAPES,
} from '@/lib/templates';

const css = readFileSync(path.resolve(__dirname, '../../src/app/globals.css'), 'utf8');

function tokens(selector: string): Record<string, [number, number, number]> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return {};
  const body = css.slice(start, css.indexOf('}', start));
  const out: Record<string, [number, number, number]> = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) {
    out[m[1]!] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

const WHITE: [number, number, number] = [255, 255, 255];

describe('палитры читаемы', () => {
  for (const palette of PALETTES) {
    it(palette.code, () => {
      const t = palette.code === 'mandarin' ? { ...tokens(':root,\n[data-palette=\'mandarin\']'), ...tokens("[data-palette='mandarin']") } : tokens(`[data-palette='${palette.code}']`);
      expect(t.brand, `нет токенов для ${palette.code} в globals.css`).toBeDefined();

      // Тёмный текст на светлой плашке и на фоне страницы — всегда норма.
      expect(contrast(t['brand-ink']!, t['brand-soft']!)).toBeGreaterThanOrEqual(MIN_CONTRAST);
      expect(contrast(t['brand-ink']!, t.surface!)).toBeGreaterThanOrEqual(MIN_CONTRAST);
      // Белый текст на кнопке основного цвета — у всех палитр без исключений.
      expect(contrast(WHITE, t.brand!)).toBeGreaterThanOrEqual(MIN_CONTRAST);
      // Образец в админке совпадает с настоящим цветом.
      expect(parseHex(palette.swatch)).toEqual(t.brand);
    });
  }
});

describe('«свой цвет»', () => {
  it('светлый цвет сгущается, пока белый текст не станет читаемым', () => {
    const p = derivePalette('#ffd84d')!;
    expect(p.adjusted).toBe(true);
    expect(contrast(WHITE, parseHex(p.brand)!)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    expect(contrast(parseHex(p.brandInk)!, parseHex(p.brandSoft)!)).toBeGreaterThanOrEqual(7);
  });

  it('тёмный цвет остаётся как есть', () => {
    const p = derivePalette('#1f5a96')!;
    expect(p.adjusted).toBe(false);
    expect(p.brand).toBe('#1f5a96');
  });

  it('мусор не принимается', () => {
    expect(derivePalette('красный')).toBeNull();
    expect(derivePalette('#12345')).toBeNull();
  });

  it('короткая запись #abc понимается', () => {
    expect(parseHex('#abc')).toEqual([170, 187, 204]);
  });
});

describe('варианты описаны и в коде, и в CSS', () => {
  it('у каждой пары шрифтов, кроме «Мягкого» по умолчанию, есть правило', () => {
    for (const pair of FONT_PAIRS.filter((f) => f.code !== 'soft')) {
      expect(css, pair.code).toContain(`[data-font='${pair.code}']`);
    }
  });

  it('у каждой формы и шапки, кроме значений по умолчанию, есть правило', () => {
    for (const shape of SHAPES.filter((s) => s.code !== 'soft')) expect(css, shape.code).toContain(`[data-shape='${shape.code}']`);
    for (const style of HEADER_STYLES.filter((h) => h.code !== 'light')) expect(css, style.code).toContain(`[data-header-style='${style.code}']`);
  });

  it('у каждого узора есть правило', () => {
    for (const pattern of PATTERNS.filter((p) => p.code !== 'none')) {
      expect(css, pattern.code).toContain(`[data-pattern='${pattern.code}']`);
    }
  });

  it('готовые стили ссылаются только на существующие варианты', () => {
    for (const preset of PRESETS) {
      expect(isTemplateCode(preset.templateCode), preset.code).toBe(true);
      expect(isPaletteCode(preset.palette), preset.code).toBe(true);
      expect(isPatternCode(preset.pattern), preset.code).toBe(true);
      expect(isFontPairCode(preset.fontPair), preset.code).toBe(true);
      expect(isShapeCode(preset.shape), preset.code).toBe(true);
      expect(isHeaderStyleCode(preset.headerStyle), preset.code).toBe(true);
      expect(isHeaderLayoutCode(preset.headerLayout), preset.code).toBe(true);
    }
  });
});
