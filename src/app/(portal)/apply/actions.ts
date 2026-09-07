'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';
import { assertCsrf } from '@/server/auth/csrf';
import { requestMeta } from '@/server/auth/session';
import { hit, FORM_LIMIT, FORM_WINDOW_MS } from '@/server/auth/rate-limit';

const schema = z.object({
  gardenName: z.string().trim().min(2, 'Укажите название сада').max(200),
  personName: z.string().trim().min(2, 'Укажите ваше имя').max(120),
  phone: z.string().trim().min(6, 'Укажите телефон для связи').max(40),
  email: z.string().trim().email('Проверьте адрес почты').max(160).optional().or(z.literal('')),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
  // Скрытое поле-ловушка: боты его заполняют, люди — нет.
  website: z.string().max(0).optional(),
});

export type LeadState = { ok: boolean; message?: string; errors?: Record<string, string> };

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  try {
    await assertCsrf(formData);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const { ip } = await requestMeta();
  const limit = hit(`lead:${ip ?? 'unknown'}`, FORM_LIMIT, FORM_WINDOW_MS);
  if (!limit.allowed) {
    return { ok: false, message: 'Слишком много заявок подряд. Попробуйте через час или позвоните нам.' };
  }

  const parsed = schema.safeParse({
    gardenName: formData.get('gardenName'),
    personName: formData.get('personName'),
    phone: formData.get('phone'),
    email: formData.get('email') ?? '',
    comment: formData.get('comment') ?? '',
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors, message: 'Проверьте заполнение формы.' };
  }

  // Ловушка сработала — делаем вид, что всё хорошо, и ничего не сохраняем.
  if (parsed.data.website) return { ok: true };

  await prisma.lead.create({
    data: {
      gardenName: parsed.data.gardenName,
      personName: parsed.data.personName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      comment: parsed.data.comment || null,
      ip,
    },
  });

  return { ok: true };
}
