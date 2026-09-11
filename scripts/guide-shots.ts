/**
 * Снимки экрана для инструкции сада. Берутся из живой админки, а не рисуются
 * руками: нарисованная картинка устаревает молча, а эта пересобирается
 * той же командой, что и сам PDF, и расхождение с продуктом сразу видно.
 *
 * Требуется поднятый dev-сервер и демо-база: pnpm dev
 * Запуск: pnpm guide:shots
 */
import { chromium, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.GUIDE_BASE ?? 'http://kunshuaq.bobegim.local:3000';
const LOGIN = process.env.GUIDE_LOGIN ?? 'kunshuaq-admin';
const PASSWORD = process.env.GUIDE_PASSWORD ?? 'kunshuaq-2026';
const OUT = resolve(process.cwd(), 'docs/guide/shots');

type Shot = { name: string; path: string; wait?: string };

const SHOTS: Shot[] = [
  { name: 'overview', path: '/admin' },
  { name: 'profile', path: '/admin/profile' },
  { name: 'groups', path: '/admin/groups' },
  { name: 'posts', path: '/admin/posts?type=NEWS' },
  { name: 'gallery', path: '/admin/gallery' },
  { name: 'documents', path: '/admin/documents' },
  { name: 'staff', path: '/admin/staff' },
  { name: 'sections', path: '/admin/sections' },
  { name: 'appearance', path: '/admin/appearance' },
  { name: 'notice', path: '/admin/notice' },
  { name: 'feedback', path: '/admin/feedback' },
  { name: 'account', path: '/admin/account' },
];

async function signIn(page: Page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="login"]', LOGIN);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin(\/|$)/, { timeout: 20_000 });
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2, // в печати одинарный масштаб выглядит мыльным
    locale: 'ru-RU',
  });
  const page = await context.newPage();

  await signIn(page);

  for (const shot of SHOTS) {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: resolve(OUT, `${shot.name}.png`) });
    console.log(`снято: ${shot.name}`);
  }

  // Публичная страница сада — как это увидит родитель
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(OUT, 'site.png') });
  console.log('снято: site');

  await browser.close();
  console.log(`Готово: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
