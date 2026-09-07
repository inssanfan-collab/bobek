import type { Page } from '@playwright/test';

export const PORTAL = 'http://bobegim.local:3000';
export const site = (slug: string) => `http://${slug}.bobegim.local:3000`;

export const SUPERADMIN = { login: 'admin', password: 'admin-bobegim-2026' };
export const SAD12_ADMIN = { login: 'sad12-admin', password: 'sad12-2026' };

/** Вход через настоящую форму: заодно проверяется CSRF и rate-limit. */
export async function login(page: Page, origin: string, user: { login: string; password: string }) {
  await page.goto(`${origin}/admin/login`);
  await page.getByLabel('Логин').fill(user.login);
  await page.getByLabel('Пароль').fill(user.password);
  await page.getByRole('button', { name: 'Войти' }).click();

  // Ждём именно ухода со страницы входа: маска `/admin**` совпала бы и с `/admin/login`,
  // и неудачный вход выглядел бы как успешный.
  await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 20_000 });
}
