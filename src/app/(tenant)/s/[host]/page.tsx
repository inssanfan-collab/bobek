import { publicSiteContext, localeFrom } from '@/server/tenant/context';
import { siteMenu } from '@/server/tenant/menu';
import { ThemedFooter, ThemedHeader, ThemedHome } from '@/components/site/ThemedChrome';
import { UrgentNotice } from '@/components/site/UrgentNotice';
import { recordVisit } from '@/server/stats';
import { coverPosition } from '@/lib/templates';
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

  const [sections, news, announcements, albums, cover] = await Promise.all([
    siteMenu(db),
    db.posts.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, section: { type: 'NEWS' } },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 6,
      include: { coverMedia: true },
    }),
    db.posts.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, section: { type: 'ANNOUNCEMENT' } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { coverMedia: true },
    }),
    db.albums.findMany({
      where: { isVisible: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      take: 3,
      include: { items: { orderBy: { position: 'asc' }, take: 1, include: { media: true } } },
    }),
    profile?.coverMediaId
      ? prisma.media.findFirst({ where: { id: profile.coverMediaId, tenantId: tenant.id } })
      : null,
  ]);

  await recordVisit(tenant.id);

  return (
    <>
      <UrgentNotice profile={profile} locale={locale} />
      <ThemedHeader themeCode={tenant.themeCode} profile={profile} sections={sections} locale={locale} pathname="/" />
      <main id="main">
        <ThemedHome
          themeCode={tenant.themeCode}
          templateCode={tenant.templateCode}
          profile={profile}
          sections={sections}
          news={news}
          announcements={announcements}
          albums={albums}
          locale={locale}
          coverUrl={mediaUrl(cover)}
          coverPosition={coverPosition(profile?.coverFocus)}
        />
      </main>
      <ThemedFooter themeCode={tenant.themeCode} profile={profile} sections={sections} locale={locale} portalDomain={env.portalDomain} />
    </>
  );
}
