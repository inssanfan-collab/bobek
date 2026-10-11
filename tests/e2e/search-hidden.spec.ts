import { expect, test } from '@playwright/test';
import { login, PORTAL, site, SUPERADMIN } from './helpers';

test('сад можно скрыть из поисковиков и вернуть', async ({ page, request }) => {
  // Обычный сад открыт для поисковиков.
  expect(await (await request.get(`${site('ertegi')}/robots.txt`)).text()).toContain('Allow: /');

  await login(page, PORTAL, SUPERADMIN);
  await page.goto(`${PORTAL}/admin/tenants`);
  await page.getByRole('link', { name: /Ертегі/ }).first().click();
  await page.getByRole('button', { name: 'Скрыть из поисковиков' }).click();
  await expect(page.getByText('Сайт скрыт из поисковиков и каталога.')).toBeVisible();

  expect(await (await request.get(`${site('ertegi')}/robots.txt`)).text()).toContain('Disallow: /');
  await expect.poll(async () => (await request.get(`${site('ertegi')}/`)).text()).toContain('noindex');
  // Из каталога портала скрытый сад пропадает.
  await page.goto(`${PORTAL}/catalog`);
  await expect(page.getByRole('heading', { name: /Ертегі/ })).toHaveCount(0);

  // Возвращаем как было — от этого сада зависят другие тесты.
  await page.goBack();
  await page.getByRole('button', { name: 'Показывать в поиске' }).click();
  await expect(page.getByText('Сайт виден в поисковиках и каталоге.')).toBeVisible();
  expect(await (await request.get(`${site('ertegi')}/robots.txt`)).text()).toContain('Allow: /');
});
