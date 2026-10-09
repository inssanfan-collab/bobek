import webpush from 'web-push';
import type { PrismaClient } from '@prisma/client';

/**
 * Push-уведомления владельцу портала — общее ядро для приложения
 * (src/server/notify/push.ts) и серверных скриптов (scripts/push-owner.ts:
 * его зовут сторож и копия базы, когда приложение лежит).
 *
 * Без 'server-only' и без алиасов '@/…': скрипты запускаются обычным tsx.
 * Ключи VAPID — из окружения (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY): по ним
 * службы push браузеров узнают отправителя. Нет ключей — уведомления
 * выключены (так на машине разработчика), функция молча выходит.
 */

export type PushMessage = {
  title: string;
  body?: string;
  /** Куда открыть админку по нажатию на уведомление. */
  url?: string;
  /**
   * Уведомления с одной меткой заменяют друг друга, а не копятся:
   * десять ошибок подряд — одна строка в шторке, а не десять.
   */
  tag?: string;
};

export type VapidKeys = { publicKey: string; privateKey: string; subject: string };

export function vapidFromEnv(source: NodeJS.ProcessEnv = process.env): VapidKeys | null {
  const publicKey = (source.VAPID_PUBLIC_KEY ?? '').trim();
  const privateKey = (source.VAPID_PRIVATE_KEY ?? '').trim();
  if (!publicKey || !privateKey) return null;
  // Службе push нужен адрес для связи с отправителем. Почта владельца
  // берётся из окружения, а не из кода: репозиторий публичный.
  const mail = (source.NOTIFY_EMAIL ?? '').trim();
  const portal = (source.PORTAL_DOMAIN ?? 'edusad.kz').trim();
  return { publicKey, privateKey, subject: mail ? `mailto:${mail}` : `https://${portal}` };
}

/** Тело уведомления — не длиннее этого: у служб push предел около 4 КБ. */
const MAX_BODY = 900;

/**
 * Отправляет уведомление на все устройства активных главных админов.
 * Никогда не бросает: уведомление — побочное действие. Устройства,
 * которые служба push больше не знает (404, 410), удаляет.
 */
export async function sendPushToOwners(prisma: PrismaClient, keys: VapidKeys | null, message: PushMessage): Promise<number> {
  if (!keys) return 0;
  try {
    const devices = await prisma.pushSubscription.findMany({
      where: { user: { role: 'SUPERADMIN', isActive: true } },
    });
    if (devices.length === 0) return 0;

    const payload = JSON.stringify({
      title: message.title.slice(0, 120),
      body: (message.body ?? '').slice(0, MAX_BODY),
      url: message.url ?? '/admin',
      tag: message.tag,
    });

    let delivered = 0;
    await Promise.all(
      devices.map(async (device) => {
        try {
          await webpush.sendNotification(
            { endpoint: device.endpoint, keys: { p256dh: device.p256dh, auth: device.auth } },
            payload,
            {
              vapidDetails: keys,
              // Сутки: телефон был выключен — получит, когда включат.
              TTL: 24 * 60 * 60,
              urgency: 'high',
            },
          );
          delivered += 1;
          await prisma.pushSubscription.update({ where: { id: device.id }, data: { lastSentAt: new Date() } });
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await prisma.pushSubscription.delete({ where: { id: device.id } }).catch(() => undefined);
          } else {
            console.error('[push] не доставлено:', status ?? '', (error as Error).message);
          }
        }
      }),
    );
    return delivered;
  } catch (error) {
    console.error('[push] сбой отправки:', (error as Error).message);
    return 0;
  }
}
