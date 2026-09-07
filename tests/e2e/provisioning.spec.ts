import { expect, test } from '@playwright/test';
import { login, PORTAL, SUPERADMIN } from './helpers';

test('суперадмин создаёт сад и получает памятку доступа', async ({ page }) => {
  const suffix = Date.now().toString(36).slice(-5);
  const slug = `test${suffix}`;

  await login(page, PORTAL, SUPERADMIN);
  await page.goto(`${PORTAL}/admin/tenants/new`);

  await page.getByPlaceholder('Ясли-сад №12 «Балдырған»').fill(`Тестовый сад ${suffix}`);
  await page.getByPlaceholder('№12 «Балдырған» бөбекжайы').fill(`Тест бақша ${suffix}`);
  await page.locator('input[name="slug"]').fill(slug);
  await page.getByPlaceholder('Сериккызы Айгүл').fill('Тестова Тест Тестовна');
  await page.locator('input[name="adminLogin"]').fill(`${slug}-admin`);

  await page.getByRole('button', { name: 'Создать сад и выдать доступы' }).click();

  await expect(page.getByRole('heading', { name: 'Памятка доступа' })).toBeVisible();
  // Домен берётся из PORTAL_DOMAIN, в тестовом окружении это bobegim.local.
  const sheet = page.locator('#access-sheet');
  await expect(sheet.getByText(`https://${slug}.bobegim.local`, { exact: true })).toBeVisible();
  await expect(sheet.getByText(`https://${slug}.bobegim.local/admin`, { exact: true })).toBeVisible();
  await expect(sheet.getByText(`${slug}-admin`, { exact: true })).toBeVisible();

  // Сад создан со статусом «черновик»: публично он ещё не виден.
  await page.goto(`${PORTAL}/admin/tenants`);
  await expect(page.getByRole('link', { name: `Тестовый сад ${suffix}` })).toBeVisible();
});
