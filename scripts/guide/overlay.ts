/**
 * Слой поверх страницы для видеоинструкции: курсор, «щелчок», подпись
 * внизу и заставка. Внедряется в каждую страницу до её скриптов
 * (context.addInitScript) и крепится к <html>, а не к <body>: тело
 * страницы принадлежит React, и лишний узел в нём сломал бы гидрацию.
 *
 * Положение курсора переживает переход по ссылке — хранится в sessionStorage,
 * иначе после каждой загрузки он прыгал бы в угол.
 */
export const OVERLAY_SCRIPT = String.raw`
(() => {
  if (window.__guide) return;
  const KEY = '__guide_cursor';
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } })();
  let x = saved?.x ?? innerWidth * 0.62, y = saved?.y ?? innerHeight * 0.45;

  const css = document.createElement('style');
  css.textContent = [
    'nextjs-portal{display:none!important}',
    // запас внизу: иначе подпись закрывает последние кнопки страницы ("Опубликовать")
    'body{padding-bottom:150px!important}',
    '#__g{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Onest,Inter,system-ui,sans-serif}',
    '#__g .cur{position:absolute;left:0;top:0;width:30px;height:30px;will-change:transform;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}',
    '#__g .ring{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;border:3px solid #4F46E5;background:rgba(79,70,229,.18);opacity:0}',
    '#__g .ring.on{animation:__gring .6s ease-out}',
    '@keyframes __gring{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(1.25)}}',
    '#__g .cap{position:absolute;left:50%;bottom:26px;transform:translate(-50%,20px);max-width:min(980px,90vw);padding:14px 24px;border-radius:18px;',
    'background:rgba(21,18,58,.92);color:#fff;font-size:22px;line-height:1.35;font-weight:600;text-align:center;opacity:0;transition:opacity .3s,transform .3s;box-shadow:0 18px 40px -16px rgba(0,0,0,.6)}',
    '#__g .cap.on{opacity:1;transform:translate(-50%,0)}',
    '#__g .cap b{color:#FFC53D;font-weight:700}',
    '#__g .box{position:absolute;border:3px solid #FFC53D;border-radius:12px;box-shadow:0 0 0 9999px rgba(15,23,42,.18);opacity:0;transition:opacity .3s}',
    '#__g .box.on{opacity:1}',
    '#__g.hide{display:none}',
  ].join('');

  const root = document.createElement('div');
  root.id = '__g';
  root.innerHTML = '<div class="box"></div><div class="ring"></div>'
    + '<svg class="cur" viewBox="0 0 24 24"><path d="M4 2.5 20 13l-7 .9L17 21l-3.2 1.5-4-7.3L4 20.5z" fill="#fff" stroke="#15123A" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    + '<div class="cap"></div>';
  const cur = root.querySelector('.cur');
  const ring = root.querySelector('.ring');
  const cap = root.querySelector('.cap');
  const box = root.querySelector('.box');
  const place = () => { cur.style.transform = 'translate(' + (x - 4) + 'px,' + (y - 2) + 'px)'; };
  place();

  const mount = () => { document.documentElement.append(css, root); };
  if (document.documentElement) mount(); else addEventListener('DOMContentLoaded', mount);

  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  window.__guide = {
    moveTo(tx, ty, ms) {
      const fx = x, fy = y, t0 = performance.now();
      return new Promise((done) => {
        const step = (now) => {
          const k = Math.min(1, (now - t0) / ms);
          x = fx + (tx - fx) * ease(k); y = fy + (ty - fy) * ease(k);
          place();
          if (k < 1) requestAnimationFrame(step);
          else { try { sessionStorage.setItem(KEY, JSON.stringify({ x, y })); } catch {} done(); }
        };
        requestAnimationFrame(step);
      });
    },
    click() {
      ring.style.left = x + 'px'; ring.style.top = y + 'px';
      ring.classList.remove('on'); void ring.offsetWidth; ring.classList.add('on');
    },
    caption(html) {
      if (!html) { cap.classList.remove('on'); return; }
      cap.innerHTML = html; cap.classList.add('on');
    },
    frame(r) {
      if (!r) { box.classList.remove('on'); return; }
      Object.assign(box.style, { left: (r.x - 6) + 'px', top: (r.y - 6) + 'px', width: (r.width + 12) + 'px', height: (r.height + 12) + 'px' });
      box.classList.add('on');
    },
    hide(on) { root.classList.toggle('hide', !!on); },
  };
})();
`;

/** Заставка в начале и конце ролика — отдельная страница, не админка. */
export function titleCard(opts: { kicker: string; title: string; sub?: string }): string {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@900&family=Onest:wght@500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%}
  body{display:grid;place-items:center;background:radial-gradient(900px 500px at 85% 10%,#7C73FF 0%,transparent 60%),radial-gradient(700px 400px at 0% 100%,#3B32C9 0%,transparent 60%),#4F46E5;color:#fff;font-family:Onest,sans-serif}
  .c{width:min(980px,86vw)}
  .k{font-size:22px;font-weight:600;opacity:.8;letter-spacing:.02em}
  h1{font-family:Nunito,sans-serif;font-weight:900;font-size:64px;line-height:1.05;letter-spacing:-.02em;margin:14px 0 0}
  p{font-size:24px;opacity:.9;margin:22px 0 0;max-width:40ch}
  .dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#FFC53D;margin-right:10px;vertical-align:1px}
</style></head><body><div class="c"><div class="k"><span class="dot"></span>${esc(opts.kicker)}</div>
<h1>${esc(opts.title)}</h1>${opts.sub ? `<p>${esc(opts.sub)}</p>` : ''}</div></body></html>`;
}
