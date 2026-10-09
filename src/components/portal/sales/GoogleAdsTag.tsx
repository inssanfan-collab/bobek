import Script from 'next/script';
import { env } from '@/lib/env';

/**
 * Тег Google Рекламы — только на продающих страницах портала (его вставляет
 * SalesHeader): по нему Google узнаёт, какие клики по объявлениям привели
 * к заявке. На сайты садов и в админки не попадает — там дети и сотрудники,
 * а не реклама. Нет GOOGLE_ADS_ID — ничего не рисуется.
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
  ].join('');
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-ads" strategy="afterInteractive">{init}</Script>
    </>
  );
}
