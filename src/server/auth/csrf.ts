import 'server-only';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';
import { env } from '@/lib/env';
import { safeEqual, SESSION_COOKIE } from './session';
import { CSRF_FIELD } from './csrf.client';

export { CSRF_FIELD };

/** Окно жизни анонимного токена. Форму заявки могут заполнять неспешно. */
const WINDOW_MS = 60 * 60 * 1000;

/**
 * CSRF-токен без отдельной куки.
 *
 * Для вошедшего пользователя токен — это подпись его сессии: он стабилен всё время
 * работы, привязан к конкретному входу и не переносится на другого пользователя.
 * Для анонимных форм (вход, заявка, обращение родителя) сессии ещё нет, поэтому
 * подписываем текущее часовое окно — вместе со встроенной в Next проверкой Origin
 * у server actions этого достаточно.
 *
 * Отдельная кука со случайным seed здесь не годится: серверные компоненты в Next 15
 * не могут ставить куки, а выдача seed в middleware ломается на параллельных
 * запросах — каждый получал бы свой seed, и форма приходила бы с чужим токеном.
 */
export async function csrfToken(): Promise<string> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  return session ? signSession(session) : signWindow(currentWindow());
}

export async function assertCsrf(formData: FormData): Promise<void> {
  const supplied = String(formData.get(CSRF_FIELD) ?? '');
  if (!supplied) throw new Error('Форма устарела. Обновите страницу и попробуйте ещё раз.');

  const session = (await cookies()).get(SESSION_COOKIE)?.value;

  const accepted = session
    ? [signSession(session)]
    // Окно могло смениться, пока форму заполняли, — принимаем и предыдущее.
    : [signWindow(currentWindow()), signWindow(currentWindow() - 1)];

  if (!accepted.some((candidate) => safeEqual(candidate, supplied))) {
    throw new Error('Форма устарела. Обновите страницу и попробуйте ещё раз.');
  }
}

function currentWindow(): number {
  return Math.floor(Date.now() / WINDOW_MS);
}

function sign(payload: string): string {
  return createHmac('sha256', env.sessionSecret).update(payload).digest('base64url');
}

const signSession = (token: string) => sign(`session:${token}`);
const signWindow = (window: number) => sign(`anon:${window}`);
