import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { site } from './helpers';

/*
 * Каждая индивидуальная тема обязана оставить на сайте то, что сад должен
 * показывать всегда: версию для слабовидящих, переключатель языка, меню
 * и заголовок. Тема примеряется на демо-сад через ?theme=код — это работает
 * только при THEME_PREVIEW=1 (задан в playwright.config.ts).
 *
 * Список тем берём из themes.css, а не из кода: модули тем тянут React.
 */
const css = readFileSync(path.resolve(__dirname, '../../src/themes/themes.css'), 'utf8');
const THEMES = Array.from(css.matchAll(/@import '\.\/([a-z0-9-]+)\/theme\.css';/g), (m) => m[1]!);

const SAD = site('sad12');

test.describe('Индивидуальные темы', () => {
  for (const code of THEMES) {
    test(`тема «${code}»: обязательное на месте, страховка не сработала`, async ({ page }) => {
      await page.goto(`${SAD}/?theme=${code}`);

      await expect(page.locator('html')).toHaveAttribute('data-theme', code);
      await expect(page.locator('[data-theme-fallback]')).toHaveCount(0);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Версия для слабовидящих' })).toBeVisible();
      await expect(page.getByRole('group', { name: 'Язык сайта' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Главная' }).first()).toBeAttached();
      await expect(page.getByRole('contentinfo')).toBeVisible();

      // Внутренняя страница — те же шапка и подвал темы.
      await page.goto(`${SAD}/news?theme=${code}`);
      await expect(page.locator('[data-theme-fallback]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Версия для слабовидящих' })).toBeVisible();
    });

    test(`тема «${code}» уступает место версии для слабовидящих`, async ({ page }) => {
      await page.goto(`${SAD}/?theme=${code}`);
      await page.getByRole('button', { name: 'Версия для слабовидящих' }).click();

      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-a11y', 'on');
      await expect(html).not.toHaveAttribute('data-theme', code);

      await page.getByRole('button', { name: 'Версия для слабовидящих' }).click();
      await expect(html).toHaveAttribute('data-theme', code);
    });
  }

  test('без темы сайт выглядит как обычно', async ({ page }) => {
    await page.goto(`${SAD}/?theme=none`);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
  });
});
