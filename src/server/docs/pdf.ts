import 'server-only';
import path from 'node:path';
import PDFDocument from 'pdfkit';

/**
 * Печатная основа для договоров, счетов и актов.
 *
 * Документы двуязычные в две колонки: государственный сад ведёт
 * делопроизводство на казахском, а бухгалтерия обычно читает по-русски.
 * Два отдельных файла заставили бы печатать и подписывать оба.
 *
 * Шрифт берём свой, а не системный: в PDF он вшивается целиком, и без
 * этого казахские ә ғ қ ң ұ ү һ і ө превратились бы в квадраты
 * на чужом компьютере. DejaVu выбран потому, что покрывает и казахские
 * буквы, и знак тенге ₸.
 */

const FONTS = path.join(process.cwd(), 'assets', 'fonts');
const REGULAR = path.join(FONTS, 'DejaVuSans.ttf');
const BOLD = path.join(FONTS, 'DejaVuSans-Bold.ttf');

const PAGE_WIDTH = 595.28;
const MARGIN = 40;
const CONTENT = PAGE_WIDTH - MARGIN * 2;
const GAP = 18;
const COLUMN = (CONTENT - GAP) / 2;
const RIGHT_X = MARGIN + COLUMN + GAP;
const BOTTOM = 842 - MARGIN;

export type Pair = { kk: string; ru: string };

export class DocBuilder {
  readonly doc: PDFKit.PDFDocument;
  private readonly chunks: Buffer[] = [];

  constructor() {
    this.doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true });
    this.doc.registerFont('regular', REGULAR);
    this.doc.registerFont('bold', BOLD);
    this.doc.font('regular').fontSize(9);
    this.doc.on('data', (chunk: Buffer) => this.chunks.push(chunk));
  }

  /** Хватит ли места под блок высотой height; иначе новая страница. */
  private ensure(height: number): void {
    if (this.doc.y + height > BOTTOM) this.doc.addPage();
  }

  private heightOf(text: string, width: number, font: 'regular' | 'bold', size: number): number {
    this.doc.font(font).fontSize(size);
    return this.doc.heightOfString(text, { width, align: 'left' });
  }

  /** Заголовок документа: крупно, по центру, на двух языках. */
  title(pair: Pair): this {
    const height = Math.max(
      this.heightOf(pair.kk, COLUMN, 'bold', 12),
      this.heightOf(pair.ru, COLUMN, 'bold', 12),
    );
    this.ensure(height + 10);

    const y = this.doc.y;
    this.doc.font('bold').fontSize(12);
    this.doc.text(pair.kk, MARGIN, y, { width: COLUMN, align: 'center' });
    this.doc.text(pair.ru, RIGHT_X, y, { width: COLUMN, align: 'center' });
    this.doc.y = y + height + 10;
    return this;
  }

  /** Заголовок раздела. */
  heading(pair: Pair): this {
    return this.columns(pair, { font: 'bold', size: 9.5, spacing: 4, keepWithNext: true });
  }

  /** Обычный абзац в две колонки. */
  columns(
    pair: Pair,
    options: { font?: 'regular' | 'bold'; size?: number; spacing?: number; keepWithNext?: boolean } = {},
  ): this {
    const font = options.font ?? 'regular';
    const size = options.size ?? 9;
    const spacing = options.spacing ?? 6;

    const height = Math.max(
      this.heightOf(pair.kk, COLUMN, font, size),
      this.heightOf(pair.ru, COLUMN, font, size),
    );
    // keepWithNext — чтобы заголовок раздела не остался один внизу страницы.
    this.ensure(height + spacing + (options.keepWithNext ? 30 : 0));

    const y = this.doc.y;
    this.doc.font(font).fontSize(size);
    this.doc.text(pair.kk, MARGIN, y, { width: COLUMN, align: 'left' });
    this.doc.text(pair.ru, RIGHT_X, y, { width: COLUMN, align: 'left' });
    this.doc.y = y + height + spacing;
    return this;
  }

  /** Строка во всю ширину — номера, даты, суммы: их переводить незачем. */
  full(
    text: string,
    options: { font?: 'regular' | 'bold'; size?: number; align?: 'left' | 'center' | 'right'; spacing?: number } = {},
  ): this {
    const font = options.font ?? 'regular';
    const size = options.size ?? 9;
    const spacing = options.spacing ?? 6;

    const height = this.heightOf(text, CONTENT, font, size);
    this.ensure(height + spacing);

    this.doc.font(font).fontSize(size);
    this.doc.text(text, MARGIN, this.doc.y, { width: CONTENT, align: options.align ?? 'left' });
    this.doc.y += spacing;
    return this;
  }

  /** Две колонки с произвольным содержимым — реквизиты сторон, подписи. */
  sideBySide(left: string[], right: string[], options: { size?: number } = {}): this {
    const size = options.size ?? 8.5;
    const leftText = left.join('\n');
    const rightText = right.join('\n');
    const height = Math.max(
      this.heightOf(leftText, COLUMN, 'regular', size),
      this.heightOf(rightText, COLUMN, 'regular', size),
    );
    this.ensure(height + 8);

    const y = this.doc.y;
    this.doc.font('regular').fontSize(size);
    this.doc.text(leftText, MARGIN, y, { width: COLUMN });
    this.doc.text(rightText, RIGHT_X, y, { width: COLUMN });
    this.doc.y = y + height + 8;
    return this;
  }

  line(spacing = 8): this {
    this.ensure(spacing * 2);
    const y = this.doc.y + spacing / 2;
    this.doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).lineWidth(0.5).strokeColor('#94a3b8').stroke();
    this.doc.y = y + spacing;
    return this;
  }

  space(height = 10): this {
    this.doc.y += height;
    return this;
  }

  /** Таблица счёта и акта: доли ширины, первая строка — шапка. */
  table(rows: string[][], widths: number[], options: { headerRows?: number } = {}): this {
    const headerRows = options.headerRows ?? 1;
    const columns = widths.map((share) => CONTENT * share);

    rows.forEach((row, index) => {
      const isHeader = index < headerRows;
      const font = isHeader ? 'bold' : 'regular';
      const size = 8.5;

      const height = Math.max(
        ...row.map((cell, i) => this.heightOf(cell, columns[i]! - 8, font, size)),
      ) + 8;
      this.ensure(height);

      const y = this.doc.y;
      if (isHeader) {
        this.doc.rect(MARGIN, y, CONTENT, height).fillColor('#f1f5f9').fill();
      }

      let x = MARGIN;
      this.doc.font(font).fontSize(size).fillColor('#0f172a');
      row.forEach((cell, i) => {
        this.doc.text(cell, x + 4, y + 4, { width: columns[i]! - 8, align: i === 0 ? 'left' : 'right' });
        x += columns[i]!;
      });

      this.doc.rect(MARGIN, y, CONTENT, height).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
      this.doc.y = y + height;
    });

    this.doc.fillColor('#000000');
    return this;
  }

  async finish(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.doc.on('end', () => resolve(Buffer.concat(this.chunks)));
      this.doc.on('error', reject);
      this.doc.end();
    });
  }
}

export const LAYOUT = { PAGE_WIDTH, MARGIN, CONTENT, COLUMN, RIGHT_X, BOTTOM };
