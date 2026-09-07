import 'server-only';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';

export type SubscriptionState = {
  periodEnd: Date | null;
  daysLeft: number | null;
  /** Срок вышел, но grace-период ещё идёт: сайт работает, админка только на чтение. */
  isGrace: boolean;
  /** Срок и grace вышли: сад блокируется. */
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
    return { periodEnd: null, daysLeft: null, isGrace: false, isExpired: false, canEdit: true };
  }

  const now = Date.now();
  const end = current.periodEnd.getTime();
  const daysLeft = Math.ceil((end - now) / DAY_MS);
  const graceEnd = end + env.subscriptionGraceDays * DAY_MS;

  const isGrace = now > end && now <= graceEnd;
  const isExpired = now > graceEnd;

  return {
    periodEnd: current.periodEnd,
    daysLeft,
    isGrace,
    isExpired,
    canEdit: !isGrace && !isExpired,
  };
}

/** Продлевает подписку на год от большей из дат: сегодня или текущего конца периода. */
export async function extendSubscription(tenantId: string, months = 12, note?: string) {
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
        amount: env.subscriptionPrice,
        isCurrent: true,
        note: note ?? null,
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
