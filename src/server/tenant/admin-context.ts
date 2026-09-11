import 'server-only';
import { cache } from 'react';
import { siteContext } from './context';
import { requireTenantUser, type TenantSession } from '@/server/auth/guards';

export type TenantAdminContext = TenantSession & {
  host: string;
  primaryHost: string;
  tenantSlug: string;
  templateCode: string;
  palette: string;
  pattern: string;
};

/**
 * Контекст админки сада: сначала определяем сад по домену, затем проверяем,
 * что вошедший имеет к нему отношение. Порядок важен — иначе по чужому домену
 * можно было бы увидеть собственные данные и решить, что доступ есть.
 */
export const tenantAdmin = cache(async (hostParam: string): Promise<TenantAdminContext> => {
  const site = await siteContext(hostParam);
  const session = await requireTenantUser(site.tenant.id);

  return {
    ...session,
    host: site.host,
    primaryHost: site.primaryHost,
    tenantSlug: site.tenant.slug,
    templateCode: site.tenant.templateCode,
    palette: site.tenant.palette,
    pattern: site.tenant.pattern,
  };
});
