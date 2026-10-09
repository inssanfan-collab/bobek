import { expect, test } from '@playwright/test';
import { login, PORTAL, SUPERADMIN } from './helpers';

test('админку портала можно поставить как приложение', async ({ page, request }) => {
  // Описание приложения и фоновый скрипт отдаются как статика портала.
  const manifest = await request.get(`${PORTAL}/admin.webmanifest`);
  expect(manifest.ok()).toBeTruthy();
  const data = await manifest.json();
  expect(data.start_url).toBe('/admin');
  expect(data.icons.some((icon: { sizes: string }) => icon.sizes === '512x512')).toBeTruthy();
  expect((await request.get(`${PORTAL}/admin-sw.js`)).ok()).toBeTruthy();

  await login(page, PORTAL, SUPERADMIN);
  await page.goto(`${PORTAL}/admin/notifications`);
  await expect(page.getByRole('heading', { level: 1, name: 'Уведомления' })).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/admin.webmanifest');
  await expect(page.getByRole('heading', { name: 'Устройства' })).toBeVisible();
});
