/**
 * Карточка превью для портала — та картинка, которая появляется, когда
 * ссылку на edusad.kz кидают в WhatsApp или Telegram.
 *
 * Собирается заранее в JPEG и лежит в public: WhatsApp не показывает WebP,
 * в который пересжимаются все загрузки, а сборщики ссылок ходят за картинкой
 * при каждой пересылке — отдавать её статикой дешевле, чем считать на лету.
 *
 * Запуск: pnpm og:image
 */
import sharp from 'sharp';
import { resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'public/images/group-room.webp');
const OUT = resolve(process.cwd(), 'public/og-edusad.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="shade" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#06231f" stop-opacity="0.92"/>
      <stop offset="0.55" stop-color="#06231f" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#06231f" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)"/>

  <g transform="translate(72, 392)">
    <rect width="64" height="64" rx="20" fill="#14b8a6"/>
    <g transform="translate(12,12) scale(1)" fill="none" stroke="#fff" stroke-width="4"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 34v-13"/>
      <path d="M20 21c0-6-4.5-9.5-10.5-9.5 0 6 4.5 9.5 10.5 9.5z"/>
      <path d="M20 21c0-6.5 4.8-10.5 11.2-10.5 0 6.5-4.8 10.5-11.2 10.5z"/>
    </g>
    <text x="84" y="44" font-family="Segoe UI, Arial, sans-serif" font-size="44"
          font-weight="800" fill="#ffffff">EduSad</text>
  </g>

  <text x="72" y="516" font-family="Segoe UI, Arial, sans-serif" font-size="52"
        font-weight="700" fill="#ffffff">Сайты для детских садов</text>
  <text x="72" y="570" font-family="Segoe UI, Arial, sans-serif" font-size="30"
        font-weight="500" fill="#c8e8e2">Актюбинская область · edusad.kz</text>
</svg>`;

async function main() {
  const body = await sharp(SRC)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();

  await sharp(body).toFile(OUT);
  console.log(`Карточка превью собрана: ${OUT} (${Math.round(body.length / 1024)} КБ)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
