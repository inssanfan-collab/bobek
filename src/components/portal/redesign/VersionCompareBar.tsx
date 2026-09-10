'use client';

import Link from 'next/link';
import { withLocale, type Locale } from '@/lib/i18n';

interface VersionCompareBarProps {
  locale: Locale;
  currentMode: 'redesign' | 'original';
}

export function VersionCompareBar({ locale, currentMode }: VersionCompareBarProps) {
  const isKk = locale === 'kk';

  return (
    <aside aria-label="Версия предпросмотра" className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50/95 px-4 py-2.5 backdrop-blur shadow-xs">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[11px]">
            ★
          </span>
          <span className="font-bold text-amber-950">
            {isKk ? 'Жаңа дизайн концептісі (Senior UI/UX Preview)' : 'Новый дизайн-концепт (Senior UI/UX Preview)'}
          </span>
          <span className="hidden sm:inline text-amber-800/80">
            {isKk
              ? '— алдын ала бағалауға арналған бөлек нұсқа'
              : '— отдельная страница для вашей оценки'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentMode === 'redesign' ? (
            <>
              <span className="rounded-lg bg-amber-200/80 px-2.5 py-1 font-bold text-amber-900 text-[11px]">
                {isKk ? 'Ағымдағы: Жаңа дизайн (v2)' : 'Сейчас: Новый дизайн (v2)'}
              </span>
              <Link
                href={withLocale('/', locale)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1 font-bold text-amber-950 hover:bg-amber-100 transition shadow-xs"
              >
                {isKk ? '← Бастапқы нұсқаны көру (/)' : '← Открыть старую версию (/)'}
              </Link>
            </>
          ) : (
            <Link
              href={withLocale('/redesign', locale)}
              className="rounded-lg bg-brand px-3 py-1 font-bold text-white hover:brightness-110 transition shadow-xs"
            >
              {isKk ? 'Жаңа UI/UX нұсқасын көру (v2) →' : 'Посмотреть новый UI/UX дизайн (v2) →'}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
