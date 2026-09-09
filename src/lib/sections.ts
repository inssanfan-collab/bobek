import type { SectionType } from '@prisma/client';

export type SectionMeta = {
  type: SectionType;
  slug: string;
  titleKk: string;
  titleRu: string;
  /** Подсказка в админке: зачем этот раздел и что туда класть. */
  hintRu: string;
  hintKk: string;
  /** Создаётся ли автоматически при создании сада. */
  defaultOn: boolean;
  /** Раздел существует в единственном экземпляре (нельзя добавить второй). */
  singleton: boolean;
  icon: string;
};

/**
 * Набор разделов собран по практике сайтов дошкольных организаций РК:
 * паспорт, нормативные документы, педсостав, вакантные места, меню питания,
 * попечительский совет, антикоррупция и виртуальная приёмная — то, что
 * спрашивают проверяющие и ищут родители.
 */
export const SECTION_CATALOG: SectionMeta[] = [
  {
    type: 'PAGE', slug: 'about', titleKk: 'Біз туралы', titleRu: 'О саде',
    hintRu: 'История, миссия, режим работы, руководство. Первое, что читают родители.',
    hintKk: 'Тарих, миссия, жұмыс режимі, басшылық. Ата-аналар бірінші оқитыны.',
    defaultOn: true, singleton: false, icon: '🏡',
  },
  {
    type: 'NEWS', slug: 'news', titleKk: 'Жаңалықтар', titleRu: 'Новости',
    hintRu: 'Утренники, конкурсы, будни групп. Главный повод возвращаться на сайт.',
    hintKk: 'Ертеңгіліктер, байқаулар, топтардың күнделігі. Сайтқа қайта оралудың басты себебі.',
    defaultOn: true, singleton: true, icon: '📰',
  },
  {
    type: 'ANNOUNCEMENT', slug: 'announcements', titleKk: 'Хабарландырулар', titleRu: 'Объявления',
    hintRu: 'Карантин, собрание, изменение режима. Короткие срочные сообщения.',
    hintKk: 'Карантин, жиналыс, режимнің өзгеруі. Қысқа шұғыл хабарламалар.',
    defaultOn: true, singleton: true, icon: '📢',
  },
  {
    type: 'STAFF', slug: 'staff', titleKk: 'Педагогтар', titleRu: 'Педагогический состав',
    hintRu: 'ФИО, должность, образование, стаж, категория. Требуется при проверках.',
    hintKk: 'Аты-жөні, лауазымы, білімі, өтілі, санаты. Тексеру кезінде талап етіледі.',
    defaultOn: true, singleton: true, icon: '👩‍🏫',
  },
  {
    type: 'GROUPS', slug: 'groups', titleKk: 'Топтар', titleRu: 'Группы',
    hintRu: 'Возраст, язык обучения, воспитатели, количество мест.',
    hintKk: 'Жасы, оқыту тілі, тәрбиешілер, орын саны.',
    defaultOn: true, singleton: true, icon: '🧸',
  },
  {
    type: 'GALLERY', slug: 'gallery', titleKk: 'Фотогалерея', titleRu: 'Фотогалерея',
    hintRu: 'Альбомы с праздников и занятий. Публикуйте только с согласия родителей.',
    hintKk: 'Мерекелер мен сабақтардың альбомдары. Тек ата-аналардың келісімімен жариялаңыз.',
    defaultOn: true, singleton: true, icon: '📷',
  },
  {
    type: 'DOCUMENTS', slug: 'documents', titleKk: 'Құжаттар', titleRu: 'Документы',
    hintRu: 'Устав, лицензия, правила приёма, приказы, госзакупки, отчёты.',
    hintKk: 'Жарғы, лицензия, қабылдау қағидалары, бұйрықтар, сатып алулар, есептер.',
    defaultOn: true, singleton: true, icon: '📄',
  },
  {
    type: 'PAGE', slug: 'parents', titleKk: 'Ата-аналарға', titleRu: 'Родителям',
    hintRu: 'Как встать в очередь через egov, что взять в сад, режим дня, оплата.',
    hintKk: 'egov арқылы кезекке қалай тұру керек, балабақшаға не алып келу керек, күн тәртібі, төлем.',
    defaultOn: true, singleton: false, icon: '👪',
  },
  {
    type: 'MENU_FOOD', slug: 'menu', titleKk: 'Ас мәзірі', titleRu: 'Меню питания',
    hintRu: 'Меню по дням или скан утверждённого меню. Частый вопрос родителей.',
    hintKk: 'Күн бойынша мәзір немесе бекітілген мәзірдің сканы. Ата-аналардың жиі сұрағы.',
    defaultOn: true, singleton: true, icon: '🍎',
  },
  {
    type: 'PAGE', slug: 'daily-routine', titleKk: 'Күн тәртібі', titleRu: 'Режим дня',
    hintRu: 'Распорядок по времени: приём детей, занятия, прогулка, сон, ужин.',
    hintKk: 'Уақыт бойынша тәртіп: балаларды қабылдау, сабақтар, серуен, ұйқы, кешкі ас.',
    defaultOn: true, singleton: false, icon: '🕗',
  },
  {
    type: 'CLUBS', slug: 'clubs', titleKk: 'Үйірмелер', titleRu: 'Кружки и услуги',
    hintRu: 'Дополнительные занятия: английский, хореография, логопед. С ценой или бесплатные.',
    hintKk: 'Қосымша сабақтар: ағылшын тілі, хореография, логопед. Ақылы немесе тегін.',
    defaultOn: false, singleton: true, icon: '🎨',
  },
  {
    type: 'FAQ', slug: 'faq', titleKk: 'Жиі қойылатын сұрақтар', titleRu: 'Частые вопросы',
    hintRu: 'Ответы на повторяющиеся вопросы родителей — снимает часть звонков.',
    hintKk: 'Ата-аналардың қайталанатын сұрақтарына жауаптар — қоңыраулардың бір бөлігін азайтады.',
    defaultOn: false, singleton: true, icon: '❓',
  },
  {
    type: 'VACANCIES', slug: 'vacancies', titleKk: 'Бос орындар', titleRu: 'Свободные места',
    hintRu: 'Свободные места по группам и вакансии для сотрудников.',
    hintKk: 'Топтар бойынша бос орындар және қызметкерлерге арналған бос жұмыс орындары.',
    defaultOn: true, singleton: true, icon: '🪑',
  },
  {
    type: 'TRUSTEE_BOARD', slug: 'trustee', titleKk: 'Қамқоршылық кеңес', titleRu: 'Попечительский совет',
    hintRu: 'Положение, состав совета, протоколы и отчёты о средствах.',
    hintKk: 'Ереже, кеңес құрамы, хаттамалар және қаражат туралы есептер.',
    defaultOn: false, singleton: true, icon: '🤝',
  },
  {
    type: 'ANTICORRUPTION', slug: 'anticorruption', titleKk: 'Сыбайлас жемқорлыққа қарсы', titleRu: 'Противодействие коррупции',
    hintRu: 'План мероприятий, телефон доверия, порядок обращения.',
    hintKk: 'Іс-шаралар жоспары, сенім телефоны, өтініш беру тәртібі.',
    defaultOn: false, singleton: true, icon: '⚖️',
  },
  {
    type: 'FEEDBACK', slug: 'feedback', titleKk: 'Виртуалды қабылдау', titleRu: 'Виртуальная приёмная',
    hintRu: 'Форма обращения родителей. Ответы приходят вам в админку.',
    hintKk: 'Ата-аналардың өтініш нысаны. Жауаптар әкімші бөліміне келеді.',
    defaultOn: true, singleton: true, icon: '✉️',
  },
  {
    type: 'CONTACTS', slug: 'contacts', titleKk: 'Байланыс', titleRu: 'Контакты',
    hintRu: 'Адрес, телефоны, карта проезда, часы приёма.',
    hintKk: 'Мекенжай, телефондар, жол картасы, қабылдау сағаттары.',
    defaultOn: true, singleton: true, icon: '📍',
  },
];

export function sectionMeta(type: SectionType, slug?: string): SectionMeta | undefined {
  if (slug) {
    const bySlug = SECTION_CATALOG.find((s) => s.slug === slug && s.type === type);
    if (bySlug) return bySlug;
  }
  return SECTION_CATALOG.find((s) => s.type === type);
}

export const DEFAULT_SECTIONS = SECTION_CATALOG.filter((s) => s.defaultOn);

/** Разделы, которые ведут на список записей, а не на статическую страницу. */
export const FEED_TYPES: SectionType[] = ['NEWS', 'ANNOUNCEMENT'];
