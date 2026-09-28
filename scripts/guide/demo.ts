/**
 * Демо-сад, на котором снимается инструкция: и ролики (record.ts),
 * и снимки для PDF (guide-shots.ts). Одни и те же адрес, вход и язык —
 * чтобы видео и бумажная инструкция показывали одинаковые экраны.
 */
import type { Browser, Page } from '@playwright/test';
import type { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import type { Lang } from './director';

export type { Lang };

export const BASE = process.env.GUIDE_BASE ?? 'http://demo.localhost:3001';
export const ASSETS = process.env.GUIDE_ASSETS ?? 'C:/dev/bobegim-design/demo';
export const LOGIN = 'demo-admin';
/** Только для локальной базы: localOnly() не даст задать его на сервере. */
export const PASSWORD = 'guide-local-2026';

export function localOnly() {
  const url = process.env.DATABASE_URL ?? '';
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    throw new Error('Съёмка инструкции — только на локальной базе: она меняет пароль и язык сотрудника демо-сада.');
  }
}

/** Язык админки хранится у пользователя — задаём его перед входом вместе с известным паролем. */
export async function setDemoUser(prisma: PrismaClient, lang: Lang) {
  await prisma.user.update({
    where: { login: LOGIN },
    data: { passwordHash: await hash(PASSWORD, { memoryCost: 19456, timeCost: 2, parallelism: 1 }), locale: lang, mustChangePassword: false },
  });
}

/**
 * Переход с повтором: dev-сервер, упёршись в предел памяти, сам
 * перезапускается, и несколько секунд порт не отвечает — из-за этого
 * запись падала посреди прогона.
 */
export async function gotoRetry(page: Page, url: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await page.goto(url, { waitUntil: 'networkidle' });
    } catch (error) {
      if (attempt >= 12 || !String(error).includes('ERR_CONNECTION_REFUSED')) throw error;
      await page.waitForTimeout(5000);
    }
  }
}

/**
 * Вход в админку демо-сада и прогрев страниц: в режиме разработки страница
 * собирается при первом заходе, и в кадре вместо админки был бы белый экран.
 */
export async function signIn(browser: Browser, warm: string[], viewport = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  // На холодном сервере страница входа собирается секунд двадцать, и нажатие
  // успевало раньше, чем форма оживала, — тогда просто пробуем ещё раз.
  for (let attempt = 1; ; attempt++) {
    await gotoRetry(page, `${BASE}/admin/login`);
    await page.fill('input[name="login"]', LOGIN);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'), { timeout: 30_000 });
      break;
    } catch (error) {
      if (attempt >= 3) throw error;
    }
  }
  for (const p of warm) await gotoRetry(page, `${BASE}${p}`);
  const state = await context.storageState();
  await context.close();
  return state;
}

/** Страницы админки и сайта, которые показываются в инструкции. */
export const WARM_PAGES = [
  ...['', '/posts?type=NEWS', '/posts/new?type=NEWS', '/documents', '/menu', '/account', '/profile', '/notice', '/gallery', '/groups', '/staff', '/homepage', '/appearance', '/sections', '/feedback'].map((p) => `/admin${p}`),
  '/', '/news', '/documents', '/menu', '/gallery', '/groups', '/staff', '/?lang=ru',
];
