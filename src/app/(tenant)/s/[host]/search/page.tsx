import Link from 'next/link';
import type { Metadata } from 'next';
import { publicSiteContext, localeFrom, withLocale } from '@/server/tenant/context';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { EmptyState } from '@/components/ui/EmptyState';
import { pick } from '@/lib/i18n';
import { formatDate } from '@/lib/labels';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Поиск', robots: { index: false } };

const T = {
  title: { kk: 'Сайттан іздеу', ru: 'Поиск по сайту' },
  placeholder: { kk: 'Не іздейсіз?', ru: 'Что вы ищете?' },
  find: { kk: 'Іздеу', ru: 'Найти' },
  hint: {
    kk: 'Жаңалықтар, беттер, құжаттар және педагогтар бойынша іздейміз.',
    ru: 'Ищем по новостям, страницам, документам и педагогам.',
  },
  nothing: { kk: 'Ештеңе табылмады', ru: 'Ничего не найдено' },
  nothingHint: {
    kk: 'Басқа сөзбен көріңіз немесе мәзірден бөлімді ашыңыз.',
    ru: 'Попробуйте другое слово или откройте раздел через меню.',
  },
  found: { kk: 'Табылды', ru: 'Найдено' },
  inNews: { kk: 'Жаңалықтар', ru: 'Новости' },
  inPages: { kk: 'Беттер', ru: 'Страницы' },
  inDocs: { kk: 'Құжаттар', ru: 'Документы' },
  inStaff: { kk: 'Педагогтар', ru: 'Педагоги' },
} as const;

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const { db, profile } = await publicSiteContext(host);
  const locale = localeFrom(search.lang);
  const query = (search.q ?? '').trim();

  const menu = await db.sections.findMany({
    where: { isVisible: true, parentId: null },
    orderBy: { position: 'asc' },
  });

  const results = query ? await runSearch(db, query) : null;

  const posts = results?.posts ?? [];
  const pages = results?.pages ?? [];
  const documents = results?.documents ?? [];
  const staff = results?.staff ?? [];

  const total = posts.length + pages.length + documents.length + staff.length;
  const staffSlug = menu.find((s) => s.type === 'STAFF')?.slug;
  const docsSlug = menu.find((s) => s.type === 'DOCUMENTS')?.slug;

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <SiteHeader profile={profile} sections={menu} locale={locale} pathname="/search" />

      <main id="main" className="container-page max-w-3xl py-8">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{T.title[locale]}</h1>

        <form className="card mt-6 flex flex-wrap gap-3 p-4" role="search">
          {locale !== 'ru' ? <input type="hidden" name="lang" value={locale} /> : null}
          <input
            name="q"
            defaultValue={query}
            className="field min-w-48 flex-1"
            placeholder={T.placeholder[locale]}
            aria-label={T.title[locale]}
            autoFocus
          />
          <button type="submit" className="btn-primary">{T.find[locale]}</button>
        </form>
        <p className="mt-2 text-sm text-muted">{T.hint[locale]}</p>

        {query && total === 0 ? (
          <div className="mt-8">
            <EmptyState icon="🔍" title={T.nothing[locale]} description={T.nothingHint[locale]} />
          </div>
        ) : null}

        {total > 0 ? (
          <p className="mt-8 text-sm text-muted">{T.found[locale]}: {total}</p>
        ) : null}

        {posts.length > 0 ? (
          <Group title={T.inNews[locale]}>
            {posts.map((post) => (
              <Item
                key={post.id}
                href={withLocale(`/${post.section.slug}/${post.slug}`, locale)}
                title={pick(locale, post.titleKk, post.titleRu)}
                note={formatDate(post.publishedAt)}
              />
            ))}
          </Group>
        ) : null}

        {pages.length > 0 ? (
          <Group title={T.inPages[locale]}>
            {pages.map((page) => (
              <Item
                key={page.id}
                href={withLocale(`/${page.section.slug}`, locale)}
                title={pick(locale, page.section.titleKk, page.section.titleRu)}
              />
            ))}
          </Group>
        ) : null}

        {documents.length > 0 && docsSlug ? (
          <Group title={T.inDocs[locale]}>
            {documents.map((doc) => (
              <Item
                key={doc.id}
                href={withLocale(`/${docsSlug}`, locale)}
                title={pick(locale, doc.titleKk, doc.titleRu)}
              />
            ))}
          </Group>
        ) : null}

        {staff.length > 0 && staffSlug ? (
          <Group title={T.inStaff[locale]}>
            {staff.map((member) => (
              <Item
                key={member.id}
                href={withLocale(`/${staffSlug}`, locale)}
                title={member.fullName}
                note={pick(locale, member.positionKk, member.positionRu)}
              />
            ))}
          </Group>
        ) : null}
      </main>

      <SiteFooter profile={profile} sections={menu} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-display text-xl font-bold">{title}</h2>
      <div className="card divide-y divide-line">{children}</div>
    </section>
  );
}

function Item({ href, title, note }: { href: string; title: string; note?: string }) {
  return (
    <Link href={href} className="flex flex-wrap items-baseline gap-x-3 px-5 py-3 hover:bg-brand-soft/40">
      <span className="font-semibold">{title}</span>
      {note ? <span className="text-sm text-muted">{note}</span> : null}
    </Link>
  );
}

/**
 * Поиск подстрокой без учёта регистра. Полнотекстовый индекс потребовал бы
 * отдельных словарей под казахский и русский — для сайта на сотню страниц
 * это лишняя сложность.
 */
async function runSearch(db: Awaited<ReturnType<typeof publicSiteContext>>['db'], query: string) {
  const like = { contains: query, mode: 'insensitive' as const };

  const [posts, pages, documents, staff] = await Promise.all([
    db.posts.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
        OR: [
          { titleRu: like }, { titleKk: like },
          { excerptRu: like }, { excerptKk: like },
          { bodyRu: like }, { bodyKk: like },
        ],
      },
      include: { section: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    }),
    db.pages.findMany({
      where: { OR: [{ bodyRu: like }, { bodyKk: like }] },
      include: { section: true },
      take: 10,
    }),
    db.documents.findMany({
      where: { OR: [{ titleRu: like }, { titleKk: like }] },
      take: 10,
    }),
    db.staff.findMany({
      where: { isVisible: true, OR: [{ fullName: like }, { positionRu: like }, { positionKk: like }] },
      take: 10,
    }),
  ]);

  return { posts, pages, documents, staff };
}
