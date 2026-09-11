/**
 * Мелкие иконки интерфейса сайта сада: объявления, соцсети, режим для
 * слабовидящих. Причина та же, что у иконок разделов, — эмодзи каждая
 * система рисует по-своему, не красятся в цвет палитры и разъезжаются
 * по размеру рядом с текстом.
 */
const PATHS = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  warn: (
    <>
      <path d="M10.3 4.3 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0" />
      <path d="M12 10v4" />
      <path d="M12 17.5h.01" />
    </>
  ),
  urgent: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v6" />
      <path d="M12 16.5h.01" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v10a2 2 0 0 1-2 2H9l-5 4z" />
      <path d="M8.5 10h.01M12 10h.01M15.5 10h.01" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.8 7.2h.01" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5z" />
    </>
  ),
  facebook: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M14.5 8h-1.2a1.8 1.8 0 0 0-1.8 1.8V12m-1.5 0h4.4" />
      <path d="M13 12v5.5" />
    </>
  ),
  telegram: (
    <>
      <path d="M20.5 4.5 3.8 11c-.8.3-.8 1.4 0 1.7l4 1.4 1.6 4.6c.2.7 1.1.9 1.6.3l2.2-2.4 4.2 3.1c.6.4 1.4.1 1.6-.6l2.4-13c.2-.8-.6-1.5-1.4-1.2z" />
      <path d="m7.8 14.1 9.4-7.2-6.6 8.5" />
    </>
  ),
} as const;

export type UiIconName = keyof typeof PATHS;

export function UiIcon({ name, className }: { name: UiIconName; className?: string }) {
  return (
    <svg
      className={className ?? 'h-5 w-5'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
