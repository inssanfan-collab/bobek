import { publicSiteContext, localeFrom } from '@/server/tenant/context';
import { siteMenu } from '@/server/tenant/menu';
import { ThemedFooter, ThemedHeader, ThemedHome } from '@/components/site/ThemedChrome';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { recordVisit } from '@/server/stats';
import { coverPosition } from '@/lib/templates';
import { homeTileSections } from '@/lib/sections';
import { heroContent } from '@/lib/hero';
import { mediaUrl } from '@/components/site/blocks';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function TenantHome({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const { tenant, profile, db } = await publicSiteContext(host);
  const locale = localeFrom(search.lang);

  const visible = { where: { isVisible: true }, orderBy: { position: 'asc' as const } };
  const [sections, newsFeed, announcements, albums, cover, documents, staff, groups, clubs, faq, reviews, prices, routine, photos] = await Promise.all([
    siteMenu(db),
    db.posts.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, section: { type: 'NEWS' } },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      // Девять — для тем с лентой подлиннее; шаблонам по-прежнему уходит шесть.
      take: 9,
      include: { coverMedia: true },
    }),
    db.posts.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, section: { type: 'ANNOUNCEMENT' } },
      // Закреплённое — первым, как в новостях и на странице раздела.
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 5,
      include: { coverMedia: true },
    }),
    db.albums.findMany({
      where: { isVisible: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      take: 3,
      // До шести фото на альбом: темам с галереей плиткой нужно больше одной обложки.
      include: { items: { orderBy: { position: 'asc' }, take: 6, include: { media: true } } },
    }),
    profile?.coverMediaId
      ? prisma.media.findFirst({ where: { id: profile.coverMediaId, tenantId: tenant.id } })
      : null,
    db.documents.findMany({ orderBy: { publishedAt: 'desc' }, take: 5, include: { media: true } }),
    db.staff.findMany({ ...visible, include: { photo: true } }),
    db.groups.findMany(visible),
    prisma.club.findMany({ where: { tenantId: tenant.id, isVisible: true }, orderBy: { position: 'asc' } }),
    prisma.faqItem.findMany({ where: { tenantId: tenant.id, isVisible: true }, orderBy: { position: 'asc' } }),
    db.reviews.findMany(visible),
    db.pricePlans.findMany(visible),
    db.routine.findMany({ orderBy: { position: 'asc' } }),
    db.albums.latestPhotos(3),
  ]);
  const news = newsFeed.slice(0, 6);

  await recordVisit(tenant.id);

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <ThemedHeader themeCode={tenant.themeCode} layout={tenant.headerLayout} profile={profile} sections={sections} locale={locale} pathname="/" />
      <main id="main">
        <ThemedHome
          themeCode={tenant.themeCode}
          templateCode={tenant.templateCode}
          profile={profile}
          sections={homeTileSections(sections, tenant)}
          showContacts={tenant.homeShowContacts}
          hero={heroContent(profile, locale)}
          news={news}
          announcements={announcements}
          albums={albums}
          locale={locale}
          coverUrl={mediaUrl(cover)}
          coverPosition={coverPosition(profile?.coverFocus)}
          documents={documents}
          menu={sections}
          newsFeed={newsFeed}
          photos={photos}
          staff={staff}
          groups={groups}
          clubs={clubs}
          faq={faq}
          reviews={reviews}
          prices={prices}
          routine={routine}
          counts={{ staff: staff.length, groups: groups.length }}
        />
      </main>
      <ThemedFooter themeCode={tenant.themeCode} profile={profile} sections={sections} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}
