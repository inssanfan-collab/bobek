import 'server-only';
import ExcelJS from 'exceljs';
import {
  GROUP_COLUMNS, KIND_OPTIONS, LANG_OPTIONS, NO, SHEET, STAFF_COLUMNS, TENANT_FIELDS, YES,
  type TableColumn,
} from '@/lib/tenant-template';

/**
 * Разбор заполненной анкеты детского сада.
 *
 * Анкету заполняет человек, а не программа, поэтому разбор нарочно
 * снисходительный: лишние пробелы, «да» строчными, число, записанное текстом,
 * перепутанный регистр в выпадающем списке — всё это принимается. Всё, что
 * понять не удалось, не роняет загрузку, а возвращается списком замечаний:
 * отказ «файл не распознан» заставил бы заведующую заполнять анкету заново.
 */

export type AnketaGroup = {
  nameRu: string;
  nameKk: string;
  ageFrom: number | null;
  ageTo: number | null;
  language: string;
  teachers: string | null;
  placesTotal: number | null;
  placesFree: number;
};

export type AnketaStaff = {
  fullName: string;
  positionRu: string;
  positionKk: string;
  educationRu: string | null;
  educationKk: string | null;
  experience: string | null;
  categoryName: string | null;
};

export type Anketa = {
  /** Поля листа «Детский сад» — ключ поля к значению как есть, строкой. */
  fields: Record<string, string>;
  groups: AnketaGroup[];
  staff: AnketaStaff[];
  /** Что не удалось понять. Показывается администратору портала до создания сада. */
  warnings: string[];
};

export class AnketaError extends Error {}

/** Значение ячейки в строку: ExcelJS отдаёт формулы и форматированный текст объектами. */
function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? YES : NO;
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  if (typeof value === 'object') {
    const rich = value as { richText?: { text: string }[]; result?: unknown; text?: string; hyperlink?: string };
    if (Array.isArray(rich.richText)) return rich.richText.map((part) => part.text).join('').trim();
    if (rich.result !== undefined) return cellText(rich.result as ExcelJS.CellValue);
    if (typeof rich.text === 'string') return rich.text.trim();
    if (typeof rich.hyperlink === 'string') return rich.hyperlink.trim();
  }
  return '';
}

function toNumber(raw: string): number | null {
  if (!raw) return null;
  // «12 мест», «12,5», «12 » — берём первое число
  const match = raw.replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function toYesNo(raw: string): boolean | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;
  if (['да', 'иә', 'ия', 'yes', 'true', '+', '1'].includes(text)) return true;
  if (['нет', 'жоқ', 'жок', 'no', 'false', '-', '0'].includes(text)) return false;
  return null;
}

function matchOption(raw: string, options: { label: string; value: string }[]): string | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;
  const byLabel = options.find((o) => o.label.toLowerCase() === text);
  if (byLabel) return byLabel.value;
  const byValue = options.find((o) => o.value.toLowerCase() === text);
  if (byValue) return byValue.value;
  // «детский сад №12» → «детский сад»: заведующая могла дописать к варианту лишнее
  const byPrefix = options.find((o) => text.startsWith(o.label.toLowerCase()));
  return byPrefix?.value ?? null;
}

/** Сопоставляет заголовки таблицы с колонками: порядок мог измениться. */
function headerMap(sheet: ExcelJS.Worksheet, columns: TableColumn[]): Map<number, TableColumn> {
  const map = new Map<number, TableColumn>();
  const header = sheet.getRow(2);

  header.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const text = cellText(cell.value).toLowerCase();
    const column = columns.find((c) => c.labelRu.toLowerCase() === text);
    if (column) map.set(colNumber, column);
  });

  // Заголовки не нашлись — читаем по порядку, как в исходном шаблоне
  if (map.size === 0) columns.forEach((column, index) => map.set(index + 1, column));
  return map;
}

function readTable(sheet: ExcelJS.Worksheet, columns: TableColumn[]): Record<string, string>[] {
  const map = headerMap(sheet, columns);
  const rows: Record<string, string>[] = [];

  // Строка 1 — заголовок листа, 2 — названия колонок, 3 — подсказки
  for (let index = 4; index <= sheet.rowCount; index += 1) {
    const row = sheet.getRow(index);
    const values: Record<string, string> = {};
    let filled = false;

    for (const [colNumber, column] of map) {
      const text = cellText(row.getCell(colNumber).value);
      if (text) filled = true;
      values[column.key] = text;
    }

    if (filled) rows.push(values);
  }
  return rows;
}

export async function parseAnketa(buffer: ArrayBuffer): Promise<Anketa> {
  const book = new ExcelJS.Workbook();
  try {
    await book.xlsx.load(buffer);
  } catch {
    throw new AnketaError('Не удалось прочитать файл. Пришлите анкету в формате .xlsx — тем же файлом, что скачали.');
  }

  const warnings: string[] = [];
  const tenantSheet = book.getWorksheet(SHEET.tenant);
  if (!tenantSheet) {
    throw new AnketaError(`В файле нет листа «${SHEET.tenant}». Похоже, это не наша анкета или её пересохранили частично.`);
  }

  // ── Лист «Детский сад» ──
  const fields: Record<string, string> = {};
  const byKey = new Map(TENANT_FIELDS.map((field) => [field.key, field]));
  let recognised = 0;

  for (let index = 3; index <= tenantSheet.rowCount; index += 1) {
    const row = tenantSheet.getRow(index);
    const key = cellText(row.getCell(1).value);
    const field = byKey.get(key);
    if (!field) continue;

    recognised += 1;
    const raw = cellText(row.getCell(3).value);
    if (!raw) continue;

    if (field.kind === 'yesno') {
      const parsed = toYesNo(raw);
      if (parsed === null) {
        warnings.push(`«${field.labelRu}»: не понял ответ «${raw}» — нужно «${YES}» или «${NO}».`);
        continue;
      }
      fields[key] = parsed ? 'on' : '';
      continue;
    }

    if (field.kind === 'choice' && field.options) {
      const parsed = matchOption(raw, field.options);
      if (!parsed) {
        warnings.push(`«${field.labelRu}»: вариант «${raw}» не из списка.`);
        continue;
      }
      fields[key] = parsed;
      continue;
    }

    if (field.kind === 'number') {
      const parsed = toNumber(raw);
      if (parsed === null) {
        warnings.push(`«${field.labelRu}»: «${raw}» — не число.`);
        continue;
      }
      fields[key] = String(parsed);
      continue;
    }

    fields[key] = raw;
  }

  if (recognised === 0) {
    throw new AnketaError(
      'Лист «Детский сад» не похож на нашу анкету: не нашлось ни одного известного поля. Скачайте пустую анкету заново и перенесите данные в неё.',
    );
  }

  // ── Группы ──
  const groups: AnketaGroup[] = [];
  const groupSheet = book.getWorksheet(SHEET.groups);
  if (groupSheet) {
    for (const [index, raw] of readTable(groupSheet, GROUP_COLUMNS).entries()) {
      const nameRu = raw.nameRu ?? '';
      const nameKk = raw.nameKk ?? '';
      if (!nameRu && !nameKk) {
        warnings.push(`Группы, строка ${index + 1}: нет названия — строка пропущена.`);
        continue;
      }

      const language = raw.language ? matchOption(raw.language, LANG_OPTIONS) : null;
      if (raw.language && !language) {
        warnings.push(`Группа «${nameRu || nameKk}»: язык «${raw.language}» не из списка, поставили казахский.`);
      }

      const placesTotal = toNumber(raw.placesTotal ?? '');
      const placesFree = toNumber(raw.placesFree ?? '') ?? 0;

      groups.push({
        nameRu: nameRu || nameKk,
        nameKk: nameKk || nameRu,
        ageFrom: toNumber(raw.ageFrom ?? ''),
        ageTo: toNumber(raw.ageTo ?? ''),
        language: language ?? 'kk',
        teachers: raw.teachers || null,
        placesTotal,
        // Свободных не может быть больше, чем всего: иначе на сайте получится бессмыслица
        placesFree: placesTotal !== null && placesFree > placesTotal ? placesTotal : Math.max(0, placesFree),
      });
    }
  }

  // ── Педагоги ──
  const staff: AnketaStaff[] = [];
  const staffSheet = book.getWorksheet(SHEET.staff);
  if (staffSheet) {
    for (const [index, raw] of readTable(staffSheet, STAFF_COLUMNS).entries()) {
      const fullName = raw.fullName ?? '';
      if (!fullName) {
        warnings.push(`Педагоги, строка ${index + 1}: нет ФИО — строка пропущена.`);
        continue;
      }

      const positionRu = raw.positionRu || raw.positionKk || 'Педагог';
      staff.push({
        fullName,
        positionRu,
        positionKk: raw.positionKk || positionRu,
        educationRu: raw.educationRu || null,
        educationKk: raw.educationKk || raw.educationRu || null,
        experience: raw.experience || null,
        categoryName: raw.categoryName || null,
      });
    }
  }

  return { fields, groups, staff, warnings };
}

/** Подпись типа организации для проверки глазами перед созданием. */
export function kindLabel(value: string | undefined): string {
  return KIND_OPTIONS.find((o) => o.value === value)?.label ?? '—';
}
