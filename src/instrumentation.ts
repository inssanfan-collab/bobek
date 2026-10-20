import type { Instrumentation } from 'next';

/**
 * Ошибка при обработке запроса — push владельцу портала (раздел админки
 * «Уведомления»). Не каждая: служебные исключения Next (redirect, notFound)
 * и ActionError — это не сбой, а обычный ответ пользователю. Одна и та же
 * ошибка — не чаще раза в час (pushServerError).
 *
 * «Failed to find Server Action» — тоже не сбой: это роботы, перебирающие
 * дыру React2Shell поддельным заголовком Next-Action (у нас она закрыта,
 * их блокирует fail2ban — deploy/fail2ban), или вкладка, открытая
 * до выкладки. Будить из-за них владельца незачем.
 *
 * Импорт — внутри проверки NEXT_RUNTIME: файл собирается и для edge
 * (middleware), а там нет модулей Node, на которых стоит web-push.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const err = error as Error & { digest?: string };
    if (err.digest?.startsWith('NEXT_') || err.name === 'ActionError') return;
    if (err.message?.startsWith('Failed to find Server Action')) return;
    try {
      const { pushServerError } = await import('@/server/notify/push');
      // Адрес — без параметров: в них бывает что угодно, а в шторке телефона это лишнее.
      await pushServerError(`${err.name}: ${err.message}`, `${request.method} ${request.path.split('?')[0]}`);
    } catch {
      /* уведомление не должно ронять обработку ошибки */
    }
  }
};
