'use server';

import { headers } from 'next/headers';
import { env } from '@/lib/env';
import { prisma } from '@/server/db';
import { verifyPassword } from '@/server/auth/password';
import { createSession, requestMeta } from '@/server/auth/session';
import { assertCsrf } from '@/server/auth/csrf';
import { hit, reset, LOGIN_LIMIT, LOGIN_WINDOW_MS } from '@/server/auth/rate-limit';
import { audit } from '@/server/audit';
import { notifyOwner } from '@/server/notify/mail';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import { completeCodeChallenge, createLoginChallenge } from '@/server/auth/two-factor';

/** challenge — пароль верный, код ушёл в Telegram, ждём его (второй шаг формы). */
export type LoginState = { error?: string; redirectTo?: string; challenge?: string; expired?: boolean };

const LOCK_MINUTES = 15;
const GENERIC_ERROR = 'Неверный логин или пароль.';

/**
 * Вход и в админку портала, и в админку сада. Разница только в том, куда редиректим:
 * суперадмина — на дашборд портала, сотрудника сада — в его сад.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { error: (error as Error).message };
  }

  const loginValue = String(formData.get('login') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');

  if (!loginValue || !password) return { error: 'Заполните оба поля.' };

  const { ip, userAgent } = await requestMeta();
  const limit = hit(`login:${ip ?? 'unknown'}:${loginValue}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return {
      error: `Слишком много попыток входа. Попробуйте через ${Math.ceil(limit.retryAfterSec / 60)} мин. или обратитесь к администратору портала.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { login: loginValue } });

  // Одинаковый текст ошибки на «нет такого логина» и «неверный пароль»:
  // иначе перебор логинов становится тривиальным.
  if (!user || !user.isActive) {
    await audit(null, 'auth.login_failed', { meta: { login: loginValue, reason: 'not_found_or_inactive' } });
    return { error: GENERIC_ERROR };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Учётная запись временно заблокирована. Повторите через ${minutes} мин.` };
  }

  const valid = await verifyPassword(user.passwordHash, password);

  if (!valid) {
    const attempts = user.failedAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: attempts,
        lockedUntil: attempts >= LOGIN_LIMIT ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    await audit(null, 'auth.login_failed', {
      tenantId: user.tenantId,
      meta: { login: loginValue, attempts },
    });

    // Пишем один раз — в момент блокировки, а не на каждую ошибку: иначе
    // перебор пароля превратился бы ещё и в перебор вашего почтового ящика.
    // Чаще всего это заведующая, забывшая пароль, и она скоро позвонит;
    // но если заблокирован вход в админку портала — это стоит знать сразу.
    if (attempts === LOGIN_LIMIT) {
      await notifyOwner(
        user.role === 'SUPERADMIN'
          ? `вход в админку портала заблокирован — ${loginValue}`
          : `вход сотрудника сада заблокирован — ${loginValue}`,
        [
          `Логин: ${loginValue}`,
          `Неудачных попыток подряд: ${attempts}`,
          `Адрес: ${ip ?? 'неизвестен'}`,
          `Браузер: ${userAgent ?? 'неизвестен'}`,
          `Вход закрыт на ${LOCK_MINUTES} минут.`,
          '',
          user.role === 'SUPERADMIN'
            ? 'Если это были не вы — кто-то подбирает пароль к админке портала.'
            : 'Скорее всего, сотрудник забыл пароль. Сбросить его можно в карточке сада.',
        ],
        '/admin/audit',
      );
    }

    return { error: GENERIC_ERROR };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });
  reset(`login:${ip ?? 'unknown'}:${loginValue}`);

  // Включён вход с кодом в Telegram — сессию не создаём, пока не введён код.
  // Telegram не ответил — не пускаем по одному паролю: иначе второй фактор
  // снимался бы простым сбоем связи.
  if (user.telegramChatId) {
    const challenge = await createLoginChallenge({ id: user.id, login: user.login, telegramChatId: user.telegramChatId }, next || null, ip);
    return challenge ? { challenge } : { error: 'Не удалось отправить код в Telegram. Попробуйте ещё раз через минуту.' };
  }

  return finishLogin(user.id, next, { ip, userAgent }, {});
}

/** Второй шаг: код, который бот прислал в Telegram. */
export async function loginCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { error: (error as Error).message };
  }
  const token = String(formData.get('challenge') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  if (!token) return { error: 'Войдите заново.' };
  if (!code) return { challenge: token, error: 'Введите код из Telegram.' };

  const result = await completeCodeChallenge(token, code, 'login');
  if (!result.ok) {
    if (result.reason === 'wrong') return { challenge: token, error: 'Код не подошёл. Проверьте и введите ещё раз.' };
    return {
      challenge: token,
      expired: true,
      error: result.reason === 'too_many' ? 'Слишком много неверных кодов. Войдите заново.' : 'Время на ввод кода вышло. Войдите заново.',
    };
  }

  const meta = await requestMeta();
  return finishLogin(result.userId, result.next ?? '', meta, { mfa: 'telegram' });
}

/** Сессия, запись в журнал и адрес, куда перейти. Общее для входа с кодом и без. */
async function finishLogin(
  userId: string,
  next: string,
  meta: { ip: string | null; userAgent: string | null },
  auditMeta: Record<string, unknown>,
): Promise<LoginState> {
  const user = await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  await createSession(user.id, meta);
  await audit(
    { id: user.id, login: user.login, fullName: user.fullName, role: user.role, tenantId: user.tenantId, mustChangePassword: user.mustChangePassword, email: user.email, phone: user.phone, impersonatedBy: null, locale: isLocale(user.locale) ? user.locale : DEFAULT_LOCALE },
    'auth.login',
    { tenantId: user.tenantId, meta: auditMeta },
  );

  // Открытый редирект недопустим: принимаем только внутренние пути.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : null;

  // Возвращаем адрес клиенту, а не делаем redirect() на сервере: серверный редирект
  // не проходит через middleware, и `/admin` на домене сада разрешился бы
  // в админку портала — сотрудник сада получал бы 404 сразу после входа.
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? (env.cookieSecure ? 'https' : 'http');
  return { redirectTo: `${proto}://${host}${safeNext ?? '/admin'}` };
}
