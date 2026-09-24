/**
 * Демонстрационный сад «Балапан» на demo.<PORTAL_DOMAIN> — его показывают
 * заведующим, которые выбирают сайт: заполнены все разделы, есть фото,
 * документы в папках, меню, педагоги, кружки и посещаемость в админке.
 *
 *   pnpm tsx scripts/create-demo-site.ts <папка с файлами> [--reset] [--extra-host demo.localhost]
 *
 * В папке: img/demo-*.png (фото из генератора), img/logo.png (знак сада),
 * docs/*.pdf (документы-образцы). Файлы в репозиторий не кладём.
 *
 * Сад помечен Tenant.isDemo: сайт открыт, но в каталог, счётчики и ленту
 * новостей портала он не попадает, а поисковикам закрыт robots.txt.
 * Все данные выдуманы — об этом говорит полоса-объявление на каждой странице.
 *
 * --reset удаляет прежний демо-сад и создаёт заново. Удаляет только сад
 * с isDemo = true: настоящий сад с тем же адресом скрипт не тронет.
 * Учётная запись сотрудника создаётся со случайным паролем, который нигде
 * не показывается: в админку демо-сада входят «Войти как сад» из портала.
 */
import 'dotenv/config';
import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient, type SectionType } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import sharp from 'sharp';
import { SECTION_CATALOG } from '../src/lib/sections';
import { sanitizeContent } from '../src/lib/sanitize';

const prisma = new PrismaClient();

const SLUG = 'demo';
const PORTAL_DOMAIN = (process.env.PORTAL_DOMAIN ?? 'edusad.kz').toLowerCase();
const STORAGE = path.resolve(process.env.STORAGE_DIR ?? './storage');
const DAY = 86_400_000;

const args = process.argv.slice(2);
const ASSETS = args.find((a) => !a.startsWith('--'));
const RESET = args.includes('--reset');
const extraHostIndex = args.indexOf('--extra-host');
const EXTRA_HOST = extraHostIndex >= 0 ? args[extraHostIndex + 1] : null;

const ago = (days: number, hour = 10) => {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// ─────────────────────────── Файлы ───────────────────────────

/** Как saveUpload: картинки в WebP не шире 1920, без EXIF; повтор — тот же файл. */
async function store(tenantId: string, file: string, origName: string, alt?: { kk: string; ru: string }) {
  const input = await fs.readFile(path.join(ASSETS!, file));
  const isPdf = file.endsWith('.pdf');
  let output: Buffer = input;
  let width: number | null = null;
  let height: number | null = null;

  if (!isPdf) {
    output = await sharp(input).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const meta = await sharp(output).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  }

  const sha256 = createHash('sha256').update(output).digest('hex');
  const existing = await prisma.media.findUnique({ where: { tenantId_sha256: { tenantId, sha256 } } });
  if (existing) return existing;

  const ext = isPdf ? 'pdf' : 'webp';
  const relative = path.join(tenantId, sha256.slice(0, 2), `${sha256}.${ext}`);
  await fs.mkdir(path.dirname(path.join(STORAGE, relative)), { recursive: true });
  await fs.writeFile(path.join(STORAGE, relative), output);

  return prisma.media.create({
    data: {
      tenantId,
      path: relative,
      origName,
      mime: isPdf ? 'application/pdf' : 'image/webp',
      size: output.length,
      width,
      height,
      sha256,
      altKk: alt?.kk ?? null,
      altRu: alt?.ru ?? null,
    },
  });
}

const img = (tenantId: string, id: string, alt: { kk: string; ru: string }) =>
  store(tenantId, `img/${id}.png`, `${id}.webp`, alt);

// ─────────────────────────── Тексты ───────────────────────────

const PROFILE = {
  nameKk: '«Балапан» бөбекжайы',
  nameRu: 'Ясли-сад «Балапан»',
  shortNameKk: 'Балапан',
  shortNameRu: 'Балапан',
  kind: 'NURSERY_GARDEN' as const,
  isPrivate: false,
  bin: '000000000000',
  licenseNo: 'KZ00LAA00000000',
  addressKk: 'Ақтөбе қ., Мәметова к-сі, 1 (демо-мекенжай)',
  addressRu: 'г. Актобе, ул. Маметовой, 1 (демо-адрес)',
  district: 'Астана',
  lat: 50.28392,
  lng: 57.16674,
  phone: '+7 (7132) 00-00-00',
  email: 'demo@edusad.kz',
  workHours: 'Пн–Пт, 07:30–18:30',
  headNameKk: 'Сәрсенова Айгерім Болатқызы',
  headNameRu: 'Сарсенова Айгерим Болатовна',
  groupsCount: 6,
  placesTotal: 150,
  placesFree: 6,
  aboutKk:
    '«Балапан» — алты топқа арналған заманауи бөбекжай. Балалар қазақ және орыс тілдерінде тәрбиеленеді, күн сайын серуендейді, музыка, спорт және шығармашылықпен айналысады.',
  aboutRu:
    '«Балапан» — современный ясли-сад на шесть групп. Дети воспитываются на казахском и русском языках, каждый день гуляют, занимаются музыкой, спортом и творчеством.',
  whatsapp: '+7 (700) 000-00-00',
  instagram: 'https://instagram.com/edusad.kz',
  headerTaglineKk: 'Ақтөбе қаласы · 2019 жылдан бері',
  headerTaglineRu: 'г. Актобе · с 2019 года',
  headerCtaTextKk: 'Экскурсияға жазылу',
  headerCtaTextRu: 'Записаться на экскурсию',
  headerCtaUrl: '/feedback',
  headerShowPhone: true,
  heroEyebrowKk: 'Бөбекжай · 1 жастан 6 жасқа дейін',
  heroEyebrowRu: 'Ясли-сад · от 1 года до 6 лет',
  heroTitleKk: 'Балалар қуанып келетін',
  heroTitleRu: 'Сад, в который',
  heroHighlightKk: 'екінші үй',
  heroHighlightRu: 'дети бегут с радостью',
  heroLeadKk:
    'Екі тілде тәрбие, күніне төрт рет тамақ, музыка мен спорт, тәжірибелі педагогтар. Ата-аналар үшін бәрі сайтта: мәзір, жаңалықтар, құжаттар.',
  heroLeadRu:
    'Воспитание на двух языках, четырёхразовое питание, музыка и спорт, опытные педагоги. Для родителей всё на сайте: меню, новости и документы.',
  heroCta1TextKk: 'Экскурсияға жазылу',
  heroCta1TextRu: 'Записаться на экскурсию',
  heroCta1Url: '/feedback',
  heroCta2TextKk: 'Біздің топтар',
  heroCta2TextRu: 'Наши группы',
  heroCta2Url: '/groups',
  noticeKk: 'Бұл — EduSad демо-сайты: бөбекжай мен барлық деректер ойдан шығарылған. Өз сайтыңызды edusad.kz сайтында қосыңыз.',
  noticeRu: 'Это демонстрационный сайт EduSad: ясли-сад и все данные вымышлены. Подключить такой сайт своему саду — на edusad.kz.',
};

const ABOUT_RU = `
<p>Ясли-сад «Балапан» открылся в 2019 году. Сегодня у нас шесть групп — от ясельной до предшкольной, 150 детей и 24 сотрудника.</p>
<h2>Наши принципы</h2>
<ul>
<li><strong>Два языка с первого дня.</strong> Группы с казахским и русским языком обучения, праздники и песни — на обоих.</li>
<li><strong>Здоровье.</strong> Зарядка, прогулки два раза в день, спортивный зал и медицинский кабинет.</li>
<li><strong>Национальная культура.</strong> Домбра, тоғызқұмалақ, Наурыз и «Тіл мерекесі» — часть жизни сада, а не разовое событие.</li>
<li><strong>Открытость.</strong> Меню, приказы и отчёты публикуем на сайте, на вопросы родителей отвечаем в течение дня.</li>
</ul>
<h2>Что у нас есть</h2>
<table><thead><tr><th>Помещение</th><th>Для чего</th></tr></thead><tbody>
<tr><td>6 групповых комнат</td><td>Игровая, спальня и умывальная у каждой группы</td></tr>
<tr><td>Музыкальный зал</td><td>Утренники, занятия музыкой и хореографией</td></tr>
<tr><td>Спортивный зал</td><td>Физкультура, эстафеты, «Весёлые старты»</td></tr>
<tr><td>Кабинет психолога и логопеда</td><td>Индивидуальные занятия</td></tr>
<tr><td>Медицинский кабинет</td><td>Медсестра на месте весь день</td></tr>
</tbody></table>
<blockquote>«Балапан» по-казахски — птенец. Мы помогаем малышам окрепнуть, прежде чем они полетят в школу.</blockquote>`;

const ABOUT_KK = `
<p>«Балапан» бөбекжайы 2019 жылы ашылды. Бүгін бізде бөбекжай тобынан мектепалды тобына дейін алты топ, 150 бала және 24 қызметкер бар.</p>
<h2>Біздің қағидаттарымыз</h2>
<ul>
<li><strong>Алғашқы күннен екі тіл.</strong> Қазақ және орыс тілінде оқытатын топтар, мерекелер мен әндер — екі тілде де.</li>
<li><strong>Денсаулық.</strong> Таңғы жаттығу, күніне екі рет серуен, спорт залы мен медициналық кабинет.</li>
<li><strong>Ұлттық мәдениет.</strong> Домбыра, тоғызқұмалақ, Наурыз бен «Тіл мерекесі» — бөбекжай өмірінің бір бөлігі.</li>
<li><strong>Ашықтық.</strong> Мәзірді, бұйрықтар мен есептерді сайтта жариялаймыз, ата-аналардың сұрақтарына бір күн ішінде жауап береміз.</li>
</ul>
<h2>Бізде не бар</h2>
<table><thead><tr><th>Бөлме</th><th>Не үшін</th></tr></thead><tbody>
<tr><td>6 топ бөлмесі</td><td>Әр топта ойын бөлмесі, жатын бөлме және жуынатын бөлме</td></tr>
<tr><td>Музыка залы</td><td>Ертеңгіліктер, музыка және хореография сабақтары</td></tr>
<tr><td>Спорт залы</td><td>Дене шынықтыру, эстафеталар, «Көңілді старттар»</td></tr>
<tr><td>Психолог пен логопед кабинеті</td><td>Жеке сабақтар</td></tr>
<tr><td>Медициналық кабинет</td><td>Мейірбике күні бойы орнында</td></tr>
</tbody></table>
<blockquote>«Балапан» — құстың балапаны. Біз балаларға мектепке ұшар алдында қанаттарын нығайтуға көмектесеміз.</blockquote>`;

const PARENTS_RU = `
<h2>Как попасть в наш сад</h2>
<p>Очередь в государственные детские сады ведёт портал <a href="https://darabala.kz">Darabala.kz</a>. Понадобятся ИИН ребёнка и ЭЦП одного из родителей. Когда подойдёт очередь, придёт направление — с ним приходите к нам.</p>
<h2>Документы для зачисления</h2>
<ul>
<li>Направление с портала Darabala.kz</li>
<li>Свидетельство о рождении ребёнка (копия)</li>
<li>Медицинская карта ребёнка (форма 026/у) и паспорт прививок</li>
<li>Удостоверение личности одного из родителей</li>
</ul>
<h2>Первые дни: адаптация</h2>
<p>Первую неделю ребёнок остаётся в саду на 2–3 часа, затем до обеда и только потом — на полный день. Принесите любимую игрушку: с ней привыкать спокойнее.</p>
<h2>Что взять с собой</h2>
<ul><li>Сменную обувь с застёжкой</li><li>Запасной комплект одежды</li><li>Форму для физкультуры и чешки</li><li>Расчёску и бумажные салфетки</li></ul>`;

const PARENTS_KK = `
<h2>Бөбекжайға қалай түсуге болады</h2>
<p>Мемлекеттік балабақшаларға кезекті <a href="https://darabala.kz">Darabala.kz</a> порталы жүргізеді. Баланың ЖСН-і мен ата-ананың бірінің ЭЦҚ-сы қажет. Кезек келгенде жолдама келеді — сонымен бізге келіңіз.</p>
<h2>Қабылдауға қажетті құжаттар</h2>
<ul>
<li>Darabala.kz порталынан жолдама</li>
<li>Баланың туу туралы куәлігі (көшірмесі)</li>
<li>Баланың медициналық картасы (026/е нысаны) және екпе паспорты</li>
<li>Ата-ананың бірінің жеке куәлігі</li>
</ul>
<h2>Алғашқы күндер: бейімделу</h2>
<p>Бірінші аптада бала бөбекжайда 2–3 сағат болады, кейін түскі асқа дейін, содан соң ғана толық күн. Сүйікті ойыншығын әкеліңіз — онымен үйрену жеңілірек.</p>
<h2>Өзіңізбен не алу керек</h2>
<ul><li>Жабысқақ ауыстыратын аяқ киім</li><li>Қосалқы киім жиынтығы</li><li>Дене шынықтыру формасы мен чешки</li><li>Тарақ пен қағаз майлықтар</li></ul>`;

const ROUTINE = [
  ['07:30–08:30', 'Балаларды қабылдау, таңғы жаттығу', 'Приём детей, утренняя гимнастика'],
  ['08:40–09:10', 'Таңғы ас', 'Завтрак'],
  ['09:15–10:30', 'Ұйымдастырылған оқу іс-әрекеті', 'Организованная учебная деятельность'],
  ['10:30–10:45', 'Екінші таңғы ас: жеміс, шырын', 'Второй завтрак: фрукты, сок'],
  ['10:45–12:15', 'Серуен', 'Прогулка'],
  ['12:30–13:00', 'Түскі ас', 'Обед'],
  ['13:00–15:00', 'Күндізгі ұйқы', 'Дневной сон'],
  ['15:00–15:30', 'Сергіту жаттығулары, бесін ас', 'Гимнастика пробуждения, полдник'],
  ['15:30–16:30', 'Үйірмелер, ойындар', 'Кружки, игры'],
  ['16:30–17:00', 'Кешкі ас', 'Ужин'],
  ['17:00–18:30', 'Серуен, балаларды үйге қайтару', 'Прогулка, уход детей домой'],
];
const routineTable = (lang: 'kk' | 'ru') =>
  `<p>${lang === 'kk' ? 'Ересек және мектепалды топтарының күн тәртібі. Бөбекжай тобында ұйқы ұзағырақ.' : 'Режим дня старшей и предшкольной групп. В ясельной группе сон длиннее.'}</p>` +
  `<table><thead><tr><th>${lang === 'kk' ? 'Уақыты' : 'Время'}</th><th>${lang === 'kk' ? 'Не болады' : 'Что происходит'}</th></tr></thead><tbody>` +
  ROUTINE.map(([t, kk, ru]) => `<tr><td>${t}</td><td>${lang === 'kk' ? kk : ru}</td></tr>`).join('') +
  '</tbody></table>';

const TRUSTEE_RU = `<p>Попечительский совет помогает саду с развитием материальной базы и общественным контролем за питанием. В совет входят родители и представители общественности.</p>
<h2>Состав совета</h2><ul><li>Жумабаев Ерлан — председатель, родитель воспитанника</li><li>Иванова Ольга — секретарь, родитель воспитанника</li><li>Касымова Сауле — представитель общественности</li></ul>
<h2>Заседания</h2><p>Раз в квартал. Ближайшее — 15 октября в 18:00 в музыкальном зале.</p>`;
const TRUSTEE_KK = `<p>Қамқоршылық кеңес бөбекжайдың материалдық базасын дамытуға және тамақтануды қоғамдық бақылауға көмектеседі. Кеңес құрамына ата-аналар мен қоғам өкілдері кіреді.</p>
<h2>Кеңес құрамы</h2><ul><li>Жұмабаев Ерлан — төраға, тәрбиеленушінің ата-анасы</li><li>Иванова Ольга — хатшы, тәрбиеленушінің ата-анасы</li><li>Қасымова Сәуле — қоғам өкілі</li></ul>
<h2>Отырыстар</h2><p>Тоқсанына бір рет. Келесісі — 15 қазанда сағат 18:00-де музыка залында.</p>`;
const ANTI_RU = `<p>Ясли-сад «Балапан» придерживается принципа нулевой терпимости к коррупции. Приём детей идёт только по направлению с портала Darabala.kz — никаких «взносов» за место.</p>
<p>О фактах коррупции сообщите через <a href="/feedback">виртуальную приёмную</a> или по телефону доверия <strong>1424</strong> (бесплатно).</p>`;
const ANTI_KK = `<p>«Балапан» бөбекжайы сыбайлас жемқорлыққа мүлдем төзбеушілік қағидатын ұстанады. Балалар тек Darabala.kz порталындағы жолдама бойынша қабылданады — орын үшін ешқандай «жарна» жоқ.</p>
<p>Сыбайлас жемқорлық фактілері туралы <a href="/feedback">виртуалды қабылдау</a> арқылы немесе <strong>1424</strong> сенім телефоны бойынша хабарлаңыз (тегін).</p>`;

type PostSeed = {
  slug: string; section: 'news' | 'announcements'; days: number; pinned?: boolean; cover?: string;
  titleKk: string; titleRu: string; excerptKk: string; excerptRu: string; bodyKk: string; bodyRu: string;
};

const POSTS: PostSeed[] = [
  {
    slug: 'til-merekesi-2026', section: 'news', days: 2, pinned: true, cover: 'demo-n-til',
    titleKk: 'Тіл мерекесі: балалар өлең оқып, ән салды', titleRu: 'Праздник языков: стихи, песни и национальные костюмы',
    excerptKk: '22 қыркүйекте Қазақстан халқының тілдері күніне арналған мереке өтті.',
    excerptRu: '22 сентября прошёл праздник, посвящённый Дню языков народа Казахстана.',
    bodyKk: '<p>22 қыркүйекте музыка залында Қазақстан халқының тілдері күніне арналған мереке өтті. «Күншуақ» және «Білімпаз» топтарының балалары Абай мен Жамбылдың өлеңдерін оқыды, ұлттық киім киіп, «Қара жорға» биін биледі.</p><p>Ата-аналарға мерекеге дайындыққа көмектескені үшін алғыс айтамыз!</p>',
    bodyRu: '<p>22 сентября в музыкальном зале прошёл праздник, посвящённый Дню языков народа Казахстана. Дети групп «Күншуақ» и «Білімпаз» читали стихи Абая и Жамбыла, надели национальные костюмы и станцевали «Қара жорға».</p><p>Спасибо родителям за помощь в подготовке костюмов!</p>',
  },
  {
    slug: 'master-klass-dlya-roditeley', section: 'news', days: 12, cover: 'demo-n-masterclass',
    titleKk: 'Ата-аналарға арналған шеберлік сабағы', titleRu: 'Мастер-класс для родителей: лепим вместе',
    excerptKk: 'Ата-аналар балаларымен бірге саздан бұйымдар жасады.',
    excerptRu: 'Родители и дети вместе лепили из глины и мастерили поделки к осенней выставке.',
    bodyKk: '<p>«Гүлдер» тобында ата-аналар мен балалар бірге саздан ыдыстар мен жануарлар жасады. Ең сәтті жұмыстар күзгі көрмеге қойылады.</p>',
    bodyRu: '<p>В группе «Гүлдер» родители и дети вместе лепили из глины посуду и фигурки животных. Лучшие работы попадут на осеннюю выставку в холле сада.</p><p>Следующий мастер-класс — в ноябре, тема — новогодние игрушки своими руками.</p>',
  },
  {
    slug: 'bilim-kuni-2026', section: 'news', days: 23, cover: 'demo-n-bilim',
    titleKk: 'Білім күні: жаңа оқу жылы басталды', titleRu: 'День знаний: начался новый учебный год',
    excerptKk: '1 қыркүйекте бөбекжайға 32 жаңа бала келді.',
    excerptRu: '1 сентября в сад пришли 32 новых воспитанника — встретили их шарами и песнями.',
    bodyKk: '<p>1 қыркүйекте бөбекжай ауласында салтанатты жиын өтті. Мектепалды тобының балалары жаңадан келгендерге ән арнады, ал меңгеруші Айгерім Болатқызы ата-аналарды жаңа оқу жылымен құттықтады.</p>',
    bodyRu: '<p>1 сентября во дворе сада прошла торжественная линейка. Дети предшкольной группы спели песню для новичков, а заведующая Айгерим Болатовна поздравила родителей с началом учебного года.</p><p>В этом году к нам пришли 32 новых воспитанника, а группа «Бөбек» открылась после ремонта.</p>',
  },
  {
    slug: 'sport-merekesi', section: 'news', days: 48, cover: 'demo-n-sport',
    titleKk: '«Анам, әкем және мен — спорттық отбасы»', titleRu: '«Папа, мама, я — спортивная семья»',
    excerptKk: 'Спорт залында отбасылар арасында эстафета өтті.',
    excerptRu: 'В спортивном зале семьи соревновались в эстафетах — победила дружба.',
    bodyKk: '<p>Дене шынықтыру нұсқаушысы Арман Серікұлы отбасылық эстафета ұйымдастырды: құрсаулармен жүгіру, доп лақтыру, кедергілерден өту. Барлық командалар медаль алды.</p>',
    bodyRu: '<p>Инструктор по физкультуре Арман Серикович провёл семейную эстафету: бег с обручами, броски мяча, полоса препятствий. Все команды получили медали, а самые маленькие болельщики — воздушные шары.</p>',
  },
  {
    slug: 'ekskursiya-v-pozharnuyu-chast', section: 'news', days: 69, cover: 'demo-n-fire',
    titleKk: 'Өрт сөндіру бөліміне саяхат', titleRu: 'Экскурсия в пожарную часть',
    excerptKk: 'Балалар өрт сөндіру көлігін көріп, қауіпсіздік ережелерін үйренді.',
    excerptRu: 'Дети увидели настоящую пожарную машину и выучили правила безопасности.',
    bodyKk: '<p>«Күншуақ» тобы өрт сөндіру бөлімінде болды. Өрт сөндірушілер көлікті көрсетіп, өрт шықса не істеу керектігін түсіндірді.</p>',
    bodyRu: '<p>Старшая группа «Күншуақ» побывала в пожарной части. Пожарные показали машину и снаряжение и объяснили, что делать, если случился пожар: не прятаться, звать взрослых и звонить 101.</p>',
  },
  {
    slug: 'vypusknoy-2026', section: 'news', days: 118, cover: 'demo-n-graduation',
    titleKk: 'Қош бол, балабақша! Бітіру кеші', titleRu: 'До свидания, детский сад! Выпускной-2026',
    excerptKk: '28 түлек мектепке аттанды.',
    excerptRu: '28 выпускников отправились в школу — с песнями, дипломами и слезами родителей.',
    bodyKk: '<p>Мамыр айының соңында «Білімпаз» тобының 28 түлегі бітіру кешін өткізді. Балалар ән айтып, би биледі, ал педагогтар әр балаға диплом тапсырды.</p>',
    bodyRu: '<p>В конце мая 28 выпускников группы «Білімпаз» отметили выпускной. Дети пели и танцевали, а педагоги вручили каждому диплом и памятный альбом.</p><p>Желаем нашим выпускникам успехов в школе!</p>',
  },
  {
    slug: 'bizdin-baqsha', section: 'news', days: 131, cover: 'demo-n-garden',
    titleKk: 'Біздің бақша: балалар гүл отырғызды', titleRu: 'Наш огород: дети посадили цветы и зелень',
    excerptKk: 'Аулада балалар өз бақшасын жасады.',
    excerptRu: 'Во дворе появились грядки, за которыми дети ухаживают всё лето.',
    bodyKk: '<p>Көктемде әр топ өз бақшасын отырғызды: қызғалдақ, аскөк, жуа. Балалар күн сайын гүлдерді суарып, өсуін бақылайды.</p>',
    bodyRu: '<p>Весной каждая группа посадила свою грядку: тюльпаны, укроп и лук. Дети каждый день поливают растения и ведут дневник наблюдений.</p>',
  },
  {
    slug: 'nauryz-2026', section: 'news', days: 187, cover: 'demo-n-nauryz',
    titleKk: 'Наурыз мейрамы құтты болсын!', titleRu: 'Наурыз мейрамы в «Балапане»',
    excerptKk: 'Балалар ұлттық киіммен дастархан басында жиналды.',
    excerptRu: 'Дети в национальных костюмах, баурсаки и наурыз-коже — праздник весны.',
    bodyKk: '<p>21 наурызда бөбекжайда Наурыз мейрамы тойланды. Балалар ұлттық ойындар ойнап, наурыз көже дәм татты.</p>',
    bodyRu: '<p>21 марта в саду отметили Наурыз. Дети играли в национальные игры, пробовали наурыз-коже и баурсаки, а музыкальный руководитель Дәурен Маратович сыграл на домбре.</p>',
  },
  {
    slug: 'roditelskoe-sobranie-oktyabr', section: 'announcements', days: 1, pinned: true,
    titleKk: 'Ата-аналар жиналысы — 30 қыркүйек, 18:00', titleRu: 'Родительское собрание — 30 сентября в 18:00',
    excerptKk: 'Музыка залында барлық топтардың ата-аналарын күтеміз.',
    excerptRu: 'Ждём родителей всех групп в музыкальном зале.',
    bodyKk: '<p>Күн тәртібі: жаңа оқу жылының жоспары, күзгі ертеңгілік, тамақтану мәселелері.</p>',
    bodyRu: '<p>Повестка: план на учебный год, осенний утренник «Алтын күз», вопросы питания. Продолжительность — около часа.</p>',
  },
  {
    slug: 'altyn-kuz-utrennik', section: 'announcements', days: 3,
    titleKk: '«Алтын күз» ертеңгілігі — 10 қазан', titleRu: 'Осенний утренник «Алтын күз» — 10 октября',
    excerptKk: 'Барлық топтарда күзгі мерекелер өтеді.',
    excerptRu: 'Во всех группах пройдут осенние праздники. Расписание — у воспитателей.',
    bodyKk: '<p>Балаларға күзгі түстегі киім дайындауды сұраймыз. Ата-аналар ертеңгілікке шақырылады.</p>',
    bodyRu: '<p>Просим подготовить детям одежду в осенних цветах. Родители приглашаются на утренники своей группы.</p>',
  },
  {
    slug: 'svobodnye-mesta-bobek', section: 'announcements', days: 10,
    titleKk: '«Бөбек» тобында бос орындар бар', titleRu: 'В ясельной группе «Бөбек» есть свободные места',
    excerptKk: '1–2 жастағы балалар үшін 3 орын.',
    excerptRu: 'Три места для детей 1–2 лет. Направление — через Darabala.kz.',
    bodyKk: '<p>Жолдаманы Darabala.kz порталы арқылы алуға болады. Сұрақтар бойынша виртуалды қабылдауға жазыңыз.</p>',
    bodyRu: '<p>Направление оформляется на портале Darabala.kz. Вопросы можно задать через виртуальную приёмную.</p>',
  },
];

const STAFF = [
  { fullName: 'Сәрсенова Айгерім Болатқызы', positionKk: 'Меңгеруші', positionRu: 'Заведующая', educationKk: 'Жоғары педагогикалық, Қ. Жұбанов атындағы АӨУ', educationRu: 'Высшее педагогическое, АРУ им. К. Жубанова', experience: '24 года', categoryName: 'Педагог-исследователь', photo: 'demo-s-head' },
  { fullName: 'Қайратқызы Динара', positionKk: 'Әдіскер', positionRu: 'Методист', educationKk: 'Жоғары педагогикалық', educationRu: 'Высшее педагогическое', experience: '15 лет', categoryName: 'Педагог-эксперт', photo: 'demo-s-method' },
  { fullName: 'Нұрланқызы Аружан', positionKk: 'Тәрбиеші, «Күншуақ» тобы', positionRu: 'Воспитатель группы «Күншуақ»', educationKk: 'Жоғары педагогикалық', educationRu: 'Высшее педагогическое', experience: '5 лет', categoryName: 'Педагог-модератор', photo: 'demo-s-t1' },
  { fullName: 'Ержанова Гүлмира Сейітқызы', positionKk: 'Тәрбиеші, «Гүлдер» тобы', positionRu: 'Воспитатель группы «Гүлдер»', educationKk: 'Жоғары педагогикалық', educationRu: 'Высшее педагогическое', experience: '11 лет', categoryName: 'Педагог-эксперт', photo: 'demo-s-t2' },
  { fullName: 'Тұрсынова Сәуле Әміржанқызы', positionKk: 'Тәрбиеші, «Бөбек» тобы', positionRu: 'Воспитатель группы «Бөбек»', educationKk: 'Арнаулы орта педагогикалық', educationRu: 'Среднее специальное педагогическое', experience: '18 лет', categoryName: 'Педагог-исследователь', photo: 'demo-s-t3' },
  { fullName: 'Әбілов Дәурен Маратұлы', positionKk: 'Музыка жетекшісі', positionRu: 'Музыкальный руководитель', educationKk: 'Жоғары, А. Жұбанов атындағы музыкалық колледж', educationRu: 'Высшее музыкальное', experience: '9 лет', categoryName: 'Педагог-модератор', photo: 'demo-s-music' },
  { fullName: 'Серікбаев Арман Серікұлы', positionKk: 'Дене шынықтыру нұсқаушысы', positionRu: 'Инструктор по физической культуре', educationKk: 'Жоғары, дене шынықтыру', educationRu: 'Высшее, физическая культура и спорт', experience: '7 лет', categoryName: 'Педагог', photo: 'demo-s-sport' },
  { fullName: 'Бекова Камила Ерланқызы', positionKk: 'Педагог-психолог', positionRu: 'Педагог-психолог', educationKk: 'Жоғары, психология', educationRu: 'Высшее, психология', experience: '6 лет', categoryName: 'Педагог-модератор', photo: 'demo-s-psy' },
];

const GROUPS = [
  { nameKk: '«Бөбек» бөбекжай тобы', nameRu: 'Ясельная группа «Бөбек»', ageFrom: 12, ageTo: 24, language: 'kk', teachers: 'Тұрсынова С. Ә.', placesTotal: 20, placesFree: 3 },
  { nameKk: '«Құлыншақ» кіші тобы', nameRu: 'Младшая группа «Құлыншақ»', ageFrom: 24, ageTo: 36, language: 'kk', teachers: 'Сейітова А. Н.', placesTotal: 25, placesFree: 1 },
  { nameKk: '«Гүлдер» ортаңғы тобы', nameRu: 'Средняя группа «Гүлдер»', ageFrom: 36, ageTo: 48, language: 'kk', teachers: 'Ержанова Г. С.', placesTotal: 25, placesFree: 0 },
  { nameKk: '«Жұлдыз» ортаңғы тобы', nameRu: 'Средняя группа «Жұлдыз»', ageFrom: 36, ageTo: 48, language: 'ru', teachers: 'Петрова Е. В.', placesTotal: 25, placesFree: 2 },
  { nameKk: '«Күншуақ» ересек тобы', nameRu: 'Старшая группа «Күншуақ»', ageFrom: 48, ageTo: 60, language: 'kk', teachers: 'Нұрланқызы А.', placesTotal: 25, placesFree: 0 },
  { nameKk: '«Білімпаз» мектепалды тобы', nameRu: 'Предшкольная группа «Білімпаз»', ageFrom: 60, ageTo: 72, language: 'ru', teachers: 'Ахметова Л. К.', placesTotal: 30, placesFree: 0 },
];

const CLUBS = [
  { nameKk: 'Домбыра', nameRu: 'Домбра', descKk: 'Ұлттық аспапта ойнауды үйрену, күйлер тыңдау.', descRu: 'Учимся играть на национальном инструменте и слушаем кюи.', teacher: 'Әбілов Д. М.', schedule: 'Сс, Бс — 16:00 / Вт, Чт — 16:00', ageRange: 'от 5 лет', priceKzt: 7000 },
  { nameKk: 'Ағылшын тілі', nameRu: 'Английский язык', descKk: 'Ойын арқылы 8 баладан тұратын шағын топтарда.', descRu: 'Игровые занятия в мини-группах по 8 детей.', teacher: 'Бекова К. Е.', schedule: 'Дс, Ср — 16:00 / Пн, Ср — 16:00', ageRange: 'от 4 лет', priceKzt: 9000 },
  { nameKk: 'Тоғызқұмалақ', nameRu: 'Тогызкумалак', descKk: 'Логика мен есепке үйрететін ұлттық ойын.', descRu: 'Национальная настольная игра — развивает логику и счёт.', teacher: 'Қайратқызы Д.', schedule: 'Жм — 15:30 / Пт — 15:30', ageRange: 'от 5 лет', isFree: true },
  { nameKk: 'LEGO-робототехника', nameRu: 'LEGO-робототехника', descKk: 'Конструктор, қарапайым механизмдер, алғашқы бағдарламалар.', descRu: 'Конструирование, простые механизмы и первые программы.', teacher: 'Серікбаев А. С.', schedule: 'Сс — 16:30 / Вт — 16:30', ageRange: 'от 5 лет', priceKzt: 12000 },
  { nameKk: 'Хореография', nameRu: 'Хореография', descKk: 'Қазақ билері, ритмика, созылу жаттығулары.', descRu: 'Казахские танцы, ритмика и растяжка.', teacher: 'Әбілов Д. М.', schedule: 'Дс, Жм — 15:30 / Пн, Пт — 15:30', ageRange: 'от 3 лет', priceKzt: 6000 },
];

const FAQ = [
  ['Баланы сағат нешеде әкелу керек?', 'Во сколько приводить ребёнка?', 'Қабылдау 07:30-дан 08:30-ға дейін. Таңғы ас 08:40-та басталады.', 'Приём детей с 07:30 до 08:30. Завтрак начинается в 08:40 — лучше не опаздывать.'],
  ['Бөбекжайға қалай кезекке тұруға болады?', 'Как встать в очередь в сад?', 'Кезек Darabala.kz порталында. Баланың ЖСН-і мен ата-ананың ЭЦҚ-сы қажет.', 'Очередь ведётся на портале Darabala.kz. Понадобятся ИИН ребёнка и ЭЦП родителя.'],
  ['Бала ауырып қалса не істеу керек?', 'Что делать, если ребёнок заболел?', 'Тәрбиешіге 08:00-ге дейін хабарлаңыз. Аурудан кейін дәрігердің анықтамасы қажет.', 'Сообщите воспитателю до 08:00. После болезни нужна справка от участкового врача.'],
  ['Тамақ мәзірін қайдан көруге болады?', 'Где посмотреть меню?', 'Күн сайынғы мәзір сайттың «Ас мәзірі» бөлімінде жарияланады.', 'Меню на каждый день публикуется в разделе «Меню питания» на сайте.'],
  ['Үйірмелер ақылы ма?', 'Кружки платные?', 'Тоғызқұмалақ тегін, қалғандары — ақылы. Бағасы «Үйірмелер» бөлімінде.', 'Тогызкумалак бесплатный, остальные — платные. Цены — в разделе «Кружки и услуги».'],
  ['Баланы кім алып кете алады?', 'Кто может забирать ребёнка?', 'Ата-аналар немесе өтініште көрсетілген ересектер.', 'Родители или взрослые, указанные в заявлении. Детям до 16 лет детей не отдаём.'],
];

const MENU = [
  ['Сүтті күріш ботқасы, ірімшік қосылған нан, какао', 'Каша рисовая молочная, бутерброд с сыром, какао', 'Бұршақ сорпасы, күріш пен тауық еті, көкөніс салаты, компот', 'Суп гороховый, плов с курицей, салат из овощей, компот', 'Айран, тоқаш', 'Айран, булочка', 'Ірімшік запеканкасы, шай', 'Творожная запеканка, чай'],
  ['Омлет, нан мен май, сүт қосылған шай', 'Омлет, хлеб с маслом, чай с молоком', 'Кеспе сорпа, котлет пен картоп езбесі, қызылша салаты, шырын', 'Суп-лапша, котлета с картофельным пюре, салат из свёклы, сок', 'Кефир, печенье', 'Кефир, печенье', 'Көкөніс рагуы, шай', 'Овощное рагу, чай'],
  ['Сұлы ботқасы, банан, какао', 'Каша овсяная, банан, какао', 'Балық сорпасы, гречка мен гуляш, қияр салаты, компот', 'Уха, гречка с гуляшом, салат из огурцов, компот', 'Йогурт, алма', 'Йогурт, яблоко', 'Сырники, қаймақ, шай', 'Сырники со сметаной, чай'],
  ['Жүгері ботқасы, ірімшік, шай', 'Каша кукурузная, сыр, чай', 'Борщ, макарон мен тефтели, қырыққабат салаты, компот', 'Борщ, макароны с тефтелями, салат из капусты, компот', 'Ряженка, бауырсақ', 'Ряженка, баурсаки', 'Балық котлеті, күріш, шай', 'Рыбная котлета с рисом, чай'],
  ['Манна ботқасы, сары май қосылған нан, какао', 'Каша манная, хлеб с маслом, какао', 'Көже, тауық еті мен картоп, сәбіз салаты, шырын', 'Суп с фрикадельками, тушёная курица с картофелем, салат из моркови, сок', 'Сүт, құймақ', 'Молоко, блинчики', 'Палау, шай', 'Плов, чай'],
];

// Документы: папка → вложенные → файлы (docs/<id>.pdf)
const DOC_TREE = [
  { kk: 'Құрылтай құжаттары', ru: 'Учредительные документы', docs: [['ustav', 'Жарғы', 'Устав'], ['license', 'Білім беру қызметіне лицензия', 'Лицензия на образовательную деятельность'], ['registration', 'Мемлекеттік тіркеу туралы анықтама', 'Справка о государственной регистрации']] },
  { kk: 'Бұйрықтар', ru: 'Приказы', children: [
    { kk: '2025–2026 оқу жылы', ru: '2025–2026 учебный год', docs: [['prikaz-gruppy', 'Топтарды жасақтау туралы', 'О комплектовании групп'], ['prikaz-pitanie', 'Тамақтануды ұйымдастыру туралы', 'Об организации питания'], ['prikaz-plan', 'Жылдық жоспарды бекіту туралы', 'Об утверждении годового плана']] },
  ] },
  { kk: 'Оқу-әдістемелік жұмыс', ru: 'Учебно-методическая работа', docs: [['godovoy-plan', 'Жылдық жоспар 2025–2026', 'Годовой план 2025–2026'], ['uchebny-plan', 'Оқу жоспары', 'Учебный план']] },
  { kk: 'Өзін-өзі бағалау', ru: 'Самооценка', docs: [['samoocenka', 'Өзін-өзі бағалау есебі, 2025', 'Отчёт по самооценке, 2025']] },
  { kk: 'Тамақтану', ru: 'Питание', docs: [['menu-10', '10 күндік мәзір', 'Перспективное меню на 10 дней']] },
  { kk: 'Ата-аналарға', ru: 'Родителям', docs: [['pravila', 'Ішкі тәртіп ережесі', 'Правила внутреннего распорядка'], ['dogovor', 'Ата-анамен шарт (үлгі)', 'Договор с родителями (образец)']] },
  { kk: 'Сыбайлас жемқорлыққа қарсы іс-қимыл', ru: 'Противодействие коррупции', docs: [['anticorruption', 'Сыбайлас жемқорлыққа қарсы саясат', 'Антикоррупционная политика']] },
] as const;

const ALBUMS = [
  { slug: 'til-merekesi-2026', kk: 'Тіл мерекесі — 2026', ru: 'Праздник языков — 2026', days: 2, photos: ['demo-n-til', 'demo-g-class2', 'demo-g-reading'] },
  { slug: 'kundelikti-omir', kk: 'Біздің күндеріміз', ru: 'Будни нашего сада', days: 6, photos: ['demo-g-class1', 'demo-g-play1', 'demo-g-lab', 'demo-g-lunch', 'demo-g-sleep', 'demo-g-reading'] },
  { slug: 'kuzgi-serueen', kk: 'Күзгі серуен', ru: 'Осенняя прогулка', days: 9, photos: ['demo-g-yard', 'demo-n-garden'] },
  { slug: 'bilim-kuni-2026', kk: 'Білім күні', ru: 'День знаний', days: 23, photos: ['demo-n-bilim', 'demo-n-masterclass'] },
  { slug: 'mereke-men-sport', kk: 'Мерекелер мен спорт', ru: 'Праздники и спорт', days: 48, photos: ['demo-n-sport', 'demo-n-fire', 'demo-n-graduation', 'demo-n-nauryz'] },
];

const ALT: Record<string, [string, string]> = {
  'demo-cover': ['«Балапан» бөбекжайының ғимараты мен ойын алаңы', 'Здание ясли-сада «Балапан» и игровая площадка'],
  'demo-n-til': ['Тіл мерекесі: балалар ұлттық киіммен өлең оқуда', 'Праздник языков: дети в национальных костюмах читают стихи'],
  'demo-n-bilim': ['Білім күні: балалар шарлармен', 'День знаний: дети с шарами у входа в сад'],
  'demo-n-sport': ['Спорт залындағы эстафета', 'Эстафета в спортивном зале'],
  'demo-n-fire': ['Балалар өрт сөндіру көлігінің жанында', 'Дети у пожарной машины'],
  'demo-n-graduation': ['Бітіру кеші: түлектер дипломдарымен', 'Выпускной: дети с дипломами'],
  'demo-n-nauryz': ['Наурыз дастарханы', 'Праздничный дастархан на Наурыз'],
  'demo-n-masterclass': ['Ата-аналар мен балалар саздан бұйым жасауда', 'Родители и дети лепят из глины'],
  'demo-n-garden': ['Балалар бақшада гүл отырғызуда', 'Дети сажают цветы на грядке'],
  'demo-g-class1': ['Сурет салу сабағы', 'Занятие рисованием'],
  'demo-g-class2': ['Музыка сабағы', 'Музыкальное занятие'],
  'demo-g-play1': ['Балалар кубиктерден мұнара салуда', 'Дети строят башню из кубиков'],
  'demo-g-yard': ['Күзгі серуен', 'Осенняя прогулка во дворе'],
  'demo-g-lunch': ['Түскі ас', 'Обед в группе'],
  'demo-g-sleep': ['Жатын бөлме', 'Спальня группы'],
  'demo-g-reading': ['Тәрбиеші кітап оқып береді', 'Воспитатель читает детям книгу'],
  'demo-g-lab': ['Эксперимент бұрышы', 'Уголок экспериментов'],
};
const altOf = (id: string) => ({ kk: ALT[id]?.[0] ?? '', ru: ALT[id]?.[1] ?? '' });

// ─────────────────────────── Сборка ───────────────────────────

async function main() {
  if (!ASSETS) throw new Error('Укажите папку с файлами: pnpm tsx scripts/create-demo-site.ts <папка>');
  const host = `${SLUG}.${PORTAL_DOMAIN}`;

  const existing = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  if (existing) {
    if (!existing.isDemo) throw new Error(`Адрес ${host} занят настоящим садом — скрипт его не тронет.`);
    if (!RESET) throw new Error(`Демо-сад уже есть. Пересоздать: --reset.`);
    await prisma.tenant.delete({ where: { id: existing.id } });
    await fs.rm(path.join(STORAGE, existing.id), { recursive: true, force: true });
    console.log('Прежний демо-сад удалён.');
  }

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setFullYear(periodEnd.getFullYear() + 10);

  const tenant = await prisma.tenant.create({
    data: {
      slug: SLUG,
      status: 'ACTIVE',
      isDemo: true,
      templateCode: 'zhuldyz',
      palette: 'night',
      pattern: 'stars',
      fontPair: 'friendly',
      shape: 'round',
      headerStyle: 'light',
      headerLayout: 'floating',
      defaultLocale: 'kk',
      profile: { create: PROFILE },
      domains: {
        // Дополнительный адрес — для проверки на своей машине (demo.localhost
        // открывается без правки hosts). Он становится основным, иначе сайт
        // перенаправлял бы на demo.<домен портала>, которого локально нет.
        create: [
          { host, type: 'SUBDOMAIN', isPrimary: !EXTRA_HOST, certStatus: 'ACTIVE', verifiedAt: new Date() },
          ...(EXTRA_HOST ? [{ host: EXTRA_HOST, type: 'CUSTOM' as const, isPrimary: true, certStatus: 'ACTIVE' as const, verifiedAt: new Date() }] : []),
        ],
      },
      users: {
        create: {
          login: 'demo-admin',
          // Пароль никто не знает: вход только «Войти как сад» из портала.
          passwordHash: await hash(randomBytes(32).toString('hex'), { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
          fullName: 'Сарсенова Айгерим Болатовна',
          role: 'TENANT_ADMIN',
          mustChangePassword: false,
        },
      },
      subscriptions: {
        create: { periodStart, periodEnd, amount: 0, plan: 'MANAGED', isCurrent: true, note: 'Демо-сад EduSad, не оплачивается' },
      },
    },
  });
  const tenantId = tenant.id;
  console.log(`Сад создан: ${tenantId}`);

  // Разделы: все из каталога, в порядке, в каком их читает родитель.
  const ORDER = ['about', 'news', 'announcements', 'groups', 'staff', 'gallery', 'menu', 'daily-routine', 'clubs', 'parents', 'documents', 'vacancies', 'faq', 'trustee', 'anticorruption', 'feedback', 'contacts'];
  const catalog = ORDER.map((slug) => SECTION_CATALOG.find((s) => s.slug === slug)!).filter(Boolean);
  await prisma.section.createMany({
    data: catalog.map((s, position) => ({ tenantId, type: s.type as SectionType, slug: s.slug, titleKk: s.titleKk, titleRu: s.titleRu, position })),
  });
  const sections = await prisma.section.findMany({ where: { tenantId } });
  const sectionId = (slug: string) => sections.find((s) => s.slug === slug)!.id;

  // Текстовые страницы
  const PAGES: Record<string, [string, string]> = {
    about: [ABOUT_KK, ABOUT_RU],
    parents: [PARENTS_KK, PARENTS_RU],
    'daily-routine': [routineTable('kk'), routineTable('ru')],
    trustee: [TRUSTEE_KK, TRUSTEE_RU],
    anticorruption: [ANTI_KK, ANTI_RU],
  };
  for (const [slug, [kk, ru]] of Object.entries(PAGES)) {
    await prisma.page.create({ data: { tenantId, sectionId: sectionId(slug), bodyKk: sanitizeContent(kk), bodyRu: sanitizeContent(ru) } });
  }

  // Знак, обложка
  const logo = await store(tenantId, 'img/logo.png', 'balapan-logo.webp', { kk: '«Балапан» белгісі', ru: 'Знак «Балапан»' });
  const cover = await img(tenantId, 'demo-cover', altOf('demo-cover'));
  await prisma.tenantProfile.update({
    where: { tenantId },
    data: { logoMediaId: logo.id, coverMediaId: cover.id, coverFocus: 'center', noticeTone: 'INFO', noticeUntil: new Date(Date.UTC(2099, 0, 1)) },
  });

  // Новости и объявления
  for (const p of POSTS) {
    const coverMedia = p.cover ? await img(tenantId, p.cover, altOf(p.cover)) : null;
    await prisma.post.create({
      data: {
        tenantId,
        sectionId: sectionId(p.section),
        slug: p.slug,
        titleKk: p.titleKk,
        titleRu: p.titleRu,
        excerptKk: p.excerptKk,
        excerptRu: p.excerptRu,
        bodyKk: sanitizeContent(p.bodyKk),
        bodyRu: sanitizeContent(p.bodyRu),
        coverMediaId: coverMedia?.id ?? null,
        status: 'PUBLISHED',
        publishedAt: ago(p.days),
        isPinned: p.pinned ?? false,
        viewCount: Math.round(40 + Math.random() * 260),
      },
    });
  }

  // Фотогалерея
  for (const [position, a] of ALBUMS.entries()) {
    const album = await prisma.album.create({
      data: { tenantId, slug: a.slug, titleKk: a.kk, titleRu: a.ru, takenOn: ago(a.days), position },
    });
    for (const [i, id] of a.photos.entries()) {
      const media = await img(tenantId, id, altOf(id));
      await prisma.albumItem.create({ data: { albumId: album.id, mediaId: media.id, position: i } });
    }
  }

  // Педагоги
  for (const [position, s] of STAFF.entries()) {
    const photo = await img(tenantId, s.photo, { kk: s.fullName, ru: s.fullName });
    const { photo: _photo, ...fields } = s;
    await prisma.staffMember.create({ data: { tenantId, ...fields, photoMediaId: photo.id, position } });
  }

  await prisma.group.createMany({ data: GROUPS.map((g, position) => ({ tenantId, ...g, position })) });

  // Кружки: расписание в данных одно, по-русски после « / »
  await prisma.club.createMany({
    data: CLUBS.map((c, position) => ({
      tenantId, nameKk: c.nameKk, nameRu: c.nameRu, descKk: c.descKk, descRu: c.descRu, teacher: c.teacher,
      schedule: c.schedule.split(' / ')[1] ?? c.schedule, ageRange: c.ageRange,
      priceKzt: 'priceKzt' in c ? c.priceKzt : null, isFree: 'isFree' in c ? c.isFree : false, position,
    })),
  });

  await prisma.faqItem.createMany({
    data: FAQ.map(([questionKk, questionRu, answerKk, answerRu], position) => ({ tenantId, questionKk, questionRu, answerKk, answerRu, position })),
  });

  // Меню: эта и следующая рабочие недели
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  for (let week = 0; week < 2; week++) {
    for (let d = 0; d < 5; d++) {
      const m = MENU[(d + week * 2) % MENU.length]!;
      const date = new Date(monday.getTime() + (week * 7 + d) * DAY);
      await prisma.menuDay.create({
        data: {
          tenantId, date,
          breakfastKk: m[0], breakfastRu: m[1], lunchKk: m[2], lunchRu: m[3],
          snackKk: m[4], snackRu: m[5], dinnerKk: m[6], dinnerRu: m[7],
        },
      });
    }
  }

  // Документы по папкам, с вложенностью
  let docPosition = 0;
  type Folder = { kk: string; ru: string; docs?: readonly (readonly [string, string, string])[]; children?: readonly Folder[] };
  const addFolder = async (f: Folder, position: number, parentId: string | null) => {
    const folder = await prisma.documentFolder.create({ data: { tenantId, titleKk: f.kk, titleRu: f.ru, position, parentId } });
    for (const [id, titleKk, titleRu] of f.docs ?? []) {
      const media = await store(tenantId, `docs/${id}.pdf`, `${id}.pdf`);
      await prisma.document.create({ data: { tenantId, titleKk, titleRu, folderId: folder.id, mediaId: media.id, position: docPosition++, publishedAt: ago(20 + docPosition * 3) } });
    }
    for (const [i, child] of (f.children ?? []).entries()) await addFolder(child, i, folder.id);
  };
  for (const [i, f] of DOC_TREE.entries()) await addFolder(f as Folder, i, null);

  // Обращения в виртуальную приёмную — видны в админке
  await prisma.feedbackMessage.createMany({
    data: [
      { tenantId, name: 'Асель', contact: '+7 (700) 111-22-33', message: 'Здравствуйте! Можно ли прийти на экскурсию в субботу?', status: 'NEW', createdAt: ago(0, 9) },
      { tenantId, name: 'Мерей', contact: 'merey@example.kz', message: 'Сәлеметсіз бе! «Бөбек» тобына қандай құжаттар керек?', status: 'ANSWERED', answer: 'Жолдама, туу туралы куәлік, 026/е картасы. Қоңырау шалып түсіндірдік.', answeredAt: ago(1, 15), createdAt: ago(2, 11) },
    ],
  });

  // Посещаемость за 90 дней: будни выше выходных, к сентябрю растёт
  const stats = Array.from({ length: 90 }, (_, i) => {
    const date = new Date(Date.now() - (89 - i) * DAY);
    date.setUTCHours(0, 0, 0, 0);
    const weekend = [0, 6].includes(date.getUTCDay());
    const base = 25 + i * 0.9;
    return { tenantId, date, views: Math.round((weekend ? base * 0.45 : base) * (0.85 + Math.random() * 0.3)) };
  });
  await prisma.dailyStat.createMany({ data: stats });

  console.log(`Готово: https://${host}${EXTRA_HOST ? ` (и http://${EXTRA_HOST})` : ''}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
