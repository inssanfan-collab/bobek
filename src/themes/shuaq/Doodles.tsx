/*
 * Рисунки «Шуақ»: облака на ниточках, бумажный самолётик с пунктиром,
 * значки занятий и карточек. Украшения — aria-hidden.
 */

/** Два облака, подвешенные на ниточках, — слева на полосе распорядка. */
export function HangingClouds({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 120 260" fill="none" aria-hidden>
      <path d="M60 0v40M42 110v60M78 110v28" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M22 70h70c9 0 15-6 15-14s-6-14-15-14h-2C87 32 79 26 69 26c-8 0-15 5-18 12a14 14 0 0 0-26 6C14 44 8 50 8 57s6 13 14 13Z" fill="#fff" />
      <path d="M22 70h70" stroke="#E9DFF2" strokeWidth="2" />
      <path d="M14 214h62c8 0 14-6 14-13s-6-13-14-13h-2c-2-9-10-15-19-15-7 0-13 4-16 10a13 13 0 0 0-24 5c-6 0-11 6-11 13s5 13 10 13Z" fill="#fff" />
      <path d="M66 182h34c5 0 9-4 9-8s-4-8-9-8h-1c-1-5-6-9-11-9-4 0-8 2-9 6a8 8 0 0 0-14 3c-4 0-7 3-7 8s3 8 8 8Z" fill="#fff" />
    </svg>
  );
}

/** Бумажный самолётик с пунктирной траекторией. */
export function Plane({ className, color = '#fff' }: { className?: string; color?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 160 70" fill="none" aria-hidden>
      <path d="M4 58c26 6 46-2 54-14s30-22 56-12" stroke={color} strokeWidth="1.6" strokeDasharray="4 4" strokeLinecap="round" />
      <path d="M118 30 156 6l-12 40-9-11-11 8 2-13Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="m135 35 21-29" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Облачко-подпись над отзывами. */
export function Cloud({ className }: { className?: string }) {
  return (
    <svg className={`decor ${className ?? ''}`} viewBox="0 0 110 60" aria-hidden>
      <path d="M24 52h60c10 0 17-7 17-16s-7-16-17-16h-2C80 10 71 4 60 4c-9 0-17 5-20 13A15 15 0 0 0 12 25C5 26 2 32 2 38c0 8 9 14 22 14Z" fill="#FFF6E0" stroke="#1E1E1E" strokeWidth="2" />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  slide: 'M5 20V8a3 3 0 0 1 6 0v12M5 12h6M11 9c4 0 6 3 7 6l2 5',
  school: 'M4 20h16M6 20V10l6-5 6 5v10M10 20v-5h4v5M12 8.5v.01',
  easel: 'M8 3h8v10H8zM12 13v8M9 21l3-8 3 8M6 3h12',
  bus: 'M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11H5zM5 12h14M8 17v2M16 17v2M8 14.5h.01M16 14.5h.01',
  star: 'm12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8Z',
  blocks: 'M4 13h7v7H4zM13 13h7v7h-7zM8.5 4h7v7h-7z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  food: 'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 0-3 2-3 6s1 5 3 5v7',
  arrow: 'M7 17 17 7M9 7h8v8',
};

export function Icon({ name, className }: { name: keyof typeof ICONS | string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name] ?? ICONS.star} />
    </svg>
  );
}

/** Значок к пункту распорядка — по смыслу: еда, сон, прогулка, занятие. */
export function routineIcon(title: string): string {
  const t = title.toLowerCase();
  // Сон — первым: в «Тихий час» есть буквы «ас», а «ас» — это «еда».
  if (/ұйқы|сон|тихий/.test(t)) return 'moon';
  if (/(^|\s)ас(\s|$)|тамақ|завтрак|обед|полдник|ужин/.test(t)) return 'food';
  if (/серуен|прогулк|ойын/.test(t)) return 'sun';
  if (/сурет|рисов|өнер/.test(t)) return 'easel';
  return 'blocks';
}
