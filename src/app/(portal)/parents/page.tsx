import { redirect } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';

/**
 * Страницы «Родителям» больше нет: портал продаёт сайты садам, а родителю
 * всё нужное — на сайте его сада. Адрес оставлен для старых ссылок
 * и поисковиков, ведёт на главную.
 */
export default async function ParentsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  redirect(withLocale('/', locale));
}
