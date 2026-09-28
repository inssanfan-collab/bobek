/**
 * Сценарии инструкции для садов: что показываем и какими словами.
 * Каждый — одно дело в админке от начала до результата на сайте.
 *
 * Цели ищем по адресам ссылок и именам полей, а не по надписям: так один
 * сценарий работает и в казахской, и в русской админке.
 */
import type { Director, Text } from './director';

export type Scenario = {
  id: string;
  title: Text;
  sub: Text;
  /** Снимается без входа в админку: сценарий входа начинает с формы. */
  anonymous?: boolean;
  run(d: Director, assets: Assets): Promise<void>;
};

export type Assets = { photo: string; photos: string[]; portrait: string; docs: string[]; login: string; password: string };

/** Адрес страницы сайта на языке ролика: сайт сада открывается по-казахски. */
const site = (d: Director, path: string) => (d.lang === 'kk' ? path : `${path}${path.includes('?') ? '&' : '?'}lang=ru`);

const nav = (d: Director, href: string) => d.page.locator(`aside a[href="${href}"], nav a[href="${href}"]`).first();

/**
 * Поле на двух языках (вкладки РУС/ҚАЗ): в казахском ролике переключаемся
 * на ҚАЗ и пишем в казахское поле, в русском — в русское.
 */
async function bilingual(d: Director, name: string, value: { ru: string; kk: string }, text: Text) {
  const ru = d.page.locator(`input[name="${name}Ru"], textarea[name="${name}Ru"]`);
  if (d.lang === 'kk') {
    const field = ru.locator('xpath=ancestor::div[.//button[@role="tab"]][1]');
    await field.getByRole('tab', { name: 'ҚАЗ' }).click();
    await d.type(d.page.locator(`input[name="${name}Kk"], textarea[name="${name}Kk"]`), value.kk, text);
  } else {
    await d.type(ru, value.ru, text);
  }
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'login',
    anonymous: true,
    title: { ru: 'Вход в админку и пароль', kk: 'Әкімші бөліміне кіру және құпия сөз' },
    sub: {
      ru: 'Адрес входа, логин и пароль — и где потом сменить пароль.',
      kk: 'Кіру мекенжайы, логин мен құпия сөз — және құпия сөзді қайда өзгертуге болады.',
    },
    async run(d, assets) {
      const page = d.page;
      await d.goto(`/admin/login?lang=${d.lang}`);
      await d.show({
        ru: 'Админка открывается по адресу <b>ваш-сад.edusad.kz/admin</b>',
        kk: 'Әкімші бөлімі <b>сіздің-бақ.edusad.kz/admin</b> мекенжайында ашылады',
      });
      await d.type(page.locator('input[name="login"]'), assets.login, {
        ru: 'Введите логин — его выдаём при подключении',
        kk: 'Логинді енгізіңіз — оны қосқан кезде береміз',
      });
      await d.type(page.locator('input[name="password"]'), assets.password, {
        ru: 'И пароль',
        kk: 'Және құпия сөзді',
      });
      await d.click(page.locator('button[type="submit"]'), {
        ru: 'Нажмите <b>«Войти»</b>',
        kk: '<b>«Кіру»</b> батырмасын басыңыз',
      }, { navigates: true });
      await d.show({
        ru: 'Это «Обзор»: что на сайте и что стоит обновить',
        kk: 'Бұл — «Шолу»: сайтта не бар және нені жаңарту керек',
      });
      await d.click(nav(d, '/admin/account'), {
        ru: 'Пароль меняется в разделе <b>«Мой пароль»</b>',
        kk: 'Құпия сөз <b>«Құпия сөзім»</b> бөлімінде өзгертіледі',
      }, { navigates: true });
      await d.look(page.locator('main form').first(), {
        ru: 'Смените выданный пароль при первом входе. Один человек — один вход',
        kk: 'Берілген құпия сөзді алғашқы кіргенде өзгертіңіз. Бір адам — бір кіру',
      });
    },
  },

  {
    id: 'profile',
    title: { ru: 'Паспорт сада: телефон и часы работы', kk: 'Балабақша төлқұжаты: телефон және жұмыс уақыты' },
    sub: {
      ru: 'Контакты, адрес и часы работы — они сразу появляются на сайте.',
      kk: 'Байланыс, мекенжай және жұмыс уақыты — сайтта бірден көрінеді.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/profile'), {
        ru: 'Откройте <b>«Паспорт сада»</b>',
        kk: '<b>«Балабақша төлқұжаты»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('#workHours'), 'Пн–Пт, 07:30–18:30', {
        ru: 'Часы работы',
        kk: 'Жұмыс уақыты',
      });
      await d.type(page.locator('#phone'), '+7 (7132) 00-00-01', {
        ru: 'Телефон — по нему звонят родители',
        kk: 'Телефон — ата-аналар осы нөмірге қоңырау шалады',
      });
      await d.click(page.locator('main form button[type="submit"]').last(), {
        ru: 'Нажмите <b>«Сохранить паспорт»</b>',
        kk: '<b>«Төлқұжатты сақтау»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/'));
      await d.look(page.locator('header').first(), {
        ru: 'Телефон и часы — в шапке сайта и в «Контактах»',
        kk: 'Телефон мен жұмыс уақыты — сайт тақырыпшасында және «Байланыста»',
      });
    },
  },
  {
    id: 'news',
    title: { ru: 'Как добавить новость с фото', kk: 'Фотосы бар жаңалықты қалай қосуға болады' },
    sub: {
      ru: 'Заголовок, текст, обложка — и через две минуты новость на сайте.',
      kk: 'Тақырып, мәтін, мұқаба — екі минуттан кейін жаңалық сайтта.',
    },
    async run(d, assets) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/posts?type=NEWS'), {
        ru: 'Откройте <b>«Новости»</b> в меню слева',
        kk: 'Сол жақтағы мәзірден <b>«Жаңалықтар»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.click(page.locator('a[href="/admin/posts/new?type=NEWS"]').first(), {
        ru: 'Нажмите <b>«Добавить»</b>',
        kk: '<b>«Қосу»</b> батырмасын басыңыз',
      }, { navigates: true });
      await d.type(page.locator('input[name="titleRu"]'), 'Осенний утренник «Алтын күз»', {
        ru: 'Напишите заголовок',
        kk: 'Тақырыпты жазыңыз — алдымен орысша',
      });
      await d.click(page.getByRole('tab', { name: 'ҚАЗ' }).first(), {
        ru: 'Нажмите <b>ҚАЗ</b> — и напишите заголовок по-казахски',
        kk: '<b>ҚАЗ</b> қойындысын басып, тақырыпты қазақша жазыңыз',
      });
      await d.type(page.locator('input[name="titleKk"]'), '«Алтын күз» ертеңгілігі', {
        ru: 'Не заполните — на казахской версии покажется русский текст',
        kk: 'Толтырмасаңыз, қазақша нұсқада орысша мәтін көрсетіледі',
      });
      // Анонс и текст — на языке ролика: иначе казахская версия новости
      // на сайте показала бы русский текст (так и было в первой записи).
      await bilingual(d, 'excerpt', {
        ru: 'Дети читали стихи об осени и танцевали с листьями.',
        kk: 'Балалар күз туралы өлең оқып, жапырақтармен биледі.',
      }, {
        ru: 'Краткий анонс — его видят в списке новостей',
        kk: 'Қысқаша сипаттама жаңалықтар тізімінде көрінеді',
      });
      if (d.lang === 'kk') {
        const body = page.locator('input[name="bodyRu"]').locator('xpath=ancestor::div[.//button[@role="tab"]][1]');
        await body.getByRole('tab', { name: 'ҚАЗ' }).click();
      }
      await d.type(page.locator('[contenteditable="true"]:visible').first(), d.lang === 'kk'
        ? 'Сейсенбі күні «Айгөлек» ортаңғы тобында күзгі ертеңгілік өтті. Балалар өлең мен жапырақтармен би дайындады, ал ата-аналар костюм дайындауға көмектесті. Келгендердің бәріне рахмет!'
        : 'Во вторник в средней группе «Айгөлек» прошёл осенний утренник. Ребята подготовили стихи и танец с листьями, а родители помогли с костюмами. Спасибо всем, кто пришёл!', {
        ru: 'Текст новости. Жирный, списки, фото и таблицы — на панели сверху',
        kk: 'Жаңалық мәтіні. Қалың қаріп, тізім, фото және кесте — жоғарғы тақтада',
      });
      await d.upload(page.locator('input[name="coverFile"]'), [assets.photo], {
        ru: 'Добавьте обложку. Фото сожмётся само, а геометки с него снимутся',
        kk: 'Мұқаба қосыңыз. Фото өзі сығылады, ал геобелгілер алынып тасталады',
      });
      await d.click(page.locator('form button[type="submit"]').last(), {
        ru: 'Нажмите <b>«Опубликовать»</b>',
        kk: '<b>«Жариялау»</b> батырмасын басыңыз',
      }, { navigates: true });
      await d.show({ ru: 'Готово — новость в списке и уже на сайте', kk: 'Дайын — жаңалық тізімде және сайтта' });
      await d.goto(site(d, '/news'));
      await d.look(page.locator('main article').first(), {
        ru: 'Так её видят родители',
        kk: 'Ата-аналар оны осылай көреді',
      });
    },
  },

  {
    id: 'notice',
    title: { ru: 'Срочное объявление на сайте', kk: 'Сайттағы шұғыл хабарландыру' },
    sub: {
      ru: 'Полоса над шапкой на всех страницах: карантин, отключение воды, собрание.',
      kk: 'Барлық беттегі тақырыпша үстіндегі жолақ: карантин, су өшуі, жиналыс.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/notice'), {
        ru: 'Откройте <b>«Срочное объявление»</b>',
        kk: '<b>«Шұғыл хабарландыру»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('#noticeRu'), 'Родительское собрание — в пятницу в 18:00, актовый зал', {
        ru: 'Текст объявления',
        kk: 'Хабарландыру мәтіні — орысша',
      });
      await d.type(page.locator('#noticeKk'), 'Ата-аналар жиналысы — жұма күні 18:00-де, мәжіліс залында', {
        ru: 'И по-казахски',
        kk: 'Және қазақша',
      });
      await d.set(page.locator('#noticeTone'), 'INFO', {
        ru: 'Цвет полосы: синяя — информация, жёлтая — внимание, красная — срочно',
        kk: 'Жолақ түсі: көк — ақпарат, сары — назар аударыңыз, қызыл — шұғыл',
      });
      const until = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
      await d.set(page.locator('#noticeUntil'), until, {
        ru: 'До какого дня показывать — потом полоса исчезнет сама',
        kk: 'Қай күнге дейін көрсету керек — одан кейін жолақ өзі жоғалады',
      });
      await d.click(page.locator('form:has(#noticeRu) button[type="submit"]'), {
        ru: 'Нажмите <b>«Опубликовать объявление»</b>',
        kk: '<b>«Хабарландыруды жариялау»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/'));
      await d.look(page.getByText(d.lang === 'kk' ? 'Ата-аналар жиналысы' : 'Родительское собрание').first(), {
        ru: 'Полоса — на всех страницах сайта',
        kk: 'Жолақ — сайттың барлық бетінде',
      });
    },
  },

  {
    id: 'gallery',
    title: { ru: 'Фотоальбом', kk: 'Фотоальбом' },
    sub: {
      ru: 'Альбом с праздника: несколько фото за один раз.',
      kk: 'Мерекеден альбом: бірнеше фото бір рет.',
    },
    async run(d, assets) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/gallery'), {
        ru: 'Откройте <b>«Фотогалерея»</b>',
        kk: '<b>«Фотогалерея»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('#titleRu'), 'Осенний утренник', {
        ru: 'Название альбома',
        kk: 'Альбом атауы — орысша',
      });
      await d.type(page.locator('#titleKk'), 'Күзгі ертеңгілік', {
        ru: 'И по-казахски',
        kk: 'Және қазақша',
      });
      await d.click(page.locator('form:has(#titleRu) button[type="submit"]'), {
        ru: 'Нажмите <b>«Создать альбом»</b>',
        kk: '<b>«Альбом жасау»</b> батырмасын басыңыз',
      }, { navigates: true });
      await d.upload(page.locator('#files'), assets.photos, {
        ru: 'Выберите фотографии — можно сразу все',
        kk: 'Фотосуреттерді таңдаңыз — бәрін бірден болады',
      });
      await d.click(page.locator('form:has(#files) button[type="submit"]'), {
        ru: 'Нажмите <b>«Загрузить»</b>. Фото сожмутся, геометки снимутся',
        kk: '<b>«Жүктеу»</b> батырмасын басыңыз. Фото сығылады, геобелгілер алынады',
      });
      await d.goto(site(d, '/gallery'));
      await d.look(page.locator('main a[href*="/gallery/"]').first(), {
        ru: 'Альбом — на сайте, фото открываются крупно',
        kk: 'Альбом — сайтта, фото үлкейтіп ашылады',
      });
    },
  },

  {
    id: 'documents',
    title: { ru: 'Документы: папки и файлы', kk: 'Құжаттар: бумалар мен файлдар' },
    sub: {
      ru: 'Папка в папке, как на компьютере. Файлы — сразу пачкой.',
      kk: 'Компьютердегідей бума ішінде бума. Файлдар — бірден бірнешеуі.',
    },
    async run(d, assets) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/documents'), {
        ru: 'Откройте <b>«Документы»</b> в меню слева',
        kk: 'Сол жақтағы мәзірден <b>«Құжаттар»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('#folderRu'), 'Приказы 2026', {
        ru: 'Создайте папку — например, «Приказы 2026»',
        kk: 'Бума жасаңыз — мысалы, «Бұйрықтар 2026»',
      });
      await d.type(page.locator('#folderKk'), 'Бұйрықтар 2026', {
        ru: 'И то же название по-казахски',
        kk: 'Атауын қазақша да жазыңыз',
      });
      await d.click(page.locator('form:has(#folderRu) button[type="submit"]'), {
        ru: 'Нажмите <b>«Добавить папку»</b>',
        kk: '<b>«Бума қосу»</b> батырмасын басыңыз',
      });
      await d.click(page.locator('main a[href^="/admin/documents?folder="]', { hasText: d.lang === 'kk' ? 'Бұйрықтар 2026' : 'Приказы 2026' }).first(), {
        ru: 'Откройте папку',
        kk: 'Буманы ашыңыз',
      }, { navigates: true });
      await d.upload(page.locator('#file'), assets.docs, {
        ru: 'Выберите сразу несколько файлов — названия возьмутся из имён файлов',
        kk: 'Бірден бірнеше файл таңдаңыз — атаулары файл аттарынан алынады',
      });
      await d.click(page.locator('form:has(#file) button[type="submit"]'), {
        ru: 'Нажмите <b>«Загрузить»</b>',
        kk: '<b>«Жүктеу»</b> батырмасын басыңыз',
      });
      await d.look(page.locator('main section').filter({ has: page.locator('a[href^="/api/media/"]') }).first(), {
        ru: 'Файлы в папке. Название можно поправить кнопкой «Изменить»',
        kk: 'Файлдар бумада. Атауын «Өзгерту» батырмасымен түзетуге болады',
      });
      await d.goto(site(d, '/documents'));
      await d.click(page.locator('main a[href*="folder="]', { hasText: d.lang === 'kk' ? 'Бұйрықтар 2026' : 'Приказы 2026' }).first(), {
        ru: 'На сайте — так же, папками. Родитель открывает нужную',
        kk: 'Сайтта да бумалармен. Ата-ана керегін ашады',
      }, { navigates: true });
      await d.look(page.locator('main a[href*="docs-archive"]').first(), {
        ru: 'Файл открывается нажатием, а всю папку можно скачать одним архивом',
        kk: 'Файл басқанда ашылады, ал бүкіл буманы бір архивпен жүктеуге болады',
      });
    },
  },

  {
    id: 'menu',
    title: { ru: 'Меню питания на день', kk: 'Күндік тамақтану мәзірі' },
    sub: {
      ru: 'Родители видят, чем кормят сегодня, и не звонят воспитателю.',
      kk: 'Ата-аналар бүгін не берілетінін көреді де, тәрбиешіге қоңырау шалмайды.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/menu'), {
        ru: 'Откройте <b>«Меню питания»</b> в меню слева',
        kk: 'Сол жақтағы мәзірден <b>«Тамақтану мәзірі»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.look(page.locator('#date'), {
        ru: 'Дата — сегодняшняя. Можно выбрать другой день',
        kk: 'Күні — бүгінгі. Басқа күнді таңдауға болады',
      });
      await d.type(page.locator('#breakfastRu'), 'Каша овсяная, чай, хлеб с маслом', { ru: 'Завтрак', kk: 'Таңғы ас — орысша' });
      await d.type(page.locator('#breakfastKk'), 'Сұлы ботқасы, шай, майлы нан', { ru: 'Завтрак по-казахски', kk: 'Таңғы ас — қазақша' });
      await d.type(page.locator('#lunchRu'), 'Суп с фрикадельками, плов, компот', { ru: 'Обед', kk: 'Түскі ас — орысша' });
      await d.type(page.locator('#lunchKk'), 'Фрикаделька сорпасы, палау, компот', { ru: 'Обед по-казахски', kk: 'Түскі ас — қазақша' });
      await d.type(page.locator('#snackRu'), 'Кефир, печенье', { ru: 'Полдник', kk: 'Бесін ас — орысша' });
      await d.type(page.locator('#snackKk'), 'Айран, печенье', { ru: 'Полдник по-казахски', kk: 'Бесін ас — қазақша' });
      await d.click(page.locator('form:has(#date) button[type="submit"]'), {
        ru: 'Нажмите <b>«Сохранить меню»</b>',
        kk: '<b>«Мәзірді сақтау»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/menu'));
      await d.look(page.locator('main article').first(), {
        ru: 'Меню сегодня — на сайте сада',
        kk: 'Бүгінгі мәзір — балабақша сайтында',
      });
    },
  },
  {
    id: 'groups',
    title: { ru: 'Свободные места в группах', kk: 'Топтардағы бос орындар' },
    sub: {
      ru: 'Одно число в неделю — и родители не звонят узнавать.',
      kk: 'Аптасына бір сан — ата-аналар сұрау үшін қоңырау шалмайды.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/groups'), {
        ru: 'Откройте <b>«Группы»</b>',
        kk: '<b>«Топтар»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('input[id^="free-"]').first(), '3', {
        ru: 'Впишите, сколько мест свободно',
        kk: 'Қанша бос орын бар екенін жазыңыз',
      });
      await d.click(page.locator('form:has(input[id^="free-"]) button[type="submit"]').first(), {
        ru: 'Нажмите <b>«Сохранить»</b> рядом',
        kk: 'Жанындағы <b>«Сақтау»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/groups'));
      await d.look(page.locator('main article').first(), {
        ru: 'На сайте видно, сколько мест свободно. Обновляйте хотя бы раз в неделю',
        kk: 'Сайтта қанша бос орын бар екені көрінеді. Кемінде аптасына бір рет жаңартыңыз',
      });
    },
  },

  {
    id: 'staff',
    title: { ru: 'Педагог с фотографией', kk: 'Фотосы бар педагог' },
    sub: {
      ru: 'Карточка воспитателя: имя, должность, стаж, фото.',
      kk: 'Тәрбиеші карточкасы: аты-жөні, лауазымы, өтілі, фото.',
    },
    async run(d, assets) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/staff'), {
        ru: 'Откройте <b>«Педагоги»</b>',
        kk: '<b>«Педагогтар»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.type(page.locator('#fullName'), 'Жумабаева Динара Ерлановна', {
        ru: 'ФИО',
        kk: 'Аты-жөні',
      });
      await d.type(page.locator('#positionRu'), 'Воспитатель', {
        ru: 'Должность',
        kk: 'Лауазымы — орысша',
      });
      await d.type(page.locator('#positionKk'), 'Тәрбиеші', {
        ru: 'Должность по-казахски',
        kk: 'Лауазымы — қазақша',
      });
      await d.type(page.locator('#experience'), d.lang === 'kk' ? '8 жыл' : '8 лет', {
        ru: 'Стаж',
        kk: 'Еңбек өтілі',
      });
      await d.upload(page.locator('#photo'), [assets.portrait], {
        ru: 'Фото — по желанию педагога',
        kk: 'Фото — педагогтің қалауы бойынша',
      });
      await d.click(page.locator('form:has(#fullName) button[type="submit"]'), {
        ru: 'Нажмите <b>«Добавить»</b>',
        kk: '<b>«Қосу»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/staff'));
      await d.look(page.locator('main article').filter({ hasText: 'Жумабаева' }).first(), {
        ru: 'Карточка — на сайте в разделе педагогов',
        kk: 'Карточка — сайттағы педагогтар бөлімінде',
      });
    },
  },

  {
    id: 'homepage',
    title: { ru: 'Тексты главной страницы', kk: 'Басты бет мәтіндері' },
    sub: {
      ru: 'Подпись в шапке и крупный заголовок первого экрана.',
      kk: 'Тақырыпшадағы жазу және бірінші экранның ірі тақырыбы.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/homepage'), {
        ru: 'Откройте <b>«Главная страница»</b>',
        kk: '<b>«Басты бет»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await bilingual(d, 'headerTagline', { ru: 'Ясли-сад с 2019 года', kk: '2019 жылдан бері бөбекжай' }, {
        ru: 'Подпись под названием в шапке',
        kk: 'Тақырыпшадағы атау астындағы жазу',
      });
      await bilingual(d, 'heroTitle', { ru: 'Счастливое детство', kk: 'Бақытты балалық шақ' }, {
        ru: 'Заголовок первого экрана',
        kk: 'Бірінші экранның тақырыбы',
      });
      await bilingual(d, 'heroHighlight', { ru: 'рядом с домом', kk: 'үйге жақын жерде' }, {
        ru: 'А эта часть выделится цветом',
        kk: 'Ал бұл бөлігі түспен ерекшеленеді',
      });
      await d.click(page.locator('main form button[type="submit"]').last(), {
        ru: 'Нажмите <b>«Сохранить»</b>',
        kk: '<b>«Сақтау»</b> батырмасын басыңыз',
      }, { navigates: true });
      await d.goto(site(d, '/'));
      await d.look(page.locator('main h1').first(), {
        ru: 'Так это выглядит на главной',
        kk: 'Басты бетте осылай көрінеді',
      });
    },
  },

  {
    id: 'appearance',
    title: { ru: 'Внешний вид сайта', kk: 'Сайттың сыртқы көрінісі' },
    sub: {
      ru: 'Цвета, шапка и основной язык — без программиста.',
      kk: 'Түстер, тақырыпша және негізгі тіл — бағдарламашысыз.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/appearance'), {
        ru: 'Откройте <b>«Внешний вид»</b>',
        kk: '<b>«Сыртқы көрінісі»</b> бөлімін ашыңыз',
      }, { navigates: true });
      await d.click(page.locator('label:has(input[name="headerLayout"][value="center"])'), {
        ru: 'Вид шапки — например, «по центру»',
        kk: 'Тақырыпша түрі — мысалы, «ортада»',
      });
      await d.look(page.locator('#language'), {
        ru: 'Основной язык сайта: на нём сайт открывается, второй — кнопкой',
        kk: 'Сайттың негізгі тілі: сайт осы тілде ашылады, екіншісі — батырмамен',
      });
      await d.click(page.locator('label:has(input[name="palette"][value="meadow"])'), {
        ru: 'Палитра — цвета всего сайта',
        kk: 'Палитра — бүкіл сайттың түстері',
      });
      await d.click(page.locator('main form button[type="submit"]').last(), {
        ru: 'Нажмите <b>«Сохранить внешний вид»</b>',
        kk: '<b>«Сыртқы көріністі сақтау»</b> батырмасын басыңыз',
      });
      await d.goto(site(d, '/'));
      await d.show({
        ru: 'Сайт — в новых цветах. Вернуть прежние можно так же',
        kk: 'Сайт — жаңа түстерде. Бұрынғысын дәл осылай қайтаруға болады',
      });
    },
  },

  {
    id: 'sections',
    title: { ru: 'Разделы меню', kk: 'Мәзір бөлімдері' },
    sub: {
      ru: 'Скрыть пустой раздел, переименовать, поменять порядок.',
      kk: 'Бос бөлімді жасыру, атауын өзгерту, ретін ауыстыру.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/sections'), {
        ru: 'Откройте <b>«Разделы меню»</b>',
        kk: '<b>«Мәзір бөлімдері»</b> бөлімін ашыңыз',
      }, { navigates: true });
      const card = page.locator('main .card').filter({ has: page.locator('input[name="slug"][value="vacancies"]') }).first();
      await d.look(card, {
        ru: 'Каждый раздел — карточкой. Стрелки меняют порядок в меню',
        kk: 'Әр бөлім — карточка. Көрсеткілер мәзірдегі ретін өзгертеді',
      });
      await d.click(card.getByRole('button', { name: d.t({ ru: 'Скрыть', kk: 'Жасыру' }) }), {
        ru: 'Пустой раздел лучше скрыть — например, «Вакансии»',
        kk: 'Бос бөлімді жасырған дұрыс — мысалы, «Бос жұмыс орындары»',
      });
      await d.look(card, {
        ru: 'Раздел скрыт: на сайте его нет, а данные сохранились',
        kk: 'Бөлім жасырылды: сайтта жоқ, ал деректер сақталды',
      });
    },
  },

  {
    id: 'feedback',
    title: { ru: 'Обращения родителей', kk: 'Ата-аналардың өтініштері' },
    sub: {
      ru: 'Вопросы из виртуальной приёмной — и отметка, что ответили.',
      kk: 'Виртуалды қабылдаудан келген сұрақтар — және жауап бергені туралы белгі.',
    },
    async run(d) {
      const page = d.page;
      await d.goto('/admin');
      await d.click(nav(d, '/admin/feedback'), {
        ru: 'Новые обращения видно по цифре у <b>«Обращения»</b>',
        kk: 'Жаңа өтініштер <b>«Өтініштер»</b> жанындағы санмен көрінеді',
      }, { navigates: true });
      await d.look(page.locator('main form:has(textarea[name="answer"])').first().locator('xpath=..'), {
        ru: 'Вопрос родителя и как с ним связаться',
        kk: 'Ата-ананың сұрағы және онымен қалай байланысуға болады',
      });
      await d.type(page.locator('textarea[name="answer"]').first(), d.lang === 'kk' ? '25 қыркүйекте хабарластым, мәселе шешілді' : 'Позвонила 25 сентября, вопрос решён', {
        ru: 'Ответьте по телефону и оставьте заметку — она видна только вам',
        kk: 'Телефонмен жауап беріп, белгі қалдырыңыз — оны тек сіз көресіз',
      });
      await d.click(page.locator('form:has(textarea[name="answer"]) button[type="submit"]').first(), {
        ru: 'Нажмите <b>«Сохранить»</b>',
        kk: '<b>«Сақтау»</b> батырмасын басыңыз',
      });
      await d.show({
        ru: 'Отвечайте в течение рабочего дня',
        kk: 'Жұмыс күні ішінде жауап беріңіз',
      });
    },
  },
];
