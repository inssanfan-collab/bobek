import type { ReactNode } from 'react';

const TONES = {
  info: 'border-brand/30 bg-brand-soft text-brand-ink',
  warn: 'border-amber-300 bg-amber-50 text-amber-900',
  danger: 'border-red-300 bg-red-50 text-red-900',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
} as const;

export function Alert({
  tone = 'info',
  title,
  children,
  className = '',
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${TONES[tone]} ${className}`} role={tone === 'danger' ? 'alert' : undefined}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? 'mt-1 text-sm' : 'text-sm'}>{children}</div> : null}
    </div>
  );
}
