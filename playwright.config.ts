import { defineConfig, devices } from '@playwright/test';

/**
 * Сайты садов различаются доменом, поэтому базового URL нет:
 * каждый тест открывает свой хост. В /etc/hosts должны быть записи
 * bobegim.local и <slug>.bobegim.local (см. docs/DEPLOY.md).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: 0,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    ...devices['Desktop Chrome'],
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    // На сервере сборки Chromium предустановлен и может не совпадать с версией,
    // которую ждёт @playwright/test. Путь задаётся переменной, локально не нужен.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    // COOKIE_SECURE=false — тесты идут по http, а Secure-cookie браузер на http отбрасывает.
    command: 'COOKIE_SECURE=false PORTAL_DOMAIN=bobegim.local pnpm start',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
