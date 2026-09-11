/**
 * Собирает инструкцию для детских садов в PDF.
 *
 * Вёрстка печатная: A4, поля под подшивку, разделы не разрываются посреди
 * шага. Инструкцию будут печатать и класть в папку — на экране её прочтут
 * один раз, а в папке она пролежит весь год.
 *
 * Запуск: pnpm guide:pdf   (снимки экрана — pnpm guide:shots)
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHAPTERS, GUIDE_SUBTITLE, GUIDE_TITLE, type Block } from './guide-content';

const DIR = resolve(process.cwd(), 'docs/guide');
const HTML = resolve(DIR, 'guide.html');
const PDF = resolve(process.cwd(), 'public/downloads/bobegim-instrukciya.pdf');

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** В текстах разрешён только <code> — им размечены адреса и кнопки. */
const rich = (text: string) =>
  escape(text).replace(/&lt;code&gt;(.+?)&lt;\/code&gt;/g, '<code>$1</code>');

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function renderBlock(block: Block, index: number): Promise<string> {
  switch (block.kind) {
    case 'p':
      return `<p>${rich(block.text)}</p>`;

    case 'steps':
      return `<ol class="steps">${block.items.map((item) => `<li>${rich(item)}</li>`).join('')}</ol>`;

    case 'list':
      return `<ul class="list">${block.items.map((item) => `<li>${rich(item)}</li>`).join('')}</ul>`;

    case 'note':
      return `<aside class="callout note"><p class="callout-title">${escape(block.title)}</p><p>${rich(block.text)}</p></aside>`;

    case 'warn':
      return `<aside class="callout warn"><p class="callout-title">${escape(block.title)}</p><p>${rich(block.text)}</p></aside>`;

    case 'fields':
      return `<table class="fields"><tbody>${block.rows
        .map(([name, value]) => `<tr><th>${rich(name)}</th><td>${rich(value)}</td></tr>`)
        .join('')}</tbody></table>`;

    case 'shot': {
      const file = resolve(DIR, 'shots', block.file);
      // Снимка может не быть: инструкция должна собираться и без запущенного сервера
      if (!(await exists(file))) return '';
      return `<figure class="shot">
        <img src="shots/${block.file}" alt="${escape(block.caption)}" />
        <figcaption>Рис. ${index + 1}. ${escape(block.caption)}</figcaption>
      </figure>`;
    }
  }
}

async function buildHtml(): Promise<string> {
  const chapters: string[] = [];
  let shotNumber = 0;

  for (const [index, chapter] of CHAPTERS.entries()) {
    const blocks: string[] = [];
    for (const block of chapter.blocks) {
      if (block.kind === 'shot') {
        blocks.push(await renderBlock(block, shotNumber));
        shotNumber += 1;
      } else {
        blocks.push(await renderBlock(block, shotNumber));
      }
    }

    chapters.push(`<section class="chapter" id="${chapter.id}">
      <header class="chapter-head">
        <span class="chapter-number">${index + 1}</span>
        <div>
          <h2>${escape(chapter.title)}</h2>
          ${chapter.lead ? `<p class="chapter-lead">${escape(chapter.lead)}</p>` : ''}
        </div>
      </header>
      ${blocks.join('\n')}
    </section>`);
  }

  const contents = CHAPTERS.map(
    (chapter, index) =>
      `<li><span class="toc-number">${index + 1}</span><span class="toc-title">${escape(chapter.title)}</span></li>`,
  ).join('');

  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${escape(GUIDE_TITLE)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&family=Comfortaa:wght@600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --brand: #0e8f7e;
    --brand-dark: #0a6d60;
    --brand-soft: #e3f3f0;
    --ink: #1f2937;
    --muted: #6b7280;
    --line: #e2e8e7;
    --amber: #b45309;
    --amber-soft: #fef6e7;
  }

  @page {
    size: A4;
    margin: 18mm 16mm 20mm 18mm;
  }
  @page :first { margin: 0; }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Nunito Sans', 'Segoe UI', system-ui, sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  h1, h2, h3, .chapter-number, .cover-title {
    font-family: 'Comfortaa', 'Nunito Sans', 'Segoe UI', system-ui, sans-serif;
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
    padding: 32mm 22mm;
    background: linear-gradient(150deg, #0e8f7e 0%, #14b8a6 55%, #5eead4 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
  }
  .cover-mark {
    font-size: 12pt;
    letter-spacing: .28em;
    text-transform: uppercase;
    opacity: .85;
  }
  .cover-title {
    font-size: 40pt;
    line-height: 1.1;
    font-weight: 700;
    margin: 0 0 6mm;
  }
  .cover-sub {
    font-size: 14pt;
    max-width: 120mm;
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
    font-size: 20pt;
    color: var(--brand-dark);
    margin: 0 0 8mm;
  }
  .toc ol { list-style: none; margin: 0; padding: 0; counter-reset: none; }
  .toc li {
    display: flex;
    gap: 6mm;
    align-items: baseline;
    padding: 2.4mm 0;
    border-bottom: 1px solid var(--line);
  }
  .toc-number {
    width: 8mm;
    font-weight: 700;
    color: var(--brand);
  }
  .toc-title { font-weight: 600; }

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
    border-radius: 3mm;
    background: var(--brand);
    color: #fff;
    font-size: 14pt;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
  .chapter h2 {
    font-size: 19pt;
    margin: 0;
    color: var(--brand-dark);
    line-height: 1.2;
  }
  .chapter-lead {
    margin: 1.5mm 0 0;
    color: var(--muted);
    font-size: 10.5pt;
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
    background: var(--brand-soft);
    color: var(--brand-dark);
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
    border-radius: 0 2mm 2mm 0;
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
    width: 42mm;
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
  <div class="cover-mark">Bobegim</div>
  <div>
    <h1 class="cover-title">${escape(GUIDE_TITLE)}</h1>
    <p class="cover-sub">${escape(GUIDE_SUBTITLE)}</p>
  </div>
  <div class="cover-foot">
    Портал детских садов Актюбинской области · ${year}
  </div>
</div>

<section class="toc">
  <h2>Содержание</h2>
  <ol>${contents}</ol>
</section>

${chapters.join('\n')}

</body>
</html>`;
}

async function main() {
  await mkdir(DIR, { recursive: true });
  await mkdir(resolve(process.cwd(), 'public/downloads'), { recursive: true });

  const html = await buildHtml();
  await writeFile(HTML, html, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle' });
  // Шрифты подтягиваются из сети; без ожидания первая страница выйдет системной
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width:100%;font-size:8pt;color:#9aa3a1;font-family:'Segoe UI',sans-serif;
                  padding:0 16mm;display:flex;justify-content:space-between;">
        <span>Bobegim · инструкция для детских садов</span>
        <span class="pageNumber"></span>
      </div>`,
    margin: { top: '18mm', right: '16mm', bottom: '20mm', left: '18mm' },
  });

  await browser.close();
  console.log(`Инструкция собрана: ${PDF}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
