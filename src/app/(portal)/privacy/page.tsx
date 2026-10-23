import type { Metadata } from 'next';
import { env } from '@/lib/env';
import { SalesPage } from '@/components/portal/sales/SalesChrome';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { portalSettings } from '@/server/docs/contract';
import { portalAlternates } from '@/lib/seo';
import { formatPhone, phoneHref } from '@/lib/labels';

/**
 * Политика конфиденциальности портала (11.10.2026). Только то, что продающие
 * страницы edusad.kz действительно собирают: заявка, метка посетителя
 * и шаги посещения (VisitTracker, src/server/visits.ts), теги рекламы Google и ChatGPT.
 * Сайты садов — у каждого сада свой оператор данных, здесь не описываются.
 * Поменялся сбор данных — поменять и эту страницу.
 */

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const locale = localeFromParam((await searchParams).lang);
  return {
    alternates: portalAlternates('/privacy', locale),
    title: locale === 'kk' ? 'Құпиялылық саясаты' : 'Политика конфиденциальности',
  };
}

type Section = { title: { kk: string; ru: string }; items: { kk: string; ru: string }[] };

const SECTIONS: Section[] = [
  {
    title: { kk: 'Қандай деректер жиналады', ru: 'Какие данные собираются' },
    items: [
      {
        kk: 'Өтінім: балабақшаның атауы, байланыс адамының аты, телефон, қажет болса e-mail және пікір — тек сіз өтінім жіберсеңіз.',
        ru: 'Заявка: название сада, имя контактного лица, телефон, при желании e-mail и комментарий — только если вы отправили заявку.',
      },
      {
        kk: 'Кіру туралы техникалық мәліметтер: қай беттер ашылды, қайдан келдіңіз (мысалы, Google іздеуі), құрылғы мен браузер түрі, сайтта болған уақыт және шамамен қала — оны біздің серверде DB-IP базасы бойынша IP-мекенжай арқылы анықтаймыз, мекенжайдың өзін сақтамаймыз. Сізді ажырату үшін браузерде кездейсоқ белгі сақталады (localStorage). Аты-жөніңіз бен телефоныңыз мұнда жоқ.',
        ru: 'Технические сведения о посещении: какие страницы открыты, откуда вы пришли (например, из поиска Google), тип устройства и браузера, время на сайте и примерный город — его определяем по IP-адресу на нашем сервере по базе DB-IP, сам адрес не сохраняем. Чтобы отличать повторные заходы, в браузере хранится случайная метка (localStorage). Имени и телефона здесь нет.',
      },
      {
        kk: 'Google Ads жарнама тегі: Google жарнамадағы басулар өтінімге әкелгенін білу үшін өз cookie-лерін қоюы мүмкін (Google құпиялылық саясатына сәйкес).',
        ru: 'Тег Google Рекламы: чтобы понимать, привели ли клики по рекламе к заявке, Google может ставить свои cookie (по политике конфиденциальности Google).',
      },
      {
        kk: 'ChatGPT жарнамасының пикселі (OpenAI): ChatGPT-дегі жарнамадан келгеніңізді және өтінім жібергеніңізді белгілейді, бұл үшін біздің сайтта өз cookie-лерін қояды. Өтінімнің өзі — атыңыз бен телефоныңыз — OpenAI-ға жіберілмейді.',
        ru: 'Пиксель рекламы в ChatGPT (OpenAI): отмечает, что вы пришли из рекламы в ChatGPT и отправили заявку, для этого ставит свои cookie на нашем сайте. Саму заявку — имя и телефон — OpenAI не передаём.',
      },
    ],
  },
  {
    title: { kk: 'Не үшін', ru: 'Зачем' },
    items: [
      { kk: 'Өтінім бойынша сізбен байланысу.', ru: 'Связаться с вами по заявке.' },
      {
        kk: 'Сайт пен жарнаманы жақсарту: қай беттер пайдалы, келушілер қайдан келеді.',
        ru: 'Улучшать сайт и рекламу: какие страницы полезны, откуда приходят посетители.',
      },
    ],
  },
  {
    title: { kk: 'Сақтау және беру', ru: 'Хранение и передача' },
    items: [
      {
        kk: 'Өтінімдер Қазақстан аумағындағы серверде сақталады. Деректерді сатпаймыз және үшінші тұлғаларға бермейміз; жарнама тегтері арқылы Google мен OpenAI алатын мәліметтерден басқа.',
        ru: 'Заявки хранятся на сервере на территории Казахстана. Данные не продаём и третьим лицам не передаём, кроме сведений, которые получают Google и OpenAI через теги рекламы.',
      },
      {
        kk: 'Кіру туралы мәліметтер жинақталған түрде пайдаланылады және ұзақ сақталмайды.',
        ru: 'Сведения о посещениях используются в обобщённом виде и долго не хранятся.',
      },
    ],
  },
  {
    title: { kk: 'Сіздің құқықтарыңыз', ru: 'Ваши права' },
    items: [
      {
        kk: 'Өтінім деректерін өшіруді немесе түзетуді сұрай аласыз — төмендегі телефон арқылы хабарласыңыз. Браузердегі белгіні сайт деректерін тазалау арқылы өзіңіз өшіре аласыз.',
        ru: 'Вы можете попросить удалить или исправить данные заявки — свяжитесь по телефону ниже. Метку в браузере можно удалить самостоятельно, очистив данные сайта.',
      },
    ],
  },
];

const T = {
  title: { kk: 'Құпиялылық саясаты', ru: 'Политика конфиденциальности' },
  lead: {
    kk: 'edusad.kz порталы қандай деректер жинайтыны және оларды қалай пайдаланатыны. Балабақшалардың сайттарында — әр балабақшаның өз ережесі.',
    ru: 'Какие данные собирает портал edusad.kz и как их использует. На сайтах детских садов — правила каждого сада.',
  },
  contact: { kk: 'Байланыс', ru: 'Контакты' },
  offer: { kk: 'Жария оферта', ru: 'Публичная оферта' },
} as const;

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  const settings = await portalSettings();
  const company = locale === 'kk' ? settings.companyNameKk || settings.companyNameRu : settings.companyNameRu || settings.companyNameKk;

  return (
    <SalesPage locale={locale} pathname="/privacy" title={T.title[locale]} lead={T.lead[locale]}>
      <div className="doc">
        {SECTIONS.map((section) => (
          <section key={section.title.ru}>
            <h2>{section.title[locale]}</h2>
            <ul>
              {section.items.map((item) => <li key={item.ru}>{item[locale]}</li>)}
            </ul>
          </section>
        ))}
        <section>
          <h2>{T.contact[locale]}</h2>
          <p>
            {company ? <>{company} · </> : null}
            {settings.phone ? <a href={phoneHref(settings.phone)}>{formatPhone(settings.phone)}</a> : env.portalDomain}
            {' · '}
            <a href={withLocale('/offer', locale)}>{T.offer[locale]}</a>
          </p>
          {/* Условие лицензии DB-IP Lite (CC BY 4.0): ссылка на источник. */}
          <p>
            <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer">IP Geolocation by DB-IP</a>
          </p>
        </section>
      </div>
    </SalesPage>
  );
}
