'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';

export type NavLink = {
  href: string;
  label: string;
  /** Ссылка на другой сайт — открывается в новой вкладке. */
  external?: boolean;
  /** Вложенные разделы: сад собирает их сам в «Разделах меню». */
  children?: NavLink[];
};

const T = {
  /* По-казахски «Мәзір» — это и навигация, и меню питания: рядом с разделом
     «Ас мәзірі» кнопка читалась как ссылка на еду. Оставлено русское слово. */
  menu: { kk: 'Меню', ru: 'Меню' },
  close: { kk: 'Жабу', ru: 'Закрыть' },
  open: { kk: 'Менюді ашу', ru: 'Открыть меню' },
  submenu: { kk: '«%s» бөлімінің ішкі мәзірі', ru: 'Подменю раздела «%s»' },
  newTab: { kk: '(жаңа қойындыда ашылады)', ru: '(откроется в новой вкладке)' },
} as const;

function NavAnchor({
  link,
  className,
  locale,
  onClick,
}: {
  link: NavLink;
  className: string;
  locale: Locale;
  onClick?: () => void;
}) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {link.label}
        <span aria-hidden className="ml-1 text-xs">↗</span>
        <span className="sr-only"> {T.newTab[locale]}</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

/**
 * Пункт с подменю на широком экране. Открывается наведением, фокусом
 * с клавиатуры и нажатием на стрелку — последнее нужно планшетам,
 * где наведения нет. Сам заголовок остаётся ссылкой на раздел.
 */
function DesktopItem({ link, locale }: { link: NavLink; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof MouseEvent && ref.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const itemClass =
    'block rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink';

  if (!link.children?.length) {
    return (
      <li>
        <NavAnchor link={link} className={itemClass} locale={locale} />
      </li>
    );
  }

  const menuId = `submenu-${link.href.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="flex items-center">
        <NavAnchor link={link} className={`${itemClass} pr-1`} locale={locale} />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={T.submenu[locale].replace('%s', link.label)}
          className="rounded-lg px-1.5 py-2 text-muted hover:bg-brand-soft hover:text-brand-ink"
        >
          <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </span>

      {open ? (
        <ul
          id={menuId}
          className="absolute left-0 top-full z-50 min-w-56 rounded-2xl border border-line bg-card p-2 shadow-lift"
        >
          {link.children.map((child) => (
            <li key={child.href}>
              <NavAnchor
                link={child}
                locale={locale}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-brand-soft hover:text-brand-ink"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Меню сайта сада.
 *
 * На широком экране — обычная строка ссылок, у разделов со вложенными —
 * выпадающий список. На телефоне — кнопка и список, где вложенные разделы
 * идут с отступом под своим: разделов у сада больше десятка, и в горизонтальной
 * прокрутке половина из них просто не находится.
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

  const count = links.reduce((sum, link) => sum + 1 + (link.children?.length ?? 0), 0);

  return (
    <>
      <nav className="container-page hidden pb-2 md:block" aria-label={T.menu[locale]}>
        <ul className="flex flex-wrap gap-1">
          {links.map((link) => (
            <DesktopItem key={link.href} link={link} locale={locale} />
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
          <span className="text-sm text-muted">{count}</span>
        </button>

        {open ? (
          <ul id="site-mobile-menu" className="mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-card p-2">
            {links.map((link) => (
              <li key={link.href}>
                <NavAnchor
                  link={link}
                  locale={locale}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-semibold hover:bg-brand-soft hover:text-brand-ink"
                />
                {link.children?.length ? (
                  <ul className="mb-1 ml-4 border-l-2 border-line pl-2">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <NavAnchor
                          link={child}
                          locale={locale}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-4 py-2.5 text-[0.95rem] font-medium text-muted hover:bg-brand-soft hover:text-brand-ink"
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
