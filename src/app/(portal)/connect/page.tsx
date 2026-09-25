import { redirect } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';

/**
 * «Подключить сад» — это и есть главная: она с 23.09.2026 продаёт сайты
 * садам. Адрес оставлен ради старых ссылок (кнопки на страницах для
 * родителей, закладки); перенаправление временное — см. /pricing.
 */
export default async function ConnectPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  redirect(withLocale('/', locale));
}
