/**
 * Движение продающей главной (образец «В+, живой»): живой фон первого экрана,
 * появление заголовка по словам, шапка-капсула, автопоказ админки, шкала,
 * заполняемая прокруткой, плавная прокрутка.
 *
 * Вызывается из эффекта и возвращает уборку: при переходе на другую страницу
 * портала всё — анимации, слушатели, Lenis, WebGL — должно остановиться.
 * Если библиотека не загрузилась, эффект просто не включается: страница
 * остаётся рабочей, текст и форма видны и без сценария.
 */
import type { Locale } from '@/lib/i18n';
import { ADMIN_CAPTION, ADMIN_DEMO, adminHTML, phoneHTML, type AdminTab } from './mockups';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger;
type SplitTextT = typeof import('gsap/SplitText').SplitText;
type LenisT = typeof import('lenis').default;

export type Libs = { gsap?: Gsap; ScrollTrigger?: ScrollTriggerT; SplitText?: SplitTextT; Lenis?: LenisT };

export function initSales(root: HTMLElement, locale: Locale, libs: Libs): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const abort = new AbortController();
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget | null | undefined, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el?.addEventListener(type, fn as EventListener, { signal: abort.signal });
  };
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
  const cleanups: (() => void)[] = [];

  const G = libs.gsap;
  const ST = libs.ScrollTrigger;
  if (G) G.registerPlugin(...([ST, libs.SplitText].filter(Boolean) as object[]));
  const ctx = G?.context(() => {}, root);
  const inCtx = (fn: () => void) => (ctx ? ctx.add(fn) : fn());

  // ── макеты: телефон и админка ──
  let siteLang: Locale = 'kk';
  let tab: AdminTab = 'news';
  const phone = $('#phone');
  const admin = $('#admin');
  const caption = $('#caption');
  const drawPhone = () => { if (phone) phone.innerHTML = phoneHTML(siteLang); };
  const drawAdmin = () => {
    if (admin) admin.innerHTML = adminHTML(tab, locale);
    if (caption) caption.textContent = ADMIN_CAPTION[locale][tab];
  };
  drawPhone();
  drawAdmin();
  const toggleSiteLang = (e: Event) => {
    if (!(e.target as HTMLElement).closest('.sm-lang')) return;
    siteLang = siteLang === 'kk' ? 'ru' : 'kk';
    drawPhone();
  };
  on(phone, 'click', toggleSiteLang);

  const tabs = $$<HTMLButtonElement>('#tabs [data-tab]');
  const selectTab = (b: HTMLButtonElement) => {
    tab = b.dataset.tab as AdminTab;
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    drawAdmin();
  };
  on($('#tabs'), 'click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
    if (b) selectTab(b);
  });

  // кнопка «Выбрать тариф» заранее отмечает его в форме заявки
  $$('[data-plan]').forEach((a) => on(a, 'click', () => {
    const r = root.querySelector<HTMLInputElement>(`#apply input[name=plan][value="${a.dataset.plan}"]`);
    if (r) r.checked = true;
  }));

  // ── плавная прокрутка ──
  if (!reduce && libs.Lenis) {
    const lenis = new libs.Lenis({ lerp: 0.1, anchors: true });
    if (G && ST) {
      lenis.on('scroll', ST.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      G.ticker.add(tick);
      G.ticker.lagSmoothing(0);
      cleanups.push(() => { G.ticker.remove(tick); G.ticker.lagSmoothing(500, 33); });
    } else {
      let id = 0;
      const raf = (t: number) => { lenis.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
      cleanups.push(() => cancelAnimationFrame(id));
    }
    cleanups.push(() => {
      lenis.destroy();
      // destroy() оставляет на <html> класс lenis — снимаем сами, иначе
      // правила Lenis продолжат действовать на других страницах портала.
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
    });
  }

  mesh();
  hero();
  stickyBar();
  inCtx(adminDemo);
  inCtx(timeline);
  inCtx(reveals);
  inCtx(tactile);
  faq();
  if (ST) {
    const refresh = () => ST.refresh();
    on(window, 'load', refresh);
    document.fonts?.ready.then(() => { if (!abort.signal.aborted) refresh(); });
  }

  return () => {
    abort.abort();
    cleanups.forEach((fn) => fn());
    ctx?.revert();
  };

  // ── живой фон первого экрана: мягкие пятна света на WebGL ──
  function mesh() {
    const cv = $<HTMLCanvasElement>('.mesh');
    const band = $('.band-hero');
    const gl = cv?.getContext('webgl', { antialias: false });
    if (!cv || !band || !gl) { cv?.remove(); return; }
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;
      uniform vec2 u_res; uniform float u_t; uniform vec2 u_m; uniform vec3 u_base;
      float blob(vec2 uv, vec2 c, float r){ vec2 d = uv - c; return exp(-dot(d, d) / (r * r)); }
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        float ar = u_res.x / u_res.y;
        vec2 uv = gl_FragCoord.xy / u_res; uv.x *= ar;
        float t = u_t * .12;
        vec3 col = u_base;
        col = mix(col, vec3(.58, .54, 1.), .55 * blob(uv, vec2(ar * (.2 + .06 * sin(t * 1.3)) + (u_m.x - .5) * .14, .95 + .05 * cos(t)), .42));
        col = mix(col, vec3(.32, .56, 1.), .32 * blob(uv, vec2(ar * (.38 + .06 * cos(t * .8)) + (u_m.x - .5) * .1, .36 + .08 * sin(t * 1.1) + (u_m.y - .5) * .12), .34));
        col = mix(col, u_base * .6, .6 * blob(uv, vec2(ar * (.06 + .04 * sin(t * .9)), -.1 + .05 * cos(t * 1.2)), .55));
        col = mix(col, vec3(.95, .6, .96), .16 * blob(uv, vec2(ar * (.55 + .1 * sin(t * .6)), 1.08), .3));
        col += (hash(gl_FragCoord.xy + fract(u_t)) - .5) * .03;
        gl_FragColor = vec4(col, 1.);
      }`;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    // основной цвет — тот же, что у фона главной картинки: шва не будет
    const hex = getComputedStyle(root).getPropertyValue('--brand').trim() || '#4141CB';
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
    gl.uniform3f(u('u_base'), ...rgb);
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, visible = true, running = false, alive = true;
    on(band, 'pointermove', (e) => {
      const r = band.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height;
    });
    const size = () => {
      const k = Math.min(devicePixelRatio, 1.5) * 0.6;
      cv.width = Math.max(1, (cv.clientWidth * k) | 0); cv.height = Math.max(1, (cv.clientHeight * k) | 0);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    const frame = (t: number) => {
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      gl.uniform2f(u('u_res'), cv.width, cv.height);
      gl.uniform1f(u('u_t'), t / 1000);
      gl.uniform2f(u('u_m'), mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      if (running) return;
      running = true;
      const step = (t: number) => { if (!visible || !alive) { running = false; return; } frame(t); requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    on(window, 'resize', () => { size(); if (reduce) frame(0); });
    size();
    if (reduce) { frame(0); return; }
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible) loop(); });
    io.observe(band);
    loop();
    cleanups.push(() => { alive = false; io.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); });
  }

  // ── первый экран: поставленное появление и объём за курсором ──
  function hero() {
    const ready = () => root.classList.add('ready');
    if (!G || reduce) { ready(); return; }
    const art = $('.hero-art img');
    const phoneBox = $('.phone');
    const band = $('.band-hero');
    if (!art || !phoneBox || !band) { ready(); return; }
    G.set([art, phoneBox], { transformPerspective: 900 });
    document.fonts.ready.then(() => {
      if (abort.signal.aborted) return;
      ready();
      inCtx(() => {
        const h1 = $('.hero h1');
        const words = libs.SplitText && h1 ? new libs.SplitText(h1, { type: 'words', mask: 'words', wordsClass: 'w' }).words : [];
        G.timeline({ defaults: { ease: 'power3.out' } })
          .from($('.band-hero .top'), { y: -20, opacity: 0, duration: 0.6 })
          .from(words, { yPercent: 110, duration: 0.9, stagger: 0.06 }, '-=.3')
          .from($('.hero .lead'), { y: 20, opacity: 0, duration: 0.7 }, '-=.6')
          .from($$('.cta-row > *'), { y: 20, opacity: 0, stagger: 0.08, duration: 0.6 }, '-=.5')
          .from(art, { scale: 0.85, opacity: 0, duration: 1.2, ease: 'back.out(1.4)' }, 0.3)
          .from(phoneBox, { x: -60, y: 40, rotation: -12, opacity: 0, duration: 1.1, ease: 'back.out(1.3)' }, 0.6)
          .from($$('.orbs .o'), { scale: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(2)' }, 0.5)
          .from($$('.trust li'), { y: 20, opacity: 0, stagger: 0.08, duration: 0.6 }, 1);
      });
    });
    const orbs = $$('.orbs .o').map((o) => ({
      x: G.quickTo(o, 'x', { duration: 1.2, ease: 'power3' }),
      y: G.quickTo(o, 'y', { duration: 1.2, ease: 'power3' }),
      d: Number(o.dataset.depth) || 1,
    }));
    on(band, 'pointermove', (e) => {
      const r = band.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      G.to(art, { rotationY: dx * 10, rotationX: -dy * 8, duration: 1, ease: 'power3.out', overwrite: 'auto' });
      G.to(phoneBox, { rotationY: dx * 16, rotationX: -dy * 10, duration: 1, ease: 'power3.out', overwrite: 'auto' });
      orbs.forEach((o) => { o.x(dx * 70 * o.d); o.y(dy * 45 * o.d); });
    });
    on(band, 'pointerleave', () => {
      G.to([art, phoneBox], { rotationX: 0, rotationY: 0, duration: 1.4, ease: 'elastic.out(1, .5)' });
      orbs.forEach((o) => { o.x(0); o.y(0); });
    });
    cleanups.push(() => G.killTweensOf([art, phoneBox, ...$$('.orbs .o')]));
  }

  // ── шапка-капсула, которая выезжает после первого экрана ──
  function stickyBar() {
    const top = $('.band-hero .top');
    const heroBand = $('.band-hero');
    if (!top || !heroBand) return;
    const bar = document.createElement('div');
    bar.className = 'stickybar';
    bar.setAttribute('aria-hidden', 'true');
    bar.append(top.cloneNode(true));
    bar.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    root.append(bar);
    const io = new IntersectionObserver(([e]) => bar.classList.toggle('on', !e?.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    io.observe(heroBand);
    cleanups.push(() => { io.disconnect(); bar.remove(); });
  }

  // ── админка сама показывает три дела ──
  function adminDemo() {
    if (!G || !ST || reduce || !admin) return;
    const texts = ADMIN_DEMO[locale];
    tabs.forEach((b) => b.insertAdjacentHTML('beforeend', '<i class="bar" aria-hidden="true"></i>'));
    const DUR = 7;
    let i = 0;
    let tween: gsap.core.Tween | null = null;
    let inView = false, hover = false, started = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    cleanups.push(() => timers.forEach(clearTimeout));

    const toastIn = (main: Element, text: string) => {
      if (!main.isConnected) return;
      const t = document.createElement('div');
      t.className = 'am-toast';
      t.innerHTML = '<i>✓</i>';
      t.append(text);
      main.append(t);
      G.from(t, { y: 20, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
      G.to(t, { opacity: 0, y: -10, delay: 2.2, duration: 0.4, onComplete: () => t.remove() });
    };
    const scene = (name: AdminTab) => {
      const main = admin.querySelector('.am-main');
      if (!main) return;
      if (name === 'news') {
        const field = [...main.querySelectorAll('.am-field')].find((f) => f.querySelector('label')?.textContent === 'Тақырып');
        const label = field?.querySelector('label');
        if (!field || !label) return;
        field.replaceChildren(label, Object.assign(document.createElement('span'), { className: 'tx' }), Object.assign(document.createElement('span'), { className: 'caret' }));
        const tx = field.querySelector('.tx')!;
        let k = 0;
        const typer = window.setInterval(() => {
          if (!tx.isConnected) { clearInterval(typer); return; }
          k += 1; tx.textContent = texts.title.slice(0, k);
          if (k < texts.title.length) return;
          clearInterval(typer);
          [...main.querySelectorAll('.am-btn')].find((b) => b.textContent?.includes(texts.publish))?.classList.add('pulse');
          later(() => toastIn(main, texts.published), 900);
        }, 75);
        cleanups.push(() => clearInterval(typer));
      } else if (name === 'menu') {
        const today = main.querySelector('tr.today');
        if (today) G.fromTo(today.children, { backgroundColor: 'rgba(255,197,61,.65)' }, { backgroundColor: 'rgba(255,197,61,0)', duration: 1.6, stagger: 0.15, delay: 0.5, clearProps: 'backgroundColor' });
        later(() => toastIn(main, texts.menuSaved), 2600);
      } else {
        const list = main.querySelector('.am-list');
        if (!list) return;
        const row = document.createElement('div');
        row.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="#e9edf1"/><path d="M15 3v4h4" fill="#cfd6de"/></svg>'
          + '<span></span><small><span class="am-upload"><i></i></span></small>';
        row.querySelector('span')!.textContent = texts.newFile;
        list.prepend(row);
        G.from(row, { height: 0, opacity: 0, duration: 0.5, ease: 'power2.out' });
        G.to(row.querySelector('.am-upload i'), {
          width: '100%', duration: 1.8, delay: 0.5, ease: 'power1.inOut',
          onComplete: () => { const s = row.querySelector('small'); if (s) s.textContent = '340 КБ'; toastIn(main, texts.uploaded); },
        });
      }
    };
    const go = (n: number) => {
      i = n;
      const b = tabs[i];
      if (!b) return;
      selectTab(b);
      tabs.forEach((x) => G.set(x.querySelector('.bar'), { scaleX: 0 }));
      tween?.kill();
      tween = G.to(b.querySelector('.bar'), { scaleX: 1, duration: DUR, ease: 'none', paused: !inView || hover, onComplete: () => go((i + 1) % tabs.length) });
      later(() => scene(b.dataset.tab as AdminTab), 60);
    };
    // клик посетителя: начинаем с выбранной вкладки
    on($('#tabs'), 'click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
      if (b && e.isTrusted) go(tabs.indexOf(b));
    });
    const win = $('.window');
    on(win, 'pointerenter', () => { hover = true; tween?.pause(); });
    on(win, 'pointerleave', () => { hover = false; if (inView) tween?.resume(); });
    ST.create({
      trigger: $('.admin'), start: 'top 75%', end: 'bottom 25%',
      onToggle: (st) => {
        inView = st.isActive;
        if (inView && !started) { started = true; go(0); return; }
        if (inView && !hover) tween?.resume(); else tween?.pause();
      },
    });
    // прожектор за курсором на тёмной секции
    const dark = $('#adminka');
    on(dark, 'pointermove', (e) => {
      if (!dark) return;
      const r = dark.getBoundingClientRect();
      dark.style.setProperty('--mx', `${e.clientX - r.left}px`);
      dark.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // ── шкала: заполняется прокруткой ──
  function timeline() {
    const tl = $('#timeline');
    const lis = $$('#timeline li');
    if (!tl) return;
    if (!G || !ST || reduce) { tl.style.setProperty('--p', '1'); lis.forEach((li) => li.classList.add('reached')); return; }
    ST.create({
      trigger: tl, start: 'top 75%', end: 'bottom 50%', scrub: 0.6,
      onUpdate: (st) => {
        tl.style.setProperty('--p', st.progress.toFixed(3));
        lis.forEach((li, k) => li.classList.toggle('reached', st.progress >= k / (lis.length - 1) - 0.02));
      },
    });
    G.from(lis, { y: 40, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(1.6)', scrollTrigger: { trigger: tl, start: 'top 82%' } });
  }

  // ── заголовки секций и карточки появляются при прокрутке ──
  function reveals() {
    if (!G || !ST || reduce) return;
    $$('main h2').forEach((h) => {
      if (h.getBoundingClientRect().top < innerHeight * 0.86) return;
      G.from(h, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 86%' } });
    });
    const items = $$('.plan, .faq details, .common li, .window, .admin-img, .form, .apply-img');
    // прячем только то, что ниже экрана: открытое по ссылке на середину страницы не должно остаться невидимым
    G.set(items.filter((el) => el.getBoundingClientRect().top > innerHeight * 0.9), { y: 34, opacity: 0 });
    ST.batch(items, { start: 'top 90%', once: true, onEnter: (els) => G.to(els, { y: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }) });
    // цены набегают при появлении
    $$('.plan .price').forEach((el) => {
      const node = el.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const final = node.textContent ?? '';
      const target = parseInt(final.replace(/\D/g, ''), 10);
      if (!target) return;
      const obj = { v: 0 };
      const fmt = (v: number) => `${Math.round(v / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
      ST.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => G.to(obj, { v: target, duration: 1.4, ease: 'power2.out', onUpdate: () => { node.textContent = fmt(obj.v); }, onComplete: () => { node.textContent = final; } }),
      });
    });
  }

  // ── объём карточек тарифов, «магнитные» кнопки ──
  function tactile() {
    if (!G || reduce || matchMedia('(hover: none)').matches) return;
    $$('.plan').forEach((c) => {
      G.set(c, { transformPerspective: 1000 });
      on(c, 'pointermove', (e) => {
        const r = c.getBoundingClientRect();
        G.to(c, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 6, duration: 0.6, ease: 'power3.out' });
      });
      on(c, 'pointerleave', () => G.to(c, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, .5)' }));
    });
    $$('.band-hero .sbtn-primary, .band-hero .sbtn-top').forEach((b) => {
      const qx = G.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
      const qy = G.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      on(b, 'pointermove', (e) => {
        const r = b.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.25); qy((e.clientY - r.top - r.height / 2) * 0.35);
      });
      on(b, 'pointerleave', () => { qx(0); qy(0); });
    });
  }

  // ── вопросы раскрываются плавно ──
  function faq() {
    if (reduce) return;
    $$<HTMLDetailsElement>('.faq details').forEach((d) => {
      const s = d.querySelector('summary');
      if (!s) return;
      on(s, 'click', (e) => {
        e.preventDefault();
        const from = d.offsetHeight;
        if (d.open) {
          d.animate({ height: [`${from}px`, `${s.offsetHeight}px`] }, { duration: 280, easing: 'ease-in' }).onfinish = () => { d.open = false; };
        } else {
          d.open = true;
          const to = d.offsetHeight;
          d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 380, easing: 'cubic-bezier(.3,1.25,.5,1)' });
        }
      });
    });
  }
}
