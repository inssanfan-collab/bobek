'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';
import { forgetPushSubscription, savePushSubscription } from '@/app/(portal)/admin/(shell)/notifications/actions';

const T = {
  checking: { kk: 'Тексерілуде…', ru: 'Проверяем…' },
  on: { kk: 'Осы құрылғыда хабарламалар қосулы.', ru: 'Уведомления на этом устройстве включены.' },
  off: { kk: 'Осы құрылғыда хабарламалар өшірулі.', ru: 'Уведомления на этом устройстве выключены.' },
  enable: { kk: 'Осы құрылғыда қосу', ru: 'Включить на этом устройстве' },
  disable: { kk: 'Осы құрылғыда өшіру', ru: 'Выключить на этом устройстве' },
  denied: {
    kk: 'Браузер хабарламаларға тыйым салған. Оларды браузердің сайт баптауларынан рұқсат етіңіз де, бетті жаңартыңыз.',
    ru: 'Уведомления запрещены в браузере. Разрешите их в настройках сайта в браузере и обновите страницу.',
  },
  iosInstall: {
    kk: 'iPhone-да хабарламалар тек басты экранға орнатылған қосымшада жұмыс істейді: Safari → «Бөлісу» → «Басты экранға», содан кейін әкімші бөлімін белгішеден ашыңыз.',
    ru: 'На iPhone уведомления работают только у приложения на экране «Домой»: Safari → «Поделиться» → «На экран Домой», затем откройте админку с этого значка.',
  },
  unsupported: { kk: 'Бұл браузер push-хабарламаларды қолдамайды.', ru: 'Этот браузер не поддерживает push-уведомления.' },
  failed: { kk: 'Қосылмады. Бетті жаңартып, қайталап көріңіз.', ru: 'Не получилось включить. Обновите страницу и попробуйте ещё раз.' },
} as const;

type State = 'checking' | 'on' | 'off' | 'denied' | 'ios' | 'unsupported';

/** Открытый ключ VAPID из base64url — в байты, как ждёт pushManager.subscribe. */
function keyBytes(base64url: string): Uint8Array {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function registration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin' });
  return navigator.serviceWorker.ready;
}

/**
 * Включение push на этом устройстве. Разрешение браузер спрашивает только
 * по нажатию — поэтому кнопка, а не запрос при входе.
 */
export function PushSettings({ locale, publicKey }: { locale: Locale; publicKey: string }) {
  const [state, setState] = useState<State>('checking');
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported) {
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
      setState(ios ? 'ios' : 'unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    registration()
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'));
  }, []);

  const enable = () =>
    startTransition(async () => {
      setError(false);
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setState(permission === 'denied' ? 'denied' : 'off');
          return;
        }
        const reg = await registration();
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) as BufferSource }));
        const result = await savePushSubscription(sub.toJSON(), navigator.userAgent);
        if (!result.ok) throw new Error('rejected');
        setState('on');
        router.refresh();
      } catch {
        setError(true);
      }
    });

  const disable = () =>
    startTransition(async () => {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await forgetPushSubscription(sub.endpoint);
        await sub.unsubscribe().catch(() => undefined);
      }
      setState('off');
      router.refresh();
    });

  if (state === 'checking') return <p className="text-sm text-muted">{T.checking[locale]}</p>;
  if (state === 'ios') return <p className="text-sm">{T.iosInstall[locale]}</p>;
  if (state === 'unsupported') return <p className="text-sm">{T.unsupported[locale]}</p>;
  if (state === 'denied') return <p className="text-sm text-red-700">{T.denied[locale]}</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{state === 'on' ? `✅ ${T.on[locale]}` : T.off[locale]}</p>
      {state === 'on' ? (
        <button type="button" className="btn-secondary" disabled={pending} onClick={disable}>{T.disable[locale]}</button>
      ) : (
        <button type="button" className="btn-primary" disabled={pending} onClick={enable}>{T.enable[locale]}</button>
      )}
      {error ? <p className="text-sm text-red-700">{T.failed[locale]}</p> : null}
    </div>
  );
}
