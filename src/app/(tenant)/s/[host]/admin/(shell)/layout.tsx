import type { Metadata } from 'next';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { AdminShell, type NavItem } from '@/components/admin/AdminShell';
import { AdminLocaleSwitch } from '@/components/admin/AdminLocaleSwitch';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Админка сада', robots: { index: false } };

const T = {
  navLabel: { kk: 'Әкімші бөлімдері', ru: 'Разделы админки' },
  mySite: { kk: 'Сайтым', ru: 'Мой сайт' },
  logout: { kk: 'Шығу', ru: 'Выйти' },
  impersonated: {
    kk: 'Сіз портал әкімшісі ретінде кірдіңіз. Барлық әрекеттер журналға жазылады.',
    ru: 'Вы вошли как администратор портала. Все действия записываются в журнал.',
  },
  readOnly: { kk: 'Тек оқу режимі', ru: 'Режим только чтения' },
  graceHint: {
    kk: 'Жазылым %s аяқталды. Сайт жұмыс істейді, бірақ өңдеу қолжетімсіз. Ұзарту үшін портал әкімшісіне хабарласыңыз.',
    ru: 'Подписка истекла %s. Сайт работает, но редактирование недоступно. Свяжитесь с администратором портала для продления.',
  },
  blockedHint: {
    kk: 'Өңдеу бұғатталған. Портал әкімшісіне хабарласыңыз.',
    ru: 'Редактирование заблокировано. Свяжитесь с администратором портала.',
  },
  nav: {
    overview: { kk: 'Шолу', ru: 'Обзор' },
    news: { kk: 'Жаңалықтар', ru: 'Новости' },
    announcements: { kk: 'Хабарландырулар', ru: 'Объявления' },
    gallery: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
    documents: { kk: 'Құжаттар', ru: 'Документы' },
    media: { kk: 'Файлдар', ru: 'Файлы' },
    staff: { kk: 'Педагогтар', ru: 'Педагоги' },
    groups: { kk: 'Топтар', ru: 'Группы' },
    menu: { kk: 'Тамақтану мәзірі', ru: 'Меню питания' },
    clubs: { kk: 'Үйірмелер мен қызметтер', ru: 'Кружки и услуги' },
    faq: { kk: 'Жиі қойылатын сұрақтар', ru: 'Частые вопросы' },
    pages: { kk: 'Беттер', ru: 'Страницы' },
    sections: { kk: 'Мәзір бөлімдері', ru: 'Разделы меню' },
    feedback: { kk: 'Өтініштер', ru: 'Обращения' },
    notice: { kk: 'Шұғыл хабарландыру', ru: 'Срочное объявление' },
    stats: { kk: 'Сайтқа кірулер', ru: 'Посещаемость' },
    appearance: { kk: 'Сыртқы көрінісі', ru: 'Внешний вид' },
    profile: { kk: 'Балабақша төлқұжаты', ru: 'Паспорт сада' },
    account: { kk: 'Құпия сөзім', ru: 'Мой пароль' },
  },
} as const;

export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [profile, newFeedback, sections] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    prisma.feedbackMessage.count({ where: { tenantId: ctx.tenantId, status: 'NEW' } }),
    prisma.section.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { position: 'asc' },
      select: { type: true, titleKk: true, titleRu: true },
    }),
  ]);

  // Сад переименовывает разделы под себя — «Документы» становятся
  // «Материалами самооценки». Если оставить в меню зашитую подпись,
  // сотрудник ищет свой раздел и не находит: на сайте он называется иначе.
  const sectionTitles = new Map<string, string>();
  for (const section of sections) {
    if (!sectionTitles.has(section.type)) {
      sectionTitles.set(section.type, pick(locale, section.titleKk, section.titleRu));
    }
  }
  /** Название раздела, как его назвал сад; если раздела нет — наша подпись. */
  const titled = (type: string, fallback: string) => sectionTitles.get(type) || fallback;

  const base = '/admin';
  const n = T.nav;
  const nav: NavItem[] = [
    { href: base, label: n.overview[locale], icon: '📊' },
    { href: `${base}/posts?type=NEWS`, label: titled('NEWS', n.news[locale]), icon: '📰' },
    { href: `${base}/posts?type=ANNOUNCEMENT`, label: titled('ANNOUNCEMENT', n.announcements[locale]), icon: '📢' },
    { href: `${base}/gallery`, label: titled('GALLERY', n.gallery[locale]), icon: '📷' },
    { href: `${base}/documents`, label: titled('DOCUMENTS', n.documents[locale]), icon: '📄' },
    { href: `${base}/media`, label: n.media[locale], icon: '🗂' },
    { href: `${base}/staff`, label: titled('STAFF', n.staff[locale]), icon: '👩‍🏫' },
    { href: `${base}/groups`, label: titled('GROUPS', n.groups[locale]), icon: '🧸' },
    { href: `${base}/menu`, label: titled('MENU_FOOD', n.menu[locale]), icon: '🍎' },
    { href: `${base}/clubs`, label: titled('CLUBS', n.clubs[locale]), icon: '🎨' },
    { href: `${base}/faq`, label: titled('FAQ', n.faq[locale]), icon: '❓' },
    { href: `${base}/pages`, label: n.pages[locale], icon: '📝' },
    { href: `${base}/sections`, label: n.sections[locale], icon: '🧭' },
    { href: `${base}/feedback`, label: n.feedback[locale], icon: '✉️', badge: newFeedback || undefined },
    { href: `${base}/notice`, label: n.notice[locale], icon: '📣' },
    { href: `${base}/stats`, label: n.stats[locale], icon: '📈' },
    { href: `${base}/appearance`, label: n.appearance[locale], icon: '🖌' },
    { href: `${base}/profile`, label: n.profile[locale], icon: '🏡' },
    { href: `${base}/account`, label: n.account[locale], icon: '🔒' },
  ];

  const banner = (
    <>
      {ctx.user.impersonatedBy ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
          {T.impersonated[locale]}
        </div>
      ) : null}
      {!ctx.subscription.canEdit ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="warn" title={T.readOnly[locale]}>
            {ctx.subscription.isGrace
              ? T.graceHint[locale].replace('%s', formatDate(ctx.subscription.periodEnd))
              : T.blockedHint[locale]}
          </Alert>
        </div>
      ) : null}
    </>
  );

  return (
    <AdminShell
      title={pick(locale, profile?.nameKk, profile?.nameRu) || ctx.tenantSlug}
      subtitle={ctx.user.fullName}
      homeHref="/admin"
      nav={nav}
      navLabel={T.navLabel[locale]}
      banner={banner}
      headerRight={
        <>
          <a href="/" target="_blank" rel="noreferrer" className="btn-secondary text-sm">{T.mySite[locale]}</a>
          <AdminLocaleSwitch locale={locale} />
          <LogoutButton label={T.logout[locale]} />
        </>
      }
    >
      {children}
    </AdminShell>
  );
}
