import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { readMedia } from '@/server/media';

export const dynamic = 'force-dynamic';

/**
 * Отдача медиа. Файлы лежат вне public/, поэтому попасть к ним можно только
 * по существующей записи в БД — прямой обход каталога исключён.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return new NextResponse('Not found', { status: 404 });

  let body: Buffer;
  try {
    body = await readMedia(media);
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  const download = new URL(request.url).searchParams.get('download') === '1';
  const asciiName = media.origName.replace(/[^\w.\-]/g, '_') || 'file';

  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': media.mime,
      'Content-Length': String(body.length),
      // Файл адресуется по неизменяемому id, поэтому кэшируем надолго.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(media.origName)}`,
    },
  });
}
