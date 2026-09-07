'use server';

import { headers } from 'next/headers';
import { destroySession, getCurrentUser } from '@/server/auth/session';
import { env } from '@/lib/env';
import type { ActionState } from '@/lib/action-state';
import { audit } from '@/server/audit';

/**
 * Выход есть и в админке портала, и в админке сада, поэтому возвращаем адрес
 * входа того же домена, а переход делает клиент — серверный редирект не проходит
 * через middleware и увёл бы сотрудника сада на страницу портала.
 */
export async function logout(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (user) await audit(user, 'auth.logout', { tenantId: user.tenantId });
  await destroySession();

  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? (env.cookieSecure ? 'https' : 'http');
  return { redirectTo: `${proto}://${host}/admin/login` };
}
