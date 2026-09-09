'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminLocale } from '@/server/actions/locale';
import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n';

/**
 * Переключатель языка админки. Рядом с кнопкой выхода в шапке — там же,
 * где его ищут на сайте сада.
 */
export function AdminLocaleSwitch({ locale }: { locale: Locale }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex overflow-hidden rounded-xl border border-line" role="group" aria-label="Язык админки">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending || code === locale}
          aria-current={code === locale}
          onClick={() =>
            startTransition(async () => {
              await setAdminLocale(code);
              // refresh(), а не reload(): язык меняет разметку, отрисованную
              // на сервере, но полная перезагрузка обрывает начатые переходы.
              router.refresh();
            })
          }
          className={
            code === locale
              ? 'bg-brand px-2.5 py-1.5 text-xs font-bold text-white'
              : 'px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink disabled:opacity-50'
          }
        >
          {LOCALE_LABEL[code]}
        </button>
      ))}
    </div>
  );
}
