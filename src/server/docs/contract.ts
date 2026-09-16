import 'server-only';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import type { PlanCode } from '@/lib/plans';
import type { DocData } from './documents';

/**
 * Договоры с садами: номер, период и сбор данных для печати.
 *
 * Номер хранится в базе, а не считается при каждой печати: у сада
 * в бухгалтерии останется тот номер, который напечатали первым,
 * и меняться он не должен никогда.
 */

/** Реквизиты исполнителя — строка всегда одна, создаётся при первом обращении. */
export async function portalSettings() {
  const existing = await prisma.portalSettings.findUnique({ where: { id: 'singleton' } });
  if (existing) return existing;
  return prisma.portalSettings.create({ data: { id: 'singleton' } });
}

/** Год в номере — чтобы нумерация начиналась заново каждый январь. */
function numberFor(year: number, sequence: number): string {
  return `EDU-${year}-${String(sequence).padStart(4, '0')}`;
}

export async function createContract(input: {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  plan: PlanCode;
}) {
  const year = input.periodStart.getFullYear();

  // Считаем в транзакции: два договора, созданные в одну секунду,
  // иначе получили бы один номер, а он уникален в базе.
  return prisma.$transaction(async (tx) => {
    const issued = await tx.contract.count({
      where: { number: { startsWith: `EDU-${year}-` } },
    });

    return tx.contract.create({
      data: {
        tenantId: input.tenantId,
        number: numberFor(year, issued + 1),
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        amount: input.amount,
        plan: input.plan,
      },
    });
  });
}

/** Период по умолчанию — год с сегодняшнего дня или со дня окончания текущей подписки. */
export async function suggestedPeriod(tenantId: string): Promise<{ start: Date; end: Date }> {
  const current = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });

  const start = current && current.periodEnd > new Date() ? new Date(current.periodEnd) : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);

  return { start, end };
}

/** Данные для печати одного документа. */
export async function contractDocData(contractId: string): Promise<DocData | null> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      tenant: {
        include: {
          profile: true,
          domains: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }], take: 1 },
        },
      },
    },
  });
  if (!contract) return null;

  const { tenant, ...rest } = contract;
  const host = tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`;

  return {
    contract: { ...rest, tenantId: tenant.id } as DocData['contract'],
    tenant,
    settings: await portalSettings(),
    host,
  };
}
