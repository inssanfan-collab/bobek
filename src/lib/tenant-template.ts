/**
 * Описание анкеты детского сада — один источник для генератора файла и для
 * разбора заполненного. Если поля описать дважды, они разъедутся при первой же
 * правке, и сад получит «не распознали анкету» без объяснения причины.
 *
 * Ключ в первом (скрытом) столбце листа — то, по чему поле опознаётся при
 * загрузке. Подпись заведующая может случайно поправить, ключ — нет.
 */

export type FieldKind = 'text' | 'longText' | 'number' | 'yesno' | 'choice';

export type TemplateField = {
  key: string;
  labelRu: string;
  hintRu: string;
  kind: FieldKind;
  required?: boolean;
  /** Варианты для выпадающего списка: показываемая подпись → значение в базе. */
  options?: { label: string; value: string }[];
};

export const YES = 'Да';
export const NO = 'Нет';

export const KIND_OPTIONS = [
  { label: 'Ясли-сад', value: 'NURSERY_GARDEN' },
  { label: 'Детский сад', value: 'KINDERGARTEN' },
  { label: 'Мини-центр', value: 'MINI_CENTER' },
  { label: 'Частный сад', value: 'PRIVATE' },
  { label: 'Семейный ясли-сад', value: 'FAMILY' },
];

export const LANG_OPTIONS = [
  { label: 'Казахский', value: 'kk' },
  { label: 'Русский', value: 'ru' },
  { label: 'Смешанная', value: 'mixed' },
];

/** Лист «Детский сад»: поля в том порядке, в каком их удобно заполнять. */
export const TENANT_FIELDS: TemplateField[] = [
  {
    key: 'nameRu', labelRu: 'Полное название по-русски', kind: 'text', required: true,
    hintRu: 'Как в уставе: ГККП «Ясли-сад №33 Нұрсат»',
  },
  {
    key: 'nameKk', labelRu: 'Толық атауы қазақша', kind: 'text', required: true,
    hintRu: 'Название по-казахски. Без него сайт покажет русское.',
  },
  {
    key: 'shortNameRu', labelRu: 'Короткое название по-русски', kind: 'text',
    hintRu: 'Как сад называют в разговоре: «Нұрсат». Показывается в шапке сайта.',
  },
  { key: 'shortNameKk', labelRu: 'Қысқаша атауы қазақша', kind: 'text', hintRu: 'Короткое название по-казахски.' },
  {
    key: 'kind', labelRu: 'Тип организации', kind: 'choice', required: true, options: KIND_OPTIONS,
    hintRu: 'Выберите из списка.',
  },
  { key: 'isPrivate', labelRu: 'Частный сад', kind: 'yesno', hintRu: 'Да — если сад негосударственный.' },
  { key: 'bin', labelRu: 'БИН организации', kind: 'text', hintRu: '12 цифр. Нужен для договора.' },
  { key: 'licenseNo', labelRu: 'Номер лицензии', kind: 'text', hintRu: 'Если лицензия есть.' },

  {
    key: 'district', labelRu: 'Район города', kind: 'text',
    hintRu: 'Например: Астана. По району родители фильтруют сады в каталоге.',
  },
  {
    key: 'addressRu', labelRu: 'Адрес по-русски', kind: 'text', required: true,
    hintRu: 'Улица и дом: г. Актобе, пр. Санкибай батыра, 74',
  },
  { key: 'addressKk', labelRu: 'Мекенжайы қазақша', kind: 'text', hintRu: 'Адрес по-казахски.' },
  {
    key: 'phone', labelRu: 'Телефон', kind: 'text', required: true,
    hintRu: 'В формате +7 (7132) 00-00-00. Этот номер увидят родители.',
  },
  { key: 'phoneExtra', labelRu: 'Дополнительный телефон', kind: 'text', hintRu: 'Мобильный заведующей или второй номер.' },
  { key: 'email', labelRu: 'Электронная почта', kind: 'text', hintRu: 'Рабочая почта сада.' },
  {
    key: 'workHours', labelRu: 'Режим работы', kind: 'text',
    hintRu: 'Пн–Пт, 07:30–18:30',
  },
  { key: 'headNameRu', labelRu: 'ФИО заведующей по-русски', kind: 'text', hintRu: 'Полностью: Ахметова Гульнара Серикқызы' },
  { key: 'headNameKk', labelRu: 'Меңгерушінің аты-жөні қазақша', kind: 'text', hintRu: 'ФИО заведующей по-казахски.' },

  { key: 'groupsCount', labelRu: 'Количество групп', kind: 'number', hintRu: 'Сколько групп работает в саду.' },
  { key: 'placesTotal', labelRu: 'Всего мест', kind: 'number', hintRu: 'Проектная мощность сада.' },
  {
    key: 'placesFree', labelRu: 'Свободных мест сейчас', kind: 'number',
    hintRu: 'Это число вы потом меняете сами в админке — родители смотрят его чаще всего.',
  },
  { key: 'langKk', labelRu: 'Обучение на казахском', kind: 'yesno', hintRu: 'Есть ли казахские группы.' },
  { key: 'langRu', labelRu: 'Обучение на русском', kind: 'yesno', hintRu: 'Есть ли русские группы.' },

  {
    key: 'aboutRu', labelRu: 'О саде — текст по-русски', kind: 'longText',
    hintRu: 'Пять–десять предложений: когда открылся, чем живёт, чем гордится. Это первое, что читают родители.',
  },
  { key: 'aboutKk', labelRu: 'Балабақша туралы — қазақша мәтін', kind: 'longText', hintRu: 'Тот же текст по-казахски.' },

  { key: 'whatsapp', labelRu: 'WhatsApp', kind: 'text', hintRu: 'Номер для связи: +77010000000' },
  { key: 'instagram', labelRu: 'Instagram', kind: 'text', hintRu: 'Ссылка на страницу сада.' },
  { key: 'youtube', labelRu: 'YouTube', kind: 'text', hintRu: 'Ссылка на канал, если есть.' },
  { key: 'facebook', labelRu: 'Facebook', kind: 'text', hintRu: 'Ссылка на страницу, если есть.' },
  { key: 'telegram', labelRu: 'Telegram', kind: 'text', hintRu: 'Ссылка или имя канала, если есть.' },

  {
    key: 'slug', labelRu: 'Желаемый адрес сайта', kind: 'text',
    hintRu: 'Только латиница и дефис: nursat33. Получится nursat33.vsesad.kz. Если не знаете — оставьте пустым.',
  },
  {
    key: 'adminFullName', labelRu: 'ФИО ответственного за сайт', kind: 'text', required: true,
    hintRu: 'Кто будет вести сайт: заведующая, методист или делопроизводитель.',
  },
  {
    key: 'adminLogin', labelRu: 'Желаемый логин для входа', kind: 'text',
    hintRu: 'Латиница: nursat-admin. Если не знаете — оставьте пустым, подберём сами.',
  },
  { key: 'adminPhone', labelRu: 'Телефон ответственного', kind: 'text', hintRu: 'На него позвоним, если что-то не так с сайтом.' },
];

export type TableColumn = {
  key: string;
  labelRu: string;
  hintRu: string;
  kind: FieldKind;
  width: number;
  options?: { label: string; value: string }[];
};

/** Лист «Группы». */
export const GROUP_COLUMNS: TableColumn[] = [
  { key: 'nameRu', labelRu: 'Название группы (рус.)', hintRu: 'Например: «Балдырған»', kind: 'text', width: 26 },
  { key: 'nameKk', labelRu: 'Топ атауы (қаз.)', hintRu: 'Название по-казахски', kind: 'text', width: 26 },
  { key: 'ageFrom', labelRu: 'Возраст с, месяцев', hintRu: '1 год = 12, 2 года = 24, 3 года = 36', kind: 'number', width: 18 },
  { key: 'ageTo', labelRu: 'Возраст до, месяцев', hintRu: '5 лет = 60, 6 лет = 72', kind: 'number', width: 18 },
  { key: 'language', labelRu: 'Язык обучения', hintRu: 'Выберите из списка', kind: 'choice', width: 18, options: LANG_OPTIONS },
  { key: 'teachers', labelRu: 'Воспитатели', hintRu: 'Через запятую', kind: 'text', width: 34 },
  { key: 'placesTotal', labelRu: 'Всего мест', hintRu: 'Сколько детей в группе', kind: 'number', width: 14 },
  { key: 'placesFree', labelRu: 'Свободно мест', hintRu: 'Ноль, если мест нет', kind: 'number', width: 16 },
];

/** Лист «Педагоги». */
export const STAFF_COLUMNS: TableColumn[] = [
  { key: 'fullName', labelRu: 'ФИО полностью', hintRu: 'Ахметова Гульнара Серикқызы', kind: 'text', width: 32 },
  { key: 'positionRu', labelRu: 'Должность (рус.)', hintRu: 'Воспитатель, методист, музыкальный руководитель', kind: 'text', width: 28 },
  { key: 'positionKk', labelRu: 'Лауазымы (қаз.)', hintRu: 'Должность по-казахски', kind: 'text', width: 28 },
  { key: 'educationRu', labelRu: 'Образование (рус.)', hintRu: 'Высшее педагогическое', kind: 'text', width: 28 },
  { key: 'educationKk', labelRu: 'Білімі (қаз.)', hintRu: 'Образование по-казахски', kind: 'text', width: 28 },
  { key: 'experience', labelRu: 'Стаж', hintRu: '14 лет', kind: 'text', width: 14 },
  { key: 'categoryName', labelRu: 'Категория', hintRu: 'Педагог-модератор, педагог-эксперт', kind: 'text', width: 24 },
];

export const SHEET = {
  guide: 'Как заполнять',
  tenant: 'Детский сад',
  groups: 'Группы',
  staff: 'Педагоги',
  lists: 'Списки',
} as const;

/** Сколько пустых строк оставить в таблицах — чтобы хватило без вставки строк вручную. */
export const GROUP_ROWS = 20;
export const STAFF_ROWS = 40;
