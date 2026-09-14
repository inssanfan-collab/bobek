import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { prisma } from '@/server/db';
import { readMedia } from '@/server/media';

export const dynamic = 'force-dynamic';

/**
 * Картинка для превью ссылки — в WhatsApp, Telegram, поиске.
 *
 * Отдельно от /api/media по двум причинам.
 *
 * Первая: WhatsApp не умеет WebP в превью, а через saveUpload все загрузки
 * пересжимаются именно в WebP. Ссылка на сад выглядела в переписке голым
 * текстом без картинки — при том что сама картинка на сайте открывалась.
 *
 * Вторая: превью показывается в узкой карточке с соотношением примерно 1,91:1.
 * Сборщики ссылок сами не кадрируют — они либо обрежут как попало, либо
 * пропустят картинку неподходящих пропорций. Поэтому кадрируем сами
 * в 1200×630 по центру.
 */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media || !media.mime.startsWith('image/')) {
    return new NextResponse('Not found', { status: 404 });
  }

  let source: Buffer;
  try {
    source = await readMedia(media);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const body = await sharp(source, { failOn: 'error' })
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(body), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(body.length),
        // Адресуется по неизменяемому id, поэтому кэшируем надолго:
        // сборщики ссылок ходят за картинкой при каждой пересылке.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
