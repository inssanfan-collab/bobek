'use client';

import { useEffect } from 'react';

/**
 * Движение главной под нежную манеру.
 *
 * - Первый экран виден сразу (11.10.2026): раньше он прятался до прихода
 *   этого сценария, и на телефоне с мобильным интернетом заголовок появлялся
 *   через 5 секунд — Google считал главную медленной. Теперь лёгкое всплытие
 *   делает CSS (sales-rise в sales.css) с первой отрисовки, без прозрачности.
 * - Макет первого экрана чуть наклоняется за мышью; радуга и макет смещаются
 *   при прокрутке.
 * - Плавная прокрутка (Lenis), якоря меню — с поправкой на шапку.
 * - Ниже первого экрана всё всплывает при появлении: карточки с лёгким
 *   поворотом, рукописные подписи разделов «пишутся», шарики шагов взлетают,
 *   цены набегают от нуля.
 *
 * Прячем прозрачностью, а не visibility: спрятанная так кнопка осталась бы
 * недоступной с клавиатуры, пока до неё не докрутили. Прячем только то, что
 * ниже окна. При «уменьшить движение» — ничего. При уходе — полная уборка.
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

        const lenis = new Lenis({ anchors: { offset: -84 } });
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const listeners = new AbortController();
        const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;
        const $ = (s: string) => gsap.utils.toArray<HTMLElement>(s, root);

        const ctx = gsap.context(() => {
          // ── первый экран: вступление — в CSS, здесь только наклон и параллакс ──
          const hero = root.querySelector<HTMLElement>('.hero');
          if (hero) {
            // Макет чуть наклоняется за мышью.
            const stage = hero.querySelector<HTMLElement>('.hero-stage');
            if (stage && matchMedia('(hover: hover)').matches) {
              gsap.set(stage, { transformPerspective: 1100 });
              const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'power3.out' });
              const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'power3.out' });
              hero.addEventListener('pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                ry(((e.clientX - r.left) / r.width - 0.5) * 7);
                rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
              }, { signal: listeners.signal });
              hero.addEventListener('pointerleave', () => { rx(0); ry(0); }, { signal: listeners.signal });
            }

            gsap.to('.rainbow', { y: 140, rotate: 6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
            gsap.to('.hero-stage', { y: -50, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
          }

          // ── ниже первого экрана ──
          const soft = $('.head h2, .head p, .chips, .looks:not([hidden]), .admin .stage, .common, .plan-notes > div, .faq-grid > div:first-child > :not(.kicker), .faq details, .apply-grid > *').filter(below);
          gsap.set(soft, { opacity: 0, y: 40 });
          ScrollTrigger.batch(soft, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }),
          });

          // Карточки — с лёгким поворотом, как наклейки, которые прижали.
          const cards = $('.trust li, .task, .plan, .memo').filter(below);
          cards.forEach((card, i) => gsap.set(card, { opacity: 0, y: 50, rotate: i % 2 ? 3 : -3, scale: 0.94 }));
          ScrollTrigger.batch(cards, {
            start: 'top 90%',
            once: true,
            // transform после — снять: у выбранного дела админки свой сдвиг в CSS.
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 1, ease: 'back.out(1.6)', stagger: 0.12, overwrite: true, clearProps: 'transform,opacity' }),
          });

          // Рукописные подписи разделов «пишутся» слева направо.
          const kickers = $('.kicker').filter(below);
          gsap.set(kickers, { clipPath: 'inset(0 100% 0 0)' });
          ScrollTrigger.batch(kickers, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power1.inOut' }),
          });

          // Галочки «входит в оба тарифа» — по одной.
          const checks = $('.common .checks li').filter(below);
          gsap.set(checks, { opacity: 0, x: -14 });
          ScrollTrigger.batch(checks, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06 }),
          });

          // Шарики взлетают снизу, каждый чуть позже соседа, с покачиванием.
          const steps = $('.steps li').filter(below);
          gsap.set(steps, { opacity: 0, y: 140 });
          ScrollTrigger.batch(steps, {
            start: 'top 94%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.6, ease: 'elastic.out(1, 0.75)', stagger: 0.18 }),
          });

          // Цены набегают от нуля до настоящей — круглыми тысячами.
          for (const num of $('.price .num')) {
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
                  duration: 1.4,
                  ease: 'power2.out',
                  onUpdate: () => { num.textContent = `${(Math.round(state.v / 1000) * 1000).toLocaleString('ru-RU')} ₸`; },
                  onComplete: () => { num.textContent = final; },
                });
              },
            });
          }

          // Облака заявки плывут навстречу прокрутке.
          for (const cloud of $('.apply .cloud')) {
            gsap.to(cloud, { x: -80, ease: 'none', scrollTrigger: { trigger: cloud.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
          }
        }, root);

        // Вкладки меняют высоту раздела — пересчитать точки срабатывания.
        root.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('[role="tab"]')) requestAnimationFrame(() => ScrollTrigger.refresh());
        }, { signal: listeners.signal });

        cleanup = () => {
          listeners.abort();
          ctx.revert();
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
