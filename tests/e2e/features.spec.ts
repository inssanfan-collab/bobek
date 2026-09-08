import { expect, test } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

test.describe('Разделы и сервисы сада', () => {
  test('срочное объявление видно на всех страницах', async ({ page }) => {
    const notice = 'закрыта на карантин';

    await page.goto(site('sad12'));
    await expect(page.getByRole('status')).toContainText(notice);

    // Смысл именно в том, что полоса не только на главной.
    await page.goto(`${site('sad12')}/staff`);
    await expect(page.getByRole('status')).toContainText(notice);
  });

  test('поиск находит новость по слову из текста', async ({ page }) => {
    await page.goto(`${site('sad12')}/search?q=Наурыз`);
    await expect(page.getByRole('link', { name: /Наурыз мейрамы/ })).toBeVisible();
  });

  test('поиск находит новость по другой форме слова', async ({ page }) => {
    // Родитель ищет так, как говорит, а не так, как написано в заголовке:
    // «собраниями» должно приводить к «Родительскому собранию».
    await page.goto(`${site('sad12')}/search?q=собраниями`);
    await expect(page.getByRole('link', { name: /Родительское собрание/ })).toBeVisible();
  });

  test('поиск по казахскому тексту находит запись', async ({ page }) => {
    // Заголовок на русском, совпадение — в казахской версии той же записи.
    await page.goto(`${site('sad12')}/search?q=жиналыс`);
    await expect(page.getByRole('link', { name: /Родительское собрание/ })).toBeVisible();
  });

  test('поиск показывает фрагмент с подсвеченным словом', async ({ page }) => {
    // По заголовку не видно, почему новость нашлась, — совпадение внутри текста.
    await page.goto(`${site('sad12')}/search?q=родителями`);
    await expect(page.locator('mark').first()).toHaveText('родителей');
  });

  test('поиск честно сообщает, что ничего не нашёл', async ({ page }) => {
    await page.goto(`${site('sad12')}/search?q=цукербринов`);
    await expect(page.getByText('Ничего не найдено')).toBeVisible();
  });

  test('поиск не ломается на служебных символах tsquery', async ({ page }) => {
    await page.goto(`${site('sad12')}/search?q=${encodeURIComponent('&|!():*')}`);
    await expect(page.getByRole('heading', { name: 'Поиск по сайту' })).toBeVisible();
  });

  test('кружки показывают цену и бесплатные занятия', async ({ page }) => {
    await page.goto(`${site('sad12')}/clubs`);
    await expect(page.getByRole('heading', { name: 'Английский язык' })).toBeVisible();
    await expect(page.getByText('8 000 ₸ / в месяц')).toBeVisible();
    await expect(page.getByText('Бесплатно')).toBeVisible();
  });

  test('контакты показывают WhatsApp и карту', async ({ page }) => {
    await page.goto(`${site('sad12')}/contacts`);
    // Ссылка есть и в подвале — здесь проверяем именно блок контактов.
    await expect(page.locator('#main').getByRole('link', { name: /WhatsApp/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Как добраться' })).toBeVisible();
  });

  test('посещаемость растёт после захода на сайт', async ({ page }) => {
    await page.goto(site('sad12'));

    await login(page, site('sad12'), SAD12_ADMIN);
    await page.goto(`${site('sad12')}/admin/stats`);

    const today = page.locator('.card', { hasText: 'Сегодня' }).first();
    const value = Number((await today.locator('p').nth(1).innerText()).trim());
    expect(value).toBeGreaterThan(0);
  });
});
