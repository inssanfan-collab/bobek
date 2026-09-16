import 'server-only';
import { isPlanCode, type PlanCode } from '@/lib/plans';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { periodIsOver } from '@/lib/subscription-period';

export type SubscriptionState = {
  periodEnd: Date | null;
  /** Тариф текущего периода. Пока подписки нет — null. */
  plan: PlanCode | null;
  daysLeft: number | null;
  /**
   * Оплаченный период закончился. Льготных дней нет: админка сразу только
   * на просмотр, а утренняя проверка приостанавливает сад и закрывает сайт.
   */
  isExpired: boolean;
  /** Можно ли редактировать контент прямо сейчас. */
  canEdit: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function subscriptionState(tenantId: string): Promise<SubscriptionState> {
  const current = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });

  if (!current) {
    // Сад ещё не оплачивал — это DRAFT сразу после создания, редактировать можно.
    return { periodEnd: null, plan: null, daysLeft: null, isExpired: false, canEdit: true };
  }

  const now = Date.now();
  const daysLeft = Math.ceil((current.periodEnd.getTime() - now) / DAY_MS);
  const isExpired = periodIsOver(current.periodEnd, now);

  return {
    periodEnd: current.periodEnd,
    plan: isPlanCode(current.plan) ? current.plan : 'BASIC',
    daysLeft,
    isExpired,
    canEdit: !isExpired,
  };
}

/**
 * Продлевает подписку от большей из дат: сегодня или текущего конца периода.
 * Тариф и сумма передаются явно: сад может перейти с базового на тариф
 * с наполнением при продлении, и в истории должно остаться, за что платили.
 */
export async function extendSubscription(
  tenantId: string,
  months = 12,
  options: { plan?: PlanCode; amount?: number; note?: string } = {},
) {
  const plan = options.plan ?? 'BASIC';
  const current = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });

  const start = current && current.periodEnd > new Date() ? current.periodEnd : new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  await prisma.$transaction([
    prisma.subscription.updateMany({ where: { tenantId, isCurrent: true }, data: { isCurrent: false } }),
    prisma.subscription.create({
      data: {
        tenantId,
        periodStart: start,
        periodEnd: end,
        amount: options.amount ?? env.planPrices[plan],
        plan,
        isCurrent: true,
        note: options.note ?? null,
      },
    }),
  ]);

  return end;
}

/** Сады, у которых подписка истекает в ближайшие N дней — для дашборда и напоминаний. */
export async function expiringSoon(days = 30) {
  const until = new Date(Date.now() + days * DAY_MS);
  return prisma.subscription.findMany({
    where: { isCurrent: true, periodEnd: { lte: until } },
    include: { tenant: { include: { profile: true } } },
    orderBy: { periodEnd: 'asc' },
  });
}
