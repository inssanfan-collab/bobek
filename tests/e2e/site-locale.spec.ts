import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

const SAD = site('sad12');

async function setDefaultLocale(page: Page, code: 'kk' | 'ru') {
  await page.goto(`${SAD}/admin/appearance`);
  await page.locator(`input[name="defaultLocale"][value="${code}"]`).check({ force: true });
  await page.getByRole('button', { name: 'Сохранить внешний вид' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Основной язык сайта сада', () => {
  test('сайт открывается на выбранном языке, второй — кнопкой', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);
    try {
      await setDefaultLocale(page, 'kk');

      await page.goto(`${SAD}/news`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
      const kk = page.getByRole('group', { name: 'Язык сайта' }).getByRole('link', { name: 'ҚАЗ' });
      await expect(kk).toHaveAttribute('aria-current', 'true');
      await expect(page.getByText(/\d{4} жылғы \d{1,2} /).first()).toBeVisible();

      // Русский — теперь с параметром, и он едет по ссылкам дальше.
      await page.getByRole('group', { name: 'Язык сайта' }).getByRole('link', { name: 'РУС' }).click();
      await expect(page).toHaveURL(/lang=ru/);
      await expect(page.getByText(/\d{1,2} сентября \d{4}|\d{1,2} [а-я]+ \d{4}/).first()).toBeVisible();
      await page.locator('.site-header').getByRole('link', { name: 'Главная' }).first().click();
      await expect(page).toHaveURL(/lang=ru/);
    } finally {
      await setDefaultLocale(page, 'ru');
    }

    await page.goto(`${SAD}/news`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });
});
