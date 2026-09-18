import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { publicSiteContext, localeFrom, withLocale } from '@/server/tenant/context';
import { siteMenu } from '@/server/tenant/menu';
import { ThemedFooter, ThemedHeader } from '@/components/site/ThemedChrome';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { PhotoZoom } from '@/components/site/PhotoZoom';
import { recordVisit } from '@/server/stats';
import { ContactCard } from '@/components/site/blocks';
import {
  AlbumGrid, ClubList, DocumentList, Empty, FaqList, GroupList, MenuTable, PostFeed, StaffList,
  VacanciesBlock,
} from '@/components/site/sections';
import { RouteMap } from '@/components/site/RouteMap';
import { SocialLinks } from '@/components/site/SocialLinks';
import { FeedbackForm } from '@/components/site/FeedbackForm';
import { csrfToken } from '@/server/auth/csrf';
import { pick } from '@/lib/i18n';
import { env } from '@/lib/env';
import { prisma } from '@/server/db';
import { withFileCards } from '@/server/content/file-cards';
import { sectionLink, sectionSettings } from '@/lib/sections';
import { SectionIcon } from '@/components/site/SectionIcon';

export const dynamic = 'force-dynamic';

type Params = { host: string; section: string };

async function loadSection(host: string, slug: string) {
  const context = await publicSiteContext(host);
  const section = await context.db.sections.findFirst({ where: { slug, isVisible: true } });
  if (!section) notFound();

  // Раздел-ссылка своей страницы не имеет. В меню он и так ведёт куда надо,
  // а сюда попадают по старой закладке или из поиска.
  if (section.type === 'LINK') {
    const url = sectionSettings(section.settings).url;
    if (url) redirect(url);
    notFound();
  }

  return { context, section };
}

const T = {
  inside: { kk: 'Осы бөлімде', ru: 'В этом разделе' },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { host, section: slug } = await params;
  const { section } = await loadSection(host, slug);
  return { title: section.titleRu || section.titleKk };
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ host, section: slug }, search] = await Promise.all([params, searchParams]);
  const { context, section } = await loadSection(host, slug);
  const { db, profile } = context;
  const locale = localeFrom(search.lang);
  const basePath = `/${section.slug}`;

  const menu = await siteMenu(db);

  const title = pick(locale, section.titleKk, section.titleRu);

  // Путь назад к родителю и список вложенных разделов — чтобы из подменю
  // можно было выйти, а в раздел с вложенными — зайти не только через меню.
  const branch = menu.find((item) => item.id === section.id || item.id === section.parentId);
  const parent = section.parentId && branch?.id === section.parentId ? branch : null;
  const children = branch?.id === section.id ? branch.children : [];

  await recordVisit(context.tenant.id);

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <ThemedHeader themeCode={context.tenant.themeCode} layout={context.tenant.headerLayout} profile={profile} sections={menu} locale={locale} pathname={basePath} />
      <main id="main" className="container-page py-8">
        {parent ? (
          <Link href={withLocale(`/${parent.slug}`, locale)} className="text-sm font-semibold text-brand">
            ← {pick(locale, parent.titleKk, parent.titleRu)}
          </Link>
        ) : null}
        <h1 className={`font-display text-3xl font-extrabold sm:text-4xl ${parent ? 'mt-3' : ''}`}>{title}</h1>

        {children.length > 0 ? (
          <nav aria-label={T.inside[locale]} className="mt-6">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => {
                const link = sectionLink(child, (path) => withLocale(path, locale));
                const label = pick(locale, child.titleKk, child.titleRu);
                const inner = (
                  <>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                      <SectionIcon type={child.type} className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">{label}</span>
                  </>
                );
                const className = 'card flex items-center gap-3 p-4 transition hover:shadow-lift';
                return (
                  <li key={child.id}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
                    ) : (
                      <Link href={link.href} className={className}>{inner}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <PhotoZoom locale={locale}>
          <div className="mt-6">
            <SectionBody
              type={section.type}
              sectionId={section.id}
              folderId={sectionSettings(section.settings).folderId}
              hasChildren={children.length > 0}
              basePath={basePath}
              context={context}
              locale={locale}
            />
          </div>
        </PhotoZoom>
      </main>
      <ThemedFooter themeCode={context.tenant.themeCode} profile={profile} sections={menu} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}

async function SectionBody({
  type,
  sectionId,
  folderId,
  hasChildren,
  basePath,
  context,
  locale,
}: {
  type: string;
  sectionId: string;
  /** «Документы из папки»: показать только эту папку. */
  folderId: string | null;
  /** У раздела есть вложенные — пустую страницу тогда не показываем. */
  hasChildren: boolean;
  basePath: string;
  context: Awaited<ReturnType<typeof publicSiteContext>>;
  locale: ReturnType<typeof localeFrom>;
}) {
  const { db, profile, tenant } = context;

  switch (type) {
    case 'NEWS':
    case 'ANNOUNCEMENT': {
      const posts = await db.posts.findMany({
        where: { sectionId, status: 'PUBLISHED', publishedAt: { lte: new Date() } },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 50,
        include: { coverMedia: true },
      });
      return <PostFeed posts={posts} locale={locale} basePath={basePath} />;
    }

    case 'GALLERY': {
      const albums = await db.albums.findMany({
        where: { isVisible: true },
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        include: {
          items: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
          _count: { select: { items: true } },
        },
      });
      return <AlbumGrid albums={albums} locale={locale} basePath={basePath} />;
    }

    case 'DOCUMENTS': {
      // Свой раздел «документы из папки» показывает одну папку; общий — все.
      const [folders, documents] = await Promise.all([
        db.docFolders.findMany({
          where: folderId ? { id: folderId } : undefined,
          orderBy: { position: 'asc' },
        }),
        db.documents.findMany({
          where: folderId ? { folderId } : undefined,
          orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }],
          include: { media: true },
        }),
      ]);
      return <DocumentList folders={folders} documents={documents} locale={locale} />;
    }

    case 'STAFF': {
      const staff = await db.staff.findMany({
        where: { isVisible: true },
        orderBy: { position: 'asc' },
        include: { photo: true },
      });
      return <StaffList staff={staff} locale={locale} />;
    }

    case 'GROUPS': {
      const groups = await db.groups.findMany({ where: { isVisible: true }, orderBy: { position: 'asc' } });
      return <GroupList groups={groups} locale={locale} />;
    }

    case 'MENU_FOOD': {
      const days = await db.menuDays.findMany({ orderBy: { date: 'desc' }, take: 14 });
      return <MenuTable days={days} locale={locale} />;
    }

    case 'VACANCIES': {
      const groups = await db.groups.findMany({ where: { isVisible: true }, orderBy: { position: 'asc' } });
      return <VacanciesBlock profile={profile} groups={groups} locale={locale} />;
    }

    case 'CLUBS': {
      const clubs = await prisma.club.findMany({
        where: { tenantId: tenant.id, isVisible: true },
        orderBy: { position: 'asc' },
      });
      return <ClubList clubs={clubs} locale={locale} />;
    }

    case 'FAQ': {
      const items = await prisma.faqItem.findMany({
        where: { tenantId: tenant.id, isVisible: true },
        orderBy: { position: 'asc' },
      });
      return <FaqList items={items} locale={locale} />;
    }

    case 'CONTACTS':
      return (
        <div className="space-y-6">
          <ContactCard profile={profile} locale={locale} />
          <SocialLinks profile={profile} locale={locale} />
          <RouteMap
            lat={profile?.lat ?? null}
            lng={profile?.lng ?? null}
            address={pick(locale, profile?.addressKk, profile?.addressRu)}
            locale={locale}
          />
        </div>
      );

    case 'FEEDBACK': {
      const csrf = await csrfToken();
      return <FeedbackForm csrf={csrf} tenantId={tenant.id} locale={locale} />;
    }

    default: {
      // PAGE, TRUSTEE_BOARD, ANTICORRUPTION — обычные текстовые страницы.
      const page = await db.pages.findFirst({ where: { sectionId } });
      const body = locale === 'kk' ? page?.bodyKk || page?.bodyRu : page?.bodyRu || page?.bodyKk;
      // Раздел-«папка» для вложенных часто без своего текста: плашка
      // «материалы пока не добавлены» под списком вложенных сбивала бы с толку.
      if (!body) return hasChildren ? null : <Empty locale={locale} />;
      const html = await withFileCards(body, db, locale);
      return <div className="prose-content max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />;
    }
  }
}
