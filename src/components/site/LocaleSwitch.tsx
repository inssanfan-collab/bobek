import Link from 'next/link';
import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n';

/**
 * Переключатель языка через параметр адреса. Так у казахской и русской версии
 * разные URL — их видят поисковики, и ссылку можно отправить в WhatsApp «как есть».
 */
export function LocaleSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <div className="flex items-center rounded-xl border border-line p-0.5" role="group" aria-label="Язык сайта">
      {LOCALES.map((code) => {
        const href = code === 'ru' ? pathname : `${pathname}?lang=${code}`;
        const active = code === locale;
        return (
          <Link
            key={code}
            href={href}
            hrefLang={code}
            aria-current={active ? 'true' : undefined}
            className={`rounded-lg px-2.5 py-1 text-sm font-bold transition ${
              active ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft'
            }`}
          >
            {LOCALE_LABEL[code]}
          </Link>
        );
      })}
    </div>
  );
}
