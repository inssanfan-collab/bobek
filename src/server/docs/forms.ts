import 'server-only';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { amountInWords } from '@/lib/amount-words';
import { formatDate } from '@/lib/labels';
import { isPlanCode, PLAN_INFO, type PlanCode } from '@/lib/plans';
import type { DocData } from './documents';

/**
 * Счёт и акт в формах, которые бухгалтерия сада узнаёт с первого взгляда.
 *
 * Акт — форма Р-1 (приложение 50 к приказу Министра финансов РК от 20 декабря
 * 2012 года № 562): её требуют и частные, и государственные сады, альбомный
 * лист. Счёт утверждённой формы не имеет — он собран так, как его печатает
 * 1С: сверху «образец платёжного поручения» с реквизитами бенефициара,
 * по которым бухгалтер набивает платёжку, ниже поставщик, покупатель,
 * договор, таблица и сумма прописью.
 *
 * Подписи граф — на двух языках (казахская сверху): один документ, одна
 * подпись, и прочитает его и казахоязычное делопроизводство, и бухгалтер.
 */

const FONTS = path.join(process.cwd(), 'assets', 'fonts');
const INK = '#000000';
const MUTED = '#333333';

type Font = 'regular' | 'bold';

function newDoc(layout: 'portrait' | 'landscape', margin: number) {
  const doc = new PDFDocument({ size: 'A4', layout, margin, bufferPages: true });
  doc.registerFont('regular', path.join(FONTS, 'DejaVuSans.ttf'));
  doc.registerFont('bold', path.join(FONTS, 'DejaVuSans-Bold.ttf'));
  doc.font('regular').fontSize(8).fillColor(INK);
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  const finish = () => new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
  return { doc, finish };
}

/** Деньги как в бухгалтерских формах: «90 000,00». */
function amount(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ' ');
}

function planOf(data: DocData): PlanCode {
  return isPlanCode(data.contract.plan) ? data.contract.plan : 'BASIC';
}

function textHeight(doc: PDFKit.PDFDocument, text: string, width: number, font: Font, size: number): number {
  doc.font(font).fontSize(size);
  return doc.heightOfString(text || ' ', { width });
}

type Cell = { text: string; font?: Font; size?: number; align?: 'left' | 'center' | 'right'; fill?: string };

/**
 * Строка таблицы с рамками. Высота — по самой высокой ячейке; текст
 * по вертикали прижат к верху с отступом, как в бланках.
 */
function row(doc: PDFKit.PDFDocument, x: number, y: number, widths: number[], cells: Cell[], options: { minHeight?: number; pad?: number } = {}): number {
  const pad = options.pad ?? 3;
  const height = Math.max(
    options.minHeight ?? 0,
    ...cells.map((cell, i) => textHeight(doc, cell.text, widths[i]! - pad * 2, cell.font ?? 'regular', cell.size ?? 7.5) + pad * 2),
  );
  let cx = x;
  cells.forEach((cell, i) => {
    const w = widths[i]!;
    if (cell.fill) doc.rect(cx, y, w, height).fillColor(cell.fill).fill();
    doc.rect(cx, y, w, height).lineWidth(0.6).strokeColor(INK).stroke();
    doc.fillColor(INK).font(cell.font ?? 'regular').fontSize(cell.size ?? 7.5);
    doc.text(cell.text, cx + pad, y + pad, { width: w - pad * 2, align: cell.align ?? 'left' });
    cx += w;
  });
  return y + height;
}

/** Подпись графы в две строки: казахская и русская. */
const bi = (kk: string, ru: string) => `${kk}\n${ru}`;

/** Подчёркнутое поле с подписью мелким шрифтом под чертой — как в бланке. */
function field(doc: PDFKit.PDFDocument, x: number, y: number, width: number, value: string, caption: string, options: { size?: number; font?: Font } = {}): number {
  const size = options.size ?? 8;
  const h = textHeight(doc, value, width, options.font ?? 'bold', size);
  doc.fillColor(INK).font(options.font ?? 'bold').fontSize(size).text(value || ' ', x, y, { width });
  const lineY = y + h + 1;
  doc.moveTo(x, lineY).lineTo(x + width, lineY).lineWidth(0.5).strokeColor(INK).stroke();
  doc.fillColor(MUTED).font('regular').fontSize(5.8).text(caption, x, lineY + 1.5, { width, align: 'center' });
  doc.fillColor(INK);
  return lineY + 1.5 + textHeight(doc, caption, width, 'regular', 5.8);
}

// ───────────────────────────── счёт ─────────────────────────────

export async function buildStandardInvoice(data: DocData): Promise<Buffer> {
  const { contract, settings } = data;
  const profile = data.tenant.profile;
  const M = 36;
  const { doc, finish } = newDoc('portrait', M);
  const W = doc.page.width - M * 2;
  let y = M;

  const provider = settings.companyNameRu || settings.companyNameKk || '—';
  const bank = settings.bankNameRu || settings.bankNameKk || '—';

  doc.font('regular').fontSize(7).fillColor(MUTED).text(
    bi('Осы шотты төлеу шарт талаптарымен келісуді білдіреді. Төлем жасалғаны туралы хабарлауды сұраймыз.',
      'Оплата данного счёта означает согласие с условиями договора. Просим уведомить об оплате.'),
    M, y, { width: W, align: 'center' },
  );
  y = doc.y + 8;

  doc.fillColor(INK).font('bold').fontSize(8.5).text(bi('Төлем тапсырмасының үлгісі', 'Образец платёжного поручения'), M, y, { width: W });
  y = doc.y + 3;

  const wide = [W * 0.56, W * 0.3, W * 0.14];
  y = row(doc, M, y, wide, [
    { text: 'Бенефициар:', font: 'bold' },
    { text: 'ИИК', font: 'bold', align: 'center' },
    { text: 'Кбе', font: 'bold', align: 'center' },
  ]);
  y = row(doc, M, y, wide, [
    { text: `${provider}\n${settings.taxId ? `БСН/ЖСН · БИН/ИИН: ${settings.taxId}` : ''}`, font: 'bold', size: 8 },
    { text: settings.iban || '—', font: 'bold', size: 8, align: 'center' },
    { text: settings.kbe || '—', font: 'bold', size: 8, align: 'center' },
  ]);
  y = row(doc, M, y, wide, [
    { text: bi('Бенефициардың банкі:', 'Банк бенефициара:'), font: 'bold' },
    { text: 'БСК / БИК', font: 'bold', align: 'center' },
    { text: bi('ТМК', 'КНП'), font: 'bold', align: 'center' },
  ]);
  // КНП 859 — «оплата прочих услуг»: подписка на сайт под другие коды не подходит.
  y = row(doc, M, y, wide, [
    { text: bank, size: 8 },
    { text: settings.bic || '—', size: 8, align: 'center' },
    { text: '859', size: 8, align: 'center' },
  ]);

  y += 14;
  const issued = contract.issuedAt;
  doc.font('bold').fontSize(12).text(`Төлемге арналған шот № ${contract.number}, ${formatDate(issued, 'kk')}`, M, y, { width: W });
  doc.font('bold').fontSize(12).text(`Счёт на оплату № ${contract.number} от ${formatDate(issued, 'ru')} г.`, M, doc.y + 1, { width: W });
  y = doc.y + 4;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.6).stroke();
  y += 8;

  const labelW = 105;
  const party = (label: string, value: string) => {
    doc.font('regular').fontSize(8).text(label, M, y, { width: labelW });
    const h1 = doc.y;
    doc.font('bold').fontSize(8).text(value, M + labelW, y, { width: W - labelW });
    y = Math.max(h1, doc.y) + 5;
  };
  party(bi('Жеткізуші:', 'Поставщик:'), [
    settings.taxId ? `БИН/ИИН ${settings.taxId}` : '',
    provider,
    settings.addressRu || settings.addressKk,
    settings.phone ? `тел.: ${settings.phone}` : '',
  ].filter(Boolean).join(', '));
  party(bi('Сатып алушы:', 'Покупатель:'), [
    profile?.bin ? `БИН ${profile.bin}` : 'БИН _______________',
    profile?.nameRu || profile?.nameKk || data.tenant.slug,
    profile?.addressRu || profile?.addressKk,
    profile?.phone ? `тел.: ${profile.phone}` : '',
  ].filter(Boolean).join(', '));
  party(bi('Шарт:', 'Договор:'), `№ ${contract.number} от ${formatDate(issued, 'ru')} г. / ${formatDate(issued, 'kk')}`);

  y += 4;
  const plan = planOf(data);
  const period = `${formatDate(contract.periodStart, 'ru')} — ${formatDate(contract.periodEnd, 'ru')}`;
  const cols = [W * 0.05, W * 0.08, W * 0.4, W * 0.08, W * 0.09, W * 0.15, W * 0.15];
  y = row(doc, M, y, cols, [
    { text: '№', font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Коды', 'Код'), font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Атауы', 'Наименование'), font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Саны', 'Кол-во'), font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Өлш. бір.', 'Ед.'), font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Бағасы', 'Цена'), font: 'bold', align: 'center', fill: '#eeeeee' },
    { text: bi('Сомасы', 'Сумма'), font: 'bold', align: 'center', fill: '#eeeeee' },
  ]);
  y = row(doc, M, y, cols, [
    { text: '1', align: 'center' },
    { text: plan === 'MANAGED' ? 'EDU-2' : 'EDU-1', align: 'center' },
    { text: `${PLAN_INFO[plan].serviceName.kk}\n${PLAN_INFO[plan].serviceName.ru}, ${period}` },
    { text: '1', align: 'right' },
    { text: bi('қызмет', 'усл.'), align: 'center' },
    { text: amount(contract.amount), align: 'right' },
    { text: amount(contract.amount), align: 'right' },
  ]);

  y += 5;
  const totals: [string, string][] = [
    [bi('Барлығы:', 'Итого:'), amount(contract.amount)],
    [bi(settings.taxNoteKk || 'ҚҚС-сыз', settings.taxNoteRu || 'Без налога (НДС)'), '—'],
  ];
  for (const [label, value] of totals) {
    doc.font('bold').fontSize(8).text(label, M, y, { width: W * 0.85 - 6, align: 'right' });
    const h = doc.y;
    doc.font('bold').fontSize(8).text(value, M + W * 0.85, y, { width: W * 0.15, align: 'right' });
    y = Math.max(h, doc.y) + 3;
  }

  y += 4;
  doc.font('regular').fontSize(8.5).text(
    `Барлығы 1 атау, ${amount(contract.amount)} KZT сомасына\nВсего наименований 1, на сумму ${amount(contract.amount)} KZT`,
    M, y, { width: W },
  );
  y = doc.y + 3;
  doc.font('bold').fontSize(9).text(`Төлеуге барлығы: ${amountInWords(contract.amount, 'kk')}`, M, y, { width: W });
  doc.font('bold').fontSize(9).text(`Всего к оплате: ${amountInWords(contract.amount, 'ru')}`, M, doc.y + 1, { width: W });
  y = doc.y + 6;
  doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.6).stroke();
  y += 22;

  const signer = settings.signerNameRu || settings.ownerNameRu || '';
  doc.font('bold').fontSize(8.5).text(bi('Орындаушы', 'Исполнитель'), M, y, { width: 90 });
  field(doc, M + 95, y + 8, 140, '', bi('қолы', 'подпись'));
  field(doc, M + 245, y + 8, 180, signer ? `/${signer}/` : ' ', bi('қолтаңбаның толық жазылуы', 'расшифровка подписи'), { font: 'regular' });
  doc.font('regular').fontSize(8).text('М.О. / М.П.', M + 440, y + 8);

  return finish();
}

// ───────────────────────── акт, форма Р-1 ─────────────────────────

export async function buildStandardAct(data: DocData): Promise<Buffer> {
  const { contract, settings } = data;
  const profile = data.tenant.profile;
  const M = 28;
  const { doc, finish } = newDoc('landscape', M);
  const W = doc.page.width - M * 2;
  let y = M;

  // Шапка формы: к какому приказу приложение — справа вверху, на двух языках.
  const headW = 190;
  doc.font('regular').fontSize(6.5).fillColor(INK);
  doc.text('Қазақстан Республикасы Қаржы министрінің 2012 жылғы 20 желтоқсандағы № 562 бұйрығына 50-қосымша', M + W - headW * 2 - 10, y, { width: headW, align: 'right' });
  doc.text('Приложение 50 к приказу Министра финансов Республики Казахстан от 20 декабря 2012 года № 562', M + W - headW, y, { width: headW, align: 'right' });
  y = doc.y + 3;
  doc.font('bold').fontSize(8).text('Р-1 нысаны / Форма Р-1', M + W - headW, y, { width: headW, align: 'right' });
  y = doc.y + 8;

  const labelW = 120;
  const binW = 120;
  const valueW = W - labelW - binW - 10;
  const partyRow = (label: string, value: string, bin: string) => {
    doc.font('regular').fontSize(7.5).text(label, M, y + 1, { width: labelW });
    const bottom = field(doc, M + labelW, y, valueW, value,
      bi('толық атауы, мекенжайы, байланыс құралдары туралы деректер', 'полное наименование, адрес, данные о средствах связи'),
      { size: 7.5 });
    const bx = M + labelW + valueW + 10;
    row(doc, bx, y, [binW], [{ text: bi('ЖСН/БСН', 'ИИН/БИН'), size: 6, align: 'center', fill: '#eeeeee' }]);
    row(doc, bx, y + 18, [binW], [{ text: bin || ' ', font: 'bold', size: 8, align: 'center' }]);
    y = Math.max(bottom, y + 34) + 5;
  };
  partyRow(bi('Тапсырыс беруші', 'Заказчик'),
    [profile?.nameRu || profile?.nameKk || data.tenant.slug, profile?.addressRu || profile?.addressKk, profile?.phone ? `тел.: ${profile.phone}` : ''].filter(Boolean).join(', '),
    profile?.bin ?? '');
  partyRow(bi('Орындаушы', 'Исполнитель'),
    [settings.companyNameRu || settings.companyNameKk, settings.addressRu || settings.addressKk, settings.phone ? `тел.: ${settings.phone}` : ''].filter(Boolean).join(', '),
    settings.taxId);

  const issuedRu = formatDate(contract.issuedAt, 'ru');
  doc.font('regular').fontSize(7.5).text(bi('Шарт (келісімшарт)', 'Договор (контракт)'), M, y + 1, { width: labelW });
  field(doc, M + labelW, y, 220, `№ ${contract.number} от ${issuedRu} г.`, bi('нөмірі, күні', 'номер, дата'), { size: 7.5 });

  // Номер и дата документа — табличкой справа, как в бланке.
  const actDate = contract.periodEnd;
  const numW = [110, 110];
  const nx = M + W - numW[0]! - numW[1]!;
  let ny = row(doc, nx, y, numW, [
    { text: bi('Құжаттың нөмірі', 'Номер документа'), size: 6.5, align: 'center', fill: '#eeeeee' },
    { text: bi('Жасалған күні', 'Дата составления'), size: 6.5, align: 'center', fill: '#eeeeee' },
  ]);
  ny = row(doc, nx, ny, numW, [
    { text: contract.number, font: 'bold', size: 8, align: 'center' },
    { text: actDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }), font: 'bold', size: 8, align: 'center' },
  ]);
  y = ny + 10;

  doc.font('bold').fontSize(10).text('ОРЫНДАЛҒАН ЖҰМЫСТАР (КӨРСЕТІЛГЕН ҚЫЗМЕТТЕР) АКТІСІ*', M, y, { width: W, align: 'center' });
  doc.font('bold').fontSize(10).text('АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)*', M, doc.y + 1, { width: W, align: 'center' });
  y = doc.y + 8;

  // Графы 1–8 формы Р-1; 6–8 объединены шапкой «Выполнено работ (оказано услуг)».
  const c = [34, 236, 100, 150, 56, 56, 75, W - (34 + 236 + 100 + 150 + 56 + 56 + 75)];
  const head = '#eeeeee';
  const top = y;
  const firstFive = c.slice(0, 5);
  const lastThree = c.slice(5);
  const leftW = firstFive.reduce((a, b) => a + b, 0);
  const firstCells: Cell[] = [
    { text: bi('Реттік нөмірі', 'Номер по порядку'), size: 6, align: 'center', fill: head },
    { text: bi('Жұмыстардың (көрсетілетін қызметтердің) атауы (техникалық ерекшелікке, тапсырмаға, жұмыстарды орындау (қызметтерді көрсету) кестесіне сәйкес олардың кіші түрлері бөлінісінде, олар болған кезде)',
      'Наименование работ (услуг) (в разрезе их подвидов в соответствии с технической спецификацией, заданием, графиком выполнения работ (услуг) при их наличии)'), size: 6, align: 'center', fill: head },
    { text: bi('Жұмыстарды орындау (қызметтерді көрсету) күні**', 'Дата выполнения работ (оказания услуг)**'), size: 6, align: 'center', fill: head },
    { text: bi('Ғылыми зерттеулер, маркетингтік, консультациялық және өзге де қызметтер туралы есеп туралы мәліметтер (күні, нөмірі, беттер саны) (олар болған кезде)***',
      'Сведения об отчете о научных исследованиях, маркетинговых, консультационных и прочих услугах (дата, номер, количество страниц) (при их наличии)***'), size: 6, align: 'center', fill: head },
    { text: bi('Өлшем бірлігі', 'Единица измерения'), size: 6, align: 'center', fill: head },
  ];
  // Высота шапки — по самой длинной подписи первых пяти граф; двухъярусная
  // шапка граф 6–8 тянется до неё же.
  const headH = Math.max(...firstCells.map((cell, i) => textHeight(doc, cell.text, firstFive[i]! - 6, 'regular', 6) + 6));
  const endLeft = row(doc, M, top, firstFive, firstCells, { minHeight: headH });
  const mid = row(doc, M + leftW, top, [lastThree.reduce((a, b) => a + b, 0)], [
    { text: bi('Орындалған жұмыстар (көрсетілген қызметтер)', 'Выполнено работ (оказано услуг)'), size: 6, align: 'center', fill: head },
  ]);
  row(doc, M + leftW, mid, lastThree, [
    { text: bi('саны', 'количество'), size: 6, align: 'center', fill: head },
    { text: bi('бірлік үшін бағасы', 'цена за единицу'), size: 6, align: 'center', fill: head },
    { text: bi('құны', 'стоимость'), size: 6, align: 'center', fill: head },
  ], { minHeight: endLeft - mid });
  y = endLeft;
  y = row(doc, M, y, c, c.map((_, i) => ({ text: String(i + 1), size: 6.5, align: 'center' as const })));

  const plan = planOf(data);
  const period = `${formatDate(contract.periodStart, 'ru')} — ${formatDate(contract.periodEnd, 'ru')}`;
  y = row(doc, M, y, c, [
    { text: '1', align: 'center' },
    { text: `${PLAN_INFO[plan].serviceName.kk}\n${PLAN_INFO[plan].serviceName.ru}` },
    { text: period, align: 'center' },
    { text: '—', align: 'center' },
    { text: bi('қызмет', 'услуга'), align: 'center' },
    { text: '1', align: 'center' },
    { text: amount(contract.amount), align: 'right' },
    { text: amount(contract.amount), align: 'right' },
  ]);
  y = row(doc, M, y, c, [
    { text: '' },
    { text: bi('Барлығы', 'Итого'), font: 'bold' },
    { text: 'х', align: 'center' },
    { text: 'х', align: 'center' },
    { text: 'х', align: 'center' },
    { text: '1', align: 'center', font: 'bold' },
    { text: 'х', align: 'center' },
    { text: amount(contract.amount), align: 'right', font: 'bold' },
  ]);

  y += 5;
  doc.font('regular').fontSize(7.5).text(
    `${settings.taxNoteKk || 'ҚҚС-сыз'} / ${settings.taxNoteRu || 'Без НДС'}.  Барлығы: ${amountInWords(contract.amount, 'kk')} / Всего: ${amountInWords(contract.amount, 'ru')}`,
    M, y, { width: W },
  );
  y = doc.y + 6;

  doc.font('regular').fontSize(7.5).text(bi('Тапсырыс берушіден алынған қорларды пайдалану туралы мәліметтер', 'Сведения об использовании запасов, полученных от заказчика'), M, y, { width: 260 });
  field(doc, M + 265, y, W - 265, 'жоқ / нет', bi('атауы, саны, құны', 'наименование, количество, стоимость'), { size: 7.5 });
  y = doc.y + 6;
  doc.font('regular').fontSize(7.5).text(
    bi('Қосымша: ғылыми зерттеулер, маркетингтік, консультациялық және өзге де қызметтер туралы есеп(тер)ді қоса алғанда, құжаттама тізбесі (олар болған кезде міндетті) ____ бетте',
      'Приложение: Перечень документации, в том числе отчет(ы) о маркетинговых, научных исследованиях, консультационных и прочих услугах (обязательны при его (их) наличии) на ____ страниц'),
    M, y, { width: W },
  );
  y = doc.y + 14;

  // Подписи: слева Исполнитель («Сдал»), справа Заказчик («Принял»).
  const half = (W - 30) / 2;
  const signer = settings.signerNameRu || settings.ownerNameRu || '';
  const signerTitle = settings.signerTitleRu || 'Руководитель';
  const head2 = profile?.headNameRu || profile?.headNameKk || '';
  const signBlock = (x: number, label: string, title: string, name: string) => {
    doc.font('bold').fontSize(7.5).text(label, x, y, { width: 95 });
    const fx = x + 100;
    const fw = (half - 100 - 10) / 3;
    field(doc, fx, y, fw, title, bi('лауазымы', 'должность'), { font: 'regular', size: 7 });
    field(doc, fx + fw + 5, y, fw, ' ', bi('қолы', 'подпись'), { size: 7 });
    field(doc, fx + (fw + 5) * 2, y, fw, name, bi('қолтаңбаның толық жазылуы', 'расшифровка подписи'), { font: 'regular', size: 7 });
  };
  signBlock(M, bi('Тапсырды (Орындаушы)', 'Сдал (Исполнитель)'), signerTitle, signer);
  signBlock(M + half + 30, bi('Қабылдады (Тапсырыс беруші)', 'Принял (Заказчик)'), 'Заведующий', head2);
  y += 40;
  doc.font('regular').fontSize(7.5).text('М.О. / М.П.', M + 100, y);
  doc.text(bi('Жұмыстарға (қызметтерге) қол қойылған (қабылданған) күн', 'Дата подписания (принятия) работ (услуг)'), M + half + 30, y, { width: 200 });
  doc.text('«____» ______________ 20___ г.', M + half + 235, y + 4);
  doc.text('М.О. / М.П.', M + half + 130, y + 26);

  // Сноски формы — внизу листа, мелко.
  const notes = [
    '* Құрылыс-монтаждау жұмыстарын қоспағанда, орындалған жұмыстарды (көрсетілген қызметтерді) қабылдау-беру үшін қолданылады. / Применяется для приемки-передачи выполненных работ (оказанных услуг), за исключением строительно-монтажных работ.',
    '** Орындалған жұмыстардың (көрсетілген қызметтердің) күндері әртүрлі кезеңдерге келген жағдайда, сондай-ақ жұмыстарды орындау (қызметтерді көрсету) күндері мен оларға қол қою (қабылдау) күндері әртүрлі болған жағдайда толтырылады. / Заполняется в случае, если даты выполненных работ (оказанных услуг) приходятся на различные периоды, а также в случае, если даты выполнения работ (оказания услуг) и даты подписания (принятия) работ (услуг) различны.',
    '*** Ғылыми зерттеулер, маркетингтік, консультациялық және өзге де қызметтер туралы есеп болған жағдайда толтырылады. / Заполняется в случае наличия отчета о научных исследованиях, маркетинговых, консультационных и прочих услугах.',
  ];
  const notesText = notes.join('\n');
  const notesH = textHeight(doc, notesText, W, 'regular', 5.8);
  const notesY = Math.max(doc.y + 14, doc.page.height - M - notesH);
  doc.fillColor(MUTED).font('regular').fontSize(5.8).text(notesText, M, notesY, { width: W });

  return finish();
}
