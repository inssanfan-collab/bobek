'use server';

import { headers } from 'next/headers';
import { env } from '@/lib/env';
import { prisma } from '@/server/db';
import { verifyPassword } from '@/server/auth/password';
import { createSession, requestMeta } from '@/server/auth/session';
import { assertCsrf } from '@/server/auth/csrf';
import { hit, reset, LOGIN_LIMIT, LOGIN_WINDOW_MS } from '@/server/auth/rate-limit';
import { audit } from '@/server/audit';

export type LoginState = { error?: string; redirectTo?: string };

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
    return { error: GENERIC_ERROR };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  reset(`login:${ip ?? 'unknown'}:${loginValue}`);

  await createSession(user.id, { ip, userAgent });
  await audit(
    { id: user.id, login: user.login, fullName: user.fullName, role: user.role, tenantId: user.tenantId, mustChangePassword: user.mustChangePassword, email: user.email, phone: user.phone, impersonatedBy: null },
    'auth.login',
    { tenantId: user.tenantId },
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
