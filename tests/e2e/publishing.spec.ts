import { expect, test } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

test.describe('Публикация из админки', () => {
  test('новость, созданная в админке, появляется на сайте', async ({ page }) => {
    const marker = `Тестовая новость ${Date.now()}`;
    const origin = site('sad12');

    await login(page, origin, SAD12_ADMIN);
    await page.goto(`${origin}/admin/posts/new?type=NEWS`);

    await page.getByPlaceholder('Наурыз мейрамы в нашем саду').fill(marker);
    await page.getByRole('textbox', { name: 'Расскажите, как прошёл праздник…' })
      .fill('Проверка публикации через админку.');
    await page.getByRole('button', { name: 'Опубликовать' }).click();

    await page.waitForURL(`${origin}/admin/posts**`);
    await expect(page.getByText(marker)).toBeVisible();

    // Главное: материал виден посетителю без входа.
    const guest = await page.context().browser()!.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`${origin}/news`);
    await expect(guestPage.getByRole('link', { name: marker })).toBeVisible();
    await guest.close();
  });

  test('раздел можно убрать из меню, а по ссылке он открывается', async ({ page }) => {
    const origin = site('sad12');
    await login(page, origin, SAD12_ADMIN);
    await page.goto(`${origin}/admin/sections`);

    const row = page.locator('div.card', { hasText: '/menu' }).first();
    await row.getByRole('button', { name: 'Убрать из меню' }).click();
    await expect(row.getByRole('button', { name: 'Вернуть в меню' })).toBeVisible();

    const guest = await page.context().browser()!.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`${origin}/?lang=ru`);
    await expect(guestPage.locator('header nav a[href^="/menu"]')).toHaveCount(0);
    // Ссылка на раздел с главной или из закладки не должна вести в 404.
    const response = await guestPage.goto(`${origin}/menu`);
    expect(response?.status()).toBe(200);
    await guest.close();

    // Возвращаем как было, чтобы тесты не зависели от порядка запуска.
    await row.getByRole('button', { name: 'Вернуть в меню' }).click();
    await expect(row.getByRole('button', { name: 'Убрать из меню' })).toBeVisible();
  });
});
