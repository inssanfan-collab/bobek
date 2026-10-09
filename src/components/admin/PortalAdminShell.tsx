import type { ReactNode } from 'react';
import { AdminPresence } from './AdminPresence';
import { PortalMobileNav, PortalSideNav, type PortalNavGroup } from './PortalNav';

/**
 * Оболочка админки портала — строже админки сада (09.10.2026): нейтральная
 * серая база вместо тёплой бумаги, белые карточки с тонкой рамкой без теней,
 * небольшие скругления, одноцветные значки, меню по группам с текущим
 * разделом. Цвета и скругления переопределяет data-admin="strict"
 * (globals.css) — общие классы .card, .btn, .field остаются те же.
 *
 * На телефоне — нижняя панель с главными разделами и «Ещё» (PortalMobileNav).
 * Админку сада не трогаем: у неё ролики инструкции и снимки на главной.
 */
export function PortalAdminShell({
  title,
  subtitle,
  groups,
  navLabel,
  moreLabel,
  closeLabel,
  extras,
  children,
}: {
  title: string;
  subtitle: string;
  groups: PortalNavGroup[];
  navLabel: string;
  moreLabel: string;
  closeLabel: string;
  /** Язык и выход: на компьютере — внизу бокового меню, на телефоне — в «Ещё». */
  extras: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-admin="strict" className="min-h-screen bg-surface text-ink">
      <AdminPresence />
      <PortalMobileNav groups={groups} moreLabel={moreLabel} closeLabel={closeLabel} title={title} extras={extras} />

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card lg:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-white" aria-hidden>E</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight">{title}</span>
              <span className="block truncate text-xs text-muted">{subtitle}</span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <PortalSideNav groups={groups} label={navLabel} />
          </div>
          <div className="flex items-center gap-2 border-t border-line px-4 py-3">{extras}</div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-[90rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
