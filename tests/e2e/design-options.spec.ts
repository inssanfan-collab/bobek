import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

const SAD = site('sad12');

/** Отмеченные сейчас варианты — чтобы вернуть демо-сад как был. */
async function current(page: Page) {
  const value = (name: string) => page.locator(`input[type="radio"][name="${name}"]:checked`).getAttribute('value');
  return {
    templateCode: await value('templateCode'),
    palette: await value('palette'),
    pattern: await value('pattern'),
    fontPair: await value('fontPair'),
    shape: await value('shape'),
    headerStyle: await value('headerStyle'),
  };
}

async function choose(page: Page, values: Record<string, string | null>) {
  for (const [name, value] of Object.entries(values)) {
    if (value) await page.locator(`input[type="radio"][name="${name}"][value="${value}"]`).check({ force: true });
  }
}

async function save(page: Page) {
  await page.getByRole('button', { name: 'Сохранить внешний вид' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Оформление сайта сада', () => {
  test('шрифт, форма, шапка и «свой цвет» доходят до сайта', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);
    await page.goto(`${SAD}/admin/appearance`);
    const before = await current(page);

    try {
      await choose(page, { fontPair: 'modern', shape: 'outline', headerStyle: 'dark', palette: 'custom' });
      // Светло-жёлтый: белый текст на нём нечитаем — сайт обязан его сгустить.
      await page.locator('input[name="brandColor"]').fill('#ffd84d');
      await save(page);

      await page.goto(SAD);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-font', 'modern');
      await expect(html).toHaveAttribute('data-shape', 'outline');
      await expect(html).toHaveAttribute('data-header-style', 'dark');
      await expect(html).toHaveAttribute('data-palette', 'custom');
      // Цвет кнопок — уже не исходный #ffd84d, а сгущённый.
      const brand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--brand').trim());
      expect(brand).not.toBe('255 216 77');
      expect(brand).toMatch(/^\d+ \d+ \d+$/);

      // Версия для слабовидящих перебивает и свой цвет, и тёмную шапку.
      await page.locator('button[title="Версия для слабовидящих"]').click();
      await expect(html).toHaveAttribute('data-a11y', 'on');
      const a11yBrand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--brand').trim());
      expect(a11yBrand).toBe('0 0 0');
      await page.locator('button[title="Версия для слабовидящих"]').click();
    } finally {
      await page.goto(`${SAD}/admin/appearance`);
      await choose(page, before);
      await save(page);
    }
  });

  test('готовый стиль заполняет форму одним нажатием', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);
    await page.goto(`${SAD}/admin/appearance`);
    await page.getByRole('button', { name: 'Ночное небо' }).click();

    await expect(page.locator('input[name="palette"][value="night"]')).toBeChecked();
    await expect(page.locator('input[name="templateCode"][value="zhuldyz"]')).toBeChecked();
    await expect(page.locator('input[name="headerStyle"][value="dark"]')).toBeChecked();
    // Сам по себе стиль ничего не сохраняет — только заполняет форму.
    await page.goto(SAD);
    await expect(page.locator('html')).not.toHaveAttribute('data-palette', 'night');
  });
});
