import { expect, test } from '@playwright/test';
import { login, PORTAL, SAD12_ADMIN, site, SUPERADMIN } from './helpers';

test('«Онлайн» показывает, кто сейчас в админке сада и что у него открыто', async ({ browser }) => {
  // Сотрудник сада — в своей админке, в «Кружках».
  const staff = await browser.newContext();
  const staffPage = await staff.newPage();
  await login(staffPage, site('sad12'), SAD12_ADMIN);
  const ping = staffPage.waitForResponse((response) => response.url().endsWith('/api/presence') && response.status() === 204);
  await staffPage.goto(`${site('sad12')}/admin/clubs`);
  await ping;

  // Владелец портала видит его в разделе «Онлайн».
  const owner = await browser.newContext();
  const ownerPage = await owner.newPage();
  await login(ownerPage, PORTAL, SUPERADMIN);
  await ownerPage.goto(`${PORTAL}/admin/online`);
  // Других сессий этого сотрудника в списке может быть несколько (прошлые тесты
  // тоже входили) — ищем ту, где открыты «Кружки».
  const row = ownerPage.getByRole('listitem').filter({ hasText: SAD12_ADMIN.login }).filter({ hasText: 'Кружки и услуги' });
  await expect(row.first()).toBeVisible();
  await expect(ownerPage.getByText(/Сейчас в админках работают/)).toBeVisible();

  await staff.close();
  await owner.close();
});
