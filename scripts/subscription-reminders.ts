import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** За сколько дней до окончания подписки напоминаем. */
const REMIND_AT_DAYS = [30, 14, 3];
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ежедневная проверка подписок.
 *
 * Что делает:
 *  - печатает список садов, которым сегодня пора напомнить об оплате;
 *  - переводит в SUSPENDED тех, у кого закончился и льготный период.
 *
 * Почта отсюда не отправляется намеренно: у садов часто общий ящик, который никто
 * не читает, а обзвон всё равно делает администратор портала. Скрипт даёт ему
 * готовый список на день. Когда появится рассылка — подключается здесь же.
 */
async function main() {
  const graceDays = Number.parseInt(process.env.SUBSCRIPTION_GRACE_DAYS ?? '30', 10);
  const now = Date.now();

  const subscriptions = await prisma.subscription.findMany({
    where: { isCurrent: true, tenant: { status: { in: ['ACTIVE', 'DRAFT'] } } },
    include: {
      tenant: {
        include: {
          profile: true,
          users: { where: { role: 'TENANT_ADMIN', isActive: true }, take: 1 },
        },
      },
    },
    orderBy: { periodEnd: 'asc' },
  });

  const toRemind: string[] = [];
  const toSuspend: { id: string; name: string }[] = [];

  for (const sub of subscriptions) {
    const daysLeft = Math.ceil((sub.periodEnd.getTime() - now) / DAY_MS);
    const name = sub.tenant.profile?.nameRu ?? sub.tenant.slug;
    const admin = sub.tenant.users[0];
    const contact = [admin?.fullName, admin?.phone].filter(Boolean).join(', ') || 'контакт не указан';

    if (REMIND_AT_DAYS.includes(daysLeft)) {
      toRemind.push(`  • ${name} — осталось ${daysLeft} дн. (${contact})`);
    }

    if (daysLeft < -graceDays) {
      toSuspend.push({ id: sub.tenantId, name });
    }
  }

  console.log(`[${new Date().toISOString()}] Проверено подписок: ${subscriptions.length}`);

  if (toRemind.length) {
    console.log(`\nПозвонить сегодня (${toRemind.length}):`);
    console.log(toRemind.join('\n'));
  } else {
    console.log('Напоминать сегодня некому.');
  }

  if (toSuspend.length) {
    await prisma.tenant.updateMany({
      where: { id: { in: toSuspend.map((t) => t.id) } },
      data: { status: 'SUSPENDED' },
    });
    console.log(`\nПриостановлены (льготный период ${graceDays} дн. истёк):`);
    for (const tenant of toSuspend) console.log(`  • ${tenant.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
