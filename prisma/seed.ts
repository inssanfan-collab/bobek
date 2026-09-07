import 'dotenv/config';
import { PrismaClient, type TenantKind } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { DEFAULT_SECTIONS } from '../src/lib/sections';
import { TEMPLATES } from '../src/lib/templates';

const prisma = new PrismaClient();

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
          create: { periodStart, periodEnd, amount: 20000, isCurrent: true },
        },
      },
    });

    await prisma.section.createMany({
      data: DEFAULT_SECTIONS.map((section, index) => ({
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
            : '<h2>Как встать в очередь</h2><p>Очередь ведётся на портале egov.kz. Понадобятся ИИН ребёнка и ЭЦП.</p><h2>Что взять в сад</h2><ul><li>Сменную обувь</li><li>Форму для физкультуры</li><li>Расчёску и салфетки</li></ul>',
        bodyKk: s.slug === 'about' ? `<p>${garden.aboutKk}</p>` : '<h2>Кезекке қалай тұру керек</h2><p>Кезек egov.kz порталында жүргізіледі.</p>',
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

    await prisma.album.create({
      data: {
        tenantId: tenant.id,
        slug: 'nauryz-2026',
        titleRu: 'Наурыз 2026',
        titleKk: 'Наурыз 2026',
        descRu: 'Фотографии с праздничного концерта.',
        takenOn: new Date(Date.now() - 5 * 86_400_000),
      },
    });

    console.log(`Создан сад ${garden.slug} → http://${garden.slug}.${PORTAL_DOMAIN}:3000 (логин ${garden.slug}-admin / ${garden.slug}-2026)`);
  }

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
