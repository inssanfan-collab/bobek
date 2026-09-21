import { expect, test, type Page } from '@playwright/test';
import { login, site, SAD12_ADMIN } from './helpers';

const SAD = site('sad12');
const TOP = 'Самооценка e2e';
const YEAR = '2025 - 2026 e2e';

const pdf = (name: string) => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.from(`%PDF-1.4\n% ${name} ${Date.now()}\n%%EOF\n`),
});

async function createFolder(page: Page, title: string) {
  await page.locator('#folderRu').fill(title);
  await page.getByRole('button', { name: 'Добавить папку' }).click();
  await expect(page.getByRole('link', { name: new RegExp(title) })).toBeVisible();
}

/** Удалить папку, стоя в той, где она лежит. */
async function deleteFolder(page: Page, title: string) {
  const row = page.locator('li', { has: page.getByRole('link', { name: new RegExp(title) }) });
  await row.getByRole('button', { name: 'Удалить папку' }).click();
  await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveCount(0);
}

test.describe('Документы — вложенные папки, как в проводнике', () => {
  test('папка в папке, пачка файлов и путь назад на сайте', async ({ page }) => {
    await login(page, SAD, SAD12_ADMIN);
    await page.goto(`${SAD}/admin/documents`);

    await createFolder(page, TOP);
    await page.getByRole('link', { name: new RegExp(TOP) }).click();
    await page.waitForURL(/folder=/);
    await createFolder(page, YEAR);
    await page.getByRole('link', { name: new RegExp(YEAR) }).click();
    await page.waitForURL(/folder=/);

    try {
      // Два файла разом — названия берутся из имён файлов.
      await page.locator('#file').setInputFiles([pdf('Жарғы  e2e.pdf'), pdf('Штаттық кесте e2e.pdf')]);
      await page.getByRole('button', { name: 'Загрузить' }).click();
      await expect(page.getByText('Жарғы e2e', { exact: true })).toBeVisible();
      await expect(page.getByText('Штаттық кесте e2e', { exact: true })).toBeVisible();

      // Сайт: папка → вложенная → файлы, и путь назад.
      await page.goto(`${SAD}/documents`);
      await page.getByRole('link', { name: new RegExp(TOP) }).click();
      await expect(page.getByRole('heading', { name: TOP })).toBeVisible();
      await page.getByRole('link', { name: new RegExp(YEAR) }).click();
      await expect(page.getByText('Жарғы e2e', { exact: true })).toBeVisible();
      // Строка целиком — ссылка на файл, рядом текстовая «Скачать».
      await expect(page.getByRole('link', { name: 'Жарғы e2e', exact: true })).toHaveAttribute('href', /\/api\/media\//);
      await expect(page.getByRole('link', { name: 'Скачать: Жарғы e2e' })).toHaveAttribute('href', /download=1/);
      await expect(page.getByRole('link', { name: /Скачать всю папку/ })).toBeVisible();

      // Архив всех документов: настоящий ZIP, длина совпадает с заявленной,
      // папки сайта — папками архива.
      // Без ?lang= — на основном языке сада (у демо-сада русский).
      const zip = await page.request.get(`${SAD}/docs-archive`);
      expect(zip.status()).toBe(200);
      expect(zip.headers()['content-type']).toBe('application/zip');
      const body = await zip.body();
      expect(body.subarray(0, 4).toString('hex')).toBe('504b0304');
      expect(body.length).toBe(Number(zip.headers()['content-length']));
      expect(body.includes(Buffer.from(`${TOP}/${YEAR}/Жарғы e2e.pdf`))).toBe(true);

      const path = page.getByRole('navigation', { name: 'Путь к папке' });
      await expect(path).toContainText(TOP);
      await path.getByRole('link', { name: 'Документы' }).click();
      // Прежние папки сада на месте.
      await expect(page.getByRole('link', { name: /Учредительные документы/ })).toBeVisible();
    } finally {
      // Удаляем верхнюю папку: вложенная с файлами поднимается наверх, а не пропадает.
      await page.goto(`${SAD}/admin/documents`);
      await deleteFolder(page, TOP);
      await expect(page.getByRole('link', { name: new RegExp(YEAR) })).toBeVisible();

      await page.getByRole('link', { name: new RegExp(YEAR) }).click();
      await page.waitForURL(/folder=/);
      for (const title of ['Жарғы e2e', 'Штаттық кесте e2e']) {
        const row = page.locator('div.px-5', { has: page.getByText(title, { exact: true }) });
        await row.getByRole('button', { name: 'Удалить' }).first().click();
        await expect(page.getByText(title, { exact: true })).toHaveCount(0);
      }
      await page.goto(`${SAD}/admin/documents`);
      await deleteFolder(page, YEAR);
    }
  });
});
