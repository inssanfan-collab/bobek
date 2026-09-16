/**
 * Сумма прописью для счетов и актов.
 *
 * Бухгалтерия сада не примет документ, где сумма только цифрами: так
 * заведено, и спорить бессмысленно. Диапазон — до миллиардов, чего
 * для годовой подписки хватает с большим запасом.
 */

const RU_ONES = [
  '', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
];
const RU_ONES_FEM = [...RU_ONES];
RU_ONES_FEM[1] = 'одна';
RU_ONES_FEM[2] = 'две';

const RU_TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const RU_HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

const KK_ONES = ['', 'бір', 'екі', 'үш', 'төрт', 'бес', 'алты', 'жеті', 'сегіз', 'тоғыз'];
const KK_TENS = ['', 'он', 'жиырма', 'отыз', 'қырық', 'елу', 'алпыс', 'жетпіс', 'сексен', 'тоқсан'];

/** Русский требует согласования: «два миллиона», но «две тысячи». */
function ruGroup(value: number, feminine: boolean): string[] {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds) words.push(RU_HUNDREDS[hundreds]!);
  if (rest >= 20) {
    words.push(RU_TENS[Math.floor(rest / 10)]!);
    const ones = rest % 10;
    if (ones) words.push((feminine ? RU_ONES_FEM : RU_ONES)[ones]!);
  } else if (rest) {
    words.push((feminine ? RU_ONES_FEM : RU_ONES)[rest]!);
  }

  return words;
}

function ruPlural(value: number, forms: [string, string, string]): string {
  const rest100 = value % 100;
  const rest10 = value % 10;
  if (rest100 >= 11 && rest100 <= 14) return forms[2];
  if (rest10 === 1) return forms[0];
  if (rest10 >= 2 && rest10 <= 4) return forms[1];
  return forms[2];
}

function kkGroup(value: number): string[] {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;

  // «жүз» без единицы перед ним: 100 — «жүз», 200 — «екі жүз».
  if (hundreds === 1) words.push('жүз');
  else if (hundreds > 1) words.push(KK_ONES[hundreds]!, 'жүз');

  if (tens) words.push(KK_TENS[tens]!);
  if (ones) words.push(KK_ONES[ones]!);

  return words;
}

function ruWords(amount: number): string {
  if (amount === 0) return 'ноль';

  const parts: string[] = [];
  const billions = Math.floor(amount / 1_000_000_000);
  const millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((amount % 1_000_000) / 1000);
  const rest = amount % 1000;

  if (billions) parts.push(...ruGroup(billions, false), ruPlural(billions, ['миллиард', 'миллиарда', 'миллиардов']));
  if (millions) parts.push(...ruGroup(millions, false), ruPlural(millions, ['миллион', 'миллиона', 'миллионов']));
  if (thousands) parts.push(...ruGroup(thousands, true), ruPlural(thousands, ['тысяча', 'тысячи', 'тысяч']));
  if (rest) parts.push(...ruGroup(rest, false));

  return parts.join(' ');
}

function kkWords(amount: number): string {
  if (amount === 0) return 'нөл';

  const parts: string[] = [];
  const billions = Math.floor(amount / 1_000_000_000);
  const millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((amount % 1_000_000) / 1000);
  const rest = amount % 1000;

  if (billions) parts.push(...kkGroup(billions), 'миллиард');
  if (millions) parts.push(...kkGroup(millions), 'миллион');
  // «мың» без единицы: 1000 — «мың», 2000 — «екі мың».
  if (thousands === 1) parts.push('мың');
  else if (thousands > 1) parts.push(...kkGroup(thousands), 'мың');
  if (rest) parts.push(...kkGroup(rest));

  return parts.join(' ');
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * «50000» → «Пятьдесят тысяч тенге 00 тиын» / «Елу мың теңге 00 тиын».
 * Тиыны в наших документах всегда нулевые, но строку без них бухгалтерия
 * считает неполной.
 */
export function amountInWords(amount: number, locale: 'kk' | 'ru'): string {
  const whole = Math.floor(Math.abs(amount));
  const coins = Math.round((Math.abs(amount) - whole) * 100);
  const coinsText = String(coins).padStart(2, '0');

  return locale === 'kk'
    ? `${capitalize(kkWords(whole))} теңге ${coinsText} тиын`
    : `${capitalize(ruWords(whole))} тенге ${coinsText} тиын`;
}
