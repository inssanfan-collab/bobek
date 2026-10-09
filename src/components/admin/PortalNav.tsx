'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { AdminIcon, type IconName } from './AdminIcon';

export type PortalNavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
  /** Пункт нижней панели на телефоне. */
  tab?: boolean;
  /** Подпись на панели, если полная не помещается. */
  tabLabel?: string;
};
export type PortalNavGroup = { label: string; items: PortalNavItem[] };

/** Какой пункт меню текущий: самый длинный адрес, с которого начинается путь. */
function useActive(items: PortalNavItem[]): PortalNavItem | undefined {
  const pathname = usePathname();
  return items
    .filter((item) => (item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function Badge({ value }: { value?: number }) {
  return value ? (
    <span className="ml-auto min-w-5 rounded-md bg-brand px-1.5 py-0.5 text-center text-[11px] font-bold leading-4 text-white">{value}</span>
  ) : null;
}

/** Боковое меню на компьютере: группы, текущий раздел подсвечен. */
export function PortalSideNav({ groups, label }: { groups: PortalNavGroup[]; label: string }) {
  const active = useActive(groups.flatMap((group) => group.items));
  return (
    <nav aria-label={label} className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/80">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const current = item === active;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                      current ? 'bg-brand-soft font-semibold text-brand-ink' : 'font-medium text-ink/80 hover:bg-surface hover:text-ink'
                    }`}
                  >
                    <AdminIcon name={item.icon} className={`h-[18px] w-[18px] shrink-0 ${current ? 'text-brand' : 'text-muted'}`} />
                    <span className="truncate">{item.label}</span>
                    <Badge value={item.badge} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Телефон: вверху — название раздела, внизу — панель как в приложении
 * (главные разделы и «Ещё»). «Ещё» открывает всё меню листом снизу,
 * там же язык и выход.
 */
export function PortalMobileNav({
  groups,
  moreLabel,
  closeLabel,
  title,
  extras,
}: {
  groups: PortalNavGroup[];
  moreLabel: string;
  closeLabel: string;
  title: string;
  extras: ReactNode;
}) {
  const items = groups.flatMap((group) => group.items);
  const active = useActive(items);
  const tabs = items.filter((item) => item.tab);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Переход по ссылке закрывает лист; Escape — тоже.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const moreActive = active && !active.tab;
  const othersBadge = items.filter((item) => !item.tab).reduce((sum, item) => sum + (item.badge ?? 0), 0);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-card/95 px-4 backdrop-blur lg:hidden">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-white" aria-hidden>E</span>
        <span className="min-w-0 truncate text-base font-semibold">{title}</span>
      </header>

      <nav
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {tabs.map((item) => {
          const current = item === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${current ? 'text-brand' : 'text-muted'}`}
            >
              <AdminIcon name={item.icon} className="h-[22px] w-[22px]" />
              <span className="max-w-full truncate px-1">{item.tabLabel ?? item.label}</span>
              {item.badge ? (
                <span className="absolute left-1/2 top-1 ml-2 min-w-4 rounded-md bg-brand px-1 text-center text-[10px] font-bold leading-4 text-white">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${moreActive ? 'text-brand' : 'text-muted'}`}
        >
          <AdminIcon name="more" className="h-[22px] w-[22px]" />
          <span>{moreLabel}</span>
          {othersBadge ? (
            <span className="absolute left-1/2 top-1 ml-2 min-w-4 rounded-md bg-brand px-1 text-center text-[10px] font-bold leading-4 text-white">{othersBadge}</span>
          ) : null}
        </button>
      </nav>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={moreLabel}>
          <button type="button" aria-label={closeLabel} className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-lift">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">{extras}</div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface" aria-label={closeLabel}>
                <AdminIcon name="close" />
              </button>
            </div>
            <PortalSideNav groups={groups} label={moreLabel} />
          </div>
        </div>
      ) : null}
    </>
  );
}
