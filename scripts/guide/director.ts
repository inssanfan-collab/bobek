/**
 * «Режиссёр» инструкции: ведёт настоящий браузер по админке так, чтобы это
 * можно было смотреть. Перед каждым действием — подпись, курсор плавно
 * едет к цели, щелчок подсвечивается, текст печатается по буквам.
 *
 * Заодно снимает кадры для анимированной страницы: снимок экрана до действия
 * (без курсора и подписи) и прямоугольник цели. Видео и кадры получаются из
 * одного прогона, поэтому не расходятся между собой.
 */
import type { Locator, Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { gotoRetry } from './demo';

export type Lang = 'kk' | 'ru';
export type Text = { kk: string; ru: string };

export type Step = {
  /** Файл снимка относительно папки шагов задачи. */
  img: string;
  caption: string;
  /** Цель на снимке, в пикселях окна 1280×800. Нет — просто смотрим на экран. */
  box: { x: number; y: number; width: number; height: number } | null;
  action: 'click' | 'type' | 'upload' | 'look';
};

const MOVE_MS = 750;

export class Director {
  readonly steps: Step[] = [];
  private shot = 0;

  constructor(
    readonly page: Page,
    readonly lang: Lang,
    /** Папка кадров задачи; null — кадры не нужны. */
    private readonly stepsDir: string | null,
    readonly base: string,
  ) {}

  t(text: Text): string {
    return text[this.lang];
  }

  /** Сколько держать подпись: чтобы успели прочитать, но не заскучали. */
  private readMs(caption: string): number {
    return Math.min(4200, Math.max(1600, caption.length * 42));
  }

  async goto(path: string) {
    const url = path.startsWith('http') ? path : `${this.base}${path}`;
    await gotoRetry(this.page, url);
    await this.page.waitForTimeout(500);
  }

  async caption(text: Text | null) {
    await this.page.evaluate((html) => window.__guide?.caption(html), text ? this.t(text) : null);
  }

  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /** Кадр для анимированной страницы: без нашего слоя поверх. */
  private async snap(caption: string, box: Step['box'], action: Step['action']) {
    if (!this.stepsDir) return;
    const img = `${String(++this.shot).padStart(2, '0')}.png`;
    const path = `${this.stepsDir}/${img}`;
    await mkdir(dirname(path), { recursive: true });
    await this.page.waitForLoadState('networkidle');
    await this.page.evaluate(() => window.__guide?.hide(true));
    await this.page.screenshot({ path });
    await this.page.evaluate(() => window.__guide?.hide(false));
    this.steps.push({ img, caption, box, action });
  }

  private async aim(target: Locator) {
    await target.scrollIntoViewIfNeeded();
    await target.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    await this.page.waitForTimeout(650);
    const box = await target.boundingBox();
    if (!box) throw new Error('цель не видна на экране');
    return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
  }

  private async moveTo(box: NonNullable<Step['box']>) {
    const x = box.x + Math.min(box.width / 2, 60);
    const y = box.y + box.height / 2;
    await this.page.evaluate(([cx, cy, ms]) => window.__guide?.moveTo(cx, cy, ms), [x, y, MOVE_MS] as const);
  }

  /** Подсветить место и объяснить, ничего не нажимая. */
  async look(target: Locator, text: Text) {
    const caption = this.t(text);
    const box = await this.aim(target);
    await this.snap(caption, box, 'look');
    await this.caption(text);
    await this.moveTo(box);
    await this.page.evaluate((r) => window.__guide?.frame(r), box);
    await this.wait(this.readMs(caption));
    await this.page.evaluate(() => window.__guide?.frame(null));
  }

  /** Просто экран с подписью: итог, пояснение. */
  async show(text: Text) {
    const caption = this.t(text);
    await this.snap(caption, null, 'look');
    await this.caption(text);
    await this.wait(this.readMs(caption));
  }

  async click(target: Locator, text: Text, opts: { navigates?: boolean } = {}) {
    const caption = this.t(text);
    const box = await this.aim(target);
    await this.snap(caption, box, 'click');
    await this.caption(text);
    await this.moveTo(box);
    await this.wait(Math.max(500, this.readMs(caption) - MOVE_MS - 400));
    await this.page.evaluate(() => window.__guide?.click());
    await this.wait(180);
    const before = this.page.url();
    await target.click();
    if (opts.navigates) {
      // Формы админки переходят дальше сами, уже после ответа сервера
      // (window.location.assign) — ждём смены адреса, а не только тишины в сети.
      await this.page.waitForURL((url) => url.href !== before, { timeout: 15_000 }).catch(() => {});
      // Настоящая мышь осталась там, где была кнопка, и на новой странице
      // подсвечивала случайный пункт меню — уводим её в угол.
      const size = this.page.viewportSize();
      if (size) await this.page.mouse.move(size.width - 2, size.height - 2);
    }
    await this.page.waitForLoadState('networkidle');
    await this.wait(700);
  }

  /** Щелчок в поле и печать по буквам. Длинный текст — первые слова вручную, остальное сразу. */
  async type(target: Locator, value: string, text: Text) {
    const caption = this.t(text);
    const box = await this.aim(target);
    await this.snap(caption, box, 'type');
    await this.caption(text);
    await this.moveTo(box);
    await this.page.evaluate(() => window.__guide?.click());
    await target.click();
    // Прежний текст заменяем, а не дописываем к нему (у демо-сада поля заполнены).
    await this.page.keyboard.press('Control+A');
    const typed = value.length > 70 ? value.slice(0, 55) : value;
    await this.page.keyboard.type(typed, { delay: 45 });
    if (typed.length < value.length) await this.page.keyboard.insertText(value.slice(typed.length));
    await this.wait(900);
  }

  /** Выбор из списка или дата: курсор к полю, значение ставится сразу. */
  async set(target: Locator, value: string, text: Text) {
    const caption = this.t(text);
    const box = await this.aim(target);
    await this.snap(caption, box, 'click');
    await this.caption(text);
    await this.moveTo(box);
    await this.wait(500);
    await this.page.evaluate(() => window.__guide?.click());
    const tag = await target.evaluate((el) => el.tagName);
    if (tag === 'SELECT') await target.selectOption(value);
    else await target.fill(value);
    await this.wait(Math.max(900, this.readMs(caption) - MOVE_MS - 500));
  }

  /** Выбор файлов: показываем поле, файлы подставляем без системного окна. */
  async upload(target: Locator, files: string[], text: Text) {
    const caption = this.t(text);
    // Само поле спрятано (FileInput), целимся в его видимую обёртку с кнопкой.
    const wrapper = target.locator('xpath=ancestor::*[@data-file-field][1]');
    const box = await this.aim((await wrapper.count()) ? wrapper : target);
    await this.snap(caption, box, 'upload');
    await this.caption(text);
    await this.moveTo(box);
    await this.wait(600);
    await this.page.evaluate(() => window.__guide?.click());
    await target.setInputFiles(files);
    await this.wait(Math.max(900, this.readMs(caption) - MOVE_MS - 600));
  }
}

declare global {
  interface Window {
    __guide?: {
      moveTo(x: number, y: number, ms: number): Promise<void>;
      click(): void;
      caption(html: string | null): void;
      frame(r: { x: number; y: number; width: number; height: number } | null): void;
      hide(on: boolean): void;
    };
  }
}
