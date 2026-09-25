/**
 * Макеты продукта на продающей главной: сайт сада в телефоне и админка.
 * Это картинки из разметки, а не настоящий сайт, — поэтому строки HTML:
 * их перерисовывает сценарий страницы (смена языка в телефоне, вкладки
 * и автопоказ админки). Все тексты — константы этого файла, пользовательский
 * ввод сюда не попадает.
 */
import type { Locale } from '@/lib/i18n';

export type Palette = { b: string; bs: string };
export type AdminTab = 'news' | 'menu' | 'docs';

/** «Мята» с сайтов садов — в ней макет и показывается. */
export const MOCK_PALETTE: Palette = { b: '20 132 125', bs: '226 246 244' };
/** Название сада в макетах — то же, что у демо-сайта demo.edusad.kz. */
export const MOCK_NAME = 'Балапан';

const IMG = '/images/sales';

// Сайт сада открывается по-казахски — как у настоящих садов.
const SITE = {
  kk: {
    sub: 'Ақтөбе қаласы, балабақша', eye: 'Нашар көретіндерге',
    notice: 'Хабарландыру: қыркүйекте ортаңғы топта бос орындар бар',
    lead: 'Балаларды мейіріммен күтеміз. Бос орындар, мәзір және жаңалықтар — осында.', btn: 'Бос орындар',
    c1: ['Жаңалықтар', '«Алтын күз» ертеңгілігі'],
  },
  ru: {
    sub: 'детский сад, Актобе', eye: 'Для слабовидящих',
    notice: 'Объявление: в сентябре есть свободные места в средней группе',
    lead: 'Ждём детей с заботой. Свободные места, меню и новости — здесь.', btn: 'Свободные места',
    c1: ['Новости', 'Утренник «Золотая осень»'],
  },
} as const;

const LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="16" cy="8" r="3" fill="#FFC53D"/><path d="M3 20 C7 12 10 11 12 11 C15 11 18 13 21 20Z" fill="#fff"/></svg>';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';
const FOLDER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" style="fill: rgb(var(--b) / .75)"/></svg>';
const FILE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="#e9edf1"/><path d="M15 3v4h4" fill="#cfd6de"/><rect x="8" y="12" width="8" height="1.6" rx=".8" fill="#b9c2cc"/><rect x="8" y="15" width="6" height="1.6" rx=".8" fill="#b9c2cc"/></svg>';

/** Сайт сада в телефоне. `siteLang` — язык самого макета: его переключают, нажав ҚАЗ/РУС. */
export function phoneHTML(siteLang: Locale, pal: Palette = MOCK_PALETTE): string {
  const t = SITE[siteLang];
  const host = 'balapan.edusad.kz';
  return `<div class="sm is-phone" style="--b: ${pal.b}; --bs: ${pal.bs}">
    <div class="bz phone"><span class="url">${LOCK}${host}</span></div>
    <div class="sm-notice">${t.notice}</div>
    <div class="sm-top"><span class="sm-logo">${LOGO}</span>
      <b class="sm-name">${MOCK_NAME}<span class="sm-sub">${t.sub}</span></b>
      <span class="sm-right"><span class="eye">${t.eye}</span><span class="sm-lang"><i class="${siteLang === 'kk' ? 'on' : ''}">ҚАЗ</i><i class="${siteLang === 'ru' ? 'on' : ''}">РУС</i></span></span></div>
    <div class="sm-hero"><div><div class="sm-h">${MOCK_NAME}</div><p>${t.lead}</p>
      <span class="sm-btn">${t.btn}</span></div><img class="sm-art" src="${IMG}/site.webp" alt=""></div>
    <div class="sm-cards">
      <div class="sm-card"><span class="sm-ph"><img class="sm-photo" src="${IMG}/news.webp" alt=""></span><b>${t.c1[0]}</b><small>${t.c1[1]}</small></div>
    </div>
  </div>`;
}

const ADMIN = {
  kk: {
    menu: ['Басты бет', 'Жаңалықтар', 'Мәзір', 'Құжаттар', 'Топтар', 'Педагогтар', 'Сыртқы көрінісі'],
    on: { news: 'Жаңалықтар', menu: 'Мәзір', docs: 'Құжаттар' },
    newsTitle: 'Жаңа жаңалық', preview: 'Алдын ала қарау', publish: 'Жариялау', text: 'Мәтін',
    geo: 'Геобелгі алынды',
    menuTitle: 'Апталық мәзір', save: 'Сақтау', meals: ['Таңғы ас', 'Түскі ас', 'Бесін ас'],
    rows: [
      ['Дс', 'Сұлы ботқасы', 'Фрикаделька сорпасы', 'Айран, печенье'],
      ['Сс', 'Омлет, нан', 'Борщ, котлет', 'Бауырсақ, шай'],
      ['Ср', 'Күріш ботқасы', 'Лағман', 'Йогурт, алма'],
      ['Бс', 'Сырниктер', 'Тауық сорпасы', 'Компот, тоқаш'],
      ['Жм', 'Тары ботқасы', 'Палау, салат', 'Сүт, печенье'],
    ],
    docsTitle: 'Құжаттар', downloadAll: 'Барлық құжаттарды жүктеу', upload: 'Файл жүктеу',
    crumbs: ['Құжаттар', 'Ата-аналарға'],
    items: [['Лицензия мен жарғы', '3 файл'], ['Қабылдау қағидалары', '2 файл'], ['Бұйрықтар 2026', '12 файл'], ['Мәзір мен сертификаттар', '5 файл']],
    plan: ['Жылдық жоспар.pdf', '1,1 МБ'],
  },
  ru: {
    menu: ['Главная', 'Новости', 'Меню', 'Документы', 'Группы', 'Педагоги', 'Оформление'],
    on: { news: 'Новости', menu: 'Меню', docs: 'Документы' },
    newsTitle: 'Новая новость', preview: 'Предпросмотр', publish: 'Опубликовать', text: 'Мәтін',
    geo: 'Геометка снята',
    menuTitle: 'Меню на неделю', save: 'Сохранить', meals: ['Завтрак', 'Обед', 'Полдник'],
    rows: [
      ['Пн', 'Каша овсяная', 'Суп с фрикадельками', 'Кефир, печенье'],
      ['Вт', 'Омлет, хлеб', 'Борщ, котлета', 'Баурсаки, чай'],
      ['Ср', 'Каша рисовая', 'Лагман', 'Йогурт, яблоко'],
      ['Чт', 'Сырники', 'Суп куриный', 'Компот, булочка'],
      ['Пт', 'Каша пшённая', 'Плов, салат', 'Молоко, печенье'],
    ],
    docsTitle: 'Документы', downloadAll: 'Скачать все документы', upload: 'Загрузить файл',
    crumbs: ['Документы', 'Для родителей'],
    items: [['Лицензия и устав', '3 файла'], ['Правила приёма', '2 файла'], ['Приказы 2026', '12 файлов'], ['Меню и сертификаты', '5 файлов']],
    plan: ['Годовой план.pdf', '1,1 МБ'],
  },
} as const;

/** Подписи под вкладками админки. */
export const ADMIN_CAPTION: Record<Locale, Record<AdminTab, string>> = {
  kk: {
    news: 'Екі-үш минут. Екі тілдегі мәтін қатар жазылады, фото өзі сығылады, ал геобелгілер алынып тасталады — балалар суретімен бірге балабақшаның координаттары интернетке кетпейді.',
    menu: 'Апталық мәзір кесте түрінде толтырылады. Ата-аналар бүгін не беретінін көреді де, тәрбиешіге қоңырау шалмайды.',
    docs: 'Лицензия, жарғы, бұйрықтар — компьютердегідей бумаларда. Дайын бумаларды Google Дискіден көшіріп береміз.',
  },
  ru: {
    news: 'Пара минут. Текст на двух языках пишется рядом, фото сжимается само, а геометки с него снимаются — координаты сада с фотографий детей не уйдут в интернет.',
    menu: 'Меню на неделю заполняется таблицей. Родители видят, чем кормят сегодня, и не звонят воспитателю.',
    docs: 'Лицензия, устав, приказы — по папкам, как в проводнике. Готовые папки переносим с Google Диска.',
  },
};

/** Тексты автопоказа: что «набирается» и какие сообщения всплывают. */
export const ADMIN_DEMO: Record<Locale, { title: string; publish: string; published: string; menuSaved: string; newFile: string; uploaded: string }> = {
  kk: {
    title: '«Алтын күз» ертеңгілігі', publish: ADMIN.kk.publish, published: 'Сайтта жарияланды',
    menuSaved: 'Мәзір сақталды', newFile: 'Қабылдау туралы бұйрық.pdf', uploaded: 'Файл жүктелді',
  },
  ru: {
    title: '«Алтын күз» ертеңгілігі', publish: ADMIN.ru.publish, published: 'Опубликовано на сайте',
    menuSaved: 'Меню сохранено', newFile: 'Приказ о зачислении.pdf', uploaded: 'Файл загружен',
  },
};

/** Админка в окне ноутбука. Язык интерфейса — язык страницы: админка у нас тоже двуязычная. */
export function adminHTML(tab: AdminTab, locale: Locale, pal: Palette = MOCK_PALETTE): string {
  const t = ADMIN[locale];
  let main = '';
  if (tab === 'news') {
    // Новость пишется на вкладке «Қазақша» — поэтому подписи полей казахские в обеих версиях.
    main = `<h4>${t.newsTitle}<span class="am-row" style="margin:0"><span class="am-btn ghost">${t.preview}</span><span class="am-btn">${t.publish}</span></span></h4>
      <div class="am-tabs"><span class="on">Қазақша</span><span>Русский</span></div>
      <div class="am-field"><label>Тақырып</label>«Алтын күз» ертеңгілігі</div>
      <div class="am-field am-bars"><label>${t.text}</label><i style="width:94%"></i><i style="width:86%"></i><i style="width:58%"></i></div>
      <div class="am-field am-photo"><div class="ph"><img class="sm-photo" src="${IMG}/news.webp" alt=""></div><div><b style="font-size:.9em">IMG_2041.jpg</b><br>
        <span class="am-tag">${t.geo}</span> <span class="am-tag" style="background:#eef1f4;color:#4a5561">4,2 МБ → 310 КБ</span></div></div>`;
  } else if (tab === 'menu') {
    main = `<h4>${t.menuTitle}<span class="am-btn">${t.save}</span></h4>
      <table class="am-table"><tr><th></th>${t.meals.map((m) => `<th>${m}</th>`).join('')}</tr>
      ${t.rows.map((r, i) => `<tr${i === 2 ? ' class="today"' : ''}>${r.map((c, j) => (j ? `<td>${c}</td>` : `<td><b>${c}</b></td>`)).join('')}</tr>`).join('')}</table>`;
  } else {
    main = `<h4>${t.docsTitle}<span class="am-row" style="margin:0"><span class="am-btn ghost">${t.downloadAll}</span><span class="am-btn">${t.upload}</span></span></h4>
      <div class="am-crumbs">${t.crumbs[0]} / <b>${t.crumbs[1]}</b></div>
      <div class="am-list">${t.items.map(([n, s]) => `<div>${FOLDER}<span>${n}</span><small>${s}</small></div>`).join('')}<div>${FILE}<span>${t.plan[0]}</span><small>${t.plan[1]}</small></div></div>`;
  }
  return `<div class="am" style="--b: ${pal.b}; --bs: ${pal.bs}">
    <div class="am-side"><div class="who"><i></i><span>${MOCK_NAME}</span></div>
      ${t.menu.map((m) => `<span class="${m === t.on[tab] ? 'on' : ''}">${m}</span>`).join('')}</div>
    <div class="am-main">${main}</div></div>`;
}
