'use server';

import { notifyThemeFailure } from '@/server/notify/theme';

/**
 * Браузер посетителя сообщает, что тема упала уже у него (при обновлении
 * страницы без перезагрузки). Вызвать может кто угодно — проверки и
 * ограничение частоты писем внутри notifyThemeFailure.
 */
export async function reportThemeError(theme: string, part: string, message: string, url: string): Promise<void> {
  await notifyThemeFailure(String(theme), String(part), String(message).slice(0, 500), `браузер, ${String(url).slice(0, 300)}`);
}
