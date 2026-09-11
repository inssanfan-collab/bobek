/**
 * Образец заполненной анкеты — его прикладывают к пустой, когда отправляют саду.
 *
 * Заведующая заполняет анкету один раз в жизни, и по пустым клеткам непонятно,
 * что от неё хотят: «режим работы» можно написать десятью способами. Образец
 * снимает половину вопросов ещё до звонка.
 *
 * Запуск: pnpm template:example (сначала pnpm template:xlsx)
 */
import ExcelJS from 'exceljs';
import { resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'public/downloads/bobegim-anketa.xlsx');
const OUT = resolve(process.cwd(), 'public/downloads/bobegim-anketa-obrazec.xlsx');

const VALUES: Record<string, string> = {
  nameRu: 'Ясли-сад №7 «Күншуақ»',
  nameKk: '№7 «Күншуақ» бөбекжайы',
  shortNameRu: 'Күншуақ',
  shortNameKk: 'Күншуақ',
  kind: 'Ясли-сад',
  isPrivate: 'нет',
  bin: '123456789012',
  district: 'Астана',
  addressRu: 'г. Актобе, пр. Абилкайыр хана, 41',
  addressKk: 'Ақтөбе қ., Әбілқайыр хан даңғылы, 41',
  phone: '+7 (7132) 55-11-22',
  email: 'kunshuaq7@mail.kz',
  workHours: 'Пн–Пт, 07:30–18:30',
  headNameRu: 'Ахметова Гульнара Сериккызы',
  headNameKk: 'Ахметова Гүлнара Серікқызы',
  groupsCount: '6',
  placesTotal: '180',
  placesFree: '12',
  langKk: 'Да',
  langRu: 'да',
  aboutRu: 'Сад открылся в 1987 году. Шесть групп, бассейн, логопед и музыкальный зал.',
  aboutKk: 'Балабақша 1987 жылы ашылды. Алты топ, бассейн, логопед және музыка залы бар.',
  whatsapp: '+77010001122',
  instagram: 'https://instagram.com/kunshuaq7',
  adminFullName: 'Сериккызы Айгуль',
  adminPhone: '+7 (777) 123-45-67',
};

const GROUPS = [
  ['Балдырған', 'Балдырған', 24, 36, 'Казахский', 'Ахметова Г., Нурланова А.', 25, 3],
  ['Болашақ', 'Болашақ', 36, 48, 'Казахский', 'Сериккызы А.', 25, 0],
  ['Солнышко', 'Күншуақ', 48, 60, 'Русский', 'Иванова М.', 30, 9],
];

const STAFF = [
  ['Ахметова Гульнара Сериккызы', 'Заведующая', 'Меңгеруші', 'Высшее педагогическое', 'Жоғары педагогикалық', '22 года', 'Педагог-исследователь'],
  ['Нурланова Айгуль Бахытовна', 'Воспитатель', 'Тәрбиеші', 'Высшее педагогическое', 'Жоғары педагогикалық', '14 лет', 'Педагог-эксперт'],
  ['Иванова Мария Петровна', 'Музыкальный руководитель', 'Музыка жетекшісі', 'Среднее специальное', 'Арнаулы орта', '7 лет', 'Педагог-модератор'],
];

async function main() {
  const book = new ExcelJS.Workbook();
  await book.xlsx.readFile(SRC);

  const tenant = book.getWorksheet('Детский сад')!;
  for (let r = 3; r <= tenant.rowCount; r += 1) {
    const row = tenant.getRow(r);
    const key = String(row.getCell(1).value ?? '');
    if (VALUES[key] !== undefined) row.getCell(3).value = VALUES[key];
  }

  const groups = book.getWorksheet('Группы')!;
  GROUPS.forEach((values, index) => {
    const row = groups.getRow(4 + index);
    values.forEach((value, col) => { row.getCell(col + 1).value = value; });
  });

  const staff = book.getWorksheet('Педагоги')!;
  STAFF.forEach((values, index) => {
    const row = staff.getRow(4 + index);
    values.forEach((value, col) => { row.getCell(col + 1).value = value; });
  });

  await book.xlsx.writeFile(OUT);
  console.log('Образец заполнения собран:', OUT);
}

main().catch((error) => { console.error(error); process.exit(1); });
