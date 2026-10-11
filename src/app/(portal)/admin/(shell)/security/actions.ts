'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { audit } from '@/server/audit';
import { hashSessionToken } from '@/server/auth/session';
import { findStartChat, sendTelegram } from '@/server/notify/telegram';

/** error — ключ подписи (тексты на двух языках — в TelegramForms). */
export type LinkState = { error?: 'not_found' | 'expired' | 'not_sent'; label?: string; done?: boolean };

const LINK_MINUTES = 10;

/**
 * Шаг 1: одноразовая метка для ссылки t.me/<бот>?start=<метка>. Храним хеш
 * в LoginChallenge (purpose «link»): метку видит только тот, кто на странице.
 */
export async function startTelegramLink(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);
  // Telegram пропускает в start только латиницу, цифры, _ и - до 64 знаков.
  const label = randomBytes(18).toString('base64url');
  await prisma.loginChallenge.deleteMany({ where: { OR: [{ userId: admin.id }, { expiresAt: { lt: new Date() } }] } });
  await prisma.loginChallenge.create({
    data: {
      tokenHash: hashSessionToken(label),
      userId: admin.id,
      codeHash: '',
      purpose: 'link',
      expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000),
    },
  });
  return { label };
}

/** Шаг 2: вы нажали «Start» — находим ваш чат по метке и включаем вход с кодом. */
export async function checkTelegramLink(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);
  const label = String(formData.get('label') ?? '');
  const challenge = await prisma.loginChallenge.findUnique({ where: { tokenHash: hashSessionToken(label) } });
  if (!challenge || challenge.userId !== admin.id || challenge.purpose !== 'link' || challenge.expiresAt < new Date()) {
    return { error: 'expired' };
  }

  const chatId = await findStartChat(label);
  if (!chatId) return { error: 'not_found', label };

  const sent = await sendTelegram(chatId, 'Готово: коды входа в админку EduSad будут приходить сюда.\n\nЕсли подключали не вы — сразу смените пароль.');
  if (!sent) return { error: 'not_sent', label };

  await prisma.$transaction([
    prisma.user.update({ where: { id: admin.id }, data: { telegramChatId: chatId } }),
    prisma.loginChallenge.delete({ where: { id: challenge.id } }),
  ]);
  await audit(admin, 'auth.2fa_enabled', { entity: 'user', entityId: admin.id });
  revalidatePath('/admin/security');
  return { done: true };
}

/** Отключить: снова вход по одному паролю. */
export async function disableTelegram(formData: FormData): Promise<void> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);
  await prisma.user.update({ where: { id: admin.id }, data: { telegramChatId: null } });
  await audit(admin, 'auth.2fa_disabled', { entity: 'user', entityId: admin.id });
  revalidatePath('/admin/security');
}

/** Проверочное сообщение: убедиться, что бот до вас достаёт. */
export async function testTelegram(formData: FormData): Promise<void> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
  if (user.telegramChatId) await sendTelegram(user.telegramChatId, 'Проверка: бот EduSad достаёт до вас. Коды входа придут сюда.');
}
