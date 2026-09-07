import 'server-only';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Счётчик попыток входа в памяти процесса. Приложение работает одним инстансом
 * на VPS, поэтому этого достаточно; при переезде на несколько нод — заменить на Redis.
 */
export function hit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) sweep(now);
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function reset(key: string) {
  buckets.delete(key);
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export const LOGIN_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const FORM_LIMIT = 10;
export const FORM_WINDOW_MS = 60 * 60 * 1000;
