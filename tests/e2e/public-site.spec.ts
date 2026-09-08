import { expect, test } from '@playwright/test';
import { PORTAL, site } from './helpers';

test.describe('Публичная часть', () => {
  test('портал открывается и показывает тариф', async ({ page }) => {
    await page.goto(PORTAL);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('20 000 ₸');
  });

  test('каталог фильтрует сады по названию', async ({ page }) => {
    await page.goto(`${PORTAL}/catalog`);
    await expect(page.getByRole('heading', { name: 'Детские сады Актобе' })).toBeVisible();

    await page.getByLabel('Название, адрес или район').fill('Күншуақ');
    await page.getByRole('button', { name: 'Найти' }).click();

    await expect(page.getByRole('heading', { name: /Күншуақ/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Балдырған/ })).toHaveCount(0);
  });

  test('каталог ищет сад по району, а не только по названию', async ({ page }) => {
    // Район в карточке не показан, но родитель ищет именно им.
    await page.goto(`${PORTAL}/catalog?q=${encodeURIComponent('Алматинский')}`);
    await expect(page.getByRole('heading', { name: /Күншуақ/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Балдырған/ })).toHaveCount(0);
  });

  test('каталог показывает сады на карте', async ({ page }) => {
    await page.goto(`${PORTAL}/catalog`);

    const map = page.locator('iframe[title="Детские сады Актобе на карте"]');
    const src = await map.getAttribute('src');
    expect(src).toContain('map-widget');

    // Метка на каждый сад с координатами, а не одна общая на весь город.
    const marks = new URL(src ?? '').searchParams.get('pt')?.split('~') ?? [];
    expect(marks.length).toBeGreaterThan(1);
  });

  test('сайт сада открывается на своём поддомене', async ({ page }) => {
    await page.goto(site('sad12'));
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Балдырған');
  });

  test('каждый сад получает свою палитру и шаблон', async ({ page }) => {
    await page.goto(site('sad12'));
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'mandarin');

    await page.goto(site('kunshuaq'));
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'mint');
  });

  test('новость публикуется на двух языках', async ({ page }) => {
    await page.goto(`${site('sad12')}/news/nauryz-meyramy`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Наурыз мейрамы в нашем саду');

    await page.goto(`${site('sad12')}/news/nauryz-meyramy?lang=kk`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Балабақшамыздағы Наурыз мейрамы');
  });

  test('несуществующий поддомен отдаёт 404', async ({ page }) => {
    const response = await page.goto('http://demo-sad.bobegim.local:3000/');
    expect(response?.status()).toBe(404);
  });

  test('скрытый раздел недоступен по прямой ссылке', async ({ page }) => {
    const response = await page.goto(`${site('sad12')}/trustee`);
    expect(response?.status()).toBe(404);
  });
});
