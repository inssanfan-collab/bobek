import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

const SAD = site('sad12');

async function setLayout(page: Page, options: { sticky: boolean; sections: boolean; contacts: boolean }) {
  await page.goto(`${SAD}/admin/appearance`);
  await page.getByLabel('Закреплять шапку при прокрутке').setChecked(options.sticky);
  await page.getByLabel('Показывать на главной блок «Разделы сайта»').setChecked(options.sections);
  await page.getByLabel('Показывать на главной блок «Контакты»').setChecked(options.contacts);
  await page.getByRole('button', { name: 'Сохранить внешний вид' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Шапка и главная страница — настройки сада', () => {
  test('сад выключает закреплённую шапку, разделы и контакты на главной, и включает обратно', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);

    try {
      await setLayout(page, { sticky: false, sections: false, contacts: false });

      await page.goto(SAD);
      await expect(page.locator('html')).toHaveAttribute('data-header', 'static');
      await expect(page.locator('.site-header')).toHaveCSS('position', 'static');
      await expect(page.getByRole('heading', { name: 'Разделы сайта' })).toHaveCount(0);
      await expect(page.getByRole('main').getByRole('heading', { name: 'Контакты' })).toHaveCount(0);
      // Меню от этого не страдает — выключен только блок на главной.
      await expect(page.getByRole('navigation', { name: 'Меню' })).toBeAttached();
    } finally {
      // Возвращаем как было: демо-сад общий для всех тестов.
      await setLayout(page, { sticky: true, sections: true, contacts: true });
    }

    await page.goto(SAD);
    await expect(page.locator('html')).not.toHaveAttribute('data-header', /.+/);
    await expect(page.locator('.site-header')).toHaveCSS('position', 'sticky');
    await expect(page.getByRole('heading', { name: 'Разделы сайта' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('heading', { name: 'Контакты' })).toBeVisible();
  });
});
