import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { periodIsOver } from '../src/lib/subscription-period';

const prisma = new PrismaClient();

/** За сколько дней до окончания подписки напоминаем. */
const REMIND_AT_DAYS = [30, 14, 3];
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ежедневная проверка подписок.
 *
 * Что делает:
 *  - печатает список садов, которым сегодня пора напомнить об оплате;
 *  - переводит в SUSPENDED тех, у кого закончился оплаченный период. Льготных
 *    дней нет: последний оплаченный день сад работает, на следующее утро закрыт.
 *
 * Садам отсюда почта не отправляется намеренно: у них часто общий ящик, который
 * никто не читает, а обзвон всё равно делает администратор портала. Ему и уходит
 * письмо со списком на день — только если в нём кто-то есть: пустые сводки
 * приучают не открывать.
 *
 * Запускается таймером edusad-subscriptions.timer раз в сутки.
 */

/** Сводка владельцу. Ошибка почты не должна отменять приостановку садов. */
async function mailOwner(subject: string, text: string) {
  const to = (process.env.NOTIFY_EMAIL ?? '').trim();
  if (!to) return;

  try {
    await nodemailer
      .createTransport({
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: Number.parseInt(process.env.SMTP_PORT ?? '25', 10),
        secure: false,
        ignoreTLS: true,
      })
      .sendMail({
        from: process.env.MAIL_FROM || 'EduSad <edusad@e04.kz>',
        to,
        subject: `EduSad: ${subject}`,
        text,
      });
  } catch (error) {
    console.error('Письмо не отправлено:', (error as Error).message);
  }
}
async function main() {
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

    if (periodIsOver(sub.periodEnd, now)) {
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
    console.log(`\nПриостановлены (оплаченный период закончился):`);
    for (const tenant of toSuspend) console.log(`  • ${tenant.name}`);
  }

  if (toRemind.length || toSuspend.length) {
    const portal = process.env.PORTAL_DOMAIN ?? 'edusad.kz';
    const parts: string[] = [];
    if (toRemind.length) {
      parts.push(`Позвонить сегодня — подписка скоро закончится:\n${toRemind.join('\n')}`);
    }
    if (toSuspend.length) {
      parts.push(
        `Приостановлены — подписка закончилась, сайт закрыт до оплаты:\n` +
          toSuspend.map((t) => `  • ${t.name}`).join('\n'),
      );
    }
    parts.push(`Все подписки: https://${portal}/admin/subscriptions`);

    await mailOwner(
      toSuspend.length ? `приостановлено садов: ${toSuspend.length}` : `позвонить по подпискам: ${toRemind.length}`,
      parts.join('\n\n'),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
