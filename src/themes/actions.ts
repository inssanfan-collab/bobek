'use server';

import { notifyOwner } from '@/server/notify/mail';
import { findThemeInfo } from '@/themes/catalog';

const PARTS = new Set(['home', 'header', 'footer']);

/** Когда последний раз писали про эту тему: одно письмо в час, а не на каждый заход. */
const lastSent = new Map<string, number>();
const HOUR = 60 * 60 * 1000;

/**
 * Сообщение о том, что индивидуальная тема упала у посетителя.
 *
 * Вызвать это действие может кто угодно, поэтому верим только тому, что
 * можно проверить: тема должна существовать, часть — быть известной,
 * а писем — не больше одного в час на тему и часть.
 */
export async function reportThemeError(theme: string, part: string, message: string, url: string): Promise<void> {
  if (!findThemeInfo(theme) || !PARTS.has(part)) return;

  const key = `${theme}:${part}`;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < HOUR) return;
  lastSent.set(key, now);

  console.error(`[theme] тема ${theme}, часть ${part}: ${message}`);
  await notifyOwner(`упала индивидуальная тема «${theme}»`, [
    `Часть сайта: ${part}`,
    `Страница: ${String(url).slice(0, 300)}`,
    `Ошибка: ${String(message).slice(0, 500)}`,
    '',
    'Посетители видят стандартную версию этой части сайта, сам сайт работает.',
    'Следующее письмо про эту тему — не раньше чем через час.',
  ]);
}
