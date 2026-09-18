/**
 * Как обратиться к человеку в приветствии админки.
 *
 * В поле «ФИО» в Казахстане почти всегда пишут фамилию первой
 * («Кудайбергенов Асет Амангалиевич»), но бывает и «Асет Кудайбергенов».
 * Поэтому не берём слепо первое слово — иначе заведующую приветствовали бы
 * по фамилии, — а узнаём фамилию и отчество по окончаниям.
 *
 * Русское отчество (-вич, -вна) — обращаемся по имени и отчеству, как
 * принято. Казахское (-ұлы, -қызы) в обращении не используют — только имя.
 */

const SURNAME_ENDINGS = [
  'ов', 'ова', 'ев', 'ева', 'ёв', 'ёва', 'ин', 'ина', 'ын', 'ына',
  'ский', 'ская', 'цкий', 'цкая', 'ко', 'ук', 'юк', 'енко',
  'баев', 'баева', 'бек', 'бекова', 'улы', 'ұлы', 'кызы', 'қызы',
];
const RUSSIAN_PATRONYMIC = /(вич|вна|ична|ьич)$/i;

function looksLikeSurname(word: string): boolean {
  const lower = word.toLowerCase();
  return SURNAME_ENDINGS.some((ending) => lower.length > ending.length + 1 && lower.endsWith(ending));
}

export function greetingName(fullName: string | null | undefined): string {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0]!;

  // «Фамилия Имя [Отчество]» — самый частый порядок.
  const [first, second, third] = words as [string, string, string | undefined];
  if (looksLikeSurname(first) && !looksLikeSurname(second)) {
    return third && RUSSIAN_PATRONYMIC.test(third) ? `${second} ${third}` : second;
  }
  // «Имя Отчество Фамилия» или «Имя Фамилия».
  return second && RUSSIAN_PATRONYMIC.test(second) ? `${first} ${second}` : first;
}
