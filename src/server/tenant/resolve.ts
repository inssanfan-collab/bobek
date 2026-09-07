import { prisma } from '@/server/db';
import { normalizeHost } from '@/lib/host';
import type { CertStatus, DomainType, Tenant, TenantProfile, TenantStatus } from '@prisma/client';

export type ResolvedTenant = {
  tenant: Tenant;
  profile: TenantProfile | null;
  /** Хост, по которому пришёл запрос. */
  host: string;
  /** Канонический адрес сада — на него редиректим с остальных. */
  primaryHost: string;
  domainType: DomainType;
  certStatus: CertStatus;
};

type CacheEntry = { value: ResolvedTenant | null; expiresAt: number };

const TTL_MS = 60_000;
const MAX_ENTRIES = 500;
const cache = new Map<string, CacheEntry>();

/**
 * Резолв хоста в сад с кэшем на минуту. Кэшируются и промахи — иначе перебор
 * несуществующих поддоменов бьёт прямо в базу.
 */
export async function resolveTenantByHost(rawHost: string): Promise<ResolvedTenant | null> {
  const host = normalizeHost(rawHost);
  if (!host) return null;

  const cached = cache.get(host);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const domain = await prisma.domain.findUnique({
    where: { host },
    include: { tenant: { include: { profile: true, domains: true } } },
  });

  let value: ResolvedTenant | null = null;
  if (domain && domain.tenant.status !== 'ARCHIVED') {
    const primary =
      domain.tenant.domains.find((d) => d.isPrimary) ??
      domain.tenant.domains.find((d) => d.type === 'SUBDOMAIN') ??
      domain;

    value = {
      tenant: stripRelations(domain.tenant),
      profile: domain.tenant.profile,
      host,
      primaryHost: primary.host,
      domainType: domain.type,
      certStatus: domain.certStatus,
    };
  }

  writeCache(host, value);
  return value;
}

function stripRelations(row: Tenant & { profile?: unknown; domains?: unknown }): Tenant {
  const { profile: _profile, domains: _domains, ...tenant } = row;
  return tenant;
}

function writeCache(host: string, value: ResolvedTenant | null) {
  // Грубый LRU: при переполнении выкидываем самую старую запись (Map хранит порядок вставки).
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(host, { value, expiresAt: Date.now() + TTL_MS });
}

/** Вызывается при любом изменении домена, темы или статуса сада. */
export function invalidateTenantCache(host?: string) {
  if (!host) {
    cache.clear();
    return;
  }
  cache.delete(normalizeHost(host));
}

/** Сброс кэша по всем адресам сада — после смены шаблона, палитры или статуса. */
export async function invalidateTenantCacheById(tenantId: string) {
  const domains = await prisma.domain.findMany({ where: { tenantId }, select: { host: true } });
  for (const d of domains) cache.delete(d.host);
}

/** Статусы, при которых публичный сайт сада виден посетителям. */
export function isPubliclyVisible(status: TenantStatus): boolean {
  return status === 'ACTIVE' || status === 'SUSPENDED';
}
