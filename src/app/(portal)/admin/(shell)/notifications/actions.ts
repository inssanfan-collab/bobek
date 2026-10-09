'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { pushToOwners } from '@/server/notify/push';

type BrowserSubscription = { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };

/**
 * Сохранить устройство, которое разрешило уведомления. Зовётся из браузера
 * (PushSettings) объектом подписки, а не формой; от подделки защищает
 * проверка Origin у server actions и вход главного админа.
 */
export async function savePushSubscription(subscription: BrowserSubscription, userAgent: string): Promise<{ ok: boolean }> {
  const user = await requireSuperadmin();
  const endpoint = String(subscription?.endpoint ?? '');
  const p256dh = String(subscription?.keys?.p256dh ?? '');
  const auth = String(subscription?.keys?.auth ?? '');
  // Адрес службы push — всегда https у самого браузера (Google, Mozilla, Apple).
  if (!/^https:\/\/[^\s]{10,1000}$/.test(endpoint) || !p256dh || !auth || p256dh.length > 200 || auth.length > 100) {
    return { ok: false };
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, userId: user.id, userAgent: userAgent.slice(0, 300) },
    update: { p256dh, auth, userId: user.id, userAgent: userAgent.slice(0, 300) },
  });
  revalidatePath('/admin/notifications');
  return { ok: true };
}

/** Выключить уведомления на этом устройстве (из браузера, по адресу подписки). */
export async function forgetPushSubscription(endpoint: string): Promise<void> {
  const user = await requireSuperadmin();
  await prisma.pushSubscription.deleteMany({ where: { endpoint: String(endpoint), userId: user.id } });
  revalidatePath('/admin/notifications');
}

/** Удалить устройство из списка (потерянный телефон и т. п.). */
export async function deletePushDevice(formData: FormData): Promise<void> {
  await requireSuperadmin();
  await assertCsrf(formData);
  await prisma.pushSubscription.deleteMany({ where: { id: String(formData.get('id')) } });
  revalidatePath('/admin/notifications');
}

/** Проверочное уведомление на все устройства. */
export async function sendTestPush(formData: FormData): Promise<void> {
  await requireSuperadmin();
  await assertCsrf(formData);
  await pushToOwners({
    title: 'Проверка уведомлений',
    body: 'Если вы это видите — уведомления EduSad работают.',
    url: '/admin/notifications',
    tag: 'test',
  });
  revalidatePath('/admin/notifications');
}
