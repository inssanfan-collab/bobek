import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { botUsername } from '@/server/notify/telegram';
import { disableTelegram, testTelegram } from './actions';
import { ConnectTelegram } from './TelegramForms';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Қауіпсіздік', ru: 'Безопасность' },
  lead: {
    kk: 'Кіру кезінде құпия сөзден кейін бот Telegram-ға 6 цифрлы код жібереді. Құпия сөз біреуге белгілі болса да, сіздің Telegram-сыз кіре алмайды.',
    ru: 'При входе после пароля бот присылает в Telegram код из 6 цифр. Даже если пароль кто-то узнает, без вашего Telegram он не войдёт.',
  },
  card: { kk: 'Telegram арқылы кіру', ru: 'Вход с кодом в Telegram' },
  on: { kk: 'Қосулы — кодтар Telegram-ға келеді.', ru: 'Включён — коды приходят в Telegram.' },
  off: { kk: 'Өшірулі. Кіру тек құпия сөзбен.', ru: 'Выключен. Вход только по паролю.' },
  test: { kk: 'Тексеру хабарын жіберу', ru: 'Прислать проверочное сообщение' },
  disable: { kk: 'Өшіру', ru: 'Отключить' },
  noBot: {
    kk: 'Серверде бот бапталмаған (.env ішіндегі TELEGRAM_BOT_TOKEN).',
    ru: 'На сервере не настроен бот (TELEGRAM_BOT_TOKEN в .env).',
  },
  lostTitle: { kk: 'Telegram қолжетімсіз болса', ru: 'Если Telegram недоступен' },
  lostText: {
    kk: 'Код келмесе, бір минуттан соң қайта кіріп көріңіз. Telegram-ға мүлдем кіре алмасаңыз — кодпен кіруді серверде қолмен өшіруге болады (әзірлеуші арқылы).',
    ru: 'Не пришёл код — попробуйте войти ещё раз через минуту. Совсем нет доступа к Telegram — вход с кодом можно отключить вручную на сервере (через разработчика).',
  },
} as const;

export default async function SecurityPage() {
  const admin = await requireSuperadmin();
  const locale = admin.locale;
  const [user, csrf, bot] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: admin.id }, select: { telegramChatId: true } }),
    csrfToken(),
    botUsername(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <section className="card max-w-2xl p-6">
        <h2 className="font-display text-lg font-bold">{T.card[locale]}</h2>

        {user.telegramChatId ? (
          <>
            <p className="mt-2 text-sm font-semibold text-emerald-700">{T.on[locale]}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <form action={testTelegram}>
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <button type="submit" className="btn-secondary text-sm">{T.test[locale]}</button>
              </form>
              <form action={disableTelegram}>
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <button type="submit" className="btn-secondary text-sm text-red-700">{T.disable[locale]}</button>
              </form>
            </div>
          </>
        ) : bot ? (
          <>
            <p className="mt-2 text-sm text-muted">{T.off[locale]}</p>
            <ConnectTelegram csrf={csrf} locale={locale} bot={bot} />
          </>
        ) : (
          <Alert tone="warn" className="mt-3">{T.noBot[locale]}</Alert>
        )}
      </section>

      <Alert tone="info" title={T.lostTitle[locale]} className="mt-5 max-w-2xl">
        {T.lostText[locale]}
      </Alert>
    </>
  );
}
