import { expect, test } from '@playwright/test';
import { login, site, PORTAL, SAD12_ADMIN, SUPERADMIN } from './helpers';

test.describe('Изоляция садов', () => {
  test('на домене чужого сада сотрудник не авторизован', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Здравствуйте');

    // Cookie сессии привязана к домену, поэтому на чужом домене пользователь анонимен.
    await page.goto(`${site('kunshuaq')}/admin`);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('подставленная в чужой домен сессия не даёт доступа', async ({ page, context }) => {
    await login(page, site('sad12'), SAD12_ADMIN);

    // Самое важное: переносим cookie руками — так проверяется серверная проверка
    // владения, а не только браузерная привязка cookie к домену.
    const session = (await context.cookies(site('sad12'))).find((c) => c.name === 'bobegim_session');
    expect(session, 'сессия должна быть выдана').toBeTruthy();

    await context.addCookies([{ ...session!, domain: 'kunshuaq.bobegim.local', path: '/' }]);

    const response = await page.goto(`${site('kunshuaq')}/admin`);
    expect(response?.status()).toBe(404);
  });

  test('подставленная в портал сессия сада не даёт админку портала', async ({ page, context }) => {
    await login(page, site('sad12'), SAD12_ADMIN);

    const session = (await context.cookies(site('sad12'))).find((c) => c.name === 'bobegim_session');
    await context.addCookies([{ ...session!, domain: 'bobegim.local', path: '/' }]);

    const response = await page.goto(`${PORTAL}/admin`);
    expect(response?.status()).toBe(404);
  });

  test('суперадмин входит в сад кнопкой «Войти как сад»', async ({ page }) => {
    await login(page, PORTAL, SUPERADMIN);
    await page.goto(`${PORTAL}/admin/tenants`);
    await page.getByRole('link', { name: /Күншуақ/ }).click();

    await page.getByRole('button', { name: 'Войти как сад' }).click();

    // Сессия передаётся одноразовой ссылкой и обменивается на cookie домена сада.
    await page.waitForURL(/kunshuaq\.bobegim\.local:3000\/admin$/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Здравствуйте');
    await expect(page.getByText('Вы вошли как администратор портала')).toBeVisible();

    // Токен из адресной строки должен стать непригодным сразу после обмена.
    expect(page.url()).not.toContain('?t=');
  });

  test('неверный пароль не пускает', async ({ page }) => {
    await page.goto(`${site('sad12')}/admin/login`);
    await page.getByLabel('Логин').fill(SAD12_ADMIN.login);
    await page.getByLabel('Пароль').fill('sovsem-ne-tot-parol');
    await page.getByRole('button', { name: 'Войти' }).click();

    // У Next есть собственный role="alert" для объявления навигации — берём тот, что в форме.
    await expect(page.locator('form').getByRole('alert')).toContainText('Неверный логин или пароль');
    expect(page.url()).toContain('/admin/login');
  });

  test('админка требует входа', async ({ page }) => {
    await page.goto(`${site('sad12')}/admin`);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('внутренний префикс /s/ снаружи недоступен', async ({ page }) => {
    const response = await page.goto(`${PORTAL}/s/sad12.bobegim.local`);
    expect(response?.status()).toBe(404);
  });
});
