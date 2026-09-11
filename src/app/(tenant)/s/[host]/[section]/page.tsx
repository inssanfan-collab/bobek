import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { publicSiteContext, localeFrom } from '@/server/tenant/context';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UrgentNotice } from '@/components/site/UrgentNotice';
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

export const dynamic = 'force-dynamic';

type Params = { host: string; section: string };

async function loadSection(host: string, slug: string) {
  const context = await publicSiteContext(host);
  const section = await context.db.sections.findFirst({ where: { slug, isVisible: true } });
  if (!section) notFound();
  return { context, section };
}

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

  const menu = await db.sections.findMany({
    where: { isVisible: true, parentId: null },
    orderBy: { position: 'asc' },
  });

  const title = pick(locale, section.titleKk, section.titleRu);

  await recordVisit(context.tenant.id);

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <SiteHeader profile={profile} sections={menu} locale={locale} pathname={basePath} />
      <main id="main" className="container-page py-8">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <div className="mt-6">
          <SectionBody
            type={section.type}
            sectionId={section.id}
            basePath={basePath}
            context={context}
            locale={locale}
          />
        </div>
      </main>
      <SiteFooter profile={profile} sections={menu} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}

async function SectionBody({
  type,
  sectionId,
  basePath,
  context,
  locale,
}: {
  type: string;
  sectionId: string;
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
      const [folders, documents] = await Promise.all([
        db.docFolders.findMany({ orderBy: { position: 'asc' } }),
        db.documents.findMany({
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
      if (!body) return <Empty locale={locale} />;
      return <div className="prose-content max-w-3xl" dangerouslySetInnerHTML={{ __html: body }} />;
    }
  }
}
