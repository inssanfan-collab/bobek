import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * robots.txt портала. У сайтов садов свой — см. (tenant)/s/[host]/robots.txt:
 * какой из двух отдать, решает домен в заголовке Host.
 */
export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: https://${env.portalDomain}/sitemap.xml`,
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
