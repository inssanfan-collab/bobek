import Script from 'next/script';
import { env } from '@/lib/env';

/**
 * Тег Google Рекламы — только на продающих страницах портала (его вставляет
 * SalesHeader): по нему Google узнаёт, какие клики по объявлениям привели
 * к заявке. На сайты садов и в админки не попадает — там дети и сотрудники,
 * а не реклама. Нет GOOGLE_ADS_ID — ничего не рисуется.
 *
 * Сам gtag.js (≈440 КБ) грузится не сразу (11.10.2026): он отнимал почти
 * секунду процессора телефона при открытии главной. Пришли с рекламы
 * (gclid в адресе) — сразу, чтобы клик засчитался; остальным — при первом
 * касании, прокрутке или через 5 секунд. События до загрузки копятся
 * в dataLayer и уходят потом.
 *
 * Метку конверсии кладём в window: форма заявки (SalesApplyForm) после
 * успешной отправки сообщает о ней Google.
 */
export function GoogleAdsTag() {
  const id = env.googleAdsId;
  if (!/^AW-\d+$/.test(id)) return null;
  const label = /^[\w-]+$/.test(env.googleAdsLeadLabel) ? env.googleAdsLeadLabel : '';
  const init = [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js',new Date());",
    `gtag('config','${id}');`,
    label ? `window.__edusadLeadConversion='${id}/${label}';` : '',
    '(function(){var done=false;function load(){if(done)return;done=true;',
    "var s=document.createElement('script');s.async=true;",
    `s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s);}`,
    "if(/[?&](gclid|gbraid|wbraid)=/.test(location.search)){load();return;}",
    "['pointerdown','keydown','scroll','touchstart'].forEach(function(e){addEventListener(e,load,{once:true,passive:true});});",
    'setTimeout(load,5000);})();',
  ].join('');
  return <Script id="google-ads" strategy="afterInteractive">{init}</Script>;
}
