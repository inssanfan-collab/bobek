'use client';

import { useEffect } from 'react';

/**
 * Движение главной — мягкое, под нежную манеру: плавная прокрутка (Lenis),
 * разделы всплывают при появлении, шарики шагов взлетают снизу, цены
 * «набегают» от нуля, радуга и макет первого экрана чуть смещаются.
 *
 * Первый экран не анимируется при загрузке: он виден сразу, без мигания.
 * Прячем только то, что ниже окна, — его всё равно ещё не видно.
 * Прячем прозрачностью, а не visibility: спрятанная так кнопка осталась бы
 * недоступной с клавиатуры, пока до неё не докрутили.
 * Библиотеки грузятся после показа страницы и только на главной; не
 * загрузились или в системе «уменьшить движение» — страница как есть.
 * При уходе со страницы всё снимается: Lenis, триггеры, тикер.
 */
export function SalesMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.sales');
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cleanup: (() => void) | null = null;
    let cancelled = false;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
      .then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        // Якоря меню ведёт Lenis — с поправкой на прилипшую шапку.
        const lenis = new Lenis({ anchors: { offset: -84 } });
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;

        const ctx = gsap.context(() => {
          // Разделы и карточки: всплывают по очереди, когда доходит прокрутка.
          const soft = [
            '.head', '.trust li', '.chips', '.looks:not([hidden])', '.task', '.admin .stage',
            '.plan', '.common', '.plan-notes > div', '.faq-grid > div:first-child', '.faq details',
            '.apply-grid > *',
          ].join(',');
          const items = gsap.utils.toArray<HTMLElement>(soft, root).filter(below);
          gsap.set(items, { opacity: 0, y: 36 });
          ScrollTrigger.batch(items, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, overwrite: true }),
          });

          // Шарики взлетают снизу, каждый чуть позже соседа.
          const steps = gsap.utils.toArray<HTMLElement>('.steps li', root).filter(below);
          gsap.set(steps, { opacity: 0, y: 110 });
          ScrollTrigger.batch(steps, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out', stagger: 0.16 }),
          });

          // Цены набегают от нуля до настоящей — один раз.
          for (const num of gsap.utils.toArray<HTMLElement>('.price .num', root)) {
            const target = Number(num.dataset.value);
            const final = num.textContent ?? '';
            if (!target || !below(num)) continue;
            ScrollTrigger.create({
              trigger: num,
              start: 'top 90%',
              once: true,
              onEnter: () => {
                const state = { v: 0 };
                gsap.to(state, {
                  v: target,
                  duration: 1.3,
                  ease: 'power2.out',
                  // Шаг — тысяча: «90 000 ₸» набегает круглыми суммами, как на ценнике.
                  onUpdate: () => { num.textContent = `${(Math.round(state.v / 1000) * 1000).toLocaleString('ru-RU')} ₸`; },
                  onComplete: () => { num.textContent = final; },
                });
              },
            });
          }

          // Первый экран: радуга уплывает вниз, макет — чуть вверх.
          const hero = root.querySelector('.hero');
          if (hero) {
            gsap.to(root.querySelector('.rainbow'), { y: 120, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
            gsap.to(root.querySelector('.hero-stage'), { y: -40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
          }
        }, root);

        // Вкладки меняют высоту раздела — пересчитать точки срабатывания.
        const clicks = new AbortController();
        root.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('[role="tab"]')) requestAnimationFrame(() => ScrollTrigger.refresh());
        }, { signal: clicks.signal });

        cleanup = () => {
          clicks.abort();
          ctx.revert();
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
