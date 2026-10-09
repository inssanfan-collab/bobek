import 'server-only';
import { prisma } from '@/server/db';
import { sendPushToOwners, vapidFromEnv, type PushMessage } from './push-send';

/** Ключи читаются один раз: окружение во время работы не меняется. */
const keys = vapidFromEnv();

/** Открытый ключ VAPID — нужен браузеру, чтобы подписаться. Пусто — push не настроен. */
export const vapidPublicKey = keys?.publicKey ?? '';

/** Push владельцу портала. Не бросает — см. sendPushToOwners. */
export function pushToOwners(message: PushMessage): Promise<number> {
  return sendPushToOwners(prisma, keys, message);
}

/** Сколько раз за последний час уже сообщали об ошибке с этим текстом. */
const recentErrors = new Map<string, number>();
const HOUR = 60 * 60 * 1000;

/**
 * Ошибка на сервере (instrumentation.ts → onRequestError). Одна и та же
 * ошибка — не чаще раза в час: упавшая страница, которую открывают сто
 * родителей, иначе разбудила бы владельца сто раз.
 */
export async function pushServerError(message: string, path: string): Promise<void> {
  const key = message.slice(0, 200);
  const now = Date.now();
  if (now - (recentErrors.get(key) ?? 0) < HOUR) return;
  recentErrors.set(key, now);
  for (const [k, at] of recentErrors) if (now - at > HOUR) recentErrors.delete(k);

  await pushToOwners({
    title: 'Ошибка на сервере',
    body: `${path}\n${message}`,
    url: '/admin/system',
    tag: 'server-error',
  });
}
