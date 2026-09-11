import 'dotenv/config';
import { PrismaClient, type TenantKind } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { DEFAULT_SECTIONS, SECTION_CATALOG } from '../src/lib/sections';
import { TEMPLATES } from '../src/lib/templates';
import { seedImage, seedPdf } from './seed-media';

const prisma = new PrismaClient();

/** Цена берётся из окружения: в текстах сайта она тоже из него, чтобы не разъезжались. */
const SUBSCRIPTION_PRICE = Number.parseInt(process.env.SUBSCRIPTION_PRICE_KZT ?? '50000', 10);

const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
const PORTAL_DOMAIN = (process.env.PORTAL_DOMAIN ?? 'bobegim.kz').toLowerCase();

/**
 * Демо-данные для локальной разработки и приёмки.
 * Пароли здесь заведомо простые — на боевом сервере сиды запускаются только
 * для создания суперадмина, а его пароль сразу меняется.
 */
const GARDENS = [
  {
    slug: 'sad12',
    nameRu: 'Ясли-сад №12 «Балдырған»',
    nameKk: '№12 «Балдырған» бөбекжайы',
    kind: 'NURSERY_GARDEN' as TenantKind,
    isPrivate: false,
    district: 'Астана',
    addressRu: 'г. Актобе, ул. Абая, 12',
    addressKk: 'Ақтөбе қ., Абай к-сі, 12',
    lat: 50.202621,
    lng: 57.286689,
    phone: '+7 (7132) 21-11-12',
    email: 'sad12@aqtobe.kz',
    template: 'klassik',
    palette: 'mandarin',
    aboutRu: 'Государственный ясли-сад работает с 1985 года. 12 групп, обучение на казахском и русском языках.',
    aboutKk: 'Мемлекеттік бөбекжай 1985 жылдан бері жұмыс істейді. 12 топ, қазақ және орыс тілдерінде оқытылады.',
  },
  {
    slug: 'kunshuaq',
    nameRu: 'Детский сад «Күншуақ»',
    nameKk: '«Күншуақ» балабақшасы',
    kind: 'PRIVATE' as TenantKind,
    isPrivate: true,
    district: 'Алматинский',
    addressRu: 'г. Актобе, пр. Санкибай батыра, 74',
    addressKk: 'Ақтөбе қ., Сәңкібай батыр д-лы, 74',
    lat: 50.28066,
    lng: 57.154897,
    phone: '+7 (777) 512-30-30',
    email: 'info@kunshuaq.kz',
    template: 'zhuldyz',
    palette: 'mint',
    aboutRu: 'Частный детский сад полного дня с английским уклоном и собственной кухней.',
    aboutKk: 'Ағылшын тілі бағытындағы, өз асханасы бар толық күндік жеке балабақша.',
  },
  {
    slug: 'ertegi',
    nameRu: 'Мини-центр «Ертегі»',
    nameKk: '«Ертегі» шағын орталығы',
    kind: 'MINI_CENTER' as TenantKind,
    isPrivate: true,
    district: 'Нур-Актобе',
    addressRu: 'г. Актобе, ул. Молдагуловой, 45',
    addressKk: 'Ақтөбе қ., Молдағұлова к-сі, 45',
    lat: 50.288753,
    lng: 57.159056,
    phone: '+7 (705) 300-11-22',
    email: 'ertegi@mail.kz',
    template: 'ertegi',
    palette: 'berry',
    aboutRu: 'Дошкольный мини-центр на 4 группы. Подготовка к школе, логопед, музыкальные занятия.',
    aboutKk: '4 топқа арналған мектепке дейінгі шағын орталық. Мектепке дайындық, логопед, музыка сабақтары.',
  },
];

async function main() {
  console.log('Заполняем справочник шаблонов…');
  for (const template of TEMPLATES) {
    await prisma.template.upsert({
      where: { code: template.code },
      update: { nameRu: template.nameRu, nameKk: template.nameKk, description: template.descriptionRu },
      create: {
        code: template.code,
        nameRu: template.nameRu,
        nameKk: template.nameKk,
        description: template.descriptionRu,
      },
    });
  }

  const superLogin = process.env.SEED_ADMIN_LOGIN ?? 'admin';
  const superPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin-bobegim-2026';

  const superadmin = await prisma.user.upsert({
    where: { login: superLogin },
    update: {},
    create: {
      login: superLogin,
      passwordHash: await hash(superPassword, ARGON),
      fullName: 'Администратор портала',
      role: 'SUPERADMIN',
      mustChangePassword: true,
    },
  });
  console.log(`Суперадмин: ${superadmin.login} / ${superPassword}`);

  if (process.env.SEED_DEMO === 'false') {
    console.log('Демо-сады пропущены (SEED_DEMO=false).');
    return;
  }

  for (const garden of GARDENS) {
    const existing = await prisma.tenant.findUnique({ where: { slug: garden.slug } });
    if (existing) {
      console.log(`Сад ${garden.slug} уже существует — пропускаем.`);
      continue;
    }

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const tenant = await prisma.tenant.create({
      data: {
        slug: garden.slug,
        status: 'ACTIVE',
        templateCode: garden.template,
        palette: garden.palette,
        profile: {
          create: {
            nameRu: garden.nameRu,
            nameKk: garden.nameKk,
            kind: garden.kind,
            isPrivate: garden.isPrivate,
            district: garden.district,
            addressRu: garden.addressRu,
            addressKk: garden.addressKk,
            phone: garden.phone,
            email: garden.email,
            workHours: 'Пн–Пт, 07:30–18:30',
            headNameRu: 'Сериккызы Айгүл',
            headNameKk: 'Серікқызы Айгүл',
            aboutRu: garden.aboutRu,
            aboutKk: garden.aboutKk,
            groupsCount: 6,
            // Координаты у каждого сада свои: с одной точкой на всех карта
            // каталога выглядела бы исправной, оставаясь бессмысленной.
            lat: garden.lat,
            lng: garden.lng,
            whatsapp: garden.phone,
            instagram: `https://instagram.com/${garden.slug}`,
          },
        },
        domains: {
          create: {
            host: `${garden.slug}.${PORTAL_DOMAIN}`,
            type: 'SUBDOMAIN',
            isPrimary: true,
            certStatus: 'ACTIVE',
            verifiedAt: new Date(),
          },
        },
        users: {
          create: {
            login: `${garden.slug}-admin`,
            passwordHash: await hash(`${garden.slug}-2026`, ARGON),
            fullName: 'Заведующая детским садом',
            role: 'TENANT_ADMIN',
            mustChangePassword: true,
          },
        },
        subscriptions: {
          create: { periodStart, periodEnd, amount: SUBSCRIPTION_PRICE, isCurrent: true },
        },
      },
    });

    // Кружки и частые вопросы по умолчанию выключены, но демо-данные для них мы
    // создаём ниже — без разделов эти данные на сайте было бы не увидеть.
    const demoSections = [
      ...DEFAULT_SECTIONS,
      ...SECTION_CATALOG.filter((section) => section.slug === 'clubs' || section.slug === 'faq'),
    ];

    await prisma.section.createMany({
      data: demoSections.map((section, index) => ({
        tenantId: tenant.id,
        type: section.type,
        slug: section.slug,
        titleKk: section.titleKk,
        titleRu: section.titleRu,
        position: index,
      })),
    });

    const sections = await prisma.section.findMany({ where: { tenantId: tenant.id } });
    const pageSections = sections.filter((s) => s.type === 'PAGE');
    await prisma.page.createMany({
      data: pageSections.map((s) => ({
        tenantId: tenant.id,
        sectionId: s.id,
        bodyRu:
          s.slug === 'about'
            ? `<p>${garden.aboutRu}</p><h2>Наши принципы</h2><ul><li>Безопасность и уход</li><li>Развитие речи на двух языках</li><li>Открытость для родителей</li></ul>`
            : '<h2>Как встать в очередь</h2><p>Очередь ведётся на портале Darabala.kz. Понадобятся ИИН ребёнка и ЭЦП.</p><h2>Что взять в сад</h2><ul><li>Сменную обувь</li><li>Форму для физкультуры</li><li>Расчёску и салфетки</li></ul>',
        bodyKk: s.slug === 'about' ? `<p>${garden.aboutKk}</p>` : '<h2>Кезекке қалай тұру керек</h2><p>Кезек Darabala.kz порталында жүргізіледі.</p>',
      })),
    });

    const newsSection = sections.find((s) => s.type === 'NEWS')!;
    const announceSection = sections.find((s) => s.type === 'ANNOUNCEMENT')!;

    await prisma.post.createMany({
      data: [
        {
          tenantId: tenant.id,
          sectionId: newsSection.id,
          slug: 'nauryz-meyramy',
          titleRu: 'Наурыз мейрамы в нашем саду',
          titleKk: 'Балабақшамыздағы Наурыз мейрамы',
          excerptRu: 'Дети всех групп подготовили концерт, а родители накрыли дастархан.',
          excerptKk: 'Барлық топ балалары концерт дайындады, ата-аналар дастархан жайды.',
          bodyRu: '<p>22 марта в нашем саду прошёл праздник Наурыз. Дети читали стихи, пели песни и играли в национальные игры.</p><p>Благодарим родителей за помощь в подготовке!</p>',
          bodyKk: '<p>22 наурызда балабақшамызда Наурыз мейрамы өтті. Балалар өлең оқып, ән айтып, ұлттық ойындар ойнады.</p>',
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - 5 * 86_400_000),
          isPinned: true,
        },
        {
          tenantId: tenant.id,
          sectionId: newsSection.id,
          slug: 'den-sauliq-kuni',
          titleRu: 'День здоровья',
          titleKk: 'Денсаулық күні',
          excerptRu: 'Зарядка на свежем воздухе, весёлые старты и беседа о правильном питании.',
          bodyRu: '<p>Утро началось с зарядки во дворе, после которой прошли весёлые старты между группами.</p>',
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - 14 * 86_400_000),
        },
        {
          tenantId: tenant.id,
          sectionId: announceSection.id,
          slug: 'roditelskoe-sobranie',
          titleRu: 'Родительское собрание 18 числа в 18:00',
          titleKk: 'Ата-аналар жиналысы 18-і күні сағат 18:00-де',
          bodyRu: '<p>Приглашаем родителей всех групп в музыкальный зал. Обсудим подготовку к выпускному.</p>',
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - 2 * 86_400_000),
        },
      ],
    });

    await prisma.staffMember.createMany({
      data: [
        {
          tenantId: tenant.id, fullName: 'Серікқызы Айгүл', positionRu: 'Заведующая', positionKk: 'Меңгеруші',
          educationRu: 'Высшее педагогическое', experience: '22 года', categoryName: 'Педагог-исследователь', position: 0,
        },
        {
          tenantId: tenant.id, fullName: 'Ахметова Гүлнар', positionRu: 'Методист', positionKk: 'Әдіскер',
          educationRu: 'Высшее педагогическое', experience: '14 лет', categoryName: 'Педагог-эксперт', position: 1,
        },
        {
          tenantId: tenant.id, fullName: 'Есенова Дана', positionRu: 'Воспитатель', positionKk: 'Тәрбиеші',
          educationRu: 'Среднее специальное', experience: '7 лет', categoryName: 'Педагог-модератор', position: 2,
        },
      ],
    });

    await prisma.group.createMany({
      data: [
        { tenantId: tenant.id, nameRu: 'Ясельная «Бөбек»', nameKk: '«Бөбек» бөбекжай тобы', ageFrom: 12, ageTo: 24, language: 'kk', placesTotal: 20, placesFree: 2, position: 0 },
        { tenantId: tenant.id, nameRu: 'Средняя «Гүлдер»', nameKk: '«Гүлдер» ортаңғы тобы', ageFrom: 36, ageTo: 48, language: 'kk', placesTotal: 25, placesFree: 0, position: 1 },
        { tenantId: tenant.id, nameRu: 'Старшая «Күншуақ»', nameKk: '«Күншуақ» ересек тобы', ageFrom: 48, ageTo: 72, language: 'ru', placesTotal: 25, placesFree: 3, position: 2 },
      ],
    });

    await prisma.tenantProfile.update({
      where: { tenantId: tenant.id },
      data: { placesFree: 5, placesTotal: 70 },
    });

    const today = new Date();
    await prisma.menuDay.create({
      data: {
        tenantId: tenant.id,
        date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
        breakfastRu: 'Каша рисовая молочная, хлеб с маслом, какао',
        breakfastKk: 'Сүтті күріш ботқасы, май жағылған нан, какао',
        lunchRu: 'Суп с фрикадельками, картофельное пюре с котлетой, компот',
        lunchKk: 'Фрикаделькалы сорпа, котлетпен картоп езбесі, компот',
        snackRu: 'Кефир, булочка',
        snackKk: 'Кефир, тоқаш',
      },
    });

    await prisma.club.createMany({
      data: [
        {
          tenantId: tenant.id, nameRu: 'Английский язык', nameKk: 'Ағылшын тілі',
          descRu: 'Игровые занятия в малых группах по 8 детей.',
          teacher: 'Ахметова Гүлнар', schedule: 'Вт, Чт — 16:00', ageRange: 'от 4 лет',
          priceKzt: 8000, position: 0,
        },
        {
          tenantId: tenant.id, nameRu: 'Хореография', nameKk: 'Хореография',
          descRu: 'Подготовка номеров к утренникам, растяжка, ритмика.',
          teacher: 'Есенова Дана', schedule: 'Пн, Ср — 15:30', ageRange: 'от 3 лет',
          priceKzt: 6000, position: 1,
        },
        {
          tenantId: tenant.id, nameRu: 'Логопед', nameKk: 'Логопед',
          descRu: 'Индивидуальные занятия по постановке звуков.',
          schedule: 'по записи', isFree: true, position: 2,
        },
      ],
    });

    await prisma.faqItem.createMany({
      data: [
        {
          tenantId: tenant.id,
          questionRu: 'Во сколько нужно привести ребёнка?',
          questionKk: 'Баланы сағат нешеде әкелу керек?',
          answerRu: 'Приём детей с 07:30 до 08:30. Завтрак в 08:40 — после этого времени ребёнок остаётся без завтрака.',
          answerKk: 'Балаларды қабылдау 07:30-дан 08:30-ға дейін.',
          position: 0,
        },
        {
          tenantId: tenant.id,
          questionRu: 'Что взять с собой в первый день?',
          questionKk: 'Бірінші күні не алып келу керек?',
          answerRu: 'Сменную обувь, форму для физкультуры, расчёску, салфетки и запасной комплект одежды.',
          position: 1,
        },
        {
          tenantId: tenant.id,
          questionRu: 'Что делать, если ребёнок заболел?',
          questionKk: 'Бала ауырып қалса не істеу керек?',
          answerRu: 'Сообщите воспитателю до 08:00. После болезни нужна справка от участкового врача.',
          position: 2,
        },
      ],
    });

    // Демонстрируем срочное объявление только у первого сада.
    if (garden.slug === 'sad12') {
      const until = new Date();
      until.setDate(until.getDate() + 10);
      await prisma.tenantProfile.update({
        where: { tenantId: tenant.id },
        data: {
          noticeRu: 'С 10 по 20 марта группа «Гүлдер» закрыта на карантин по ОРВИ.',
          noticeKk: '10-20 наурыз аралығында «Гүлдер» тобы карантинге жабылды.',
          noticeTone: 'WARN',
          noticeUntil: until,
        },
      });
    }

    // Демо-медиа: без него галерея, обложки и документы выглядят пустыми,
    // и понять, как сайт смотрится с контентом, невозможно.
    const cover = await seedImage(prisma, tenant.id, 'Наш детский сад', '#ea7a2a', '#2ea49e', 'obложka.webp');
    const photos = await Promise.all([
      seedImage(prisma, tenant.id, 'Наурыз мейрамы', '#ea7a2a', '#d69814', 'nauryz-1.webp'),
      seedImage(prisma, tenant.id, 'Концерт', '#189e96', '#307ad0', 'nauryz-2.webp'),
      seedImage(prisma, tenant.id, 'Дастархан', '#c74a76', '#ea7a2a', 'nauryz-3.webp'),
      seedImage(prisma, tenant.id, 'Ұлттық ойындар', '#4c983e', '#189e96', 'nauryz-4.webp'),
    ]);

    await prisma.tenantProfile.update({
      where: { tenantId: tenant.id },
      data: { coverMediaId: cover.id },
    });

    await prisma.post.updateMany({
      where: { tenantId: tenant.id, slug: 'nauryz-meyramy' },
      data: { coverMediaId: photos[0].id },
    });
    await prisma.post.updateMany({
      where: { tenantId: tenant.id, slug: 'den-sauliq-kuni' },
      data: { coverMediaId: photos[1].id },
    });

    const album = await prisma.album.create({
      data: {
        tenantId: tenant.id,
        slug: 'nauryz-2026',
        titleRu: 'Наурыз 2026',
        titleKk: 'Наурыз 2026',
        descRu: 'Фотографии с праздничного концерта.',
        takenOn: new Date(Date.now() - 5 * 86_400_000),
      },
    });

    await prisma.albumItem.createMany({
      data: photos.map((media, index) => ({ albumId: album.id, mediaId: media.id, position: index })),
    });

    const charter = await seedPdf(prisma, tenant.id, 'Ustav organizacii', 'ustav.pdf');
    const rules = await seedPdf(prisma, tenant.id, 'Pravila priema detey', 'pravila-priema.pdf');

    const docFolders = await Promise.all(
      [
        { titleRu: 'Учредительные документы', titleKk: 'Мекеме құжаттары' },
        { titleRu: 'Правила приёма', titleKk: 'Қабылдау қағидалары' },
      ].map((folder, position) =>
        prisma.documentFolder.create({ data: { tenantId: tenant.id, ...folder, position } }),
      ),
    );

    await prisma.document.createMany({
      data: [
        {
          tenantId: tenant.id, titleRu: 'Устав организации', titleKk: 'Ұйым жарғысы',
          folderId: docFolders[0]!.id, mediaId: charter.id, position: 0,
        },
        {
          tenantId: tenant.id, titleRu: 'Правила приёма детей', titleKk: 'Балаларды қабылдау ережелері',
          folderId: docFolders[1]!.id, mediaId: rules.id, position: 1,
        },
      ],
    });

    // Фотографии педагогов
    const staff = await prisma.staffMember.findMany({ where: { tenantId: tenant.id }, orderBy: { position: 'asc' } });
    for (const [index, member] of staff.entries()) {
      const photo = await seedImage(
        prisma, tenant.id, member.fullName, ['#ea7a2a', '#189e96', '#c74a76'][index % 3], '#307ad0',
        `staff-${index}.webp`,
      );
      await prisma.staffMember.update({ where: { id: member.id }, data: { photoMediaId: photo.id } });
    }

    await prisma.feedbackMessage.createMany({
      data: [
        {
          tenantId: tenant.id, name: 'Асель Нурлановна', contact: '+7 (777) 123-45-67',
          message: 'Здравствуйте! Подскажите, есть ли места в среднюю группу с казахским языком обучения?',
          status: 'NEW',
        },
        {
          tenantId: tenant.id, name: 'Марат', contact: 'marat@mail.kz',
          message: 'Можно ли забирать ребёнка в 16:00, а не в 18:00?',
          status: 'ANSWERED', answer: 'Позвонила 3 сентября, вопрос решён — можно.',
          answeredAt: new Date(),
        },
      ],
    });

    console.log(`Создан сад ${garden.slug} → http://${garden.slug}.${PORTAL_DOMAIN}:3000 (логин ${garden.slug}-admin / ${garden.slug}-2026)`);
  }

  await prisma.lead.createMany({
    data: [
      {
        gardenName: 'Ясли-сад №23 «Ақбота»', personName: 'Гүлмира Сериковна',
        phone: '+7 (701) 555-30-30', email: 'akbota23@mail.kz',
        comment: 'Хотим сайт до начала учебного года. Удобно звонить после 15:00.',
      },
      {
        gardenName: 'Мини-центр «Балапан»', personName: 'Айдос',
        phone: '+7 (747) 800-11-22', isHandled: true,
      },
    ],
  });

  await prisma.portalPost.upsert({
    where: { slug: 'portal-zapushchen' },
    update: {},
    create: {
      slug: 'portal-zapushchen',
      titleRu: 'Портал детских садов Актюбинской области открыт',
      titleKk: 'Ақтөбе облысы балабақшаларының порталы ашылды',
      excerptRu: 'Теперь у каждого сада может быть свой современный сайт с админкой.',
      bodyRu: '<p>Мы запустили портал, на котором детские сады Актобе получают готовый сайт с админкой, галереей, документами и меню питания.</p>',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('Готово.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
