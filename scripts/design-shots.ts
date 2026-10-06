/**
 * Снимки витрины дизайнов (/designs): каждая тема с `showcase` в каталоге —
 * на демо-саде «Балапан», во всю длину, на компьютере и на телефоне.
 *
 *   pnpm designs:shots                       # с боевого demo.edusad.kz
 *   pnpm designs:shots http://demo.bobegim.local:3000 dala aspan   # свой адрес и только эти темы
 *
 * Снимаем только демо-сад: данные там выдуманы, фото сгенерированы — настоящих
 * детей на витрине портала быть не должно. Примерка ?theme= на боевом работает
 * только на нём. Результат — public/images/designs/<код>-{desk,mob}.webp
 * и размеры снимков в src/lib/design-shots.json (их читает страница, чтобы
 * знать высоту картинки до загрузки).
 * Поменялась тема заметно — переснимите её.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from '@playwright/test';
import sharp from 'sharp';
import { THEME_CATALOG } from '../src/themes/catalog';

const OUT = path.resolve(__dirname, '../public/images/designs');
const MANIFEST = path.resolve(__dirname, '../src/lib/design-shots.json');

type Size = [number, number];

async function shoot(page: Page, url: string): Promise<Buffer> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  // Липкая шапка на снимке во всю длину повторялась бы; кнопка «наверх» и
  // всплывающие подсказки — тоже лишние.
  await page.addStyleTag({ content: '.site-header{position:static!important} nextjs-portal{display:none!important}' });
  // Ленивые картинки грузятся у края экрана — проходим страницу дважды.
  await page.evaluate(async () => {
    // Ленивые картинки в самом низу в безголовом браузере иногда не успевают
    // загрузиться при прокрутке — просим их сразу.
    document.querySelectorAll('img[loading=lazy]').forEach((img) => {
      (img as HTMLImageElement).loading = 'eager';
    });
    for (let pass = 0; pass < 2; pass += 1) {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }
    }
    // Декодируем всё до снимка: повёрнутая или в overflow:hidden картинка
    // иначе может остаться пустой рамкой на снимке во всю длину.
    await Promise.all(Array.from(document.images, (img) => img.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  return page.screenshot({ fullPage: true, type: 'png' });
}

async function main() {
  const [baseArg, ...only] = process.argv.slice(2);
  const base = (baseArg && baseArg.startsWith('http') ? baseArg : 'https://demo.edusad.kz').replace(/\/$/, '');
  const codes = [...(baseArg && !baseArg.startsWith('http') ? [baseArg] : []), ...only];
  const themes = THEME_CATALOG.filter((theme) => theme.showcase && (codes.length === 0 || codes.includes(theme.code)));
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const manifest: Record<string, { desk: Size; mob: Size }> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  for (const theme of themes) {
    const url = `${base}/?theme=${theme.code}`;
    const deskInfo = await sharp(await shoot(desk, url)).resize(960).webp({ quality: 70 }).toFile(path.join(OUT, `${theme.code}-desk.webp`));
    const mobInfo = await sharp(await shoot(mob, url)).resize(390).webp({ quality: 72 }).toFile(path.join(OUT, `${theme.code}-mob.webp`));
    manifest[theme.code] = { desk: [deskInfo.width, deskInfo.height], mob: [mobInfo.width, mobInfo.height] };
    console.log(theme.code, `компьютер ${deskInfo.width}×${deskInfo.height}, ${Math.round(deskInfo.size / 1024)} КБ;`, `телефон ${mobInfo.width}×${mobInfo.height}, ${Math.round(mobInfo.size / 1024)} КБ`);
  }
  await browser.close();
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((code) => [code, manifest[code]]));
  writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
