import Script from 'next/script';
import { env } from '@/lib/env';

/**
 * Пиксель рекламы в ChatGPT (OpenAI Ads, 23.10.2026) — только на главной
 * портала (решение владельца: туда ведёт реклама и там форма заявки; вставляет
 * SalesHeader при onHome). На других страницах портала, сайтах садов
 * и в админках его нет. Нет OPENAI_ADS_PIXEL_ID — ничего не рисуется.
 *
 * SDK грузится не сразу, чтобы не отнимать процессор телефона при открытии
 * главной: пришли из рекламы (oppref в адресе) — сразу, иначе отметка клика
 * потеряется при переходе на другую страницу; остальным — при первом
 * касании, прокрутке или через 5 секунд. Вызовы oaiq до загрузки копятся
 * в очереди и уходят потом.
 *
 * Форма заявки (SalesApplyForm) после успешной отправки шлёт lead_created —
 * только сам факт, без имени и телефона.
 */
export function OpenAiPixel() {
  const id = env.openaiAdsPixelId;
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return null;
  const init = [
    '(function(w,d){if(w.oaiq)return;',
    'var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;',
    `q('init',{pixelId:'${id}'});`,
    'var done=false;function load(){if(done)return;done=true;',
    "var s=d.createElement('script');s.async=true;s.src='https://bzrcdn.openai.com/sdk/oaiq.min.js';d.head.appendChild(s);}",
    "if(/[?&]oppref=/.test(location.search)){load();return;}",
    "['pointerdown','keydown','scroll','touchstart'].forEach(function(e){addEventListener(e,load,{once:true,passive:true});});",
    'setTimeout(load,5000);})(window,document);',
  ].join('');
  return <Script id="openai-ads" strategy="afterInteractive">{init}</Script>;
}
