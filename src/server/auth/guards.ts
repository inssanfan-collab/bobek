import 'server-only';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser, type AuthUser } from './session';
import { subscriptionState, type SubscriptionState } from '@/server/subscription';
import { scoped, type TenantScope } from '@/server/db/scope';
import { roleAtLeast } from './session';
import type { Role } from '@prisma/client';
import { ActionError } from '@/lib/action-state';

/** Админка портала. Сад сюда не попадает, даже зная адрес. */
export async function requireSuperadmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'SUPERADMIN') notFound();
  return user;
}

export type TenantSession = {
  user: AuthUser;
  tenantId: string;
  db: TenantScope;
  subscription: SubscriptionState;
  /** Учитывает и роль, и состояние подписки. */
  canEdit: boolean;
  canManageSettings: boolean;
};

/**
 * Админка сада. Три проверки подряд: вошёл ли, его ли это сад, и не read-only ли режим.
 * Суперадмин проходит внутрь любого сада — это режим «войти как сад».
 */
export async function requireTenantUser(
  tenantId: string,
  minimumRole: Role = 'TENANT_EDITOR',
): Promise<TenantSession> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const isOwnTenant = user.tenantId === tenantId;
  const isSuperadmin = user.role === 'SUPERADMIN';

  // Чужой сад отдаёт 404, а не 403: существование чужих садов не подтверждаем.
  if (!isOwnTenant && !isSuperadmin) notFound();
  if (!isSuperadmin && !roleAtLeast(user.role, minimumRole)) notFound();

  const subscription = await subscriptionState(tenantId);
  const roleCanEdit = isSuperadmin || roleAtLeast(user.role, 'TENANT_EDITOR');
  const roleCanManage = isSuperadmin || roleAtLeast(user.role, 'TENANT_ADMIN');

  return {
    user,
    tenantId,
    db: scoped(tenantId),
    subscription,
    canEdit: roleCanEdit && (subscription.canEdit || isSuperadmin),
    canManageSettings: roleCanManage && (subscription.canEdit || isSuperadmin),
  };
}

/** Бросает понятную ошибку в server action, если редактирование сейчас запрещено. */
export function assertCanEdit(session: TenantSession): void {
  if (session.canEdit) return;
  if (session.subscription.isGrace || session.subscription.isExpired) {
    throw new Error(
      'Подписка истекла — сейчас доступен только просмотр. Обратитесь к администратору портала для продления.',
    );
  }
  throw new ActionError({ kk: 'Тіркелгіңізде бұл әрекетке құқық жоқ.', ru: 'У вашей учётной записи нет прав на это действие.' });
}
