'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { ActionError, EMPTY_ACTION_STATE, type ActionState, toActionError } from '@/lib/action-state';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { assertCanEdit } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { assertOwned } from '@/server/db/scope';
import { audit } from '@/server/audit';
import { sanitizeContent, toPlainText } from '@/lib/sanitize';
import { isVideoUrl } from '@/lib/video';
import type { EditorUpload } from '@/components/admin/RichText';
import { slugify, uniqueSlug } from '@/lib/slug';
import {
  canDeleteSection, CUSTOM_KINDS, isCustomKind, isValidSectionSlug, normalizeLinkUrl,
  RESERVED_SECTION_SLUGS, sectionSettings,
} from '@/lib/sections';
import type { Prisma, SectionType } from '@prisma/client';
import { canMoveFolder, titleFromFileName } from '@/lib/doc-tree';
import { saveUpload, deleteMedia, UploadError } from '@/server/media';
import { invalidateTenantCacheById } from '@/server/tenant/resolve';
import { geocodeAddress } from '@/server/maps/yandex';
import { hashPassword, passwordProblem, verifyPassword } from '@/server/auth/password';
import { destroyAllSessions, getCurrentUser } from '@/server/auth/session';
import {
  isCoverFocus, isFontPairCode, isHeaderLayoutCode, isHeaderStyleCode, isPaletteCode, isPatternCode, isShapeCode, isTemplateCode,
} from '@/lib/templates';
import { parseHex, toHex } from '@/lib/colors';
import { env } from '@/lib/env';

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

  // Ссылка на ролик: принимаем только YouTube и Instagram, чужую ссылку
  // лучше отклонить сразу, чем показать родителю пустую рамку.
  const videoRaw = optionalStr(formData, 'videoUrl');
  if (videoRaw && !isVideoUrl(videoRaw)) {
    throw new Error('Ссылка на видео должна вести на YouTube или Instagram');
  }

  const data = {
    titleRu: parsed.data.titleRu,
    titleKk: parsed.data.titleKk || parsed.data.titleRu,
    excerptRu: optionalStr(formData, 'excerptRu') ?? (toPlainText(bodyRu, 180) || null),
    excerptKk: optionalStr(formData, 'excerptKk') ?? (toPlainText(bodyKk, 180) || null),
    bodyRu,
    bodyKk,
    coverMediaId,
    videoUrl: videoRaw ?? null,
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
    return toActionError(error, (await getCurrentUser())?.locale);
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
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

/**
 * Фото или файл, вставленные прямо в текст страницы или новости. Проходят
 * тот же `saveUpload`, что и галерея: пересжатие и снятие EXIF обязательны
 * и здесь — фото в текст вставляют с телефона чаще, чем в альбом.
 */
export async function uploadEditorFile(formData: FormData): Promise<EditorUpload> {
  try {
    const ctx = await gate(formData);
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      throw new ActionError({ kk: 'Файл таңдалмады', ru: 'Файл не выбран' });
    }
    const media = await saveUpload(file, ctx.tenantId);
    await audit(ctx.user, 'content.create', { tenantId: ctx.tenantId, entity: 'media', entityId: media.id });
    return {
      url: `/api/media/${media.id}`,
      name: media.origName,
      image: media.mime.startsWith('image/'),
      width: media.width,
      height: media.height,
    };
  } catch (error) {
    return { error: toActionError(error, (await getCurrentUser())?.locale).error ?? 'Ошибка загрузки' };
  }
}

// ─────────────────────────── Разделы ───────────────────────────

export async function toggleSection(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('section', id, ctx.tenantId);

  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw new ActionError({ kk: 'Бөлім табылмады', ru: 'Раздел не найден' });

  await prisma.section.update({ where: { id }, data: { isVisible: !section.isVisible } });
  revalidatePath('/admin/sections');
}

/** Ошибка настройки раздела — сразу на двух языках. */
function sectionError(kk: string, ru: string): never {
  throw new ActionError({ kk, ru });
}

/** Занят ли адрес другим разделом этого сада. */
async function slugTaken(tenantId: string, slug: string, exceptId?: string): Promise<boolean> {
  const row = await prisma.section.findFirst({
    where: { tenantId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { id: true },
  });
  return Boolean(row);
}

/**
 * Проверки, общие для создания и настройки раздела: название, адрес,
 * место в меню, папка и ссылка. Возвращает уже очищенные значения.
 */
async function readSectionForm(
  formData: FormData,
  tenantId: string,
  options: { id?: string; type: SectionType; hasChildren: boolean },
) {
  const titleRu = str(formData, 'titleRu');
  const titleKk = str(formData, 'titleKk') || titleRu;
  if (titleRu.length < 2) sectionError('Орысша атауын жазыңыз', 'Укажите название по-русски');
  if (titleRu.length > 80 || titleKk.length > 80) {
    sectionError('Атауы тым ұзын — 80 таңбаға дейін', 'Название слишком длинное — до 80 символов');
  }

  // Адрес: пустой — собираем из русского названия и подбираем свободный;
  // введённый — только приводим к виду и проверяем.
  const rawSlug = str(formData, 'slug');
  let slug = slugify(rawSlug || titleRu);
  if (!rawSlug) {
    const root = slug.length >= 2 ? slug : 'razdel';
    slug = root;
    for (let i = 2; (await slugTaken(tenantId, slug, options.id)) || RESERVED_SECTION_SLUGS.has(slug); i += 1) {
      slug = `${root}-${i}`;
    }
  }
  if (!isValidSectionSlug(slug)) {
    sectionError(
      'Мекенжай жарамсыз: латын әріптері, сандар және сызықша, 2–60 таңба. admin, search сияқты мекенжайлар бос емес.',
      'Адрес не подходит: латинские буквы, цифры и дефис, 2–60 символов. Адреса вроде admin и search заняты сайтом.',
    );
  }
  if (await slugTaken(tenantId, slug, options.id)) {
    sectionError(`«/${slug}» мекенжайы бос емес`, `Адрес «/${slug}» уже занят другим разделом`);
  }

  // Место в меню. Вложенность одна: раздел внутри раздела, не глубже.
  const parentId = optionalStr(formData, 'parentId');
  if (parentId) {
    if (parentId === options.id) sectionError('Бөлімді өзінің ішіне салуға болмайды', 'Раздел нельзя вложить в самого себя');
    const parent = await prisma.section.findFirst({
      where: { id: parentId, tenantId },
      select: { parentId: true, type: true },
    });
    if (!parent) sectionError('Ата-бөлім табылмады', 'Раздел-родитель не найден');
    if (parent.parentId) {
      sectionError('Ішкі бөлімнің ішіне салуға болмайды — бір деңгей ғана', 'Нельзя вкладывать во вложенный раздел — уровень только один');
    }
    if (parent.type === 'LINK') sectionError('Сілтеменің ішіне бөлім салуға болмайды', 'Внутрь ссылки раздел не вложить');
    if (options.hasChildren) {
      sectionError(
        'Бұл бөлімнің өз ішкі бөлімдері бар — оны басқаның ішіне салуға болмайды',
        'У этого раздела есть свои вложенные — его нельзя вложить в другой',
      );
    }
  }

  // Настройки вида раздела.
  let folderId: string | null = null;
  let url: string | null = null;
  if (options.type === 'DOCUMENTS' && formData.has('folderId')) {
    folderId = optionalStr(formData, 'folderId');
    if (!folderId) sectionError('Буманы таңдаңыз', 'Выберите папку с документами');
    await assertOwned('documentFolder', folderId, tenantId);
  }
  if (options.type === 'LINK') {
    url = normalizeLinkUrl(str(formData, 'url'));
    if (!url) sectionError('Сілтеме мекенжайын тексеріңіз', 'Проверьте адрес ссылки — например, darabala.kz или https://…');
  }

  return { titleRu, titleKk, slug, parentId, folderId, url };
}

/** Позиция в конце уровня: новый или перенесённый раздел встаёт последним. */
async function lastPosition(tenantId: string, parentId: string | null): Promise<number> {
  const last = await prisma.section.findFirst({
    where: { tenantId, parentId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  return (last?.position ?? -1) + 1;
}

/**
 * Свой раздел: текстовая страница, документы из папки или ссылка.
 * Страницу сразу открываем в редакторе — пустой раздел заведующая создаёт,
 * чтобы наполнить, а не чтобы потом искать его в списке.
 */
export async function createSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await gate(formData);
    const kind = formData.get('kind');
    if (!isCustomKind(kind)) sectionError('Бөлімнің түрін таңдаңыз', 'Выберите вид раздела');
    const type = CUSTOM_KINDS.find((item) => item.kind === kind)!.type;

    const form = await readSectionForm(formData, ctx.tenantId, { type, hasChildren: false });

    const section = await prisma.section.create({
      data: {
        tenantId: ctx.tenantId,
        type,
        slug: form.slug,
        titleRu: form.titleRu,
        titleKk: form.titleKk,
        parentId: form.parentId,
        position: await lastPosition(ctx.tenantId, form.parentId),
        settings: {
          custom: true,
          ...(form.folderId ? { folderId: form.folderId } : {}),
          ...(form.url ? { url: form.url } : {}),
        },
      },
    });
    if (type === 'PAGE') {
      await prisma.page.create({ data: { tenantId: ctx.tenantId, sectionId: section.id } });
    }

    await audit(ctx.user, 'content.create', { tenantId: ctx.tenantId, entity: 'section', entityId: section.id });
    revalidatePath('/admin', 'layout');
    return { redirectTo: await hostUrl(type === 'PAGE' ? `/admin/pages/${section.id}` : '/admin/sections') };
  } catch (error) {
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

/** Название, адрес, место в меню и настройки вида — одной формой. */
export async function updateSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await gate(formData);
    const id = str(formData, 'id');
    await assertOwned('section', id, ctx.tenantId);

    const current = await prisma.section.findUnique({
      where: { id },
      include: { _count: { select: { children: true } } },
    });
    if (!current) sectionError('Бөлім табылмады', 'Раздел не найден');

    const form = await readSectionForm(formData, ctx.tenantId, {
      id,
      type: current.type,
      hasChildren: current._count.children > 0,
    });

    const settings = sectionSettings(current.settings);
    const movedLevel = form.parentId !== current.parentId;

    await prisma.section.update({
      where: { id },
      data: {
        titleRu: form.titleRu,
        titleKk: form.titleKk,
        slug: form.slug,
        parentId: form.parentId,
        ...(movedLevel ? { position: await lastPosition(ctx.tenantId, form.parentId) } : {}),
        settings: {
          ...(settings.custom ? { custom: true } : {}),
          ...(current.type === 'DOCUMENTS' && settings.custom && form.folderId ? { folderId: form.folderId } : {}),
          ...(current.type === 'LINK' && form.url ? { url: form.url } : {}),
        },
      },
    });

    await audit(ctx.user, 'content.update', { tenantId: ctx.tenantId, entity: 'section', entityId: id });
    revalidatePath('/admin', 'layout');
    return { redirectTo: await hostUrl('/admin/sections') };
  } catch (error) {
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

/**
 * Удалить можно страницу, ссылку и свой раздел. Ленты, галерею, педагогов
 * и прочие — только скрыть: вместе с ними ушли бы все новости и альбомы.
 */
export async function deleteSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await gate(formData);
    const id = str(formData, 'id');
    await assertOwned('section', id, ctx.tenantId);

    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) sectionError('Бөлім табылмады', 'Раздел не найден');

    if (!canDeleteSection(section)) {
      sectionError('Бұл бөлімді жоюға болмайды, тек жасыруға болады', 'Этот раздел нельзя удалить, только скрыть');
    }
    if (formData.get('confirm') !== 'on') {
      sectionError('Жоюды растаңыз — белгішені қойыңыз', 'Подтвердите удаление — поставьте галочку');
    }

    // Вложенные разделы не пропадают, а поднимаются в главное меню — в конец.
    const children = await prisma.section.findMany({ where: { parentId: id }, orderBy: { position: 'asc' } });
    let position = await lastPosition(ctx.tenantId, null);
    await prisma.$transaction([
      ...children.map((child) =>
        prisma.section.update({ where: { id: child.id }, data: { parentId: null, position: position++ } }),
      ),
      prisma.section.delete({ where: { id } }),
    ]);

    await audit(ctx.user, 'content.delete', { tenantId: ctx.tenantId, entity: 'section', entityId: id });
    revalidatePath('/admin', 'layout');
    return { redirectTo: await hostUrl('/admin/sections') };
  } catch (error) {
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

/** Выше или ниже — среди разделов того же уровня. */
export async function moveSection(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const direction = str(formData, 'direction');
  await assertOwned('section', id, ctx.tenantId);

  const moving = await prisma.section.findUnique({ where: { id }, select: { parentId: true } });
  if (!moving) return;

  const sections = await prisma.section.findMany({
    where: { tenantId: ctx.tenantId, parentId: moving.parentId },
    orderBy: { position: 'asc' },
  });

  const index = sections.findIndex((s) => s.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sections.length) return;

  // Позиции могут быть неплотными, поэтому переставляем и переномеровываем весь уровень.
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
  if (!meta) throw new ActionError({ kk: 'Бөлімнің түрі белгісіз', ru: 'Неизвестный тип раздела' });

  const exists = await prisma.section.findFirst({ where: { tenantId: ctx.tenantId, slug } });
  if (exists) throw new ActionError({ kk: 'Мұндай бөлім бұрыннан бар', ru: 'Такой раздел уже есть' });

  const section = await prisma.section.create({
    data: {
      tenantId: ctx.tenantId,
      type: meta.type,
      slug: meta.slug,
      titleKk: meta.titleKk,
      titleRu: meta.titleRu,
      position: await lastPosition(ctx.tenantId, null),
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
  if (titleRu.length < 2) throw new ActionError({ kk: 'Альбом атауын көрсетіңіз', ru: 'Укажите название альбома' });

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
    return toActionError(error, (await getCurrentUser())?.locale);
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
    return toActionError(error, (await getCurrentUser())?.locale);
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

/**
 * Папка документа проверяется отдельно: без этого сад мог бы подставить чужой
 * folderId и увести файл на соседний сайт.
 */
async function folderIdFrom(formData: FormData, tenantId: string, field = 'folderId'): Promise<string | null> {
  const folderId = str(formData, field);
  if (!folderId) return null;
  await assertOwned('documentFolder', folderId, tenantId);
  return folderId;
}

/** Следующая позиция среди соседей: новая папка встаёт в конец своего уровня. */
async function nextFolderPosition(tenantId: string, parentId: string | null): Promise<number> {
  const last = await prisma.documentFolder.findFirst({
    where: { tenantId, parentId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  return (last?.position ?? -1) + 1;
}

export async function createDocFolder(formData: FormData) {
  const ctx = await gate(formData);
  const titleRu = str(formData, 'titleRu');
  if (titleRu.length < 2) throw new ActionError({ kk: 'Бума атауын көрсетіңіз', ru: 'Укажите название папки' });
  const parentId = await folderIdFrom(formData, ctx.tenantId, 'parentId');

  await prisma.documentFolder.create({
    data: {
      tenantId: ctx.tenantId,
      titleRu,
      titleKk: str(formData, 'titleKk') || titleRu,
      parentId,
      position: await nextFolderPosition(ctx.tenantId, parentId),
    },
  });

  revalidatePath('/admin/documents');
}

/** Переименование и перенос в другую папку — одной формой. */
export async function renameDocFolder(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const titleRu = str(formData, 'titleRu');
  if (titleRu.length < 2) throw new ActionError({ kk: 'Бума атауын көрсетіңіз', ru: 'Укажите название папки' });
  await assertOwned('documentFolder', id, ctx.tenantId);

  const data: Prisma.DocumentFolderUncheckedUpdateInput = { titleRu, titleKk: str(formData, 'titleKk') || titleRu };

  // Поля «где лежит» в форме может не быть — тогда папка остаётся на месте.
  if (formData.has('parentId')) {
    const parentId = await folderIdFrom(formData, ctx.tenantId, 'parentId');
    const folders = await ctx.db.docFolders.findMany({ select: { id: true, parentId: true, position: true } });
    const current = folders.find((f) => f.id === id);
    if (current && current.parentId !== parentId) {
      if (!canMoveFolder(folders, id, parentId)) {
        throw new ActionError({
          kk: 'Буманы өзінің ішіне салуға болмайды',
          ru: 'Папку нельзя положить внутрь неё самой',
        });
      }
      data.parentId = parentId;
      data.position = await nextFolderPosition(ctx.tenantId, parentId);
    }
  }

  await prisma.documentFolder.update({ where: { id }, data });
  revalidatePath('/admin/documents');
}

/**
 * Папка удаляется, содержимое — нет: вложенные папки и файлы поднимаются
 * на уровень выше, туда, где лежала сама папка. Случайное удаление
 * «IV. Учебно-методическая работа» не должно уносить с собой сотню файлов.
 */
export async function deleteDocFolder(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('documentFolder', id, ctx.tenantId);
  const folder = await prisma.documentFolder.findUniqueOrThrow({ where: { id }, select: { parentId: true } });

  const [children, start] = await Promise.all([
    prisma.documentFolder.findMany({
      where: { tenantId: ctx.tenantId, parentId: id },
      orderBy: { position: 'asc' },
      select: { id: true },
    }),
    nextFolderPosition(ctx.tenantId, folder.parentId),
  ]);

  await prisma.$transaction([
    ...children.map((child, index) =>
      prisma.documentFolder.update({ where: { id: child.id }, data: { parentId: folder.parentId, position: start + index } }),
    ),
    prisma.document.updateMany({ where: { tenantId: ctx.tenantId, folderId: id }, data: { folderId: folder.parentId } }),
    prisma.documentFolder.delete({ where: { id } }),
  ]);

  revalidatePath('/admin/documents');
}

/** Выше/ниже — среди соседей по уровню, а не среди всех папок сада. */
export async function moveDocFolder(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const up = str(formData, 'direction') === 'up';
  await assertOwned('documentFolder', id, ctx.tenantId);
  const { parentId } = await prisma.documentFolder.findUniqueOrThrow({ where: { id }, select: { parentId: true } });

  const folders = await prisma.documentFolder.findMany({
    where: { tenantId: ctx.tenantId, parentId },
    orderBy: { position: 'asc' },
    select: { id: true },
  });

  const index = folders.findIndex((f) => f.id === id);
  const target = up ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= folders.length) return;

  [folders[index], folders[target]] = [folders[target]!, folders[index]!];
  await prisma.$transaction(
    folders.map((f, position) => prisma.documentFolder.update({ where: { id: f.id }, data: { position } })),
  );

  revalidatePath('/admin/documents');
}

/**
 * Добавление и правка документа. Файлов можно выбрать сразу несколько —
 * материалы самооценки приходят пачками по два десятка, и загружать их
 * по одному — полчаса на папку. У пачки названия берутся из имён файлов.
 */
export async function saveDocument(formData: FormData) {
  const ctx = await gate(formData);
  const existingId = str(formData, 'id');
  const folderId = await folderIdFrom(formData, ctx.tenantId);
  const files = formData.getAll('file').filter((f): f is File => f instanceof File && f.size > 0);

  if (existingId) {
    const titleRu = str(formData, 'titleRu');
    if (titleRu.length < 2) throw new ActionError({ kk: 'Құжат атауын көрсетіңіз', ru: 'Укажите название документа' });
    await assertOwned('document', existingId, ctx.tenantId);
    const mediaId = files[0] ? (await saveUpload(files[0], ctx.tenantId)).id : undefined;
    await prisma.document.update({
      where: { id: existingId },
      data: { titleRu, titleKk: str(formData, 'titleKk') || titleRu, folderId, ...(mediaId ? { mediaId } : {}) },
    });
    revalidatePath('/admin/documents');
    return;
  }

  if (files.length === 0) throw new ActionError({ kk: 'Құжат файлын тіркеңіз', ru: 'Прикрепите файл документа' });

  const last = await prisma.document.findFirst({
    where: { tenantId: ctx.tenantId, folderId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  let position = (last?.position ?? -1) + 1;

  // Название из формы — только для одиночного файла: одно название на двадцать
  // файлов дало бы двадцать одинаковых строк.
  const single = files.length === 1;
  const formRu = single ? str(formData, 'titleRu') : '';
  const formKk = single ? str(formData, 'titleKk') : '';
  for (const file of files) {
    const media = await saveUpload(file, ctx.tenantId);
    const fromName = titleFromFileName(file.name) || file.name;
    await prisma.document.create({
      data: {
        tenantId: ctx.tenantId,
        titleRu: formRu || fromName,
        titleKk: formKk || formRu || fromName,
        folderId,
        mediaId: media.id,
        position: position++,
      },
    });
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
  if (fullName.length < 2) throw new ActionError({ kk: 'Аты-жөнін көрсетіңіз', ru: 'Укажите ФИО' });

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
  if (nameRu.length < 1) throw new ActionError({ kk: 'Топ атауын көрсетіңіз', ru: 'Укажите название группы' });

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

/**
 * Отдельное действие для свободных мест: цифра меняется чаще всего остального,
 * и заведующая правит её прямо в строке списка. Через `saveGroup` так нельзя —
 * оно перезаписывает всю группу, и короткая форма стёрла бы возраст, язык
 * и педагогов пустыми значениями.
 */
export async function setGroupPlaces(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await gate(formData);
    const id = str(formData, 'id');
    await assertOwned('group', id, ctx.tenantId);

    const placesFree = num(formData, 'placesFree') ?? 0;
    if (placesFree < 0) {
      throw new ActionError({ kk: 'Бос орын теріс болмайды', ru: 'Свободных мест не может быть меньше нуля' });
    }

    const group = await prisma.group.findUniqueOrThrow({ where: { id }, select: { placesTotal: true } });
    if (group.placesTotal !== null && placesFree > group.placesTotal) {
      throw new ActionError({
        kk: `Барлығы ${group.placesTotal} орын`,
        ru: `Всего мест — ${group.placesTotal}`,
      });
    }

    await prisma.group.update({ where: { id }, data: { placesFree } });
    await syncFreePlaces(ctx.tenantId);
    revalidatePath('/admin/groups');
    return EMPTY_ACTION_STATE;
  } catch (error) {
    return toActionError(error, (await getCurrentUser())?.locale);
  }
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
  if (!dateRaw) throw new ActionError({ kk: 'Күнін көрсетіңіз', ru: 'Укажите дату' });
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
  if (!ctx.canManageSettings) throw new ActionError({ kk: 'Сыртқы көріністі тек балабақша әкімшісі өзгерте алады', ru: 'Менять внешний вид может только администратор сада' });

  const templateCode = str(formData, 'templateCode');
  const palette = str(formData, 'palette');
  const pattern = str(formData, 'pattern') || 'none';
  const coverFocus = str(formData, 'coverFocus') || 'center';
  if (!isTemplateCode(templateCode) || !isPaletteCode(palette) || !isPatternCode(pattern)) {
    throw new ActionError({ kk: 'Үлгі, палитра немесе өрнек белгісіз', ru: 'Неизвестный шаблон, палитра или узор' });
  }
  const fontPair = str(formData, 'fontPair') || 'soft';
  const shape = str(formData, 'shape') || 'soft';
  const headerStyle = str(formData, 'headerStyle') || 'light';
  const headerLayout = str(formData, 'headerLayout') || 'classic';
  if (!isFontPairCode(fontPair) || !isShapeCode(shape) || !isHeaderStyleCode(headerStyle) || !isHeaderLayoutCode(headerLayout)) {
    throw new ActionError({ kk: 'Қаріп, пішін немесе тақырыпша түсі белгісіз', ru: 'Неизвестный шрифт, форма или цвет шапки' });
  }
  // «Свой цвет» храним всегда, когда он прислан, — чтобы, вернувшись к нему
  // с готовой палитры, сад нашёл свой цвет на месте.
  const pickedColor = parseHex(str(formData, 'brandColor'));
  const brandColor = pickedColor ? toHex(pickedColor) : null;
  if (palette === 'custom' && !brandColor) {
    throw new ActionError({ kk: 'Өз түсіңізді таңдаңыз', ru: 'Выберите свой цвет' });
  }

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

  // Шапка и главная. Разделы для блока принимаем только свои и только
  // видимые корневые; отмечены все — храним пустой список, тогда и новые
  // разделы попадут в блок сами.
  const rootSections = await prisma.section.findMany({
    where: { tenantId: ctx.tenantId, parentId: null, isVisible: true },
    select: { id: true },
  });
  const rootIds = new Set(rootSections.map((section) => section.id));
  const picked = formData.getAll('homeSectionIds').map(String).filter((id) => rootIds.has(id));
  const homeSectionIds = picked.length === rootIds.size ? [] : [...new Set(picked)];
  const layout = {
    headerSticky: formData.get('headerSticky') === 'on',
    // Сняли все галочки — это «блок не нужен», а не «все разделы»:
    // пустой список в базе значит именно «все».
    homeShowSections: formData.get('homeShowSections') === 'on' && (picked.length > 0 || rootIds.size === 0),
    homeSectionIds,
    homeShowContacts: formData.get('homeShowContacts') === 'on',
    // Поля нет в форме — язык не трогаем; прислан мусор — казахский.
    ...(formData.has('defaultLocale') ? { defaultLocale: str(formData, 'defaultLocale') === 'ru' ? 'ru' : 'kk' } : {}),
  };

  await prisma.$transaction([
    prisma.tenant.update({
      where: { id: ctx.tenantId },
      data: { templateCode, palette, pattern, fontPair, shape, headerStyle, headerLayout, ...(brandColor ? { brandColor } : {}), ...layout },
    }),
    prisma.tenantProfile.update({
      where: { tenantId: ctx.tenantId },
      data: { coverMediaId, logoMediaId, coverFocus: isCoverFocus(coverFocus) ? coverFocus : 'center' },
    }),
  ]);

  // Палитра и шаблон читаются из кэша резолвера — иначе изменения увидят через минуту.
  await invalidateTenantCacheById(ctx.tenantId);
  revalidatePath('/admin/appearance');
}

/**
 * Тексты шапки и первого экрана главной. Всё необязательно; кнопка
 * сохраняется, только если есть и текст, и ссылка — полкнопки на сайте
 * хуже, чем никакой.
 */
export async function saveHomepage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const ctx = await gate(formData);
    if (!ctx.canManageSettings) {
      throw new ActionError({ kk: 'Басты бетті тек балабақша әкімшісі өзгерте алады', ru: 'Менять главную может только администратор сада' });
    }

    const text = (key: string, max: number) => {
      const value = str(formData, key).replace(/\s+/g, ' ');
      if (value.length > max) {
        throw new ActionError({ kk: `Мәтін тым ұзын — ${max} таңбаға дейін`, ru: `Слишком длинный текст — до ${max} символов` });
      }
      return value || null;
    };

    const button = (textKk: string, textRu: string, urlKey: string, label: { kk: string; ru: string }) => {
      const kk = text(textKk, 40);
      const ru = text(textRu, 40);
      const raw = str(formData, urlKey);
      const url = raw ? normalizeLinkUrl(raw) : null;
      if (raw && !url) {
        throw new ActionError({ kk: `${label.kk}: сілтемені тексеріңіз`, ru: `${label.ru}: проверьте ссылку — например /contacts, tel:+7… или https://…` });
      }
      if ((kk || ru) && !url) {
        throw new ActionError({ kk: `${label.kk}: қайда апаратынын көрсетіңіз`, ru: `${label.ru}: укажите, куда ведёт кнопка` });
      }
      if (url && !kk && !ru) {
        throw new ActionError({ kk: `${label.kk}: батырма мәтінін жазыңыз`, ru: `${label.ru}: напишите текст кнопки` });
      }
      return { kk, ru, url };
    };

    const headerCta = button('headerCtaTextKk', 'headerCtaTextRu', 'headerCtaUrl', { kk: 'Тақырыпшадағы батырма', ru: 'Кнопка в шапке' });
    const cta1 = button('heroCta1TextKk', 'heroCta1TextRu', 'heroCta1Url', { kk: 'Басты батырма', ru: 'Главная кнопка' });
    const cta2 = button('heroCta2TextKk', 'heroCta2TextRu', 'heroCta2Url', { kk: 'Екінші батырма', ru: 'Вторая кнопка' });

    await prisma.tenantProfile.update({
      where: { tenantId: ctx.tenantId },
      data: {
        headerTaglineKk: text('headerTaglineKk', 60),
        headerTaglineRu: text('headerTaglineRu', 60),
        headerShowPhone: formData.get('headerShowPhone') === 'on',
        headerCtaTextKk: headerCta.kk,
        headerCtaTextRu: headerCta.ru,
        headerCtaUrl: headerCta.url,
        heroEyebrowKk: text('heroEyebrowKk', 60),
        heroEyebrowRu: text('heroEyebrowRu', 60),
        heroTitleKk: text('heroTitleKk', 90),
        heroTitleRu: text('heroTitleRu', 90),
        heroHighlightKk: text('heroHighlightKk', 60),
        heroHighlightRu: text('heroHighlightRu', 60),
        heroLeadKk: text('heroLeadKk', 300),
        heroLeadRu: text('heroLeadRu', 300),
        heroCta1TextKk: cta1.kk,
        heroCta1TextRu: cta1.ru,
        heroCta1Url: cta1.url,
        heroCta2TextKk: cta2.kk,
        heroCta2TextRu: cta2.ru,
        heroCta2Url: cta2.url,
      },
    });

    await audit(ctx.user, 'content.update', { tenantId: ctx.tenantId, entity: 'homepage' });
    // Паспорт сада читается из кэша резолвера — иначе шапка обновится через минуту.
    await invalidateTenantCacheById(ctx.tenantId);
    revalidatePath('/admin/homepage');
    return { redirectTo: await hostUrl('/admin/homepage?saved=1') };
  } catch (error) {
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

export async function saveProfile(formData: FormData) {
  const ctx = await gate(formData);
  if (!ctx.canManageSettings) throw new ActionError({ kk: 'Балабақша төлқұжатын тек балабақша әкімшісі өзгерте алады', ru: 'Менять паспорт сада может только администратор сада' });

  const nameRu = str(formData, 'nameRu');
  if (nameRu.length < 2) throw new ActionError({ kk: 'Балабақша атауын көрсетіңіз', ru: 'Укажите название сада' });

  const addressRu = optionalStr(formData, 'addressRu');
  let lat = Number.parseFloat(str(formData, 'lat')) || null;
  let lng = Number.parseFloat(str(formData, 'lng')) || null;

  // Заведующая своих координат не знает — спрашиваем их у геокодера по адресу.
  // Только когда поля пустые: введённую руками точку затирать нельзя, она почти
  // всегда точнее (одинаковых названий улиц в Актобе хватает).
  if ((lat === null || lng === null) && addressRu) {
    const point = await geocodeAddress(addressRu);
    if (point) {
      lat = point.lat;
      lng = point.lng;
    }
  }

  await prisma.tenantProfile.update({
    where: { tenantId: ctx.tenantId },
    data: {
      nameRu,
      nameKk: str(formData, 'nameKk') || nameRu,
      shortNameRu: optionalStr(formData, 'shortNameRu'),
      shortNameKk: optionalStr(formData, 'shortNameKk'),
      bin: optionalStr(formData, 'bin'),
      licenseNo: optionalStr(formData, 'licenseNo'),
      addressRu,
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
      whatsapp: optionalStr(formData, 'whatsapp'),
      instagram: optionalStr(formData, 'instagram'),
      youtube: optionalStr(formData, 'youtube'),
      facebook: optionalStr(formData, 'facebook'),
      telegram: optionalStr(formData, 'telegram'),
      lat,
      lng,
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

  if (next !== repeat) throw new ActionError({ kk: 'Жаңа құпия сөз бен қайталауы сәйкес келмейді', ru: 'Новый пароль и повтор не совпадают' });
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);

  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  if (!user || !(await verifyPassword(user.passwordHash, current))) {
    throw new ActionError({ kk: 'Ағымдағы құпия сөз дұрыс көрсетілмеген', ru: 'Текущий пароль указан неверно' });
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
    return toActionError(error, (await getCurrentUser())?.locale);
  }
}

// ─────────────────────────── Кружки и услуги ───────────────────────────

export async function saveClub(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const nameRu = str(formData, 'nameRu');
  if (nameRu.length < 2) throw new ActionError({ kk: 'Үйірме атауын көрсетіңіз', ru: 'Укажите название кружка' });

  const isFree = formData.get('isFree') === 'on';
  const data = {
    nameRu,
    nameKk: str(formData, 'nameKk') || nameRu,
    descRu: optionalStr(formData, 'descRu'),
    descKk: optionalStr(formData, 'descKk'),
    teacher: optionalStr(formData, 'teacher'),
    schedule: optionalStr(formData, 'schedule'),
    ageRange: optionalStr(formData, 'ageRange'),
    // Бесплатное занятие не должно хранить цену: иначе она всплывёт при снятии галочки.
    priceKzt: isFree ? null : num(formData, 'priceKzt'),
    isFree,
  };

  if (id) {
    await assertOwned('club', id, ctx.tenantId);
    await prisma.club.update({ where: { id }, data });
  } else {
    const last = await prisma.club.findFirst({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'desc' } });
    await prisma.club.create({ data: { ...data, tenantId: ctx.tenantId, position: (last?.position ?? -1) + 1 } });
  }

  revalidatePath('/admin/clubs');
}

export async function deleteClub(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('club', id, ctx.tenantId);
  await prisma.club.delete({ where: { id } });
  revalidatePath('/admin/clubs');
}

// ─────────────────────────── Частые вопросы ───────────────────────────

export async function saveFaq(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  const questionRu = str(formData, 'questionRu');
  if (questionRu.length < 3) throw new ActionError({ kk: 'Сұрақты тұжырымдаңыз', ru: 'Сформулируйте вопрос' });

  const data = {
    questionRu,
    questionKk: str(formData, 'questionKk') || questionRu,
    answerRu: optionalStr(formData, 'answerRu'),
    answerKk: optionalStr(formData, 'answerKk'),
  };

  if (id) {
    await assertOwned('faqItem', id, ctx.tenantId);
    await prisma.faqItem.update({ where: { id }, data });
  } else {
    const last = await prisma.faqItem.findFirst({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'desc' } });
    await prisma.faqItem.create({ data: { ...data, tenantId: ctx.tenantId, position: (last?.position ?? -1) + 1 } });
  }

  revalidatePath('/admin/faq');
}

export async function deleteFaq(formData: FormData) {
  const ctx = await gate(formData);
  const id = str(formData, 'id');
  await assertOwned('faqItem', id, ctx.tenantId);
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath('/admin/faq');
}

// ─────────────────────────── Срочное объявление ───────────────────────────

export async function saveNotice(formData: FormData) {
  const ctx = await gate(formData);
  if (!ctx.canManageSettings) throw new ActionError({ kk: 'Шұғыл хабарландыруды балабақша әкімшісі жариялайды', ru: 'Срочное объявление публикует администратор сада' });

  const untilRaw = str(formData, 'noticeUntil');
  const tone = str(formData, 'noticeTone') || 'WARN';
  if (!['INFO', 'WARN', 'URGENT'].includes(tone)) throw new ActionError({ kk: 'Хабарландырудың түрі белгісіз', ru: 'Неизвестный тип объявления' });

  await prisma.tenantProfile.update({
    where: { tenantId: ctx.tenantId },
    data: {
      noticeRu: optionalStr(formData, 'noticeRu'),
      noticeKk: optionalStr(formData, 'noticeKk'),
      noticeTone: tone as 'INFO' | 'WARN' | 'URGENT',
      noticeUntil: untilRaw ? new Date(untilRaw) : null,
    },
  });

  await invalidateTenantCacheById(ctx.tenantId);
  revalidatePath('/admin/notice');
}

export async function clearNotice(formData: FormData) {
  const ctx = await gate(formData);
  if (!ctx.canManageSettings) throw new ActionError({ kk: 'Шұғыл хабарландыруды балабақша әкімшісі алып тастайды', ru: 'Срочное объявление снимает администратор сада' });

  await prisma.tenantProfile.update({
    where: { tenantId: ctx.tenantId },
    data: { noticeRu: null, noticeKk: null, noticeUntil: null },
  });

  await invalidateTenantCacheById(ctx.tenantId);
  revalidatePath('/admin/notice');
}
