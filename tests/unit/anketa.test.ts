import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { parseAnketa, AnketaError } from '@/server/import/anketa';
import { GROUP_COLUMNS, SHEET, STAFF_COLUMNS, TENANT_FIELDS } from '@/lib/tenant-template';

/**
 * Анкету заполняет заведующая в Excel, а не программа по схеме. Поэтому
 * проверяем именно небрежное заполнение: «да» строчными, число словами рядом,
 * переставленные колонки, пустые строки посреди таблицы.
 */

/** Собирает книгу той же структуры, что и наш шаблон, с указанными значениями. */
async function makeBook(
  fields: Record<string, string>,
  options: {
    groups?: (string | number)[][];
    staff?: (string | number)[][];
    groupHeader?: string[];
  } = {},
): Promise<ArrayBuffer> {
  const book = new ExcelJS.Workbook();

  const tenant = book.addWorksheet(SHEET.tenant);
  tenant.addRow(['Детский сад']);
  tenant.addRow(['key', 'Поле', 'Значение', 'Подсказка']);
  for (const field of TENANT_FIELDS) {
    tenant.addRow([field.key, field.labelRu, fields[field.key] ?? '', field.hintRu]);
  }

  const groups = book.addWorksheet(SHEET.groups);
  groups.addRow(['Группы']);
  groups.addRow(options.groupHeader ?? GROUP_COLUMNS.map((c) => c.labelRu));
  groups.addRow(GROUP_COLUMNS.map((c) => c.hintRu));
  for (const row of options.groups ?? []) groups.addRow(row);

  const staff = book.addWorksheet(SHEET.staff);
  staff.addRow(['Педагоги']);
  staff.addRow(STAFF_COLUMNS.map((c) => c.labelRu));
  staff.addRow(STAFF_COLUMNS.map((c) => c.hintRu));
  for (const row of options.staff ?? []) staff.addRow(row);

  const buffer = await book.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

describe('разбор анкеты сада', () => {
  it('читает поля, приводит списки и числа', async () => {
    const anketa = await parseAnketa(
      await makeBook({
        nameRu: '  Ясли-сад №33 «Нұрсат»  ',
        nameKk: '№33 «Нұрсат» бөбекжайы',
        kind: 'Детский сад',
        isPrivate: 'нет',
        langKk: 'ДА',
        placesTotal: '240 мест',
        phone: '+7 (7132) 00-00-00',
      }),
    );

    expect(anketa.fields.nameRu).toBe('Ясли-сад №33 «Нұрсат»');
    expect(anketa.fields.kind).toBe('KINDERGARTEN');
    expect(anketa.fields.isPrivate).toBe('');
    expect(anketa.fields.langKk).toBe('on');
    expect(anketa.fields.placesTotal).toBe('240');
    expect(anketa.warnings).toHaveLength(0);
  });

  it('не роняет разбор из-за непонятного значения, а предупреждает', async () => {
    const anketa = await parseAnketa(await makeBook({ nameRu: 'Сад', langRu: 'иногда', groupsCount: 'много' }));

    expect(anketa.fields.nameRu).toBe('Сад');
    expect(anketa.fields.langRu).toBeUndefined();
    expect(anketa.warnings).toHaveLength(2);
  });

  it('читает группы, пропускает пустые строки и чинит перебор свободных мест', async () => {
    const anketa = await parseAnketa(
      await makeBook(
        { nameRu: 'Сад' },
        {
          groups: [
            ['Балдырған', 'Балдырған', 24, 36, 'Казахский', 'Ахметова Г.', 25, 40],
            ['', '', '', '', '', '', '', ''],
            ['Болашақ', '', 36, 48, 'Русский', '', 25, 3],
          ],
        },
      ),
    );

    expect(anketa.groups).toHaveLength(2);
    expect(anketa.groups[0]).toMatchObject({ ageFrom: 24, ageTo: 36, language: 'kk', placesFree: 25 });
    // Казахское название не заполнили — подставляется русское, иначе сайт покажет пустоту
    expect(anketa.groups[1]!.nameKk).toBe('Болашақ');
    expect(anketa.groups[1]!.language).toBe('ru');
  });

  it('находит колонки, даже если их переставили местами', async () => {
    const swapped = [...GROUP_COLUMNS.map((c) => c.labelRu)];
    [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];

    const anketa = await parseAnketa(
      await makeBook(
        { nameRu: 'Сад' },
        { groupHeader: swapped, groups: [['Топ қазақша', 'Группа по-русски', 24, 36, 'Казахский', '', 25, 5]] },
      ),
    );

    expect(anketa.groups[0]).toMatchObject({ nameKk: 'Топ қазақша', nameRu: 'Группа по-русски' });
  });

  it('читает педагогов и достраивает недостающий перевод должности', async () => {
    const anketa = await parseAnketa(
      await makeBook(
        { nameRu: 'Сад' },
        { staff: [['Ахметова Гульнара', 'Воспитатель', '', 'Высшее', '', '14 лет', 'Педагог-эксперт']] },
      ),
    );

    expect(anketa.staff).toHaveLength(1);
    expect(anketa.staff[0]).toMatchObject({ positionRu: 'Воспитатель', positionKk: 'Воспитатель', experience: '14 лет' });
  });

  it('отвергает чужой файл понятным сообщением', async () => {
    const book = new ExcelJS.Workbook();
    book.addWorksheet('Отчёт').addRow(['что-то своё']);
    const buffer = (await book.xlsx.writeBuffer()) as ArrayBuffer;

    await expect(parseAnketa(buffer)).rejects.toBeInstanceOf(AnketaError);
  });
});
