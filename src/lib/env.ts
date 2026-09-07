/**
 * Единая точка чтения окружения. Падаем на старте, а не в рантайме на первом запросе,
 * иначе неверно настроенный VPS даёт ошибку только когда её увидит родитель.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Не задана обязательная переменная окружения ${name}`);
  return value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  portalDomain: (process.env.PORTAL_DOMAIN ?? 'bobegim.kz').toLowerCase(),
  storageDir: process.env.STORAGE_DIR ?? './storage',
  maxUploadBytes: int('MAX_UPLOAD_MB', 20) * 1024 * 1024,
  sessionSecret: required('SESSION_SECRET'),
  sessionTtlDays: int('SESSION_TTL_DAYS', 14),
  tlsAskToken: process.env.TLS_ASK_TOKEN ?? '',
  subscriptionPrice: int('SUBSCRIPTION_PRICE_KZT', 20000),
  subscriptionGraceDays: int('SUBSCRIPTION_GRACE_DAYS', 30),
  isProduction: process.env.NODE_ENV === 'production',
  /**
   * Флаг Secure у cookie сессии. В продакшене всегда true — сайт работает по HTTPS.
   * Выключается только для локального запуска и e2e по обычному HTTP: браузер молча
   * отбрасывает Secure-cookie на http://, и вход выглядит как «пароль не подошёл».
   */
  cookieSecure:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
};
