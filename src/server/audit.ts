import 'server-only';
import { prisma } from '@/server/db';
import { requestMeta } from '@/server/auth/session';
import type { AuthUser } from '@/server/auth/session';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_changed'
  | 'tenant.create'
  | 'tenant.update'
  | 'tenant.status_change'
  | 'tenant.impersonate'
  | 'tenant.impersonate_end'
  | 'domain.add'
  | 'domain.verify'
  | 'domain.delete'
  | 'domain.set_primary'
  | 'user.create'
  | 'user.reset_password'
  | 'user.deactivate'
  | 'user.activate'
  | 'subscription.extend'
  | 'payment.record'
  | 'content.create'
  | 'content.update'
  | 'content.delete';

/**
 * Аудит пишем «мягко»: сбой записи лога не должен ронять действие пользователя,
 * но и молча терять его нельзя — поэтому ошибка уходит в stderr.
 */
export async function audit(
  actor: AuthUser | null,
  action: AuditAction,
  details: {
    tenantId?: string | null;
    entity?: string;
    entityId?: string;
    meta?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    const { ip, userAgent } = await requestMeta();
    await prisma.auditLog.create({
      data: {
        userId: actor?.id ?? null,
        userLogin: actor?.login ?? null,
        tenantId: details.tenantId ?? null,
        action,
        entity: details.entity ?? null,
        entityId: details.entityId ?? null,
        meta: (details.meta ?? {}) as object,
        ip,
        userAgent: userAgent?.slice(0, 500) ?? null,
      },
    });
  } catch (error) {
    console.error('[audit] не удалось записать событие', action, error);
  }
}
