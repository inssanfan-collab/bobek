import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

const SAD = site('sad12');

const FIELDS = [
  'headerTaglineRu', 'headerCtaTextRu', 'headerCtaUrl',
  'heroEyebrowRu', 'heroTitleRu', 'heroHighlightRu', 'heroLeadRu', 'heroCta1TextRu', 'heroCta1Url',
] as const;

async function fill(page: Page, values: Partial<Record<(typeof FIELDS)[number], string>>, showPhone: boolean) {
  await page.goto(`${SAD}/admin/homepage`);
  for (const name of FIELDS) {
    // Поля на двух языках спрятаны вкладкой — заполняем напрямую.
    await page.locator(`[name="${name}"]`).evaluate((el, value) => {
      (el as HTMLInputElement).value = value;
    }, values[name] ?? '');
  }
  await page.getByLabel('Показывать в шапке телефон и часы работы').setChecked(showPhone);
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await page.waitForURL(/saved=1/);
}

async function headerLayout(page: Page, value: string) {
  await page.goto(`${SAD}/admin/appearance`);
  await page.locator(`input[name="headerLayout"][value="${value}"]`).check({ force: true });
  await page.getByRole('button', { name: 'Сохранить внешний вид' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('Главная страница — тексты шапки и первого экрана', () => {
  test('сад пишет свой заголовок, кнопки и подпись — и они на сайте', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);

    try {
      await fill(page, {
        headerTaglineRu: 'Детский эко-сад',
        headerCtaTextRu: 'Записаться на экскурсию',
        headerCtaUrl: '/feedback',
        heroEyebrowRu: 'Пространство гармоничного взросления',
        heroTitleRu: 'Счастливое детство среди',
        heroHighlightRu: 'природы и сказки',
        heroLeadRu: 'Собственный парк и пятиразовое питание.',
        heroCta1TextRu: 'Посетить сад',
        heroCta1Url: '/contacts',
      }, true);
      await headerLayout(page, 'floating');

      await page.goto(SAD);
      const header = page.locator('.site-header');
      await expect(header).toContainText('Детский эко-сад');
      await expect(header.getByRole('link', { name: 'Записаться на экскурсию' })).toHaveAttribute('href', '/feedback');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Счастливое детство среди');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('природы и сказки');
      await expect(page.getByText('Пространство гармоничного взросления')).toBeVisible();
      await expect(page.getByRole('main').getByRole('link', { name: /Посетить сад/ })).toHaveAttribute('href', '/contacts');
      // Обязательное в любой шапке — на месте.
      await expect(page.locator('button[title="Версия для слабовидящих"]')).toBeVisible();
    } finally {
      await fill(page, {}, false);
      await headerLayout(page, 'classic');
    }

    // Всё очищено — сайт как был: заголовок снова название сада.
    await page.goto(SAD);
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Счастливое детство');
    await expect(page.locator('.site-header')).not.toContainText('Записаться на экскурсию');
  });

  test('кнопка без ссылки не сохраняется — понятная ошибка', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);
    await page.goto(`${SAD}/admin/homepage`);
    await page.locator('[name="heroCta1TextRu"]').evaluate((el) => {
      (el as HTMLInputElement).value = 'Посетить сад';
    });
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await expect(page.getByText('укажите, куда ведёт кнопка')).toBeVisible();
  });
});
