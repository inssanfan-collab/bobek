'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import type { Locale } from '@/lib/i18n';
import { checkTelegramLink, startTelegramLink, type LinkState } from './actions';

const T = {
  connect: { kk: 'Telegram-ды қосу', ru: 'Подключить Telegram' },
  preparing: { kk: 'Дайындап жатырмыз…', ru: 'Готовим…' },
  step1: { kk: '1. Ботты ашып, «Start» басыңыз:', ru: '1. Откройте бота и нажмите «Start»:' },
  open: { kk: 'Ботты ашу', ru: 'Открыть бота' },
  step2: { kk: '2. Содан кейін осы жерге оралып, тексеріңіз:', ru: '2. Затем вернитесь сюда и нажмите:' },
  check: { kk: 'Start бастым — тексеру', ru: 'Я нажал Start — проверить' },
  checking: { kk: 'Тексеріп жатырмыз…', ru: 'Проверяем…' },
  done: {
    kk: 'Қосылды — ботта растау хабары келді. Келесі кіруден бастап құпия сөзден кейін Telegram-ға келген код сұралады.',
    ru: 'Подключено — в боте пришло подтверждение. Со следующего входа после пароля будет спрашиваться код из Telegram.',
  },
  not_found: {
    kk: 'Ботта «Start» әлі көрінбейді. Ботты дәл осы батырмамен ашып, «Start» басыңыз да, бірнеше секундтан соң қайта тексеріңіз.',
    ru: 'Нажатия «Start» пока не видно. Откройте бота именно этой кнопкой, нажмите «Start» и через пару секунд проверьте снова.',
  },
  expired: { kk: 'Сілтеме ескірді. Қайта бастаңыз.', ru: 'Ссылка устарела. Начните заново.' },
  not_sent: { kk: 'Бот сізге жаза алмады. Қайталап көріңіз.', ru: 'Бот не смог вам написать. Попробуйте ещё раз.' },
} as const;

export function ConnectTelegram({ csrf, locale, bot }: { csrf: string; locale: Locale; bot: string }) {
  const [started, startAction] = useActionState<LinkState, FormData>(startTelegramLink, {});
  const [checked, checkAction] = useActionState<LinkState, FormData>(checkTelegramLink, {});

  if (checked.done) return <Alert tone="success" className="mt-4">{T.done[locale]}</Alert>;

  const label = checked.error === 'expired' ? undefined : checked.label ?? started.label;
  if (!label) {
    return (
      <form action={startAction} className="mt-4 space-y-3">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        {checked.error === 'expired' ? <Alert tone="danger">{T.expired[locale]}</Alert> : null}
        <SubmitButton className="btn-primary" pendingLabel={T.preparing[locale]}>{T.connect[locale]}</SubmitButton>
      </form>
    );
  }

  return (
    <div className="mt-4 space-y-4 text-sm">
      <div className="space-y-2">
        <p>{T.step1[locale]}</p>
        <a href={`https://t.me/${bot}?start=${label}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          {T.open[locale]} · @{bot}
        </a>
      </div>
      <form action={checkAction} className="space-y-2">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="label" value={label} />
        <p>{T.step2[locale]}</p>
        {checked.error ? <Alert tone="danger">{T[checked.error][locale]}</Alert> : null}
        <SubmitButton className="btn-primary" pendingLabel={T.checking[locale]}>{T.check[locale]}</SubmitButton>
      </form>
    </div>
  );
}
