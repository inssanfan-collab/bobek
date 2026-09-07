'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';
import { assertCsrf } from '@/server/auth/csrf';
import { requestMeta } from '@/server/auth/session';
import { hit, FORM_LIMIT, FORM_WINDOW_MS } from '@/server/auth/rate-limit';

const schema = z.object({
  tenantId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(4).max(160),
  message: z.string().trim().min(5).max(4000),
  website: z.string().max(0).optional(),
});

export type FeedbackState = { ok: boolean; message?: string };

/** Виртуальная приёмная сада. Форма публичная, поэтому лимит и ловушка обязательны. */
export async function submitFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const { ip } = await requestMeta();
  const limit = hit(`feedback:${ip ?? 'unknown'}`, FORM_LIMIT, FORM_WINDOW_MS);
  if (!limit.allowed) {
    return { ok: false, message: 'Слишком много обращений подряд. Попробуйте позже или позвоните в сад.' };
  }

  const parsed = schema.safeParse({
    tenantId: formData.get('tenantId'),
    name: formData.get('name'),
    contact: formData.get('contact'),
    message: formData.get('message'),
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) {
    return { ok: false, message: 'Проверьте заполнение формы: имя, контакт и текст обращения.' };
  }
  if (parsed.data.website) return { ok: true };

  // Сад должен существовать и быть виден публично — иначе это подделанный tenantId.
  const tenant = await prisma.tenant.findFirst({
    where: { id: parsed.data.tenantId, status: { in: ['ACTIVE', 'SUSPENDED'] } },
    select: { id: true },
  });
  if (!tenant) return { ok: false, message: 'Не удалось отправить обращение. Обновите страницу.' };

  await prisma.feedbackMessage.create({
    data: {
      tenantId: tenant.id,
      name: parsed.data.name,
      contact: parsed.data.contact,
      message: parsed.data.message,
      ip,
    },
  });

  return { ok: true };
}
