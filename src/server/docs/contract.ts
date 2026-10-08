import 'server-only';
import { prisma } from '@/server/db';
import { periodIsOver } from '@/lib/subscription-period';
import { dayAfter, isPaid, periodEndFrom } from '@/server/subscription';
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

/**
 * Номер договора: EDU-<год заключения>-<порядковый номер>. Год — когда
 * договор заключён (оформлен), а не когда начинается оплаченный период:
 * договор, подписанный в декабре на следующий год, — договор этого года.
 * Порядковый номер владелец может вписать сам (сверка с бухгалтерией),
 * по умолчанию — следующий свободный в году. Нумерация каждый январь заново.
 */
export function numberFor(year: number, sequence: number): string {
  return `EDU-${year}-${String(sequence).padStart(4, '0')}`;
}

export const MAX_SEQUENCE = 9999;

/** Следующий свободный порядковый номер года: наибольший + 1, а не «сколько есть + 1» — номера бывают вписаны руками. */
export async function nextSequence(year: number): Promise<number> {
  const numbers = await prisma.contract.findMany({ where: { number: { startsWith: `EDU-${year}-` } }, select: { number: true } });
  const used = numbers.map((c) => Number.parseInt(c.number.slice(`EDU-${year}-`.length), 10)).filter(Number.isFinite);
  return Math.max(0, ...used) + 1;
}

export class ContractNumberTaken extends Error {
  constructor(readonly number: string) {
    super(`Номер ${number} уже занят`);
  }
}

export async function createContract(input: {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  plan: PlanCode;
  /** Порядковый номер в году; не задан — следующий свободный. */
  sequence?: number | null;
}) {
  const issuedAt = new Date();
  const year = issuedAt.getFullYear();
  const number = numberFor(year, input.sequence ?? (await nextSequence(year)));

  // Номер уникален в базе: занятый (вписанный руками или созданный в ту же
  // секунду) — понятная ошибка вместо падения на ограничении.
  if (await prisma.contract.findUnique({ where: { number } })) throw new ContractNumberTaken(number);
  return prisma.contract.create({
    data: {
      tenantId: input.tenantId,
      number,
      issuedAt,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      amount: input.amount,
      plan: input.plan,
    },
  });
}

/** Поменять порядковый номер уже оформленного договора; год — года заключения. */
export async function renumberContract(id: string, sequence: number) {
  const contract = await prisma.contract.findUniqueOrThrow({ where: { id } });
  const number = numberFor(contract.issuedAt.getFullYear(), sequence);
  if (number === contract.number) return contract;
  if (await prisma.contract.findUnique({ where: { number } })) throw new ContractNumberTaken(number);
  return prisma.contract.update({ where: { id }, data: { number } });
}

/** Период по умолчанию — год с сегодняшнего дня или со дня окончания текущей подписки. */
export async function suggestedPeriod(tenantId: string): Promise<{ start: Date; end: Date }> {
  const current = await prisma.subscription.findFirst({
    where: { tenantId, isCurrent: true },
    orderBy: { periodEnd: 'desc' },
  });

  // Текущий период ещё не оплачен — договор на него же (первый договор нового
  // сада). Оплачен — на следующий, со дня после его окончания.
  if (current && !periodIsOver(current.periodEnd) && !(await isPaid(current.id))) {
    return { start: current.periodStart, end: current.periodEnd };
  }
  const start = current && !periodIsOver(current.periodEnd) ? dayAfter(current.periodEnd) : new Date();
  return { start, end: periodEndFrom(start, 12) };
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
