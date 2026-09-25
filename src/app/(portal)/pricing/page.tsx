import { redirect } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';

/**
 * Тарифы теперь — раздел главной (#tarify). Адрес оставлен: на него ведут
 * старые ссылки, закладки и поисковики. Перенаправление временное (307),
 * а не постоянное: браузеры запоминают постоянное надолго, и вернуть
 * отдельную страницу потом было бы трудно.
 */
export default async function PricingPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  redirect(`${withLocale('/', locale)}#tarify`);
}
