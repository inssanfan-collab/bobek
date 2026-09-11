'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';

export type NavLink = { href: string; label: string };

const T = {
  menu: { kk: 'Мәзір', ru: 'Меню' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
  open: { kk: 'Мәзірді ашу', ru: 'Открыть меню' },
} as const;

/**
 * Меню сайта сада.
 *
 * На широком экране — обычная строка ссылок. На телефоне — кнопка и выпадающий
 * список: разделов у сада больше десятка, и в горизонтальной прокрутке
 * половина из них просто не находится, а мобильных посетителей большинство.
 */
export function SiteNav({ links, locale }: { links: NavLink[]; locale: Locale }) {
  const [open, setOpen] = useState(false);

  // Открытое меню не должно «переезжать» вместе со страницей.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <nav className="container-page hidden pb-2 md:block" aria-label={T.menu[locale]}>
        <ul className="flex flex-wrap gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page pb-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          className="btn-secondary w-full justify-between text-base"
        >
          <span className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              {open ? <path d="M6 6 18 18M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            {open ? T.close[locale] : T.menu[locale]}
          </span>
          <span className="text-sm text-muted">{links.length}</span>
        </button>

        {open ? (
          <ul id="site-mobile-menu" className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-card p-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-semibold hover:bg-brand-soft hover:text-brand-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
