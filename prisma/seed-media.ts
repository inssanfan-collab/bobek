import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { PrismaClient } from '@prisma/client';

const STORAGE = path.resolve(process.env.STORAGE_DIR ?? './storage');

/**
 * Демо-изображения генерируем, а не храним в репозитории: настоящие фотографии
 * детей класть в git нельзя, а пустая галерея не даёт понять, как выглядит сайт.
 */
function placeholderSvg(title: string, from: string, to: string): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <circle cx="240" cy="180" r="110" fill="#ffffff" opacity="0.18"/>
    <circle cx="980" cy="640" r="160" fill="#ffffff" opacity="0.14"/>
    <circle cx="900" cy="200" r="70" fill="#ffffff" opacity="0.2"/>
    <text x="600" y="420" font-family="sans-serif" font-size="54" font-weight="700"
          fill="#ffffff" text-anchor="middle" opacity="0.92">${title}</text>
    <text x="600" y="480" font-family="sans-serif" font-size="26"
          fill="#ffffff" text-anchor="middle" opacity="0.7">демонстрационное изображение</text>
  </svg>`);
}

async function store(prisma: PrismaClient, tenantId: string, buffer: Buffer, origName: string, mime: string) {
  const sha256 = createHash('sha256').update(buffer).digest('hex');

  const existing = await prisma.media.findUnique({ where: { tenantId_sha256: { tenantId, sha256 } } });
  if (existing) return existing;

  const ext = mime === 'application/pdf' ? 'pdf' : 'webp';
  const relative = path.join(tenantId, sha256.slice(0, 2), `${sha256}.${ext}`);
  const absolute = path.join(STORAGE, relative);

  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, buffer);

  const meta = mime.startsWith('image/') ? await sharp(buffer).metadata() : null;

  return prisma.media.create({
    data: {
      tenantId,
      path: relative,
      origName,
      mime,
      size: buffer.length,
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      sha256,
    },
  });
}

export async function seedImage(
  prisma: PrismaClient,
  tenantId: string,
  title: string,
  from: string,
  to: string,
  origName: string,
) {
  const webp = await sharp(placeholderSvg(title, from, to)).webp({ quality: 82 }).toBuffer();
  return store(prisma, tenantId, webp, origName, 'image/webp');
}

/** Минимальный валидный PDF — чтобы раздел «Документы» не выглядел пустым. */
export async function seedPdf(prisma: PrismaClient, tenantId: string, title: string, origName: string) {
  const text = `BT /F1 24 Tf 72 700 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return store(prisma, tenantId, Buffer.from(pdf, 'latin1'), origName, 'application/pdf');
}
