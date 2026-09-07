'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { sanitizeContent, toPlainText } from '@/lib/sanitize';
import { uniqueSlug } from '@/lib/slug';

/** Новости самого портала: анонсы, изменения в тарифе, новости системы образования. */
export async function savePortalPost(formData: FormData) {
  await requireSuperadmin();
  await assertCsrf(formData);

  const id = String(formData.get('id') ?? '').trim();
  const titleRu = String(formData.get('titleRu') ?? '').trim();
  if (titleRu.length < 2) throw new Error('Укажите заголовок');

  const bodyRu = sanitizeContent(String(formData.get('bodyRu') ?? ''));
  const bodyKk = sanitizeContent(String(formData.get('bodyKk') ?? ''));
  const publish = formData.get('status') === 'PUBLISHED';

  const data = {
    titleRu,
    titleKk: String(formData.get('titleKk') ?? '').trim() || titleRu,
    excerptRu: String(formData.get('excerptRu') ?? '').trim() || toPlainText(bodyRu, 180) || null,
    excerptKk: String(formData.get('excerptKk') ?? '').trim() || toPlainText(bodyKk, 180) || null,
    bodyRu,
    bodyKk,
    status: publish ? ('PUBLISHED' as const) : ('DRAFT' as const),
    publishedAt: publish ? new Date() : null,
  };

  if (id) {
    // Дату публикации при правке не сдвигаем: иначе старая новость всплывает наверх ленты.
    const existing = await prisma.portalPost.findUnique({ where: { id } });
    await prisma.portalPost.update({
      where: { id },
      data: { ...data, publishedAt: publish ? existing?.publishedAt ?? new Date() : null },
    });
  } else {
    const slug = await uniqueSlug(titleRu, async (candidate) =>
      Boolean(await prisma.portalPost.findUnique({ where: { slug: candidate }, select: { id: true } })),
    );
    await prisma.portalPost.create({ data: { ...data, slug } });
  }

  revalidatePath('/admin/news');
  revalidatePath('/news');
  redirect('/admin/news');
}

export async function deletePortalPost(formData: FormData) {
  await requireSuperadmin();
  await assertCsrf(formData);

  await prisma.portalPost.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/admin/news');
  revalidatePath('/news');
}
