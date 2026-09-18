/**
 * «Свой цвет» сада: из одного цвета — обычно с логотипа — собираем всю
 * палитру (основной, светлая плашка, тёмный текст, фон, акцент).
 *
 * Заведующая выбирает цвет глазами, а не по контрасту, поэтому контраст
 * обеспечиваем сами: основной цвет затемняем, пока белый текст на кнопке
 * не станет читаемым (4.5 : 1 по WCAG), тёмный — пока не станет читаемым
 * на светлой плашке. Оттенок при этом сохраняется — сайт остаётся «того же
 * цвета», просто глубже.
 */

type Rgb = [number, number, number];

export const MIN_CONTRAST = 4.5;

export function parseHex(value: string): Rgb | null {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(value.trim());
  if (!match) return null;
  let hex = match[1]!;
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as Rgb;
}

export function toHex(rgb: Rgb): string {
  return `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`;
}

function luminance([r, g, b]: Rgb): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Смесь двух цветов: t = 0 — первый, t = 1 — второй. */
function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => a[i]! + (b[i]! - a[i]!) * t) as Rgb;
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

/** Затемняем, пока контраст с фоном не станет достаточным. */
function darkenUntil(color: Rgb, background: Rgb, target: number): Rgb {
  let result = color;
  for (let step = 0; step < 40 && contrast(result, background) < target; step += 1) {
    result = mix(result, BLACK, 0.06);
  }
  return result;
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  h /= 6;
  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}

export type DerivedPalette = {
  brand: string;
  brandSoft: string;
  brandInk: string;
  surface: string;
  accent: string;
  /** Пришлось ли затемнить выбранный цвет ради читаемости. */
  adjusted: boolean;
};

export function derivePalette(hex: string): DerivedPalette | null {
  const picked = parseHex(hex);
  if (!picked) return null;

  const brand = darkenUntil(picked, WHITE, MIN_CONTRAST);
  const brandSoft = mix(brand, WHITE, 0.88);
  const brandInk = darkenUntil(mix(brand, BLACK, 0.35), brandSoft, 7);
  const surface = mix(brand, WHITE, 0.97);

  // Акцент — противоположный оттенок: живой, но не спорящий с основным.
  const [h, s, l] = rgbToHsl(brand);
  const accent = hslToRgb([(h + 0.5) % 1, Math.min(0.75, Math.max(0.45, s)), Math.min(0.55, Math.max(0.42, l))]);

  return {
    brand: toHex(brand),
    brandSoft: toHex(brandSoft),
    brandInk: toHex(brandInk),
    surface: toHex(surface),
    accent: toHex(accent),
    adjusted: toHex(brand) !== toHex(picked),
  };
}

/** «r g b» — формат CSS-переменных палитры (rgb(var(--brand) / 0.5)). */
export function cssTriplet(hex: string): string {
  const rgb = parseHex(hex);
  return rgb ? rgb.map((c) => Math.round(c)).join(' ') : '0 0 0';
}
