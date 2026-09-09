import Link from 'next/link';
import type { Metadata } from 'next';
import { publicSiteContext, localeFrom, withLocale } from '@/server/tenant/context';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { EmptyState } from '@/components/ui/EmptyState';
import { pick } from '@/lib/i18n';
import { splitHighlight } from '@/lib/search-query';
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

  const results = query ? await db.search(query) : null;

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
                href={withLocale(`/${post.sectionSlug}/${post.slug}`, locale)}
                title={pick(locale, post.titleKk, post.titleRu)}
                note={formatDate(post.publishedAt, locale)}
                snippet={pick(locale, post.snippetKk, post.snippetRu)}
              />
            ))}
          </Group>
        ) : null}

        {pages.length > 0 ? (
          <Group title={T.inPages[locale]}>
            {pages.map((page) => (
              <Item
                key={page.id}
                href={withLocale(`/${page.sectionSlug}`, locale)}
                title={pick(locale, page.titleKk, page.titleRu)}
                snippet={pick(locale, page.snippetKk, page.snippetRu)}
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

function Item({
  href,
  title,
  note,
  snippet,
}: {
  href: string;
  title: string;
  note?: string;
  snippet?: string;
}) {
  return (
    <Link href={href} className="block px-5 py-3 hover:bg-brand-soft/40">
      <span className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-semibold">{title}</span>
        {note ? <span className="text-sm text-muted">{note}</span> : null}
      </span>
      {snippet ? <Snippet text={snippet} /> : null}
    </Link>
  );
}

/**
 * Фрагмент с подсветкой. Совпадения приходят из ts_headline размеченными
 * управляющими символами, а не готовым HTML: подставлять в страницу разметку,
 * собранную из текста сада, нельзя даже после санитайзера.
 */
function Snippet({ text }: { text: string }) {
  const parts = splitHighlight(text);
  if (parts.length === 0) return null;

  return (
    <span className="mt-1 block text-sm text-muted">
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded bg-brand-soft px-0.5 text-brand-ink">{part.text}</mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </span>
  );
}
