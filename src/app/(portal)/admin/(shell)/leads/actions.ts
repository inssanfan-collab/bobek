'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';

export async function markLeadHandled(formData: FormData) {
  await requireSuperadmin();
  await assertCsrf(formData);

  await prisma.lead.update({
    where: { id: String(formData.get('leadId')) },
    data: { isHandled: true },
  });

  revalidatePath('/admin/leads');
}
