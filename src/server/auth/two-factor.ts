import 'server-only';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/server/db';
import { hashSessionToken } from '@/server/auth/session';
import { sendTelegram } from '@/server/notify/telegram';

/**
 * Двухфакторный вход: после верного пароля бот присылает в Telegram
 * шестизначный код (решение владельца 11.10.2026 — проще приложения-
 * аутентификатора). Включается в разделе «Безопасность» админки портала:
 * User.telegramChatId задан — без кода не войти.
 *
 * Код живёт 5 минут и даёт 5 попыток; в базе — только его хеш. Тот же
 * механизм подтверждает чат при включении: код должен дойти именно до вас.
 */

const CODE_MINUTES = 5;
const CODE_ATTEMPTS = 5;

type Purpose = 'login' | 'setup';

function hashCode(challengeToken: string, code: string): string {
  // Соль — токен второго шага: одинаковые коды разных входов дают разные хеши.
  return createHash('sha256').update(`${challengeToken}:${code}`).digest('hex');
}

/**
 * Шлёт код в Telegram и возвращает токен (уходит в форму скрытым полем).
 * null — Telegram не ответил или чат не принимает сообщения от бота.
 */
export async function sendCodeChallenge(input: {
  userId: string;
  chatId: string;
  purpose: Purpose;
  next?: string | null;
  text: (code: string) => string;
}): Promise<string | null> {
  const token = randomBytes(32).toString('base64url');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  if (!(await sendTelegram(input.chatId, input.text(code)))) return null;

  // Старые незавершённые попытки этого же человека больше не нужны.
  await prisma.loginChallenge.deleteMany({ where: { OR: [{ userId: input.userId }, { expiresAt: { lt: new Date() } }] } });
  await prisma.loginChallenge.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId: input.userId,
      codeHash: hashCode(token, code),
      purpose: input.purpose,
      chatId: input.chatId,
      next: input.next ?? null,
      expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000),
    },
  });
  return token;
}

/** Пароль верный — код входа в Telegram. */
export function createLoginChallenge(
  user: { id: string; login: string; telegramChatId: string },
  next: string | null,
  ip: string | null,
): Promise<string | null> {
  return sendCodeChallenge({
    userId: user.id,
    chatId: user.telegramChatId,
    purpose: 'login',
    next,
    text: (code) => [
      `Код входа в EduSad: <b>${code}</b>`,
      '',
      `Логин: ${user.login}`,
      `Адрес: ${ip ?? 'неизвестен'}`,
      `Действует ${CODE_MINUTES} минут. Никому его не сообщайте.`,
      'Если входите не вы — кто-то знает ваш пароль: смените его.',
    ].join('\n'),
  });
}

export type ChallengeResult =
  | { ok: true; userId: string; next: string | null; chatId: string | null }
  | { ok: false; reason: 'expired' | 'wrong' | 'too_many' };

/** Проверка кода. Успех — токен гасится; пять ошибок или пять минут — заново. */
export async function completeCodeChallenge(token: string, code: string, purpose: Purpose): Promise<ChallengeResult> {
  const challenge = await prisma.loginChallenge.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: { select: { isActive: true } } },
  });
  if (!challenge || challenge.purpose !== purpose || challenge.expiresAt < new Date() || !challenge.user.isActive) {
    if (challenge) await prisma.loginChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: false, reason: 'expired' };
  }

  const expected = Buffer.from(challenge.codeHash, 'hex');
  const given = Buffer.from(hashCode(token, code.replace(/\s/g, '')), 'hex');
  if (timingSafeEqual(expected, given)) {
    await prisma.loginChallenge.delete({ where: { id: challenge.id } });
    return { ok: true, userId: challenge.userId, next: challenge.next, chatId: challenge.chatId };
  }

  const attempts = challenge.attempts + 1;
  if (attempts >= CODE_ATTEMPTS) {
    await prisma.loginChallenge.delete({ where: { id: challenge.id } });
    return { ok: false, reason: 'too_many' };
  }
  await prisma.loginChallenge.update({ where: { id: challenge.id }, data: { attempts } });
  return { ok: false, reason: 'wrong' };
}
