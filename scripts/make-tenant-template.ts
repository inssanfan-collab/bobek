/**
 * Собирает анкету детского сада в .xlsx — файл, который сад скачивает,
 * заполняет и присылает вместе с заявкой.
 *
 * Запуск: pnpm template:xlsx
 *
 * Анкету заполняет заведующая, а не программист, поэтому подписи и подсказки
 * стоят рядом с полем, а не в отдельной инструкции: до неё не доходят.
 * Технические ключи спрятаны в первом столбце — по ним анкета опознаётся
 * при загрузке, даже если подписи кто-то поправил.
 */
import ExcelJS from 'exceljs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  GROUP_COLUMNS, GROUP_ROWS, KIND_OPTIONS, LANG_OPTIONS, NO, SHEET,
  STAFF_COLUMNS, STAFF_ROWS, TENANT_FIELDS, YES,
  type TableColumn,
} from '../src/lib/tenant-template';

const OUT = resolve(process.cwd(), 'public/downloads/bobegim-anketa.xlsx');

const INK = 'FF1F2937';
const BRAND = 'FF0E8F7E';
const BRAND_SOFT = 'FFE3F3F0';
const PAPER = 'FFF7FAF9';
const MUTED = 'FF6B7280';
const NEEDED = 'FFFFF8E1';

function titleRow(sheet: ExcelJS.Worksheet, text: string, span: string) {
  const row = sheet.addRow([text]);
  sheet.mergeCells(`${span}${row.number}`);
  row.height = 30;
  row.getCell(1).font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } };
  row.getCell(1).alignment = { vertical: 'middle', indent: 1 };
  return row;
}

function buildGuide(book: ExcelJS.Workbook) {
  const sheet = book.addWorksheet(SHEET.guide, { properties: { defaultRowHeight: 18 } });
  sheet.getColumn(1).width = 4;
  sheet.getColumn(2).width = 104;
  sheet.views = [{ showGridLines: false }];

  const lines: [string, string][] = [
    ['h', 'Анкета детского сада'],
    ['p', 'Заполните эту анкету — и сайт вашего сада откроется уже с вашими данными: названием, телефоном, режимом работы, группами и педагогами. Ничего перепечатывать вручную не придётся.'],
    ['h2', 'Как заполнять'],
    ['li', 'Внизу окна — четыре листа. Заполните «Детский сад», затем «Группы» и «Педагоги».'],
    ['li', 'Вписывайте только в столбец «Значение» (он подсвечен). Подписи полей менять не нужно — по ним мы узнаём анкету.'],
    ['li', 'Поля со звёздочкой * обязательны. Остальное можно оставить пустым и добавить позже самим на сайте.'],
    ['li', 'Где есть стрелка выпадающего списка — выбирайте из списка, а не вписывайте свой вариант.'],
    ['li', 'Пустые строки в «Группах» и «Педагогах» оставляйте как есть — лишние мы пропустим.'],
    ['h2', 'Про два языка'],
    ['p', 'Сайт сада работает на казахском и русском — этого требует закон «О языках». Где просят текст на двух языках, заполните оба: если перевода не будет, посетитель увидит второй язык вместо родного.'],
    ['h2', 'Чего в анкете нет'],
    ['p', 'Фотографии, логотип, документы и новости через анкету не передаются — их вы загрузите сами в админке сада, это занимает пару минут. В инструкции показано, как.'],
    ['h2', 'Что дальше'],
    ['li', 'Пришлите заполненный файл вместе с заявкой на подключение.'],
    ['li', 'Мы создадим сайт и вышлем адрес, логин и пароль.'],
    ['li', 'Вы войдёте, смените пароль и добавите фотографии.'],
    ['p', 'Вопросы по заполнению — задайте тому, кто прислал вам эту анкету.'],
  ];

  sheet.addRow([]);
  for (const [kind, text] of lines) {
    const row = sheet.addRow(['', kind === 'li' ? `•   ${text}` : text]);
    const cell = row.getCell(2);
    cell.alignment = { wrapText: true, vertical: 'top' };

    if (kind === 'h') {
      cell.font = { name: 'Calibri', size: 20, bold: true, color: { argb: BRAND } };
      row.height = 32;
    } else if (kind === 'h2') {
      cell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: INK } };
      row.height = 30;
    } else {
      cell.font = { name: 'Calibri', size: 11, color: { argb: INK } };
      row.height = kind === 'p' ? 46 : 22;
    }
  }
  return sheet;
}

function buildTenantSheet(book: ExcelJS.Workbook) {
  const sheet = book.addWorksheet(SHEET.tenant, { properties: { defaultRowHeight: 20 } });
  sheet.views = [{ showGridLines: false, state: 'frozen', ySplit: 3 }];

  sheet.getColumn(1).width = 14;
  sheet.getColumn(1).hidden = true; // технические ключи
  sheet.getColumn(2).width = 40;
  sheet.getColumn(3).width = 46;
  sheet.getColumn(4).width = 62;

  titleRow(sheet, '  Детский сад — основные сведения', 'B:D');

  const head = sheet.addRow(['key', 'Поле', 'Значение', 'Подсказка']);
  head.height = 24;
  for (const col of [2, 3, 4]) {
    const cell = head.getCell(col);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_SOFT } };
    cell.alignment = { vertical: 'middle', indent: 1 };
  }

  for (const field of TENANT_FIELDS) {
    const row = sheet.addRow([field.key, `${field.labelRu}${field.required ? ' *' : ''}`, '', field.hintRu]);
    row.height = field.kind === 'longText' ? 64 : 24;

    const label = row.getCell(2);
    label.font = { name: 'Calibri', size: 11, bold: Boolean(field.required), color: { argb: INK } };
    label.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
    label.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PAPER } };

    const value = row.getCell(3);
    value.alignment = { vertical: 'middle', wrapText: field.kind === 'longText', indent: 1 };
    value.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: field.required ? NEEDED : 'FFFFFFFF' } };
    value.border = {
      top: { style: 'thin', color: { argb: 'FFD9E2E0' } },
      left: { style: 'thin', color: { argb: 'FFD9E2E0' } },
      bottom: { style: 'thin', color: { argb: 'FFD9E2E0' } },
      right: { style: 'thin', color: { argb: 'FFD9E2E0' } },
    };
    if (field.kind === 'number') value.numFmt = '0';

    const hint = row.getCell(4);
    hint.font = { name: 'Calibri', size: 10, color: { argb: MUTED }, italic: true };
    hint.alignment = { vertical: 'middle', wrapText: true, indent: 1 };

    if (field.kind === 'yesno') {
      value.dataValidation = {
        type: 'list', allowBlank: true, formulae: [`"${YES},${NO}"`],
        showErrorMessage: true, errorTitle: 'Выберите из списка', error: `Допустимо «${YES}» или «${NO}».`,
      };
    }
    if (field.kind === 'choice' && field.options) {
      value.dataValidation = {
        type: 'list', allowBlank: true,
        formulae: [`"${field.options.map((o) => o.label).join(',')}"`],
        showErrorMessage: true, errorTitle: 'Выберите из списка', error: 'Выберите один из предложенных вариантов.',
      };
    }
  }

  return sheet;
}

function buildTable(
  book: ExcelJS.Workbook,
  name: string,
  caption: string,
  columns: TableColumn[],
  rows: number,
) {
  const sheet = book.addWorksheet(name, { properties: { defaultRowHeight: 20 } });
  sheet.views = [{ showGridLines: false, state: 'frozen', ySplit: 3 }];
  columns.forEach((col, index) => { sheet.getColumn(index + 1).width = col.width; });

  const lastCol = String.fromCharCode(64 + columns.length);
  titleRow(sheet, `  ${caption}`, `A:${lastCol}`);

  const head = sheet.addRow(columns.map((c) => c.labelRu));
  head.height = 26;
  head.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_SOFT } };
    cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
  });

  const hints = sheet.addRow(columns.map((c) => c.hintRu));
  hints.height = 22;
  hints.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 9, color: { argb: MUTED }, italic: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PAPER } };
    cell.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
  });

  for (let i = 0; i < rows; i += 1) {
    const row = sheet.addRow(columns.map(() => ''));
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const column = columns[colNumber - 1];
      cell.alignment = { vertical: 'middle', indent: 1 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE6ECEB' } },
        left: { style: 'thin', color: { argb: 'FFE6ECEB' } },
        bottom: { style: 'thin', color: { argb: 'FFE6ECEB' } },
        right: { style: 'thin', color: { argb: 'FFE6ECEB' } },
      };
      if (column?.kind === 'number') cell.numFmt = '0';
      if (column?.kind === 'choice' && column.options) {
        cell.dataValidation = {
          type: 'list', allowBlank: true,
          formulae: [`"${column.options.map((o) => o.label).join(',')}"`],
          showErrorMessage: true, errorTitle: 'Выберите из списка', error: 'Выберите один из предложенных вариантов.',
        };
      }
    });
  }

  return sheet;
}

async function main() {
  const book = new ExcelJS.Workbook();
  book.creator = 'Bobegim';
  book.created = new Date();

  buildGuide(book);
  buildTenantSheet(book);
  buildTable(book, SHEET.groups, 'Группы детского сада', GROUP_COLUMNS, GROUP_ROWS);
  buildTable(book, SHEET.staff, 'Педагогический состав', STAFF_COLUMNS, STAFF_ROWS);

  // Лист со списками нужен только как памятка: сами выпадающие списки
  // вписаны в ячейки, чтобы анкета не ломалась при копировании листа.
  const lists = book.addWorksheet(SHEET.lists);
  lists.state = 'hidden';
  lists.addRow(['Типы организаций', 'Языки обучения']);
  const maxLen = Math.max(KIND_OPTIONS.length, LANG_OPTIONS.length);
  for (let i = 0; i < maxLen; i += 1) {
    lists.addRow([KIND_OPTIONS[i]?.label ?? '', LANG_OPTIONS[i]?.label ?? '']);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await book.xlsx.writeFile(OUT);
  console.log(`Анкета собрана: ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
