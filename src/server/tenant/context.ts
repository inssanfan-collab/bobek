import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { resolveTenantByHost, isPubliclyVisible, type ResolvedTenant } from './resolve';
import { scoped, type TenantScope } from '@/server/db/scope';
import { localeFromParam, withLocale } from '@/lib/i18n';

export type SiteContext = ResolvedTenant & { db: TenantScope };

/**
 * cache() на время одного запроса: layout, страница и generateMetadata резолвят
 * один и тот же хост — без него это три одинаковых обращения к БД.
 */
export const siteContext = cache(async (hostParam: string): Promise<SiteContext> => {
  const resolved = await resolveTenantByHost(decodeURIComponent(hostParam));
  if (!resolved) notFound();
  return { ...resolved, db: scoped(resolved.tenant.id) };
});

/**
 * Публичная часть сайта. Черновик посетителям не показываем вовсе — для них
 * такого сайта нет. Приостановленный сад отправляем на страницу «временно
 * недоступен»: сайт существует, и родитель, открывший его по старой ссылке,
 * должен понять, что дело не в опечатке, и найти хотя бы телефон сада.
 */
export const publicSiteContext = cache(async (hostParam: string): Promise<SiteContext> => {
  const context = await siteContext(hostParam);
  if (context.tenant.status === 'SUSPENDED') redirect('/unavailable');
  if (!isPubliclyVisible(context.tenant.status)) notFound();
  return context;
});

export const localeFrom = localeFromParam;

export { withLocale };
