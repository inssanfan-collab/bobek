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

/**
 * Конец периода «включительно»: год с 8 октября — до 7 октября следующего
 * года (последний оплаченный день сад работает, см. periodIsOver), а
 * следующий год начинается 8 октября. Раньше год шёл до 8 октября, и концы
 * соседних периодов наезжали друг на друга на день.
 */
export function periodEndFrom(start: Date, months: number): Date {
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  end.setDate(end.getDate() - 1);
  return end;
}

/** День после конца периода — начало следующего. */
export function dayAfter(date: Date): Date {
  return new Date(date.getTime() + DAY_MS);
}

/** Оплачен ли период: к нему привязана хотя бы одна оплата. */
export async function isPaid(subscriptionId: string): Promise<boolean> {
  return (await prisma.payment.count({ where: { subscriptionId } })) > 0;
}

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

  const start = current && !periodIsOver(current.periodEnd) ? dayAfter(current.periodEnd) : new Date();
  const end = periodEndFrom(start, months);

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

/**
 * Оплата. Сад при создании сразу получает год подписки — без оплаты, чтобы
 * успеть наполнить сайт. Первая оплата засчитывается за этот самый период,
 * а не продлевает его ещё на год (так было: создал сад, отметил оплату —
 * и подписка оказывалась на два года). Продлевает только оплата сверх
 * уже оплаченного периода или после его окончания.
 */
export async function applyPayment(
  tenantId: string,
  months: number,
  options: { plan: PlanCode; amount: number },
): Promise<{ subscriptionId: string; periodEnd: Date; extended: boolean }> {
  const current = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });
  if (current && !periodIsOver(current.periodEnd) && !(await isPaid(current.id))) {
    await prisma.subscription.update({ where: { id: current.id }, data: { plan: options.plan, amount: options.amount } });
    return { subscriptionId: current.id, periodEnd: current.periodEnd, extended: false };
  }
  const periodEnd = await extendSubscription(tenantId, months, options);
  const fresh = await prisma.subscription.findFirstOrThrow({ where: { tenantId, isCurrent: true }, orderBy: { periodEnd: 'desc' } });
  return { subscriptionId: fresh.id, periodEnd, extended: true };
}

/**
 * Дата «оплачено до» вручную — исправить ошибку или договорённость с садом.
 * Дата — последний оплаченный день (по Казахстану, полночь +05:00).
 */
export async function setSubscriptionEnd(tenantId: string, lastPaidDay: string): Promise<{ from: Date | null; to: Date }> {
  const to = new Date(`${lastPaidDay}T00:00:00+05:00`);
  if (Number.isNaN(to.valueOf())) throw new Error('bad date');
  const current = await prisma.subscription.findFirst({ where: { tenantId, isCurrent: true }, orderBy: { periodEnd: 'desc' } });
  if (current) {
    await prisma.subscription.update({ where: { id: current.id }, data: { periodEnd: to } });
    return { from: current.periodEnd, to };
  }
  await prisma.subscription.create({
    data: { tenantId, periodStart: new Date(), periodEnd: to, amount: env.planPrices.BASIC, plan: 'BASIC', isCurrent: true },
  });
  return { from: null, to };
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
