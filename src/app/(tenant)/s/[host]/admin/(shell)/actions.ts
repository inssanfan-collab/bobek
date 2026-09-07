'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { type ActionState, toActionError } from '@/lib/action-state';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { assertCanEdit } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { assertOwned } from '@/server/db/scope';
import { audit } from '@/server/audit';
import { sanitizeContent, toPlainText } from '@/lib/sanitize';
import { uniqueSlug } from '@/lib/slug';
import { saveUpload, deleteMedia, UploadError } from '@/server/media';
import { invalidateTenantCacheById } from '@/server/tenant/resolve';
import { hashPassword, passwordProblem, verifyPassword } from '@/server/auth/password';
import { destroyAllSessions } from '@/server/auth/session';
import { isPaletteCode, isTemplateCode } from '@/lib/templates';
import { env } from '@/lib/env';
import type { DocumentCategory } from '@prisma/client';

/**
 * Все действия админки сада проходят один и тот же вход: определить сад по домену,
 * проверить права и режим подписки, проверить CSRF. Дальше — только своя работа.
 */
/** Абсолютный адрес на текущем домене сада — по нему клиент делает настоящий переход. */
async function hostUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? (env.cookieSecure ? 'https' : 'http');
  return `${proto}://${host}${path}`;
}

async function gate(formData: FormData) {
  const host = String(formData.get('host') ?? '');
  const ctx = await tenantAdmin(host);
  await assertCsrf(formData);
  assertCanEdit(ctx);
  return ctx;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function optionalStr(formData: FormData, key: string): string | null {
  return str(formData, key) || null;
}

function num(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

// ─────────────────────────── Публикации ───────────────────────────

const postSchema = z.object({
  titleRu: z.string().trim().min(2, 'Укажите заголовок'),
  titleKk: z.string().trim().default(''),
});

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const sectionId = str(formData, 'sectionId');

  const parsed = postSchema.safeParse({
    titleRu: formData.get('titleRu'),
    titleKk: formData.get('titleKk') ?? '',
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Проверьте форму');

  await assertOwned('section', sectionId, ctx.tenantId);

  const bodyRu = sanitizeContent(str(formData, 'bodyRu'));
  const bodyKk = sanitizeContent(str(formData, 'bodyKk'));
  const publish = formData.get('status') === 'PUBLISHED';

  // Обложку можно либо загрузить прямо здесь, либо выбрать из уже загруженных файлов.
  let coverMediaId = optionalStr(formData, 'coverMediaId');
  const coverFile = formData.get('coverFile');
  if (coverFile instanceof File && coverFile.size > 0) {
    coverMediaId = (await saveUpload(coverFile, ctx.tenantId)).id;
  }

  const data = {
    titleRu: parsed.data.titleRu,
    titleKk: parsed.data.titleKk || parsed.data.titleRu,
    excerptRu: optionalStr(formData, 'excerptRu') ?? (toPlainText(bodyRu, 180) || null),
    excerptKk: optionalStr(formData, 'excerptKk') ?? (toPlainText(bodyKk, 180) || null),
    bodyRu,
    bodyKk,
    coverMediaId,
    isPinned: formData.get('isPinned') === 'on',
    status: publish ? ('PUBLISHED' as const) : ('DRAFT' as const),
  };

  const publishedAtRaw = str(formData, 'publishedAt');
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  if (data.coverMediaId) await assertOwned('media', data.coverMediaId, ctx.tenantId);

  if (id) {
    await assertOwned('post', id, ctx.tenantId);
    await prisma.post.update({
      where: { id },
      data: { ...data, sectionId, publishedAt: publish ? publishedAt : null },
    });
    await audit(ctx.user, 'content.update', { tenantId: ctx.tenantId, entity: 'post', entityId: id });
  } else {
    const slug = await uniqueSlug(parsed.data.titleRu, async (candidate) =>
      Boolean(await prisma.post.findFirst({ where: { tenantId: ctx.tenantId, slug: candidate }, select: { id: true } })),
    );
    const created = await prisma.post.create({
      data: {
        ...data,
        slug,
        tenantId: ctx.tenantId,
        sectionId,
        publishedAt: publish ? publishedAt : null,
      },
    });
    await audit(ctx.user, 'content.create', { tenantId: ctx.tenantId, entity: 'post', entityId: created.id });
  }

  revalidatePath('/admin/posts');
  return { redirectTo: await hostUrl('/admin/posts') };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deletePost(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('post', id, ctx.tenantId);
  await prisma.post.delete({ where: { id } });
  await audit(ctx.user, 'content.delete', { tenantId: ctx.tenantId, entity: 'post', entityId: id });
  revalidatePath('/admin/posts');
}

// ─────────────────────────── Страницы ───────────────────────────

export async function savePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const ctx = await gate(formData);
  const sectionId = str(formData, 'sectionId');
  await assertOwned('section', sectionId, ctx.tenantId);

  const data = {
    bodyRu: sanitizeContent(str(formData, 'bodyRu')),
    bodyKk: sanitizeContent(str(formData, 'bodyKk')),
    seoDescRu: optionalStr(formData, 'seoDescRu'),
    seoDescKk: optionalStr(formData, 'seoDescKk'),
  };

  await prisma.page.upsert({
    where: { sectionId },
    update: data,
    create: { ...data, sectionId, tenantId: ctx.tenantId },
  });

  await audit(ctx.user, 'content.update', { tenantId: ctx.tenantId, entity: 'page', entityId: sectionId });
  revalidatePath('/admin/pages');
  return { redirectTo: await hostUrl('/admin/pages') };
  } catch (error) {
    return toActionError(error);
  }
}

// ─────────────────────────── Разделы ───────────────────────────

export async function toggleSection(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('section', id, ctx.tenantId);

  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw new Error('Раздел не найден');

  await prisma.section.update({ where: { id }, data: { isVisible: !section.isVisible } });
  revalidatePath('/admin/sections');
}

export async function renameSection(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('section', id, ctx.tenantId);

  await prisma.section.update({
    where: { id },
    data: { titleRu: str(formData, 'titleRu'), titleKk: str(formData, 'titleKk') },
  });
  revalidatePath('/admin/sections');
}

export async function moveSection(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const direction = str(formData, 'direction');
  await assertOwned('section', id, ctx.tenantId);

  const sections = await prisma.section.findMany({
    where: { tenantId: ctx.tenantId, parentId: null },
    orderBy: { position: 'asc' },
  });

  const index = sections.findIndex((s) => s.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sections.length) return;

  // Позиции могут быть неплотными, поэтому переставляем и переномеровываем весь список.
  const reordered = [...sections];
  [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];

  await prisma.$transaction(
    reordered.map((section, position) =>
      prisma.section.update({ where: { id: section.id }, data: { position } }),
    ),
  );

  revalidatePath('/admin/sections');
}

export async function addSection(formData: FormData) {
  const ctx = await gate(formData);
  const slug = str(formData, 'slug');
  const { SECTION_CATALOG } = await import('@/lib/sections');
  const meta = SECTION_CATALOG.find((s) => s.slug === slug);
  if (!meta) throw new Error('Неизвестный тип раздела');

  const exists = await prisma.section.findFirst({ where: { tenantId: ctx.tenantId, slug } });
  if (exists) throw new Error('Такой раздел уже есть');

  const last = await prisma.section.findFirst({
    where: { tenantId: ctx.tenantId },
    orderBy: { position: 'desc' },
  });

  const section = await prisma.section.create({
    data: {
      tenantId: ctx.tenantId,
      type: meta.type,
      slug: meta.slug,
      titleKk: meta.titleKk,
      titleRu: meta.titleRu,
      position: (last?.position ?? -1) + 1,
    },
  });

  if (meta.type === 'PAGE' || meta.type === 'TRUSTEE_BOARD' || meta.type === 'ANTICORRUPTION') {
    await prisma.page.create({ data: { tenantId: ctx.tenantId, sectionId: section.id } });
  }

  revalidatePath('/admin/sections');
}

// ─────────────────────────── Медиа и галерея ───────────────────────────

export async function uploadMedia(formData: FormData): Promise<void> {
  const ctx = await gate(formData);
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  const albumId = optionalStr(formData, 'albumId');

  if (albumId) await assertOwned('album', albumId, ctx.tenantId);

  for (const file of files) {
    try {
      const media = await saveUpload(file, ctx.tenantId);
      if (albumId) {
        const last = await prisma.albumItem.findFirst({ where: { albumId }, orderBy: { position: 'desc' } });
        await prisma.albumItem.upsert({
          where: { albumId_mediaId: { albumId, mediaId: media.id } },
          update: {},
          create: { albumId, mediaId: media.id, position: (last?.position ?? -1) + 1 },
        });
      }
    } catch (error) {
      if (error instanceof UploadError) throw new Error(`${file.name}: ${error.message}`);
      throw error;
    }
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/admin/media');
}

export async function saveAlbum(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const titleRu = str(formData, 'titleRu');
  if (titleRu.length < 2) throw new Error('Укажите название альбома');

  const takenOnRaw = str(formData, 'takenOn');
  const data = {
    titleRu,
    titleKk: str(formData, 'titleKk') || titleRu,
    descRu: optionalStr(formData, 'descRu'),
    descKk: optionalStr(formData, 'descKk'),
    takenOn: takenOnRaw ? new Date(takenOnRaw) : null,
  };

  if (id) {
    await assertOwned('album', id, ctx.tenantId);
    await prisma.album.update({ where: { id }, data });
    revalidatePath('/admin/gallery');
    return {};
  }

  const slug = await uniqueSlug(titleRu, async (candidate) =>
    Boolean(await prisma.album.findFirst({ where: { tenantId: ctx.tenantId, slug: candidate }, select: { id: true } })),
  );
  const album = await prisma.album.create({ data: { ...data, slug, tenantId: ctx.tenantId } });
  return { redirectTo: await hostUrl(`/admin/gallery/${album.id}`) };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteAlbum(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('album', id, ctx.tenantId);
  await prisma.album.delete({ where: { id } });
  revalidatePath('/admin/gallery');
  return { redirectTo: await hostUrl('/admin/gallery') };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeAlbumItem(formData: FormData) {
  const ctx = await gate(formData);
  const albumId = str(formData, 'albumId');
  const mediaId = str(formData, 'mediaId');
  await assertOwned('album', albumId, ctx.tenantId);
  await prisma.albumItem.deleteMany({ where: { albumId, mediaId } });
  revalidatePath(`/admin/gallery/${albumId}`);
}

export async function deleteMediaAction(formData: FormData) {
  const ctx = await gate(formData);
  await deleteMedia(str(formData, 'mediaId'), ctx.tenantId);
  revalidatePath('/admin/media');
}

// ─────────────────────────── Документы ───────────────────────────

export async function saveDocument(formData: FormData) {
  const ctx = await gate(formData);
  const titleRu = str(formData, 'titleRu');
  if (titleRu.length < 2) throw new Error('Укажите название документа');

  const file = formData.get('file');
  const existingId = str(formData, 'id');

  let mediaId = str(formData, 'mediaId');
  if (file instanceof File && file.size > 0) {
    const media = await saveUpload(file, ctx.tenantId);
    mediaId = media.id;
  }
  if (!mediaId) throw new Error('Прикрепите файл документа');
  await assertOwned('media', mediaId, ctx.tenantId);

  const data = {
    titleRu,
    titleKk: str(formData, 'titleKk') || titleRu,
    category: (str(formData, 'category') || 'OTHER') as DocumentCategory,
    mediaId,
  };

  if (existingId) {
    await assertOwned('document', existingId, ctx.tenantId);
    await prisma.document.update({ where: { id: existingId }, data });
  } else {
    await prisma.document.create({ data: { ...data, tenantId: ctx.tenantId } });
  }

  revalidatePath('/admin/documents');
}

export async function deleteDocument(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('document', id, ctx.tenantId);
  await prisma.document.delete({ where: { id } });
  revalidatePath('/admin/documents');
}

// ─────────────────────────── Педагоги ───────────────────────────

export async function saveStaff(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const fullName = str(formData, 'fullName');
  if (fullName.length < 2) throw new Error('Укажите ФИО');

  let photoMediaId = optionalStr(formData, 'photoMediaId');
  const photo = formData.get('photo');
  if (photo instanceof File && photo.size > 0) {
    photoMediaId = (await saveUpload(photo, ctx.tenantId)).id;
  }
  if (photoMediaId) await assertOwned('media', photoMediaId, ctx.tenantId);

  const positionRu = str(formData, 'positionRu');
  const data = {
    fullName,
    positionRu,
    positionKk: str(formData, 'positionKk') || positionRu,
    educationRu: optionalStr(formData, 'educationRu'),
    educationKk: optionalStr(formData, 'educationKk'),
    experience: optionalStr(formData, 'experience'),
    categoryName: optionalStr(formData, 'categoryName'),
    photoMediaId,
  };

  if (id) {
    await assertOwned('staffMember', id, ctx.tenantId);
    await prisma.staffMember.update({ where: { id }, data });
  } else {
    const last = await prisma.staffMember.findFirst({
      where: { tenantId: ctx.tenantId },
      orderBy: { position: 'desc' },
    });
    await prisma.staffMember.create({
      data: { ...data, tenantId: ctx.tenantId, position: (last?.position ?? -1) + 1 },
    });
  }

  revalidatePath('/admin/staff');
}

export async function deleteStaff(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('staffMember', id, ctx.tenantId);
  await prisma.staffMember.delete({ where: { id } });
  revalidatePath('/admin/staff');
}

// ─────────────────────────── Группы ───────────────────────────

export async function saveGroup(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const nameRu = str(formData, 'nameRu');
  if (nameRu.length < 1) throw new Error('Укажите название группы');

  const data = {
    nameRu,
    nameKk: str(formData, 'nameKk') || nameRu,
    ageFrom: num(formData, 'ageFrom'),
    ageTo: num(formData, 'ageTo'),
    language: str(formData, 'language') || 'kk',
    teachers: optionalStr(formData, 'teachers'),
    placesTotal: num(formData, 'placesTotal'),
    placesFree: num(formData, 'placesFree') ?? 0,
  };

  if (id) {
    await assertOwned('group', id, ctx.tenantId);
    await prisma.group.update({ where: { id }, data });
  } else {
    const last = await prisma.group.findFirst({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'desc' } });
    await prisma.group.create({ data: { ...data, tenantId: ctx.tenantId, position: (last?.position ?? -1) + 1 } });
  }

  await syncFreePlaces(ctx.tenantId);
  revalidatePath('/admin/groups');
}

export async function deleteGroup(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('group', id, ctx.tenantId);
  await prisma.group.delete({ where: { id } });
  await syncFreePlaces(ctx.tenantId);
  revalidatePath('/admin/groups');
}

/** Свободные места в паспорте — сумма по группам, чтобы каталог портала не расходился с сайтом. */
async function syncFreePlaces(tenantId: string) {
  const aggregate = await prisma.group.aggregate({
    where: { tenantId, isVisible: true },
    _sum: { placesFree: true, placesTotal: true },
  });
  await prisma.tenantProfile.update({
    where: { tenantId },
    data: {
      placesFree: aggregate._sum.placesFree ?? 0,
      placesTotal: aggregate._sum.placesTotal ?? undefined,
    },
  });
}

// ─────────────────────────── Меню питания ───────────────────────────

export async function saveMenuDay(formData: FormData) {
  const ctx = await gate(formData);
  const dateRaw = str(formData, 'date');
  if (!dateRaw) throw new Error('Укажите дату');
  const date = new Date(dateRaw);

  let scanMediaId = optionalStr(formData, 'scanMediaId');
  const scan = formData.get('scan');
  if (scan instanceof File && scan.size > 0) {
    scanMediaId = (await saveUpload(scan, ctx.tenantId)).id;
  }

  const data = {
    breakfastRu: optionalStr(formData, 'breakfastRu'),
    breakfastKk: optionalStr(formData, 'breakfastKk'),
    lunchRu: optionalStr(formData, 'lunchRu'),
    lunchKk: optionalStr(formData, 'lunchKk'),
    snackRu: optionalStr(formData, 'snackRu'),
    snackKk: optionalStr(formData, 'snackKk'),
    dinnerRu: optionalStr(formData, 'dinnerRu'),
    dinnerKk: optionalStr(formData, 'dinnerKk'),
    scanMediaId,
  };

  await prisma.menuDay.upsert({
    where: { tenantId_date: { tenantId: ctx.tenantId, date } },
    update: data,
    create: { ...data, tenantId: ctx.tenantId, date },
  });

  revalidatePath('/admin/menu');
}

export async function deleteMenuDay(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('menuDay', id, ctx.tenantId);
  await prisma.menuDay.delete({ where: { id } });
  revalidatePath('/admin/menu');
}

// ─────────────────────────── Обращения ───────────────────────────

export async function answerFeedback(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('feedbackMessage', id, ctx.tenantId);

  const answer = optionalStr(formData, 'answer');
  await prisma.feedbackMessage.update({
    where: { id },
    data: {
      answer,
      status: answer ? 'ANSWERED' : 'IN_PROGRESS',
      answeredAt: answer ? new Date() : null,
    },
  });

  revalidatePath('/admin/feedback');
}

// ─────────────────────────── Внешний вид и паспорт ───────────────────────────

export async function saveAppearance(formData: FormData) {
  const ctx = await gate(formData);
  if (!ctx.canManageSettings) throw new Error('Менять внешний вид может только администратор сада');

  const templateCode = str(formData, 'templateCode');
  const palette = str(formData, 'palette');
  if (!isTemplateCode(templateCode) || !isPaletteCode(palette)) throw new Error('Неизвестный шаблон или палитра');

  let coverMediaId = optionalStr(formData, 'coverMediaId');
  const cover = formData.get('cover');
  if (cover instanceof File && cover.size > 0) {
    coverMediaId = (await saveUpload(cover, ctx.tenantId)).id;
  }

  let logoMediaId = optionalStr(formData, 'logoMediaId');
  const logo = formData.get('logo');
  if (logo instanceof File && logo.size > 0) {
    logoMediaId = (await saveUpload(logo, ctx.tenantId)).id;
  }

  await prisma.$transaction([
    prisma.tenant.update({ where: { id: ctx.tenantId }, data: { templateCode, palette } }),
    prisma.tenantProfile.update({ where: { tenantId: ctx.tenantId }, data: { coverMediaId, logoMediaId } }),
  ]);

  // Палитра и шаблон читаются из кэша резолвера — иначе изменения увидят через минуту.
  await invalidateTenantCacheById(ctx.tenantId);
  revalidatePath('/admin/appearance');
}

export async function saveProfile(formData: FormData) {
  const ctx = await gate(formData);
  if (!ctx.canManageSettings) throw new Error('Менять паспорт сада может только администратор сада');

  const nameRu = str(formData, 'nameRu');
  if (nameRu.length < 2) throw new Error('Укажите название сада');

  await prisma.tenantProfile.update({
    where: { tenantId: ctx.tenantId },
    data: {
      nameRu,
      nameKk: str(formData, 'nameKk') || nameRu,
      shortNameRu: optionalStr(formData, 'shortNameRu'),
      shortNameKk: optionalStr(formData, 'shortNameKk'),
      bin: optionalStr(formData, 'bin'),
      licenseNo: optionalStr(formData, 'licenseNo'),
      addressRu: optionalStr(formData, 'addressRu'),
      addressKk: optionalStr(formData, 'addressKk'),
      district: optionalStr(formData, 'district'),
      phone: optionalStr(formData, 'phone'),
      phoneExtra: optionalStr(formData, 'phoneExtra'),
      email: optionalStr(formData, 'email'),
      workHours: optionalStr(formData, 'workHours'),
      headNameRu: optionalStr(formData, 'headNameRu'),
      headNameKk: optionalStr(formData, 'headNameKk'),
      groupsCount: num(formData, 'groupsCount'),
      langKk: formData.get('langKk') === 'on',
      langRu: formData.get('langRu') === 'on',
      aboutRu: optionalStr(formData, 'aboutRu'),
      aboutKk: optionalStr(formData, 'aboutKk'),
      lat: Number.parseFloat(str(formData, 'lat')) || null,
      lng: Number.parseFloat(str(formData, 'lng')) || null,
    },
  });

  await invalidateTenantCacheById(ctx.tenantId);
  await audit(ctx.user, 'tenant.update', { tenantId: ctx.tenantId, entity: 'profile' });
  revalidatePath('/admin/profile');
}

// ─────────────────────────── Свой пароль ───────────────────────────

export async function changeOwnPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const host = String(formData.get('host') ?? '');
  // Смена пароля разрешена даже в режиме только чтения — иначе выйти из
  // mustChangePassword при просроченной подписке было бы невозможно.
  const ctx = await tenantAdmin(host);
  await assertCsrf(formData);

  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const repeat = String(formData.get('repeat') ?? '');

  if (next !== repeat) throw new Error('Новый пароль и повтор не совпадают');
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);

  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  if (!user || !(await verifyPassword(user.passwordHash, current))) {
    throw new Error('Текущий пароль указан неверно');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), mustChangePassword: false },
  });

  // Остальные устройства разлогиниваем, текущее — тоже: пусть войдёт с новым паролем.
  await destroyAllSessions(user.id);
  await audit(ctx.user, 'auth.password_changed', { tenantId: ctx.tenantId });

  return { redirectTo: await hostUrl('/admin/login') };
  } catch (error) {
    return toActionError(error);
  }
}
