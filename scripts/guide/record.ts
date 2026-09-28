/**
 * Видеоинструкция и кадры для анимированной страницы — одним прогоном.
 *
 * Робот проходит сценарии (scenarios.ts) по админке демо-сада «Балапан»
 * на машине разработчика: данные выдуманные, в кадр не попадают настоящие
 * дети и сотрудники. Перед каждым языком демо-сад пересоздаётся, поэтому
 * казахский и русский ролики снимаются с одинакового состояния.
 *
 * Нужны: pnpm dev на порту 3001 (GUIDE_BASE), папка с фото и PDF демо-сада
 * (GUIDE_ASSETS), ffmpeg с libx264.
 *
 *   node --conditions=react-server --import tsx scripts/guide/record.ts [news documents …] [--lang ru|kk] [--no-reset]
 *
 * Результат — public/guide (в git не входит, на сервер копируется руками):
 *   video/<id>.<lang>.mp4 и .jpg (заставка), steps/<lang>/<id>/NN.webp,
 *   manifest.json — его читает страница /guide.
 *
 * Работает только с локальной базой: пересоздаёт демо-сад и задаёт
 * его сотруднику известный пароль.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium, type Browser } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { Director, type Step } from './director';
import { OVERLAY_SCRIPT, titleCard } from './overlay';
import { SCENARIOS, type Assets } from './scenarios';
import { ASSETS, BASE, LOGIN, PASSWORD, WARM_PAGES, localOnly, setDemoUser, signIn, type Lang } from './demo';

const OUT = path.resolve('public/guide');
const SIZE = { width: 1280, height: 800 };

const KICKER = { ru: 'EduSad · инструкция для сада', kk: 'EduSad · балабақшаға нұсқаулық' };
const DONE = { ru: 'Готово!', kk: 'Дайын!' };
const MORE = { ru: 'Остальные инструкции — edusad.kz/guide', kk: 'Басқа нұсқаулықтар — edusad.kz/guide' };

type Manifest = {
  updatedAt: string;
  tasks: Record<string, { title: { kk: string; ru: string }; sub: { kk: string; ru: string }; video: Partial<Record<Lang, string>>; steps: Partial<Record<Lang, Step[]>> }>;
};

async function prepareDemo(prisma: PrismaClient, lang: Lang, reset: boolean) {
  if (reset) {
    execFileSync('pnpm', ['tsx', 'scripts/create-demo-site.ts', ASSETS, '--reset', '--extra-host', 'demo.localhost'], { stdio: 'inherit', shell: true });
  }
  await setDemoUser(prisma, lang);
}

function ffmpeg(args: string[]) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}

async function toWebp(dir: string) {
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.png')) continue;
    const src = path.join(dir, file);
    await sharp(src).webp({ quality: 82 }).toFile(src.replace(/\.png$/, '.webp'));
    await rm(src);
  }
}

async function main() {
  localOnly();
  const args = process.argv.slice(2);
  const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
  const langs: Lang[] = langArg === 'kk' || langArg === 'ru' ? [langArg] : ['ru', 'kk'];
  const reset = !args.includes('--no-reset');
  const wanted = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--lang');
  const scenarios = wanted.length ? SCENARIOS.filter((s) => wanted.includes(s.id)) : SCENARIOS;
  if (!scenarios.length) throw new Error(`нет таких сценариев: ${wanted.join(', ')}`);

  // Название документа берётся из имени файла — поэтому файлы для ролика
  // называются по-человечески и на языке ролика, а не prikaz-gruppy.pdf.
  const DOCS: [string, Record<Lang, string>][] = [
    ['prikaz-gruppy.pdf', { ru: 'Приказ о комплектовании групп', kk: 'Топтарды жасақтау туралы бұйрық' }],
    ['prikaz-pitanie.pdf', { ru: 'Приказ об организации питания', kk: 'Тамақтануды ұйымдастыру туралы бұйрық' }],
    ['prikaz-plan.pdf', { ru: 'Приказ об утверждении годового плана', kk: 'Жылдық жоспарды бекіту туралы бұйрық' }],
  ];
  const photo = path.join(ASSETS, 'img', 'demo-n-nauryz.png');
  const photos = ['demo-g-play1.png', 'demo-g-reading.png', 'demo-g-yard.png'].map((f) => path.join(ASSETS, 'img', f));
  const portrait = path.join(ASSETS, 'img', 'demo-s-t2.png');
  for (const file of [photo, portrait, ...photos, ...DOCS.map(([f]) => path.join(ASSETS, 'docs', f))]) if (!existsSync(file)) throw new Error(`нет файла ${file}`);
  const assetsFor = async (lang: Lang): Promise<Assets> => {
    const dir = path.join(tmpAssets, lang);
    await mkdir(dir, { recursive: true });
    const docs: string[] = [];
    for (const [file, names] of DOCS) {
      const target = path.join(dir, `${names[lang]}.pdf`);
      await copyFile(path.join(ASSETS, 'docs', file), target);
      docs.push(target);
    }
    // Фотографии — тоже с понятными именами: их видно в поле выбора файла.
    const named = async (src: string, name: string) => {
      const target = path.join(dir, `${name}${path.extname(src)}`);
      await copyFile(src, target);
      return target;
    };
    const party = lang === 'kk' ? 'Ертеңгілік' : 'Утренник';
    return {
      photo: await named(photo, 'Наурыз'),
      photos: await Promise.all(photos.map((p, i) => named(p, `${party} ${i + 1}`))),
      portrait: await named(portrait, lang === 'kk' ? 'Тәрбиеші' : 'Воспитатель'),
      docs,
      login: LOGIN,
      password: PASSWORD,
    };
  };

  const manifestPath = path.join(OUT, 'manifest.json');
  const manifest: Manifest = existsSync(manifestPath)
    ? JSON.parse(await readFile(manifestPath, 'utf8'))
    : { updatedAt: '', tasks: {} };
  const saveManifest = async () => {
    // Порядок задач на странице — порядок сценариев в scenarios.ts.
    const order = SCENARIOS.map((s) => s.id);
    manifest.tasks = Object.fromEntries(Object.entries(manifest.tasks).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b)));
    manifest.updatedAt = new Date().toISOString();
    await writeFile(manifestPath, JSON.stringify(manifest, null, 1));
  };

  const prisma = new PrismaClient();
  // Черновики — во временной папке системы, не в public: за public следит
  // dev-сервер, и Windows не даёт удалить занятый им файл.
  const tmp = path.join(os.tmpdir(), 'edusad-guide', 'video');
  const tmpAssets = path.join(os.tmpdir(), 'edusad-guide', 'assets');
  let browser: Browser | null = null;

  try {
    for (const lang of langs) {
      // Надписи самого браузера («Выберите файл») — на языке ролика.
      await browser?.close();
      browser = await chromium.launch({ args: [`--lang=${lang === 'kk' ? 'kk' : 'ru'}`] });
      await prepareDemo(prisma, lang, reset);
      const state = await signIn(browser, WARM_PAGES, SIZE);
      const assets = await assetsFor(lang);

      for (const scenario of scenarios) {
        console.log(`▶ ${scenario.id} (${lang})`);
        await rm(tmp, { recursive: true, force: true }).catch(() => {});
        const stepsDir = path.join(OUT, 'steps', lang, scenario.id);
        await rm(stepsDir, { recursive: true, force: true });

        const context = await browser.newContext({
          viewport: SIZE,
          storageState: scenario.anonymous ? undefined : state,
          recordVideo: { dir: tmp, size: SIZE },
          locale: lang === 'kk' ? 'kk-KZ' : 'ru-RU',
        });
        await context.addInitScript(OVERLAY_SCRIPT);
        const page = await context.newPage();
        const director = new Director(page, lang, stepsDir, BASE);

        await page.setContent(titleCard({ kicker: KICKER[lang], title: scenario.title[lang], sub: scenario.sub[lang] }), { waitUntil: 'networkidle' });
        await page.waitForTimeout(3200);
        await scenario.run(director, assets);
        await director.caption(null);
        await page.setContent(titleCard({ kicker: KICKER[lang], title: DONE[lang], sub: MORE[lang] }), { waitUntil: 'networkidle' });
        await page.waitForTimeout(2200);

        const video = page.video();
        await context.close();
        const webm = await video!.path();

        const name = `${scenario.id}.${lang}`;
        await mkdir(path.join(OUT, 'video'), { recursive: true });
        // H.264 + yuv420p — иначе ролик не откроется на iPhone; faststart —
        // чтобы видео начинало играть, не дожидаясь загрузки целиком.
        ffmpeg(['-i', webm, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(OUT, 'video', `${name}.mp4`)]);
        ffmpeg(['-ss', '4', '-i', webm, '-vframes', '1', '-q:v', '3', path.join(OUT, 'video', `${name}.jpg`)]);
        await toWebp(stepsDir);

        const task = (manifest.tasks[scenario.id] ??= { title: scenario.title, sub: scenario.sub, video: {}, steps: {} });
        task.title = scenario.title;
        task.sub = scenario.sub;
        task.video[lang] = `${name}.mp4`;
        task.steps[lang] = director.steps.map((s) => ({ ...s, img: s.img.replace(/\.png$/, '.webp') }));
        // Сразу, а не в конце прогона: упавший на середине прогон иначе
        // оставлял новые кадры при старом описании шагов.
        await saveManifest();
        console.log(`  ✓ ${name}.mp4, кадров: ${director.steps.length}`);
      }
    }
  } finally {
    await browser?.close();
    await prisma.$disconnect();
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
    await rm(tmpAssets, { recursive: true, force: true }).catch(() => {});
  }

  console.log(`Готово: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
