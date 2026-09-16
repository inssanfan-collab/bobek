import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/server/auth/guards';
import { contractDocData } from '@/server/docs/contract';
import { buildDocument, DOC_KINDS, type DocKind } from '@/server/docs/documents';

export const dynamic = 'force-dynamic';

const FILE_NAMES: Record<DocKind, string> = {
  contract: 'dogovor',
  invoice: 'schet',
  act: 'akt',
};

/**
 * Печатная форма договора, счёта или акта.
 *
 * Отдаём inline: администратор сначала смотрит документ в браузере
 * и только потом печатает или сохраняет. Сразу скачивать файл, который
 * почти всегда открывают глазами, — лишний шаг.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; kind: string }> },
) {
  await requireSuperadmin();

  const { id, kind } = await params;
  if (!DOC_KINDS.includes(kind as DocKind)) {
    return new NextResponse('Неизвестный документ', { status: 404 });
  }

  const data = await contractDocData(id);
  if (!data) return new NextResponse('Договор не найден', { status: 404 });

  const pdf = await buildDocument(kind as DocKind, data);
  const name = `${FILE_NAMES[kind as DocKind]}-${data.contract.number}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `inline; filename="${name}"`,
      // Реквизиты и суммы меняются — кэшировать документ нельзя.
      'Cache-Control': 'no-store',
    },
  });
}
