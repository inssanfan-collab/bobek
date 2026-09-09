import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

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
