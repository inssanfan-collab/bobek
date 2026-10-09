import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { PushSettings } from '@/components/admin/PushSettings';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { vapidPublicKey } from '@/server/notify/push';
import { formatDateTime } from '@/lib/labels';
import { deviceName } from '@/lib/presence';
import { deletePushDevice, sendTestPush } from './actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Хабарламалар', ru: 'Уведомления' },
  lead: {
    kk: 'Әкімші бөлімін телефонға қосымша ретінде орнатып, маңызды оқиғалар туралы push-хабарлама алыңыз.',
    ru: 'Поставьте админку на телефон как приложение и получайте push-уведомления о важном.',
  },
  notConfigured: { kk: 'Push бапталмаған', ru: 'Push не настроен' },
  notConfiguredText: {
    kk: 'Серверде VAPID кілттері жоқ (.env ішіндегі VAPID_PUBLIC_KEY және VAPID_PRIVATE_KEY). Хаттар бұрынғыдай жіберіледі.',
    ru: 'На сервере нет ключей VAPID (VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY в .env). Письма уходят как раньше.',
  },
  thisDevice: { kk: 'Осы құрылғы', ru: 'Это устройство' },
  install: { kk: 'Қосымша ретінде қалай орнатуға болады', ru: 'Как поставить как приложение' },
  installAndroid: {
    kk: 'Android (Chrome): мәзір ⋮ → «Қосымшаны орнату» немесе «Басты экранға қосу».',
    ru: 'Android (Chrome): меню ⋮ → «Установить приложение» или «Добавить на главный экран».',
  },
  installIphone: {
    kk: 'iPhone (Safari): «Бөлісу» батырмасы → «Басты экранға». Хабарламаларды белгішеден ашылған қосымшада қосыңыз — iPhone-да тек солай жұмыс істейді.',
    ru: 'iPhone (Safari): кнопка «Поделиться» → «На экран Домой». Уведомления включайте уже в приложении, открытом с этого значка, — на iPhone они работают только так.',
  },
  installDesktop: {
    kk: 'Компьютер (Chrome, Edge): мекенжай жолындағы орнату белгішесі.',
    ru: 'Компьютер (Chrome, Edge): значок установки в адресной строке.',
  },
  what: { kk: 'Не келеді', ru: 'Что приходит' },
  whatList: {
    kk: [
      'Сайттан жаңа өтінім',
      'Кіру бұғатталды (бес қате әрекет)',
      'Серверде қате, жеке тақырып құлады',
      'Сайт не қызмет істемей тұр, сертификат пен диск (күзетші)',
      'Дерекқор көшірмесі жасалмады',
      'Таңертеңгі жазылымдар қорытындысы',
    ],
    ru: [
      'Новая заявка с сайта',
      'Вход заблокирован (пять ошибок подряд)',
      'Ошибка на сервере, упала индивидуальная тема',
      'Не работает сайт или служба, сертификат и диск (сторож)',
      'Не снялась копия базы',
      'Утренняя сводка по подпискам',
    ],
  },
  devices: { kk: 'Құрылғылар', ru: 'Устройства' },
  noDevices: { kk: 'Әзірге бірде-бір құрылғы қосылмаған.', ru: 'Пока не подключено ни одного устройства.' },
  added: { kk: 'Қосылды', ru: 'Подключено' },
  lastSent: { kk: 'Соңғы хабарлама', ru: 'Последнее уведомление' },
  never: { kk: 'әлі болған жоқ', ru: 'ещё не было' },
  remove: { kk: 'Өшіру', ru: 'Удалить' },
  test: { kk: 'Тексеру хабарламасын жіберу', ru: 'Отправить проверочное' },
} as const;

export default async function NotificationsPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const [devices, csrf] = await Promise.all([
    prisma.pushSubscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {!vapidPublicKey ? (
        <Alert tone="warn" title={T.notConfigured[locale]} className="mb-5">
          {T.notConfiguredText[locale]}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{T.thisDevice[locale]}</h2>
          <div className="mt-3">
            {vapidPublicKey ? <PushSettings locale={locale} publicKey={vapidPublicKey} /> : <p className="text-sm text-muted">—</p>}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">{T.what[locale]}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {T.whatList[locale].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">{T.install[locale]}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>📱 {T.installAndroid[locale]}</li>
            <li>🍏 {T.installIphone[locale]}</li>
            <li>💻 {T.installDesktop[locale]}</li>
          </ul>
        </section>

        <section className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">{T.devices[locale]}</h2>
            {devices.length > 0 && vapidPublicKey ? (
              <form action={sendTestPush}>
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <button type="submit" className="btn-secondary text-sm">{T.test[locale]}</button>
              </form>
            ) : null}
          </div>
          {devices.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{T.noDevices[locale]}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {devices.map((device) => (
                <li key={device.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{deviceName(device.userAgent)}</p>
                    <p className="text-xs text-muted">
                      {T.added[locale]}: {formatDateTime(device.createdAt, locale)} · {T.lastSent[locale]}:{' '}
                      {device.lastSentAt ? formatDateTime(device.lastSentAt, locale) : T.never[locale]}
                    </p>
                  </div>
                  <form action={deletePushDevice}>
                    <input type="hidden" name={CSRF_FIELD} value={csrf} />
                    <input type="hidden" name="id" value={device.id} />
                    <button type="submit" className="btn-secondary text-sm">{T.remove[locale]}</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
