/**
 * Снимки экрана для PDF-инструкции. Берутся из живой админки демо-сада
 * «Балапан», а не рисуются руками: нарисованная картинка устаревает молча,
 * а эта пересобирается одной командой, и расхождение с продуктом сразу видно.
 * Сад тот же, что в роликах (scripts/guide/demo.ts), — бумага и видео
 * показывают одинаковые экраны.
 *
 * Нужны pnpm dev на порту 3001 и демо-сад в локальной базе
 * (его создаёт pnpm guide:record или scripts/create-demo-site.ts).
 * Запуск: pnpm guide:shots [--lang ru|kk]
 */
import 'dotenv/config';
import { chromium, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BASE, WARM_PAGES, localOnly, setDemoUser, signIn, type Lang } from './guide/demo';

const OUT = resolve(process.cwd(), 'docs/guide/shots');
const VIEWPORT = { width: 1280, height: 860 };

type Shot = {
  name: string;
  /** Адрес; {lang} заменяется языком снимка. */
  path: string;
  /** Страница сайта, а не админки: без ?lang она открывается на основном языке сада (казахском). */
  site?: boolean;
  anonymous?: boolean;
  /** Перейти по первой такой ссылке — у альбома и папки адрес с идентификатором. */
  open?: string;
};

const SHOTS: Shot[] = [
  { name: 'site', path: '/', site: true },
  { name: 'login', path: '/admin/login?lang={lang}', anonymous: true },
  { name: 'account', path: '/admin/account' },
  { name: 'overview', path: '/admin' },
  { name: 'profile', path: '/admin/profile' },
  { name: 'groups', path: '/admin/groups' },
  { name: 'news', path: '/admin/posts/new?type=NEWS' },
  { name: 'notice', path: '/admin/notice' },
  { name: 'gallery', path: '/admin/gallery', open: 'main a[href^="/admin/gallery/"]' },
  { name: 'documents', path: '/admin/documents' },
  { name: 'documents-site', path: '/documents', site: true, open: 'main a[href*="folder="]' },
  { name: 'menu', path: '/admin/menu' },
  { name: 'staff', path: '/admin/staff' },
  { name: 'homepage', path: '/admin/homepage' },
  { name: 'appearance', path: '/admin/appearance' },
  { name: 'sections', path: '/admin/sections' },
  { name: 'feedback', path: '/admin/feedback' },
];

const url = (shot: Shot, lang: Lang) => {
  const path = shot.path.replace('{lang}', lang);
  return shot.site && lang === 'ru' ? `${BASE}${path}${path.includes('?') ? '&' : '?'}lang=ru` : `${BASE}${path}`;
};

/** Значок сборки Next в углу есть только в режиме разработки — в инструкции ему не место. */
async function settle(page: Page) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  await page.waitForTimeout(500);
}

async function main() {
  localOnly();
  const args = process.argv.slice(2);
  const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
  const langs: Lang[] = langArg === 'kk' || langArg === 'ru' ? [langArg] : ['ru', 'kk'];

  const prisma = new PrismaClient();
  const browser = await chromium.launch();
  try {
    for (const lang of langs) {
      await setDemoUser(prisma, lang);
      const state = await signIn(browser, WARM_PAGES);
      await mkdir(resolve(OUT, lang), { recursive: true });

      for (const shot of SHOTS) {
        const context = await browser.newContext({
          viewport: VIEWPORT,
          // Полуторный масштаб: в печати одинарный выглядит мыльным,
          // а двойной раздувает PDF вдвое без видимой разницы на бумаге.
          deviceScaleFactor: 1.5,
          locale: lang === 'kk' ? 'kk-KZ' : 'ru-RU',
          storageState: shot.anonymous ? undefined : state,
        });
        const page = await context.newPage();
        await page.goto(url(shot, lang), { waitUntil: 'networkidle' });
        if (shot.open) {
          const href = await page.locator(shot.open).first().getAttribute('href');
          if (!href) throw new Error(`${shot.name}: нет ссылки ${shot.open}`);
          await page.goto(new URL(href, page.url()).href, { waitUntil: 'networkidle' });
        }
        await settle(page);
        await page.screenshot({ path: resolve(OUT, lang, `${shot.name}.jpg`), type: 'jpeg', quality: 82 });
        await context.close();
        console.log(`снято: ${lang}/${shot.name}`);
      }
    }
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
  console.log(`Готово: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
