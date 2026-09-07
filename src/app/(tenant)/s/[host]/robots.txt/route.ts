import { NextResponse } from 'next/server';
import { siteContext } from '@/server/tenant/context';
import { isPubliclyVisible } from '@/server/tenant/resolve';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ host: string }> },
) {
  const { host } = await params;
  const { tenant, primaryHost } = await siteContext(host);

  // Черновик сада индексировать нельзя: сайт ещё пустой и испортит выдачу.
  const body = isPubliclyVisible(tenant.status)
    ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://${primaryHost}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
