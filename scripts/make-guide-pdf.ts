/**
 * Собирает инструкцию для детских садов в PDF — казахскую и русскую.
 *
 * Вёрстка печатная: A4, поля под подшивку, разделы не разрываются посреди
 * шага. Инструкцию будут печатать и класть в папку — на экране её прочтут
 * один раз, а в папке она пролежит весь год. Под заголовком главы — ссылка
 * на ролик с тем же действием на edusad.kz/guide.
 *
 * Запуск: pnpm guide:pdf [--lang ru|kk]   (снимки экрана — pnpm guide:shots)
 */
import { chromium, type Page } from '@playwright/test';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHAPTERS, GUIDE_SUBTITLE, GUIDE_TITLE, type Block, type L, type Lang } from './guide-content';

const DIR = resolve(process.cwd(), 'docs/guide');
const PDF: Record<Lang, string> = {
  ru: resolve(process.cwd(), 'public/downloads/edusad-instrukciya.pdf'),
  kk: resolve(process.cwd(), 'public/downloads/edusad-nusqaulyq.pdf'),
};

/** Подписи самой вёрстки — не содержания. */
const UI = {
  contents: { ru: 'Содержание', kk: 'Мазмұны' },
  figure: { ru: 'Рис.', kk: 'Сурет' },
  video: { ru: 'Видео', kk: 'Бейне' },
  portal: {
    ru: 'Сайты для детских садов · edusad.kz',
    kk: 'Балабақшаларға арналған сайттар · edusad.kz',
  },
  footer: { ru: 'EduSad · инструкция для детских садов', kk: 'EduSad · балабақшаларға арналған нұсқаулық' },
} satisfies Record<string, L>;

/** Гарнитуры PDF — перед печатью проверяются на казахские буквы (см. assertKazakhGlyphs). */
const FONTS = { text: 'Onest', display: 'Nunito' };
const KAZAKH = 'әғқңұүһіөӘҒҚҢҰҮҺІӨ';

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** В текстах разрешён только <code> — им размечены адреса и кнопки. */
const rich = (text: string) =>
  escape(text).replace(/&lt;code&gt;(.+?)&lt;\/code&gt;/g, '<code>$1</code>');

const videoUrl = (id: string, lang: Lang) => `https://edusad.kz/guide${lang === 'kk' ? '?lang=kk' : ''}#${id}`;

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/** Бумажный самолётик — логотип EduSad, как в шапке сайта (PlaneLogo), в цветах для тёмного фона. */
const PLANE = `<svg class="cover-logo" viewBox="0 0 512 512" aria-hidden="true">
  <circle cx="296" cy="232" r="178" fill="#FDB62C" />
  <g stroke="#fff" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">
    <path d="M96 202L480 74L262 212Z" fill="#6F7DFF" />
    <path d="M96 202L262 212L196 254Z" fill="#FFF3DC" />
    <path d="M196 254L262 212L480 74L252 292Z" fill="#FFF3DC" />
    <path d="M196 254L252 292L226 366Z" fill="#F6D2A6" />
    <path d="M480 74L338 214L366 352Z" fill="#6F7DFF" />
    <path d="M252 292L338 214L366 352Z" fill="#FFF3DC" />
  </g>
  <path d="M206 384C168 404 118 418 78 396C40 375 40 322 80 306C118 292 150 330 132 372C114 414 66 440 22 440" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-dasharray="26 22" />
</svg>`;

async function renderBlock(block: Block, lang: Lang, figure: number): Promise<string> {
  const t = (text: L) => text[lang];
  switch (block.kind) {
    case 'p':
      return `<p>${rich(t(block.text))}</p>`;

    case 'steps':
      return `<ol class="steps">${block.items.map((item) => `<li>${rich(t(item))}</li>`).join('')}</ol>`;

    case 'list':
      return `<ul class="list">${block.items.map((item) => `<li>${rich(t(item))}</li>`).join('')}</ul>`;

    case 'note':
    case 'warn':
      return `<aside class="callout ${block.kind}"><p class="callout-title">${escape(t(block.title))}</p><p>${rich(t(block.text))}</p></aside>`;

    case 'fields':
      return `<table class="fields"><tbody>${block.rows
        .map(([name, value]) => `<tr><th>${rich(t(name))}</th><td>${rich(t(value))}</td></tr>`)
        .join('')}</tbody></table>`;

    case 'shot': {
      const file = `shots/${lang}/${block.file}.jpg`;
      // Снимка может не быть: инструкция должна собираться и без запущенного сервера
      if (!(await exists(resolve(DIR, file)))) return '';
      return `<figure class="shot">
        <img src="${file}" alt="${escape(t(block.caption))}" />
        <figcaption>${UI.figure[lang]} ${figure}. ${escape(t(block.caption))}</figcaption>
      </figure>`;
    }
  }
}

async function buildHtml(lang: Lang): Promise<string> {
  const chapters: string[] = [];
  let figure = 0;

  for (const [index, chapter] of CHAPTERS.entries()) {
    const blocks: string[] = [];
    for (const block of chapter.blocks) {
      if (block.kind === 'shot') figure += 1;
      blocks.push(await renderBlock(block, lang, figure));
    }
    const lead = chapter.lead[lang];
    const video = chapter.video
      ? `<a class="chapter-video" href="${videoUrl(chapter.video, lang)}">▶ ${UI.video[lang]}: ${escape(videoUrl(chapter.video, lang).replace('https://', ''))}</a>`
      : '';

    chapters.push(`<section class="chapter" id="${chapter.id}">
      <header class="chapter-head">
        <span class="chapter-number">${index + 1}</span>
        <div>
          <h2>${escape(chapter.title[lang])}</h2>
          ${lead ? `<p class="chapter-lead">${escape(lead)}</p>` : ''}
          ${video}
        </div>
      </header>
      ${blocks.join('\n')}
    </section>`);
  }

  const contents = CHAPTERS.map(
    (chapter, index) =>
      `<li><span class="toc-number">${index + 1}</span><span class="toc-title">${escape(chapter.title[lang])}</span>${chapter.video ? `<span class="toc-video">▶</span>` : ''}</li>`,
  ).join('');

  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${escape(GUIDE_TITLE[lang])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=${FONTS.text}:wght@400;500;600;700&family=${FONTS.display}:wght@800;900&display=swap" rel="stylesheet" />
<style>
  /* Цвета продающей части портала (sales.css): индиго и жёлтый. */
  :root {
    --brand: #4F46E5;
    --brand-dark: #3B32C9;
    --brand-soft: #EEEDFD;
    --ink: #1B1D3A;
    --muted: #5A5F7F;
    --line: #E7E8F3;
    --accent: #FFC53D;
    --amber: #A15C00;
    --amber-soft: #FFF6E0;
  }

  /* Подвал — полями страницы, а не footerTemplate: у того нет исключения
     для первой страницы, и номер с подписью ложились поверх обложки. */
  @page {
    size: A4;
    margin: 18mm 16mm 20mm 18mm;
    @bottom-left {
      content: '${UI.footer[lang]}';
      font: 8pt 'Segoe UI', sans-serif;
      color: #8F93AE;
    }
    @bottom-right {
      content: counter(page);
      font: 8pt 'Segoe UI', sans-serif;
      color: #8F93AE;
    }
  }
  @page :first {
    margin: 0;
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: '${FONTS.text}', 'Segoe UI', system-ui, sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  h1, h2, .chapter-number, .cover-title, .cover-mark {
    font-family: '${FONTS.display}', '${FONTS.text}', 'Segoe UI', sans-serif;
    font-weight: 900;
  }

  code {
    font-family: 'Consolas', 'Courier New', monospace;
    background: var(--brand-soft);
    color: var(--brand-dark);
    padding: 0 .25em;
    border-radius: .25em;
    font-size: .92em;
  }

  /* ── Обложка ── */
  .cover {
    height: 297mm;
    padding: 30mm 22mm 26mm;
    background:
      radial-gradient(160mm 110mm at 90% 8%, #7C73FF 0%, transparent 62%),
      radial-gradient(140mm 90mm at 0% 100%, #3B32C9 0%, transparent 60%),
      var(--brand);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
  }
  .cover-brand { display: flex; align-items: center; gap: 5mm; }
  .cover-logo { width: 26mm; height: 26mm; }
  .cover-mark { font-size: 22pt; letter-spacing: .01em; }
  .cover-title {
    font-size: 44pt;
    line-height: 1.05;
    margin: 0 0 7mm;
  }
  .cover-title::after {
    content: '';
    display: block;
    width: 28mm;
    height: 3mm;
    margin-top: 7mm;
    border-radius: 2mm;
    background: var(--accent);
  }
  .cover-sub {
    font-size: 15pt;
    max-width: 140mm;
    text-wrap: balance;
    opacity: .95;
    margin: 0;
  }
  .cover-foot {
    font-size: 10pt;
    opacity: .85;
    border-top: 1px solid rgba(255,255,255,.35);
    padding-top: 5mm;
  }

  /* ── Оглавление ── */
  .toc { page-break-after: always; }
  .toc h2 {
    font-size: 22pt;
    color: var(--ink);
    margin: 0 0 8mm;
  }
  .toc ol { list-style: none; margin: 0; padding: 0; }
  .toc li {
    display: flex;
    gap: 6mm;
    align-items: baseline;
    padding: 2.3mm 0;
    border-bottom: 1px solid var(--line);
  }
  .toc-number { width: 8mm; font-weight: 700; color: var(--brand); }
  .toc-title { flex: 1; font-weight: 600; }
  .toc-video { color: var(--brand); font-size: 8pt; }

  /* ── Разделы ── */
  /* Разделы идут подряд: принудительный разрыв перед каждым оставлял
     полупустые страницы у коротких глав и раздувал инструкцию вдвое. */
  .chapter { margin-top: 10mm; }
  .chapter:first-of-type { margin-top: 0; }
  .chapter-head {
    /* Заголовок не отрывается ни внутри себя, ни от первого абзаца:
       иначе подзаголовок уезжает на следующую страницу без номера главы */
    break-inside: avoid;
    page-break-inside: avoid;
    break-after: avoid;
    page-break-after: avoid;
    display: flex;
    gap: 5mm;
    align-items: flex-start;
    padding-bottom: 4mm;
    margin-bottom: 5mm;
    border-bottom: 2px solid var(--brand-soft);
  }
  .chapter-number {
    flex: none;
    width: 11mm;
    height: 11mm;
    border-radius: 3.5mm;
    background: var(--brand);
    color: #fff;
    font-size: 14pt;
    display: grid;
    place-items: center;
  }
  .chapter h2 {
    font-size: 19pt;
    margin: 0;
    color: var(--ink);
    line-height: 1.2;
  }
  .chapter-lead {
    margin: 1.5mm 0 0;
    color: var(--muted);
    font-size: 10.5pt;
  }
  .chapter-video {
    display: inline-block;
    margin-top: 2mm;
    padding: .6mm 2.6mm;
    border-radius: 3mm;
    background: var(--amber-soft);
    color: var(--ink);
    font-size: 9pt;
    font-weight: 600;
    text-decoration: none;
  }

  p { margin: 0 0 3.5mm; }

  .steps {
    margin: 0 0 4mm;
    padding-left: 0;
    list-style: none;
    counter-reset: step;
  }
  .steps li {
    counter-increment: step;
    position: relative;
    padding-left: 9mm;
    margin-bottom: 2.6mm;
    page-break-inside: avoid;
  }
  .steps li::before {
    content: counter(step);
    position: absolute;
    left: 0;
    top: .2mm;
    width: 6mm;
    height: 6mm;
    border-radius: 50%;
    background: var(--accent);
    color: var(--ink);
    font-weight: 700;
    font-size: 9pt;
    display: grid;
    place-items: center;
  }

  .list { margin: 0 0 4mm; padding-left: 5mm; }
  .list li { margin-bottom: 1.8mm; page-break-inside: avoid; }

  .callout {
    border-left: 3px solid var(--brand);
    background: var(--brand-soft);
    padding: 3.5mm 4mm;
    border-radius: 0 2.5mm 2.5mm 0;
    margin: 0 0 4mm;
    page-break-inside: avoid;
  }
  .callout.warn {
    border-left-color: var(--amber);
    background: var(--amber-soft);
  }
  .callout p { margin: 0; }
  .callout-title {
    font-weight: 700;
    margin-bottom: 1mm !important;
    color: var(--brand-dark);
  }
  .callout.warn .callout-title { color: var(--amber); }

  .fields {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 4mm;
    font-size: 10pt;
  }
  .fields th {
    text-align: left;
    vertical-align: top;
    width: 44mm;
    padding: 2.2mm 4mm 2.2mm 0;
    font-weight: 700;
    color: var(--brand-dark);
    border-bottom: 1px solid var(--line);
  }
  .fields td {
    vertical-align: top;
    padding: 2.2mm 0;
    border-bottom: 1px solid var(--line);
  }
  .fields tr { page-break-inside: avoid; }

  .shot {
    margin: 0 0 5mm;
    page-break-inside: avoid;
  }
  .shot img {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 2.5mm;
  }
  .shot figcaption {
    margin-top: 1.5mm;
    font-size: 9pt;
    color: var(--muted);
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-brand">${PLANE}<span class="cover-mark">EduSad</span></div>
  <div>
    <h1 class="cover-title">${escape(GUIDE_TITLE[lang])}</h1>
    <p class="cover-sub">${escape(GUIDE_SUBTITLE[lang])}</p>
  </div>
  <div class="cover-foot">${escape(UI.portal[lang])} · ${year}</div>
</div>

<section class="toc">
  <h2>${UI.contents[lang]}</h2>
  <ol>${contents}</ol>
</section>

${chapters.join('\n')}

</body>
</html>`;
}

/**
 * Проверка, что выбранные гарнитуры действительно рисуют казахские буквы:
 * Google Fonts объявляет cyrillic-ext и у шрифтов без них, и тогда буквы
 * молча подставляются из системного шрифта. Сравниваем ширину глифа
 * со шрифтом, которого заведомо нет.
 */
async function assertKazakhGlyphs(page: Page) {
  const missing = await page.evaluate(
    async ({ fonts, letters }) => {
      // Подмножество с этими буквами браузер грузит, только когда они
      // встречаются на странице, — просим его явно, иначе мерили бы запасной шрифт.
      for (const [family, weight] of fonts) await document.fonts.load(`${weight} 100px "${family}"`, letters.join(''));
      // Без вложенных функций: tsx оборачивает их в __name, которого нет в браузере.
      const ctx = document.createElement('canvas').getContext('2d')!;
      const out: string[] = [];
      for (const [family, weight] of fonts) {
        for (const ch of letters) {
          ctx.font = `${weight} 100px "${family}"`;
          const real = ctx.measureText(ch).width;
          ctx.font = `${weight} 100px "__NoSuchFont__"`;
          const none = ctx.measureText(ch).width;
          if (Math.abs(real - none) < 0.01) out.push(`${family} ${weight}: ${ch}`);
        }
      }
      return out;
    },
    { fonts: [[FONTS.text, 400], [FONTS.text, 700], [FONTS.display, 900]] as [string, number][], letters: [...KAZAKH] },
  );
  if (missing.length) throw new Error(`В шрифтах нет казахских букв: ${missing.join(', ')}`);
}

async function main() {
  const args = process.argv.slice(2);
  const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
  const langs: Lang[] = langArg === 'kk' || langArg === 'ru' ? [langArg] : ['kk', 'ru'];

  await mkdir(DIR, { recursive: true });
  await mkdir(resolve(process.cwd(), 'public/downloads'), { recursive: true });
  const browser = await chromium.launch();

  try {
    for (const lang of langs) {
      const html = resolve(DIR, `guide.${lang}.html`);
      await writeFile(html, await buildHtml(lang), 'utf8');

      const page = await browser.newPage();
      await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
      // Шрифты подтягиваются из сети; без ожидания первая страница выйдет системной
      await page.evaluate(() => document.fonts.ready);
      await assertKazakhGlyphs(page);

      await page.pdf({
        path: PDF[lang],
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      await page.close();
      console.log(`Инструкция собрана: ${PDF[lang]}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
