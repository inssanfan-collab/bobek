'use client';

import { useEffect } from 'react';

/**
 * Движение главной под нежную манеру.
 *
 * - Вступление первого экрана: слова заголовка выезжают по одному, маркер
 *   прорисовывается, кнопки и макет подплывают, подписи-облачка выскакивают,
 *   рукописная строчка «пишется». До сценария первый экран спрятан классом
 *   `sales-intro` на <html> (его ставит строчка в разметке главной, ещё до
 *   отрисовки) — так он не мигает; сценарий не пришёл — CSS покажет всё сам.
 * - Макет первого экрана чуть наклоняется за мышью; радуга и макет смещаются
 *   при прокрутке.
 * - Плавная прокрутка (Lenis), якоря меню — с поправкой на шапку.
 * - Лента дизайнов: раздел залипает, и прокрутка листает сайт в рамке,
 *   а потом «переодевает» его в следующий дизайн (только от 1081 px).
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
    const html = document.documentElement;
    const root = document.querySelector<HTMLElement>('.sales');
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.remove('sales-intro');
      return;
    }
    let cleanup: (() => void) | null = null;
    let cancelled = false;

    // Шрифт — дождаться: слова заголовка делятся по готовым строкам.
    Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('lenis'), document.fonts.ready])
      .then(([{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);

        const lenis = new Lenis({ anchors: { offset: -84 } });
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const listeners = new AbortController();
        const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;
        const $ = (s: string) => gsap.utils.toArray<HTMLElement>(s, root);

        const ctx = gsap.context(() => {
          // ── вступление ──
          const hero = root.querySelector<HTMLElement>('.hero');
          const title = hero?.querySelector('h1');
          if (hero && title) {
            const words = SplitText.create(title, { type: 'words', wordsClass: 'w' });
            const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
            intro
              .from('.hero .label', { y: -18, opacity: 0, duration: 0.6 })
              .from(words.words, { y: 42, rotate: 4, opacity: 0, duration: 0.8, stagger: 0.07 }, '-=0.3')
              .from('.hero .hl', { backgroundSize: '0% 100%', duration: 0.9, ease: 'power2.inOut' }, '-=0.35')
              .from('.hero .lead', { y: 22, opacity: 0, duration: 0.7 }, '-=0.7')
              .from('.hero .cta > *', { y: 22, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
              .from('.hero .facts li', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
              .from('.hero-stage .frame', { y: 70, rotate: -3, scale: 0.95, opacity: 0, duration: 1.1 }, 0.35)
              .from('.hero-stage .phone', { x: -60, y: 40, rotate: -8, opacity: 0, duration: 1 }, 0.6)
              .from('.hero-stage .bubble', { scale: 0, opacity: 0, duration: 0.7, stagger: 0.18, ease: 'back.out(2.2)' }, 1.1)
              .from('.hero-hand', { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power1.inOut' }, 1.5);
            // Начальные положения уже выставлены — снимаем прятку.
            html.classList.remove('sales-intro');

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
          } else {
            html.classList.remove('sales-intro');
          }

          // ── лента дизайнов: раздел залипает, сайт в рамке листается вниз
          // и «переодевается» в следующий дизайн, слева подсвечено название ──
          const reel = root.querySelector<HTMLElement>('.reel');
          const desks = $('.reel-screen img');
          if (reel && desks.length > 1 && matchMedia('(min-width: 1081px)').matches) {
            const mobs = $('.reel-phone-screen img');
            const items = $('.reel-list li');
            const n = desks.length;
            // Листаем верхние ~55 % страницы: там самое узнаваемое.
            const travel = (img: HTMLElement) => () => -Math.max(0, img.offsetHeight * 0.55 - (img.parentElement?.clientHeight ?? 0));
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: reel,
                start: 'top 70px',
                end: () => `+=${n * innerHeight * 0.85}`,
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const active = Math.min(n - 1, Math.floor(self.progress * n));
                  items.forEach((item, i) => item.classList.toggle('on', i === active));
                },
              },
            });
            desks.forEach((desk, i) => {
              const mob = mobs[i];
              tl.to(desk, { y: travel(desk), duration: 1 }, i);
              if (mob) tl.to(mob, { y: travel(mob), duration: 1 }, i);
              const next = [desks[i + 1], mobs[i + 1]].filter(Boolean);
              if (next.length) tl.fromTo(next, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.22 }, i + 0.78);
            });
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
      .catch(() => html.classList.remove('sales-intro'));

    return () => {
      cancelled = true;
      cleanup?.();
      html.classList.remove('sales-intro');
    };
  }, []);

  return null;
}
