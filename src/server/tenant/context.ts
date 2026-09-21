import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { resolveTenantByHost, isPubliclyVisible, type ResolvedTenant } from './resolve';
import { scoped, type TenantScope } from '@/server/db/scope';
import { isLocale, localeFromParam, withLocale as withLocaleFor, type Locale } from '@/lib/i18n';

export type SiteContext = ResolvedTenant & { db: TenantScope };

/**
 * cache() на время одного запроса: layout, страница и generateMetadata резолвят
 * один и тот же хост — без него это три одинаковых обращения к БД.
 */
export const siteContext = cache(async (hostParam: string): Promise<SiteContext> => {
  const resolved = await resolveTenantByHost(decodeURIComponent(hostParam));
  if (!resolved) notFound();
  siteLocale().value = isLocale(resolved.tenant.defaultLocale) ? resolved.tenant.defaultLocale : 'kk';
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

/**
 * Язык сайта по умолчанию — свой у каждого сада. Хранится на время запроса
 * (cache), чтобы его не пришлось протаскивать пропом через шапку, подвал,
 * шаблоны и темы: полсотни мест строят ссылки через withLocale.
 * Заполняется в siteContext — его вызывает и layout, и каждая страница.
 * Вне запроса (тесты) остаётся русский, как у портала.
 */
const siteLocale = cache((): { value: Locale } => ({ value: 'ru' }));

export function siteDefaultLocale(): Locale {
  return siteLocale().value;
}

/** Язык страницы: из ?lang=, а без него — язык, выбранный садом. */
export function localeFrom(value: string | string[] | undefined): Locale {
  return localeFromParam(value, siteDefaultLocale());
}

/** Ссылка внутри сайта сада: параметр языка — только если он не основной. */
export function withLocale(href: string, locale: Locale): string {
  return withLocaleFor(href, locale, siteDefaultLocale());
}
