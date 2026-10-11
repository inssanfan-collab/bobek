import { permanentRedirect } from 'next/navigation';
import { localeFromParam, withLocale } from '@/lib/i18n';
import { isPlanCode } from '@/lib/plans';

/**
 * Заявка теперь — форма внизу главной (#zayavka), обработчик тот же
 * (./actions.ts). Выбранный в ссылке тариф (?plan=) едет дальше и отмечен
 * в форме заранее. Перенаправление постоянное — см. /pricing.
 */
export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ lang?: string; plan?: string }> }) {
  const { lang, plan } = await searchParams;
  const locale = localeFromParam(lang);
  const path = isPlanCode(plan) ? `/?plan=${plan}` : '/';
  permanentRedirect(`${withLocale(path, locale)}#zayavka`);
}
