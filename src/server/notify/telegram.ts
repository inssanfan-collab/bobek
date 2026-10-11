import 'server-only';
import { env } from '@/lib/env';

/**
 * Бот Telegram для кодов входа — @Edusad_login_bot, отдельный для EduSad
 * (решение владельца 11.10.2026). Токен — TELEGRAM_BOT_TOKEN, только в .env
 * на сервере. Вебхука нет: входящие (нажатие «Start» при подключении)
 * читаем getUpdates в момент проверки.
 */

function api(method: string): string {
  return `https://api.telegram.org/bot${env.telegramBotToken}/${method}`;
}

/** Сообщение в чат. Не бросает: false — токена нет или Telegram не принял. */
export async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!env.telegramBotToken || !/^-?\d{5,20}$/.test(chatId)) return false;
  try {
    const response = await fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    if (!response.ok) console.error('[telegram] не отправлено:', response.status, (await response.text()).slice(0, 200));
    return response.ok;
  } catch (error) {
    console.error('[telegram] не отправлено:', (error as Error).message);
    return false;
  }
}

/** Имя бота (@…) — для ссылки «Открыть бота». */
export async function botUsername(): Promise<string | null> {
  if (!env.telegramBotToken) return null;
  try {
    const response = await fetch(api('getMe'), { signal: AbortSignal.timeout(10_000), cache: 'no-store' });
    const data = (await response.json()) as { result?: { username?: string } };
    return data.result?.username ?? null;
  } catch {
    return null;
  }
}

/**
 * Чат, из которого пришло «/start <метка>» — так подключение узнаёт ваш чат:
 * ссылка t.me/<бот>?start=<метка> открывается только у того, кто её получил.
 */
export async function findStartChat(label: string): Promise<string | null> {
  if (!env.telegramBotToken) return null;
  try {
    const response = await fetch(api('getUpdates'), { signal: AbortSignal.timeout(10_000), cache: 'no-store' });
    const data = (await response.json()) as {
      result?: { message?: { text?: string; chat?: { id?: number; type?: string } } }[];
    };
    for (const update of [...(data.result ?? [])].reverse()) {
      const message = update.message;
      if (message?.chat?.type === 'private' && message.text?.trim() === `/start ${label}` && message.chat.id) {
        return String(message.chat.id);
      }
    }
    return null;
  } catch {
    return null;
  }
}
