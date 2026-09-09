'use server';

import { prisma } from '@/server/db';
import { getCurrentUser } from '@/server/auth/session';
import { isLocale, type Locale } from '@/lib/i18n';

/**
 * Смена языка админки. Выбор хранится у пользователя, а не в cookie:
 * заведующая заходит и с рабочего компьютера, и с телефона, и переключать
 * язык заново на каждом устройстве — то, чего она делать не станет.
 *
 * Действие общее для админки портала и админки сада.
 */
export async function setAdminLocale(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;

  const user = await getCurrentUser();
  if (!user) return;

  await prisma.user.update({ where: { id: user.id }, data: { locale } });

  // Страницу перезагружает клиент, а не revalidatePath: на домене сада
  // фактический путь — /s/<host>/admin, и ревалидация по '/' до него
  // не достаёт. Та же причина, по которой действия не делают redirect().
}
