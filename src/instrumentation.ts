import type { Instrumentation } from 'next';

/**
 * Ошибка при обработке запроса — push владельцу портала (раздел админки
 * «Уведомления»). Не каждая: служебные исключения Next (redirect, notFound)
 * и ActionError — это не сбой, а обычный ответ пользователю. Одна и та же
 * ошибка — не чаще раза в час (pushServerError).
 *
 * Импорт — внутри проверки NEXT_RUNTIME: файл собирается и для edge
 * (middleware), а там нет модулей Node, на которых стоит web-push.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const err = error as Error & { digest?: string };
    if (err.digest?.startsWith('NEXT_') || err.name === 'ActionError') return;
    try {
      const { pushServerError } = await import('@/server/notify/push');
      // Адрес — без параметров: в них бывает что угодно, а в шторке телефона это лишнее.
      await pushServerError(`${err.name}: ${err.message}`, `${request.method} ${request.path.split('?')[0]}`);
    } catch {
      /* уведомление не должно ронять обработку ошибки */
    }
  }
};
