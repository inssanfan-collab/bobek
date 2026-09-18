import 'server-only';
import { notifyOwner } from '@/server/notify/mail';
import { findThemeInfo } from '@/themes/catalog';

const PARTS = new Set(['home', 'header', 'footer']);

/** Когда последний раз писали про эту тему: одно письмо в час, а не на каждый заход. */
const lastSent = new Map<string, number>();
const HOUR = 60 * 60 * 1000;

/**
 * Письмо владельцу портала о том, что индивидуальная тема упала.
 *
 * Сообщить может и сервер, и браузер посетителя — поэтому верим только
 * проверяемому: тема существует, часть известна, писем не больше одного
 * в час на тему и часть. Никогда не бросает: сайт важнее письма.
 */
export async function notifyThemeFailure(theme: string, part: string, message: string, where: string): Promise<void> {
  if (!findThemeInfo(theme) || !PARTS.has(part)) return;

  console.error(`[theme] тема ${theme}, часть ${part}, ${where}: ${message}`);

  const key = `${theme}:${part}`;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < HOUR) return;
  lastSent.set(key, now);

  try {
    await notifyOwner(`упала индивидуальная тема «${theme}»`, [
      `Часть сайта: ${part}`,
      `Где: ${String(where).slice(0, 300)}`,
      `Ошибка: ${String(message).slice(0, 500)}`,
      '',
      'Посетители видят стандартную версию этой части сайта, сам сайт работает.',
      'Следующее письмо про эту тему — не раньше чем через час.',
    ]);
  } catch {
    /* notifyOwner сам не бросает, но страховка не должна зависеть и от этого */
  }
}
