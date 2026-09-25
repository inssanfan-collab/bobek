'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n';
import { initSales, type Libs } from './live';

/**
 * Оживляет продающую главную. Библиотеки движения грузятся отдельно, уже
 * после того как страница показана, и только на главной: остальному
 * порталу они не нужны. Не загрузились — страница остаётся как есть.
 */
export function SalesLive({ locale }: { locale: Locale }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.sales');
    if (!root) return;
    let stop: (() => void) | null = null;
    let cancelled = false;

    Promise.allSettled([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
      import('lenis'),
    ]).then(([g, st, split, lenis]) => {
      if (cancelled) return;
      const libs: Libs = {
        gsap: g.status === 'fulfilled' ? g.value.gsap : undefined,
        ScrollTrigger: st.status === 'fulfilled' ? st.value.ScrollTrigger : undefined,
        SplitText: split.status === 'fulfilled' ? split.value.SplitText : undefined,
        Lenis: lenis.status === 'fulfilled' ? lenis.value.default : undefined,
      };
      stop = initSales(root, locale, libs);
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [locale]);

  return null;
}
