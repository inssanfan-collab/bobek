/**
 * Карточка превью для портала — та картинка, которая появляется, когда
 * ссылку на edusad.kz кидают в WhatsApp или Telegram.
 *
 * Оформление — как у главной (манера «нежная»): утреннее небо, облака,
 * шарики, шрифты Comfortaa, Nunito и Caveat. Надпись на двух языках:
 * картинка одна на обе версии страницы. Справа — настоящий снимок
 * демо-сада «Балапан» из public/images/sales.
 *
 * Рисует Chromium из Playwright: sharp рендерит текст системными шрифтами,
 * а шрифтов главной в системе нет. Шрифты грузятся с Google Fonts, поэтому
 * нужен интернет. Готовый JPEG лежит в public: WhatsApp не показывает WebP,
 * а сборщики ссылок ходят за картинкой при каждой пересылке.
 *
 * Запуск: pnpm og:image
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'public/og-edusad.jpg');
const WIDTH = 1200;
const HEIGHT = 630;

async function dataUri(file: string): Promise<string> {
  // Chromium из Playwright читает WebP, но data: в PNG надёжнее для снимка.
  const png = await sharp(await readFile(resolve(process.cwd(), 'public/images/sales', file))).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

const CLOUD = 'M22 48h52c9 0 16-6.5 16-15s-7-15-16-15c-1.3 0-2.5.1-3.7.4C67.6 10.7 60.5 5 52 5c-9.2 0-16.8 6.6-18.3 15.4A14 14 0 0 0 22 20C13.7 20 7 26.3 7 34s6.7 14 15 14Z';

const LOGO = `<svg width="64" height="64" viewBox="0 0 512 512">
  <circle cx="296" cy="232" r="178" fill="#FFD76A"/>
  <g stroke="#4B3F8F" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">
    <path d="M96 202L480 74L262 212Z" fill="#9A88EC"/>
    <path d="M96 202L262 212L196 254Z" fill="#FFF7EE"/>
    <path d="M196 254L262 212L480 74L252 292Z" fill="#FFF7EE"/>
    <path d="M196 254L252 292L226 366Z" fill="#FFDCCB"/>
    <path d="M480 74L338 214L366 352Z" fill="#9A88EC"/>
    <path d="M252 292L338 214L366 352Z" fill="#FFF7EE"/>
  </g>
  <path d="M206 384C168 404 118 418 78 396C40 375 40 322 80 306C118 292 150 330 132 372C114 414 66 440 22 440" fill="none" stroke="#4B3F8F" stroke-width="15" stroke-linecap="round" stroke-dasharray="26 22"/>
</svg>`;

function page(desk: string, mob: string): string {
  const cloud = (style: string) => `<svg class="cloud" style="${style}" viewBox="0 0 96 56"><path d="${CLOUD}"/></svg>`;
  const balloon = (style: string, color: string) =>
    `<div class="balloon" style="${style};--bc:${color}"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Comfortaa:wght@700&family=Nunito:wght@600;700;800&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; position: relative;
    background: linear-gradient(180deg, #DDEFFF 0%, #EEE6FF 55%, #FFE7DC 100%);
    font-family: 'Nunito', sans-serif; color: #3A3363; }
  .cloud { position: absolute; fill: #fff; filter: drop-shadow(0 8px 14px rgb(154 136 236 / .2)); }
  .balloon { position: absolute; width: 54px; height: 64px; border-radius: 50% 50% 47% 47% / 56% 56% 44% 44%;
    background: radial-gradient(circle at 32% 28%, rgb(255 255 255 / .75) 0 9%, transparent 26%), var(--bc);
    box-shadow: inset -6px -8px 0 rgb(0 0 0 / .05); }
  .balloon::after { content: ''; position: absolute; left: 50%; top: 100%; width: 2px; height: 46px; margin-top: 3px;
    background: repeating-linear-gradient(transparent 0 2px, #8F89AE 2px 5px); transform: rotate(5deg); transform-origin: top; }
  .text { position: absolute; left: 64px; top: 58px; width: 560px; }
  .brand { display: flex; align-items: center; gap: 14px; font: 700 34px/1 'Comfortaa', sans-serif; letter-spacing: -.02em; }
  h1 { margin-top: 44px; font: 700 50px/1.12 'Comfortaa', sans-serif; letter-spacing: -.01em; }
  .hl { background: linear-gradient(transparent 58%, rgb(255 214 228 / .95) 58% 92%, transparent 92%); padding: 0 .08em; }
  .ru { margin-top: 14px; font: 700 34px/1.2 'Comfortaa', sans-serif; color: #625C88; }
  .hand { margin-top: 22px; font: 700 36px/1.1 'Caveat', cursive; color: #6A58D8; }
  .foot { position: absolute; left: 64px; bottom: 50px; display: flex; align-items: center; gap: 16px; font: 700 21px/1 'Nunito', sans-serif; color: #625C88; }
  .pill { background: #6A58D8; color: #fff; border-radius: 999px; padding: 12px 22px; font: 800 24px/1 'Nunito', sans-serif;
    box-shadow: 0 10px 22px -10px rgb(106 88 216 / .7); }
  .browser { position: absolute; left: 640px; top: 92px; width: 520px; border-radius: 22px; background: #fff; overflow: hidden;
    box-shadow: 0 30px 60px -28px rgb(58 51 99 / .45), 0 0 0 1px rgb(58 51 99 / .06); }
  .bar { display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px; background: #F6F1FF; }
  .bar i { width: 10px; height: 10px; border-radius: 50%; background: #FFC2AE; }
  .bar i:nth-child(2) { background: #FFE38F; } .bar i:nth-child(3) { background: #B6EBD3; }
  .bar span { margin-left: 12px; flex: 1; height: 20px; border-radius: 999px; background: #fff; font: 700 12px/20px 'Nunito', sans-serif; color: #8F89AE; padding-left: 12px; }
  .browser img { display: block; width: 100%; }
  .phone { position: absolute; left: 1036px; top: 268px; width: 132px; border-radius: 22px; border: 6px solid #3A3363; overflow: hidden; background: #fff;
    box-shadow: 0 24px 40px -20px rgb(58 51 99 / .55); }
  .phone img { display: block; width: 100%; }
</style></head><body>
  ${cloud('left:540px;top:26px;width:120px')}
  ${cloud('left:-30px;top:330px;width:150px;opacity:.85')}
  ${cloud('left:880px;top:560px;width:170px')}
  ${balloon('left:588px;top:300px', '#CBBEFF')}
  ${balloon('left:572px;top:236px;width:44px;height:52px', '#FFC2AE')}
  <div class="text">
    <div class="brand">${LOGO}<span>EduSad</span></div>
    <h1>Балабақшаңызға <span class="hl">сайт</span></h1>
    <p class="ru">Сайт для детского сада</p>
    <p class="hand">қазақша және орысша · на двух языках</p>
  </div>
  <div class="foot"><span class="pill">edusad.kz</span><span>Ақтөбе облысы · Актюбинская область</span></div>
  <div class="browser"><div class="bar"><i></i><i></i><i></i><span>balapan.edusad.kz</span></div><img src="${desk}"></div>
  <div class="phone"><img src="${mob}"></div>
</body></html>`;
}

async function main() {
  const html = page(await dataUri('site-akvarel-desk.kk.webp'), await dataUri('site-akvarel-mob.kk.webp'));
  const browser = await chromium.launch();
  try {
    const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
    await tab.setContent(html, { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    // Без шрифтов главной картинка выйдет системным шрифтом — лучше упасть.
    const loaded = await tab.evaluate(() =>
      ['Comfortaa', 'Nunito', 'Caveat'].every((family) => document.fonts.check(`700 20px "${family}"`, 'әғқңөұүһі')),
    );
    if (!loaded) throw new Error('Шрифты Google Fonts не загрузились — нужен интернет');
    const shot = await tab.screenshot({ type: 'png' });
    const body = await sharp(shot).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    await sharp(body).toFile(OUT);
    console.log(`Карточка превью собрана: ${OUT} (${Math.round(body.length / 1024)} КБ)`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
