import 'server-only';
import { DocBuilder, type Pair } from './pdf';
import { amountInWords } from '@/lib/amount-words';
import { formatDate } from '@/lib/labels';
import { isPlanCode, PLAN_INFO, type PlanCode } from '@/lib/plans';
import type { Contract, PortalSettings, Tenant, TenantProfile } from '@prisma/client';

/**
 * Договор, счёт и акт для сада.
 *
 * Государственный сад не проведёт расход без всех трёх: договор — основание,
 * счёт — для казначейства, акт — чтобы закрыть год. Поэтому печатаются
 * одним набором, с общим номером и датами.
 *
 * Тексты юридические, но не заверенные: перед первой продажей их обязан
 * прочитать юрист. Все существенные условия по ГК РК на месте, спорные
 * места — сроки, подсудность, ограничение ответственности — вынесены
 * отдельными пунктами, чтобы их легко было поправить.
 */

export type DocData = {
  contract: Contract;
  tenant: Tenant & { profile: TenantProfile | null };
  settings: PortalSettings;
  /** Домен сайта сада — предмет договора описывает именно его. */
  host: string;
};

const CITY: Pair = { kk: 'Ақтөбе қ.', ru: 'г. Актобе' };

/** Тариф договора. Старые записи без поля считаются базовыми — других тогда не было. */
function planOf(data: DocData): PlanCode {
  return isPlanCode(data.contract.plan) ? data.contract.plan : 'BASIC';
}

function money(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₸`;
}

function both(data: DocData, kk: string | null | undefined, ru: string | null | undefined): Pair {
  void data;
  return { kk: kk || ru || '—', ru: ru || kk || '—' };
}

/** Реквизиты исполнителя — одинаковые во всех трёх документах. */
function providerBlock(settings: PortalSettings, locale: 'kk' | 'ru'): string[] {
  const name = locale === 'kk' ? settings.companyNameKk : settings.companyNameRu;
  const owner = locale === 'kk' ? settings.ownerNameKk : settings.ownerNameRu;
  const address = locale === 'kk' ? settings.addressKk : settings.addressRu;
  const bank = locale === 'kk' ? settings.bankNameKk : settings.bankNameRu;
  const taxNote = locale === 'kk' ? settings.taxNoteKk : settings.taxNoteRu;

  return [
    locale === 'kk' ? 'ОРЫНДАУШЫ:' : 'ИСПОЛНИТЕЛЬ:',
    name || '—',
    owner ? `${locale === 'kk' ? 'Басшысы' : 'Руководитель'}: ${owner}` : '',
    settings.taxId ? `${locale === 'kk' ? 'ЖСН/БСН' : 'ИИН/БИН'}: ${settings.taxId}` : '',
    address ? `${locale === 'kk' ? 'Мекенжайы' : 'Адрес'}: ${address}` : '',
    settings.phone ? `${locale === 'kk' ? 'Тел.' : 'Тел.'}: ${settings.phone}` : '',
    settings.email ? `E-mail: ${settings.email}` : '',
    bank ? `${locale === 'kk' ? 'Банк' : 'Банк'}: ${bank}` : '',
    settings.iban ? `ИИК: ${settings.iban}` : '',
    settings.bic ? `БИК: ${settings.bic}` : '',
    settings.kbe ? `${locale === 'kk' ? 'КБе' : 'Кбе'}: ${settings.kbe}` : '',
    taxNote,
  ].filter(Boolean);
}

/** Реквизиты сада. Банковские он вписывает сам — их у нас нет. */
function customerBlock(data: DocData, locale: 'kk' | 'ru'): string[] {
  const profile = data.tenant.profile;
  const name = locale === 'kk' ? profile?.nameKk : profile?.nameRu;
  const address = locale === 'kk' ? profile?.addressKk : profile?.addressRu;
  const head = locale === 'kk' ? profile?.headNameKk : profile?.headNameRu;

  return [
    locale === 'kk' ? 'ТАПСЫРЫС БЕРУШІ:' : 'ЗАКАЗЧИК:',
    name || '—',
    profile?.bin ? `${locale === 'kk' ? 'БСН' : 'БИН'}: ${profile.bin}` : `${locale === 'kk' ? 'БСН' : 'БИН'}: _______________`,
    address ? `${locale === 'kk' ? 'Мекенжайы' : 'Адрес'}: ${address}` : '',
    profile?.phone ? `${locale === 'kk' ? 'Тел.' : 'Тел.'}: ${profile.phone}` : '',
    profile?.email ? `E-mail: ${profile.email}` : '',
    `${locale === 'kk' ? 'Банк' : 'Банк'}: _______________________`,
    'ИИК: _______________________',
    'БИК: ____________  ' + (locale === 'kk' ? 'КБе' : 'Кбе') + ': ______',
    head ? `${locale === 'kk' ? 'Басшысы' : 'Руководитель'}: ${head}` : '',
  ].filter(Boolean);
}

function signatureBlock(data: DocData, locale: 'kk' | 'ru'): string[] {
  const signer = locale === 'kk'
    ? data.settings.signerNameKk || data.settings.ownerNameKk
    : data.settings.signerNameRu || data.settings.ownerNameRu;
  const title = locale === 'kk'
    ? data.settings.signerTitleKk || 'Басшысы'
    : data.settings.signerTitleRu || 'Руководитель';
  const head = locale === 'kk' ? data.tenant.profile?.headNameKk : data.tenant.profile?.headNameRu;

  return [
    '',
    `${title} ____________________ ${signer || ''}`,
    locale === 'kk' ? 'М.О.' : 'М.П.',
    '',
    locale === 'kk' ? 'Тапсырыс беруші ____________________' : 'Заказчик ____________________',
    head ? `${head}` : '',
    locale === 'kk' ? 'М.О.' : 'М.П.',
  ];
}

// ──────────────────────────── договор ────────────────────────────

export async function buildContractPdf(data: DocData): Promise<Buffer> {
  const { contract, settings, host } = data;
  const b = new DocBuilder();
  const price = money(contract.amount);
  const start = formatDate(contract.periodStart, 'ru');
  const end = formatDate(contract.periodEnd, 'ru');
  const startKk = formatDate(contract.periodStart, 'kk');
  const endKk = formatDate(contract.periodEnd, 'kk');

  b.title({
    kk: `ҚЫЗМЕТ КӨРСЕТУ ШАРТЫ № ${contract.number}`,
    ru: `ДОГОВОР ОКАЗАНИЯ УСЛУГ № ${contract.number}`,
  });

  b.columns(
    {
      kk: `${CITY.kk}                                 ${formatDate(contract.issuedAt, 'kk')}`,
      ru: `${CITY.ru}                                 ${formatDate(contract.issuedAt, 'ru')}`,
    },
    { size: 8.5, spacing: 10 },
  );

  const providerName = settings.companyNameRu || settings.companyNameKk || '—';
  const providerNameKk = settings.companyNameKk || settings.companyNameRu || '—';
  const customerName = data.tenant.profile?.nameRu ?? data.tenant.slug;
  const customerNameKk = data.tenant.profile?.nameKk ?? data.tenant.slug;
  const head = both(data, data.tenant.profile?.headNameKk, data.tenant.profile?.headNameRu);

  b.columns({
    kk: `${providerNameKk}, бұдан әрі «Орындаушы» деп аталатын, ${settings.basisKk || 'тіркеу туралы куәлік'} негізінде әрекет ететін, бір тараптан, және ${customerNameKk}, бұдан әрі «Тапсырыс беруші» деп аталатын, басшысы ${head.kk} арқылы әрекет ететін, екінші тараптан, төмендегілер туралы осы Шартты жасасты.`,
    ru: `${providerName}, именуемый в дальнейшем «Исполнитель», действующий на основании ${settings.basisRu || 'свидетельства о регистрации'}, с одной стороны, и ${customerName}, именуемое в дальнейшем «Заказчик», в лице руководителя ${head.ru}, с другой стороны, заключили настоящий Договор о нижеследующем.`,
  });

  b.heading({ kk: '1. ШАРТТЫҢ МӘНІ', ru: '1. ПРЕДМЕТ ДОГОВОРА' });
  const plan = planOf(data);
  b.columns({
    kk: `1.1. Орындаушы Тапсырыс берушіге мектепке дейінгі ұйымның ресми сайтын құру және жүргізу үшін EduSad веб-платформасына қол жеткізуді «${PLAN_INFO[plan].name.kk}» тарифі бойынша ұсынады, ал Тапсырыс беруші қызметтің ақысын төлейді.`,
    ru: `1.1. Исполнитель предоставляет Заказчику доступ к веб-платформе EduSad для создания и ведения официального сайта дошкольной организации по тарифу «${PLAN_INFO[plan].name.ru}», а Заказчик оплачивает услуги.`,
  });
  // Кто наполняет сайт — единственное, чем тарифы отличаются, поэтому
  // это записано в предмете договора, а не оставлено на словах.
  b.columns(
    plan === 'MANAGED'
      ? {
          kk: '1.1.1. Орындаушы Тапсырыс берушінің сұрауы бойынша ол берген материалдарды — жаңалықтарды, фотоларды, құжаттарды, мәзірді және өзге мәліметтерді — сайтқа орналастырады. Әкімші бөлімі Тапсырыс берушіде де сақталады.',
          ru: '1.1.1. Исполнитель по запросу Заказчика размещает на сайте предоставленные им материалы — новости, фотографии, документы, меню и иные сведения. Административная панель сохраняется и у Заказчика.',
        }
      : {
          kk: '1.1.1. Сайтты Тапсырыс беруші әкімші бөлімі арқылы өзі толтырады және жаңартады.',
          ru: '1.1.1. Заказчик самостоятельно наполняет и актуализирует сайт через административную панель.',
        },
  );
  b.columns({
    kk: `1.2. Қызметтің құрамы: ${host} мекенжайы, сайт жүйесі мен әкімшілік панелі, орналастыру, сақтық көшірме, жаңартулар және жұмыс күндері техникалық қолдау.`,
    ru: `1.2. Состав услуги: адрес ${host}, движок сайта и административная панель, размещение, резервное копирование, обновления и техническая поддержка в рабочие дни.`,
  });
  b.columns({
    kk: '1.3. Сайттың деректері Қазақстан Республикасының аумағындағы серверлерде орналастырылады.',
    ru: '1.3. Данные сайта размещаются на серверах на территории Республики Казахстан.',
  });
  b.columns({
    kk: '1.4. .kz немесе edu.kz аймағындағы жеке доменді тіркеу және оның ақысы қызметке кірмейді: оны Тапсырыс беруші өз атына сатып алады, Орындаушы баптауға өтеусіз көмектеседі.',
    ru: '1.4. Регистрация и оплата собственного домена в зоне .kz или edu.kz в состав услуги не входят: Заказчик приобретает его на своё имя, Исполнитель безвозмездно помогает с настройкой.',
  });

  b.heading({ kk: '2. ҚЫЗМЕТ ҚҰНЫ ЖӘНЕ ТӨЛЕМ ТӘРТІБІ', ru: '2. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ' });
  b.columns({
    kk: `2.1. Қызметтің құны ${startKk} — ${endKk} кезеңі үшін ${price} құрайды. ${settings.taxNoteKk || 'ҚҚС салынбайды.'}`,
    ru: `2.1. Стоимость услуг за период с ${start} по ${end} составляет ${price}. ${settings.taxNoteRu || 'НДС не облагается.'}`,
  });
  b.columns({
    kk: '2.2. Төлем шот берілген күннен бастап 10 жұмыс күні ішінде алдын ала жүргізіледі.',
    ru: '2.2. Оплата производится авансом в течение 10 рабочих дней с даты выставления счёта.',
  });
  b.columns({
    kk: '2.3. Төлем міндеттемесі ақша Орындаушының шотына түскен күні орындалды деп саналады.',
    ru: '2.3. Обязательство по оплате считается исполненным с даты зачисления денег на счёт Исполнителя.',
  });
  b.columns({
    kk: '2.4. Келесі кезеңнің құны өзгеруі мүмкін; Орындаушы бұл туралы кезең аяқталғанға дейін кемінде 30 күн бұрын хабарлайды.',
    ru: '2.4. Стоимость следующего периода может измениться; Исполнитель уведомляет об этом не позднее чем за 30 дней до окончания периода.',
  });

  b.heading({ kk: '3. ТАРАПТАРДЫҢ ҚҰҚЫҚТАРЫ МЕН МІНДЕТТЕРІ', ru: '3. ПРАВА И ОБЯЗАННОСТИ СТОРОН' });
  b.columns({
    kk: '3.1. Орындаушы міндеттенеді: сайттың қолжетімділігін айына кемінде 99% уақыт қамтамасыз ету (жоспарлы жұмыстарды қоспағанда), деректердің сақтық көшірмесін жасау, әкімшілік панельдің жұмысы бойынша кеңес беру, Тапсырыс берушінің деректерін заңда көзделген жағдайлардан басқа үшінші тұлғаларға бермеу.',
    ru: '3.1. Исполнитель обязуется: обеспечивать доступность сайта не менее 99% времени в месяц (кроме плановых работ), создавать резервные копии данных, консультировать по работе административной панели, не передавать данные Заказчика третьим лицам, кроме случаев, предусмотренных законом.',
  });
  b.columns({
    kk: '3.2. Тапсырыс беруші міндеттенеді: сайтты өз бетінше толтыру, орналастырылған мәліметтердің дұрыстығын қамтамасыз ету, кіру парольдерінің құпиялылығын сақтау, олардың белгілі болғаны туралы дереу хабарлау.',
    ru: '3.2. Заказчик обязуется: самостоятельно наполнять сайт, обеспечивать достоверность размещаемых сведений, сохранять конфиденциальность паролей доступа и немедленно сообщать об их компрометации.',
  });
  b.columns({
    kk: '3.3. Тапсырыс беруші Қазақстан Республикасының заңнамасына қайшы келетін материалдарды орналастырмайды және сайттың мазмұны үшін жауап береді.',
    ru: '3.3. Заказчик не размещает материалы, противоречащие законодательству Республики Казахстан, и несёт ответственность за содержание сайта.',
  });
  b.columns({
    kk: '3.4. Орындаушы платформаны дамытуға, сыртқы түрі мен мүмкіндіктерін жетілдіруге құқылы, бұл ретте қызметтің құрамы кемімейді.',
    ru: '3.4. Исполнитель вправе развивать платформу, улучшать её внешний вид и возможности, при этом состав услуги не уменьшается.',
  });

  b.heading({ kk: '4. ДЕРБЕС ДЕРЕКТЕР', ru: '4. ПЕРСОНАЛЬНЫЕ ДАННЫЕ' });
  b.columns({
    kk: '4.1. Тараптар дербес деректерді «Дербес деректер және оларды қорғау туралы» 2013 жылғы 21 мамырдағы № 94-V ҚРЗ Заңына сәйкес өңдейді.',
    ru: '4.1. Стороны обрабатывают персональные данные в соответствии с Законом РК «О персональных данных и их защите» от 21 мая 2013 года № 94-V.',
  });
  b.columns({
    kk: '4.2. Сайтта орналастырылған дербес деректерге қатысты Тапсырыс беруші иеленуші болып табылады, Орындаушы оларды Тапсырыс берушінің тапсырмасы бойынша өңдейді.',
    ru: '4.2. В отношении персональных данных, размещённых на сайте, Заказчик выступает собственником, Исполнитель обрабатывает их по поручению Заказчика.',
  });
  b.columns({
    kk: '4.3. Балалардың суреттері мен бейнелері заңды өкілдердің жазбаша келісімі болған кезде ғана жарияланады. Келісімнің болуын Тапсырыс беруші қамтамасыз етеді және сақтайды.',
    ru: '4.3. Изображения и видеозаписи детей публикуются только при наличии письменного согласия законных представителей. Наличие и хранение согласий обеспечивает Заказчик.',
  });

  b.heading({ kk: '5. ТАРАПТАРДЫҢ ЖАУАПКЕРШІЛІГІ', ru: '5. ОТВЕТСТВЕННОСТЬ СТОРОН' });
  b.columns({
    kk: '5.1. Тараптар Қазақстан Республикасының заңнамасына сәйкес жауап береді.',
    ru: '5.1. Стороны несут ответственность в соответствии с законодательством Республики Казахстан.',
  });
  b.columns({
    kk: `5.2. Орындаушының мүліктік жауапкершілігі осы Шарт бойынша төленген сомамен шектеледі.`,
    ru: `5.2. Имущественная ответственность Исполнителя ограничивается суммой, уплаченной по настоящему Договору.`,
  });
  b.columns({
    kk: '5.3. Орындаушы Тапсырыс беруші орналастырған материалдар үшін, сондай-ақ байланыс операторлары мен домен тіркеушісінің тарапынан туындаған үзілістер үшін жауап бермейді.',
    ru: '5.3. Исполнитель не отвечает за материалы, размещённые Заказчиком, а также за перебои, возникшие на стороне операторов связи и регистратора доменов.',
  });

  b.heading({ kk: '6. ЕҢСЕРІЛМЕЙТІН КҮШ ЖАҒДАЙЛАРЫ', ru: '6. ОБСТОЯТЕЛЬСТВА НЕПРЕОДОЛИМОЙ СИЛЫ' });
  b.columns({
    kk: '6.1. Тараптар еңсерілмейтін күш жағдайлары салдарынан міндеттемелерді орындамағаны үшін жауапкершіліктен босатылады. Мұндай жағдай туындаған тарап екінші тарапқа 10 күн ішінде хабарлайды.',
    ru: '6.1. Стороны освобождаются от ответственности за неисполнение обязательств вследствие обстоятельств непреодолимой силы. Сторона, у которой возникли такие обстоятельства, уведомляет другую сторону в течение 10 дней.',
  });

  b.heading({ kk: '7. ШАРТТЫҢ МЕРЗІМІ ЖӘНЕ ТОҚТАТЫЛУЫ', ru: '7. СРОК ДЕЙСТВИЯ И ПРЕКРАЩЕНИЕ ДОГОВОРА' });
  b.columns({
    kk: `7.1. Шарт ${startKk} бастап ${endKk} дейін қолданылады.`,
    ru: `7.1. Договор действует с ${start} по ${end}.`,
  });
  b.columns({
    kk: '7.2. Келесі кезеңге төлем жасалған жағдайда Шарт сол шарттармен ұзартылды деп саналады.',
    ru: '7.2. При оплате следующего периода Договор считается продлённым на тех же условиях.',
  });
  b.columns({
    kk: '7.3. Төлем болмаған жағдайда қызмет жеңілдік мерзімінсіз тоқтатылады: төленген кезеңнің соңғы күні сайт әлі жұмыс істейді, ал келесі күннен бастап әкімшілік панель тек қарау режиміне ауысады және сайт келушілер үшін жабылады. Оның орнына «Сайт уақытша қолжетімсіз» беті көрсетіледі, онда қызмет ақысының төленбеуіне байланысты тоқтатылғаны және Тапсырыс берушінің телефоны көрсетіледі. Төлем түскен соң сайт бұрынғы мазмұнымен бірден ашылады. Деректер тоқтатылғаннан кейін 90 күн сақталады және Тапсырыс берушінің сұрауы бойынша беріледі.',
    ru: '7.3. При отсутствии оплаты услуга приостанавливается без льготного срока: последний оплаченный день сайт ещё работает, а со следующего дня административная панель переводится в режим только для просмотра и сайт закрывается для посетителей. Вместо него показывается страница «Сайт временно недоступен» с указанием, что работа сайта приостановлена в связи с неоплатой услуги, и телефоном Заказчика. После поступления оплаты сайт открывается снова, со всем прежним содержимым. Данные хранятся 90 дней после приостановления и передаются Заказчику по его запросу.',
  });
  b.columns({
    kk: '7.4. Шарт тараптардың келісімі бойынша немесе кез келген тараптың 30 күн бұрын жазбаша хабарлауымен бұзылуы мүмкін.',
    ru: '7.4. Договор может быть расторгнут по соглашению сторон либо по письменному уведомлению любой из сторон за 30 дней.',
  });

  b.heading({ kk: '8. ДАУЛАРДЫ ШЕШУ', ru: '8. РАЗРЕШЕНИЕ СПОРОВ' });
  b.columns({
    kk: '8.1. Даулар келіссөздер жолымен шешіледі. Наразылық 15 жұмыс күні ішінде қаралады.',
    ru: '8.1. Споры решаются путём переговоров. Претензия рассматривается в течение 15 рабочих дней.',
  });
  b.columns({
    kk: '8.2. Келісімге қол жеткізілмеген жағдайда дау Қазақстан Республикасының заңнамасына сәйкес сотта қаралады.',
    ru: '8.2. При недостижении согласия спор рассматривается в суде в соответствии с законодательством Республики Казахстан.',
  });

  b.heading({ kk: '9. ӨЗГЕ ШАРТТАР', ru: '9. ПРОЧИЕ УСЛОВИЯ' });
  b.columns({
    kk: '9.1. Шарт қазақ және орыс тілдерінде, әр тарапқа бір-бірден екі данада жасалды. Екі мәтіннің де күші бірдей.',
    ru: '9.1. Договор составлен на казахском и русском языках в двух экземплярах, по одному для каждой стороны. Оба текста имеют одинаковую силу.',
  });
  b.columns({
    kk: `9.2. Осы Шартта реттелмеген бөлігінде ${host.split('.').slice(-2).join('.')} сайтындағы жария оферта қолданылады.`,
    ru: `9.2. В части, не урегулированной настоящим Договором, применяется публичная оферта, размещённая на сайте портала.`,
  });
  b.columns({
    kk: '9.3. Тараптар құжаттармен электрондық түрде алмасуға құқылы; түпнұсқалар 30 күн ішінде беріледі.',
    ru: '9.3. Стороны вправе обмениваться документами в электронном виде; оригиналы передаются в течение 30 дней.',
  });

  b.space(6).line();
  b.heading({ kk: '10. ТАРАПТАРДЫҢ ДЕРЕКТЕМЕЛЕРІ', ru: '10. РЕКВИЗИТЫ СТОРОН' });
  b.sideBySide(providerBlock(settings, 'kk'), providerBlock(settings, 'ru'));
  b.space(4);
  b.sideBySide(customerBlock(data, 'kk'), customerBlock(data, 'ru'));
  b.space(10);
  b.sideBySide(signatureBlock(data, 'kk'), signatureBlock(data, 'ru'));

  return b.finish();
}

// ───────────────────────────── счёт ─────────────────────────────

export async function buildInvoicePdf(data: DocData): Promise<Buffer> {
  const { contract, settings } = data;
  const b = new DocBuilder();

  b.title({ kk: `ТӨЛЕМГЕ АРНАЛҒАН ШОТ № ${contract.number}`, ru: `СЧЁТ НА ОПЛАТУ № ${contract.number}` });
  b.columns(
    {
      kk: `${CITY.kk}                                 ${formatDate(contract.issuedAt, 'kk')}`,
      ru: `${CITY.ru}                                 ${formatDate(contract.issuedAt, 'ru')}`,
    },
    { size: 8.5, spacing: 10 },
  );

  // Шапка платёжных реквизитов — по ней казначейство сада проводит платёж.
  b.table(
    [
      [
        settings.bankNameRu || settings.bankNameKk || '—',
        'ИИК',
        settings.iban || '—',
      ],
      [
        `${'Бенефициар: '}${settings.companyNameRu || settings.companyNameKk || '—'}`,
        'БИК',
        settings.bic || '—',
      ],
      [
        `${'ИИН/БИН: '}${settings.taxId || '—'}`,
        'Кбе',
        settings.kbe || '—',
      ],
    ],
    [0.62, 0.1, 0.28],
    { headerRows: 0 },
  );

  b.space(8);
  b.full(`Поставщик / Жеткізуші: ${settings.companyNameRu || settings.companyNameKk}`, { size: 8.5, spacing: 2 });
  b.full(
    `Покупатель / Сатып алушы: ${data.tenant.profile?.nameRu ?? data.tenant.slug}` +
      (data.tenant.profile?.bin ? `, БИН ${data.tenant.profile.bin}` : ''),
    { size: 8.5, spacing: 2 },
  );
  b.full(`Договор / Шарт: № ${contract.number} от ${formatDate(contract.issuedAt, 'ru')}`, { size: 8.5, spacing: 10 });

  const period = `${formatDate(contract.periodStart, 'ru')} — ${formatDate(contract.periodEnd, 'ru')}`;
  b.table(
    [
      ['Наименование услуги / Қызметтің атауы', 'Кол-во', 'Цена', 'Сумма'],
      [
        `${PLAN_INFO[planOf(data)].serviceName.ru}, ${period}\n${PLAN_INFO[planOf(data)].serviceName.kk}`,
        '1',
        money(contract.amount),
        money(contract.amount),
      ],
      ['Итого / Барлығы', '', '', money(contract.amount)],
    ],
    [0.58, 0.1, 0.16, 0.16],
  );

  b.space(8);
  b.full(`Всего к оплате: ${amountInWords(contract.amount, 'ru')}`, { font: 'bold', size: 9, spacing: 2 });
  b.full(`Төлеуге жататын сома: ${amountInWords(contract.amount, 'kk')}`, { font: 'bold', size: 9, spacing: 8 });
  b.full(settings.taxNoteRu || 'НДС не облагается.', { size: 8.5, spacing: 2 });
  b.full('Счёт действителен в течение 10 рабочих дней. / Шот 10 жұмыс күні бойы жарамды.', {
    size: 8.5,
    spacing: 16,
  });

  const signer = settings.signerNameRu || settings.ownerNameRu || '';
  b.full(`Исполнитель / Орындаушы ____________________  ${signer}`, { size: 9, spacing: 4 });
  b.full('М.П. / М.О.', { size: 8.5 });

  return b.finish();
}

// ───────────────────────────── акт ──────────────────────────────

export async function buildActPdf(data: DocData): Promise<Buffer> {
  const { contract, settings } = data;
  const b = new DocBuilder();

  b.title({
    kk: `КӨРСЕТІЛГЕН ҚЫЗМЕТТЕР АКТІСІ № ${contract.number}`,
    ru: `АКТ ОКАЗАННЫХ УСЛУГ № ${contract.number}`,
  });
  b.columns(
    {
      kk: `${CITY.kk}                                 ${formatDate(contract.periodEnd, 'kk')}`,
      ru: `${CITY.ru}                                 ${formatDate(contract.periodEnd, 'ru')}`,
    },
    { size: 8.5, spacing: 10 },
  );

  b.full(`Исполнитель / Орындаушы: ${settings.companyNameRu || settings.companyNameKk}`, { size: 8.5, spacing: 2 });
  b.full(
    `Заказчик / Тапсырыс беруші: ${data.tenant.profile?.nameRu ?? data.tenant.slug}` +
      (data.tenant.profile?.bin ? `, БИН ${data.tenant.profile.bin}` : ''),
    { size: 8.5, spacing: 2 },
  );
  b.full(`Основание / Негіздеме: договор № ${contract.number} от ${formatDate(contract.issuedAt, 'ru')}`, {
    size: 8.5,
    spacing: 10,
  });

  const period = `${formatDate(contract.periodStart, 'ru')} — ${formatDate(contract.periodEnd, 'ru')}`;
  b.table(
    [
      ['Наименование услуги / Қызметтің атауы', 'Кол-во', 'Цена', 'Сумма'],
      [
        `${PLAN_INFO[planOf(data)].serviceName.ru}, ${period}\n${PLAN_INFO[planOf(data)].serviceName.kk}`,
        '1',
        money(contract.amount),
        money(contract.amount),
      ],
      ['Итого / Барлығы', '', '', money(contract.amount)],
    ],
    [0.58, 0.1, 0.16, 0.16],
  );

  b.space(8);
  b.full(`Всего оказано услуг на сумму: ${amountInWords(contract.amount, 'ru')}`, { font: 'bold', size: 9, spacing: 2 });
  b.full(`Барлығы көрсетілген қызмет сомасы: ${amountInWords(contract.amount, 'kk')}`, {
    font: 'bold',
    size: 9,
    spacing: 10,
  });

  b.columns({
    kk: 'Қызметтер толық көлемде және тиісті сапада көрсетілді. Тараптардың бір-біріне наразылығы жоқ.',
    ru: 'Услуги оказаны в полном объёме и надлежащего качества. Претензий стороны друг к другу не имеют.',
  });

  b.space(14).line();
  b.sideBySide(providerBlock(settings, 'kk'), providerBlock(settings, 'ru'));
  b.space(4);
  b.sideBySide(customerBlock(data, 'kk'), customerBlock(data, 'ru'));
  b.space(10);
  b.sideBySide(signatureBlock(data, 'kk'), signatureBlock(data, 'ru'));

  return b.finish();
}

export const DOC_KINDS = ['contract', 'invoice', 'act'] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export function buildDocument(kind: DocKind, data: DocData): Promise<Buffer> {
  if (kind === 'invoice') return buildInvoicePdf(data);
  if (kind === 'act') return buildActPdf(data);
  return buildContractPdf(data);
}
