'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { audit } from '@/server/audit';

/** Поля реквизитов. Перечислены явно: из формы приходит и лишнее. */
const FIELDS = [
  'companyNameKk', 'companyNameRu', 'ownerNameKk', 'ownerNameRu', 'taxId',
  'basisKk', 'basisRu', 'addressKk', 'addressRu', 'phone', 'email',
  'bankNameKk', 'bankNameRu', 'iban', 'bic', 'kbe', 'taxNoteKk', 'taxNoteRu',
  'signerNameKk', 'signerNameRu', 'signerTitleKk', 'signerTitleRu',
] as const;

export async function saveRequisites(formData: FormData): Promise<void> {
  const admin = await requireSuperadmin();
  await assertCsrf(formData);

  const data: Record<string, string> = {};
  for (const field of FIELDS) {
    data[field] = String(formData.get(field) ?? '').trim();
  }

  await prisma.portalSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  });

  await audit(admin, 'settings.update', { entity: 'portalSettings' });
  revalidatePath('/admin/requisites');
}
