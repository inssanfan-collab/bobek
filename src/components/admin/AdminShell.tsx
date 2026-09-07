import Link from 'next/link';
import type { ReactNode } from 'react';

export type NavItem = { href: string; label: string; icon: string; badge?: number };

/**
 * Общая оболочка обеих админок: портала и сада. Отличаются только пунктами меню
 * и заголовком, поэтому вёрстку держим в одном месте.
 */
export function AdminShell({
  title,
  subtitle,
  homeHref,
  nav,
  headerRight,
  banner,
  children,
}: {
  title: string;
  subtitle?: string;
  homeHref: string;
  nav: NavItem[];
  headerRight?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-[100rem] items-center gap-4 px-4 py-3 sm:px-6">
          <Link href={homeHref} className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-brand text-lg text-white" aria-hidden>
              🧸
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display font-extrabold leading-tight">{title}</span>
              {subtitle ? <span className="block truncate text-xs text-muted">{subtitle}</span> : null}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">{headerRight}</div>
        </div>
      </header>

      {banner}

      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav className="lg:w-60 lg:shrink-0" aria-label="Разделы админки">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-brand-soft hover:text-brand-ink"
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs text-white">{item.badge}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
