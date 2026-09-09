import { expect, test, type Page } from '@playwright/test';
import { login, site, PORTAL, SAD12_ADMIN } from './helpers';

/**
 * Выбранный язык хранится у пользователя и переживает прогон, поэтому тесты
 * не вправе рассчитывать на исходное состояние: они сами приводят админку
 * к нужному языку и возвращают русский за собой.
 */
async function switchTo(page: Page, label: 'ҚАЗ' | 'РУС') {
  const button = page.getByRole('button', { name: label });
  // Кнопка выбранного языка выключена — значит переключать уже нечего.
  if (await button.isDisabled()) return;
  await button.click();
  await expect(page.getByRole('button', { name: label })).toBeDisabled();
}

test.describe('Двуязычие админки', () => {
  // Язык хранится у пользователя и переживает тест. Если оставить казахский,
  // соседние наборы начнут искать русские кнопки в казахской админке —
  // поэтому возвращаем русский даже после падения.
  test.afterEach(async ({ page }) => {
    try {
      await page.goto(`${site('sad12')}/admin`);
      await switchTo(page, 'РУС');
    } catch {
      /* восстановление не должно заслонять настоящую ошибку теста */
    }
  });

  test('админка сада переключается на казахский и обратно', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);
    await page.goto(`${site('sad12')}/admin`);

    await switchTo(page, 'РУС');
    await expect(page.getByRole('link', { name: 'Новости' })).toBeVisible();

    await switchTo(page, 'ҚАЗ');
    await expect(page.getByRole('link', { name: 'Жаңалықтар' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Балабақша төлқұжаты' })).toBeVisible();

    await switchTo(page, 'РУС');
    await expect(page.getByRole('link', { name: 'Новости' })).toBeVisible();
  });

  test('форма новости открывается на казахском с обеими вкладками', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);
    await page.goto(`${site('sad12')}/admin`);
    await switchTo(page, 'ҚАЗ');

    await page.goto(`${site('sad12')}/admin/posts/new?type=NEWS`);
    await expect(page.getByText('Тақырып', { exact: true })).toBeVisible();
    await expect(page.getByText('Жариялау', { exact: true }).first()).toBeVisible();

    // Вкладки языка контента остаются на месте: интерфейс казахский,
    // но заполнить нужно обе версии новости.
    const tabs = page.getByRole('tab');
    await expect(tabs.filter({ hasText: 'ҚАЗ' }).first()).toBeVisible();
    await expect(tabs.filter({ hasText: 'РУС' }).first()).toBeVisible();

    await page.goto(`${site('sad12')}/admin`);
    await switchTo(page, 'РУС');
  });

  test('выбранный язык переживает переход по разделам', async ({ page }) => {
    await login(page, site('sad12'), SAD12_ADMIN);
    await page.goto(`${site('sad12')}/admin`);

    await switchTo(page, 'ҚАЗ');
    await page.goto(`${site('sad12')}/admin/staff`);
    await expect(page.getByRole('link', { name: 'Педагогтар' })).toBeVisible();

    await switchTo(page, 'РУС');
    await expect(page.getByRole('link', { name: 'Педагоги' })).toBeVisible();
  });
});

test.describe('Двуязычие сайта сада', () => {
  test('дата подстраивается под язык страницы', async ({ page }) => {
    // По-казахски год идёт первым: «2026 жылғы 3 қыркүйек».
    await page.goto(`${site('sad12')}/news?lang=kk`);
    await expect(page.getByText(/\d{4} жылғы \d{1,2} /).first()).toBeVisible();
    await expect(page.getByText(/\d{1,2} сентября \d{4}/)).toHaveCount(0);

    await page.goto(`${site('sad12')}/news`);
    await expect(page.getByText(/жылғы/)).toHaveCount(0);
  });
});

test.describe('Двуязычие портала', () => {
  test('портал переключается на казахский и запоминает язык в ссылках', async ({ page }) => {
    await page.goto(`${PORTAL}/pricing`);
    await expect(page.getByRole('heading', { name: 'Что входит' })).toBeVisible();

    await page.getByRole('link', { name: 'ҚАЗ' }).click();
    await expect(page).toHaveURL(/lang=kk/);
    await expect(page.getByRole('heading', { name: 'Не кіреді' })).toBeVisible();

    // Язык должен ехать по ссылкам дальше, иначе посетитель вываливается в русский.
    await page.getByRole('link', { name: 'Балабақшалар каталогы' }).first().click();
    await expect(page).toHaveURL(/lang=kk/);
    await expect(page.getByRole('heading', { name: 'Ақтөбе балабақшалары' })).toBeVisible();
  });
});
