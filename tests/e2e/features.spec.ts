import { expect, test, type Page } from '@playwright/test';
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

});

/**
 * Счётчик намеренно не учитывает headless-браузеры: иначе статистику сада
 * накручивали бы поисковые роботы, и цифра «сайт посмотрели 340 раз» перестала
 * бы что-то значить. Playwright ходит именно headless-браузером, поэтому здесь
 * он представляется обычным Chrome — тест проверяет счётчик, а не фильтр.
 */
test.describe('Посещаемость', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  test('посещаемость растёт после захода на сайт', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);

    // Сравниваем до и после: проверка «больше нуля» проходила бы за счёт
    // чужих заходов в тот же день и врала бы на чистой базе.
    const before = await todayViews(page);
    await page.goto(site('sad12'));

    expect(await todayViews(page)).toBe(before + 1);
  });

  test('заходы роботов в статистику не попадают', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);

    const before = await todayViews(page);
    await page.request.get(site('sad12'), {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)' },
    });

    expect(await todayViews(page)).toBe(before);
  });
});

/** Число из карточки «Сегодня» на странице статистики сада. */
async function todayViews(page: Page): Promise<number> {
  await page.goto(`${site('sad12')}/admin/stats`);
  const card = page.locator('.card', { hasText: 'Сегодня' }).first();
  return Number((await card.locator('p').nth(1).innerText()).trim());
}
