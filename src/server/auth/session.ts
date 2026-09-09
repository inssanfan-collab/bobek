import 'server-only';
import { cookies, headers } from 'next/headers';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import type { Role, User } from '@prisma/client';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

export const SESSION_COOKIE = 'bobegim_session';

export type AuthUser = Pick<
  User,
  'id' | 'login' | 'fullName' | 'role' | 'tenantId' | 'mustChangePassword' | 'email' | 'phone'
> & {
  impersonatedBy: string | null;
  /**
   * Язык админки. В базе это обычная строка, поэтому здесь она приводится
   * к известному значению: неизвестный код в колонке не должен превращаться
   * в пустой интерфейс.
   */
  locale: Locale;
};

/** В БД лежит только хеш токена: дамп базы не даёт войти под чужой сессией. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(
  userId: string,
  meta: {
    ip?: string | null;
    userAgent?: string | null;
    impersonatedBy?: string | null;
    /**
     * Ставить ли cookie прямо сейчас. Для входа «под садом» — нет: сессия создаётся
     * на домене портала, а работать с ней будут на домене сада, куда cookie портала
     * не отправляется. Токен в этом случае передаётся через одноразовую ссылку.
     */
    setCookie?: boolean;
  } = {},
): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent?.slice(0, 500) ?? null,
      impersonatedBy: meta.impersonatedBy ?? null,
    },
  });

  if (meta.setCookie !== false) await setSessionCookie(token, expiresAt);

  return token;
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Меняет токен существующей сессии, не разрывая её.
 * Нужно после передачи токена через адресную строку: старое значение
 * могло осесть в логах и истории браузера, поэтому сразу становится непригодным.
 */
export async function rotateSessionToken(sessionId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.session.update({ where: { id: sessionId }, data: { tokenHash: hashToken(token) } });
  return token;
}

export function hashSessionToken(token: string): string {
  return hashToken(token);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) return null;

  const { user } = session;
  return {
    id: user.id,
    login: user.login,
    fullName: user.fullName,
    role: user.role,
    tenantId: user.tenantId,
    mustChangePassword: user.mustChangePassword,
    email: user.email,
    phone: user.phone,
    impersonatedBy: session.impersonatedBy,
    locale: isLocale(user.locale) ? user.locale : DEFAULT_LOCALE,
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/** Разлогинить все сессии пользователя — при сбросе пароля и деактивации. */
export async function destroyAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function purgeExpiredSessions(): Promise<number> {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}

export async function requestMeta(): Promise<{ ip: string | null; userAgent: string | null }> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  return {
    ip: forwarded?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
    userAgent: h.get('user-agent'),
  };
}

export function roleAtLeast(role: Role, minimum: Role): boolean {
  const rank: Record<Role, number> = { TENANT_EDITOR: 1, TENANT_ADMIN: 2, SUPERADMIN: 3 };
  return rank[role] >= rank[minimum];
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
