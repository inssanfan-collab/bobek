import 'server-only';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import type { Media } from '@prisma/client';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const FILE_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/** Больше этого по ширине хранить бессмысленно: сайт всё равно показывает уже, а вес растёт. */
const MAX_WIDTH = 1920;

export class UploadError extends Error {}

export function storagePathFor(relative: string): string {
  return path.join(path.resolve(env.storageDir), relative);
}

/**
 * Сохраняет загруженный файл. Изображения пересжимаются в WebP — заодно
 * снимается EXIF, иначе в фото с утренника уезжают GPS-координаты детского сада.
 */
export async function saveUpload(file: File, tenantId: string): Promise<Media> {
  if (file.size === 0) throw new UploadError('Файл пустой');
  if (file.size > env.maxUploadBytes) {
    throw new UploadError(`Файл больше ${Math.round(env.maxUploadBytes / 1024 / 1024)} МБ`);
  }

  const mime = file.type || 'application/octet-stream';
  const isImage = IMAGE_MIME.has(mime);

  if (!isImage && !FILE_MIME.has(mime)) {
    throw new UploadError('Допустимы изображения (JPG, PNG, WebP), PDF, Word и Excel');
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer<ArrayBufferLike> = input;
  let outMime = mime;
  let width: number | null = null;
  let height: number | null = null;

  if (isImage) {
    const image = sharp(input, { failOn: 'error' });
    const meta = await image.metadata();

    // rotate() применяет ориентацию из EXIF и после этого сам EXIF не переносится в результат.
    const pipeline = image.rotate();
    if ((meta.width ?? 0) > MAX_WIDTH) pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });

    output = await pipeline.webp({ quality: 82 }).toBuffer();
    outMime = 'image/webp';

    const outMeta = await sharp(output).metadata();
    width = outMeta.width ?? null;
    height = outMeta.height ?? null;
  }

  const sha256 = createHash('sha256').update(output).digest('hex');

  // Один и тот же файл сад часто загружает повторно — не плодим копии на диске.
  const existing = await prisma.media.findUnique({ where: { tenantId_sha256: { tenantId, sha256 } } });
  if (existing) return existing;

  const ext = EXT_BY_MIME[outMime] ?? 'bin';
  const relative = path.join(tenantId, `${sha256.slice(0, 2)}`, `${sha256}.${ext}`);
  const absolute = storagePathFor(relative);

  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, output);

  return prisma.media.create({
    data: {
      tenantId,
      path: relative,
      origName: file.name.slice(0, 200),
      mime: outMime,
      size: output.length,
      width,
      height,
      sha256,
    },
  });
}

export async function readMedia(media: Media): Promise<Buffer<ArrayBufferLike>> {
  return fs.readFile(storagePathFor(media.path));
}

/** Удаляет запись и файл, если на него больше никто не ссылается. */
export async function deleteMedia(id: string, tenantId: string): Promise<void> {
  const media = await prisma.media.findFirst({ where: { id, tenantId } });
  if (!media) return;

  await prisma.media.delete({ where: { id } });

  const stillUsed = await prisma.media.count({ where: { tenantId, sha256: media.sha256 } });
  if (stillUsed === 0) {
    await fs.rm(storagePathFor(media.path), { force: true });
  }
}
