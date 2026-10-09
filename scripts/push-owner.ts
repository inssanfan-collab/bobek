import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { sendPushToOwners, vapidFromEnv } from '../src/server/notify/push-send';

/**
 * Push владельцу портала из серверных скриптов, в обход приложения:
 * его зовут сторож (/usr/local/bin/edusad-watchdog) и копия базы
 * (vsesad-backup), когда что-то сломалось — в том числе само приложение.
 *
 *   pnpm push:owner "Заголовок" "Текст" [/admin/system]
 */
async function main() {
  const [title, body = '', url = '/admin/system'] = process.argv.slice(2);
  if (!title) {
    console.error('Использование: pnpm push:owner "Заголовок" "Текст" [/admin/…]');
    process.exit(2);
  }
  const prisma = new PrismaClient();
  try {
    const delivered = await sendPushToOwners(prisma, vapidFromEnv(), { title, body, url, tag: 'server' });
    console.log(`push: доставлено на ${delivered} устр.`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
