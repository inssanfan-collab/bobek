import { permanentRedirect } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';

/**
 * Тарифы теперь — раздел главной (#tarify). Адрес оставлен: на него ведут
 * старые ссылки, закладки и поисковики. Перенаправление постоянное (308,
 * с 11.10.2026): с временным Яндекс держал в поиске старую страницу
 * с ценой «от 50 000 ₸».
 */
export default async function PricingPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = localeFromParam((await searchParams).lang);
  permanentRedirect(`${withLocale('/', locale)}#tarify`);
}
