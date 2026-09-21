import { describe, expect, it } from 'vitest';
import { centralHeader, crc32, endOfCentralDirectory, localHeader, safeZipName, zipSize } from '@/lib/zip';

describe('ZIP без сжатия', () => {
  it('CRC-32 совпадает с эталоном', () => {
    expect(crc32(new TextEncoder().encode('hello'))).toBe(0x3610a686);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('размер архива считается заранее до байта', () => {
    const files = [
      { name: 'IV. Оқу-әдістемелік жұмыс/Жарғы.pdf', data: new TextEncoder().encode('%PDF-1.4 a') },
      { name: 'Устав.pdf', data: new TextEncoder().encode('%PDF-1.4 bb') },
    ];
    const modified = new Date(2026, 8, 21, 10, 30);
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    for (const file of files) {
      const meta = { name: file.name, size: file.data.length, modified };
      const crc = crc32(file.data);
      central.push(centralHeader(meta, crc, offset));
      const header = localHeader(meta, crc);
      parts.push(header, file.data);
      offset += header.length + file.data.length;
    }
    const centralSize = central.reduce((sum, part) => sum + part.length, 0);
    parts.push(...central, endOfCentralDirectory(files.length, centralSize, offset));
    const total = parts.reduce((sum, part) => sum + part.length, 0);

    expect(total).toBe(zipSize(files.map((f) => ({ name: f.name, size: f.data.length, modified }))));
    // Флаг UTF-8 — иначе казахские буквы в именах превратятся в кракозябры.
    expect(new DataView(parts[0]!.buffer).getUint16(6, true) & 0x0800).toBe(0x0800);
  });

  it('имена без запрещённых в Windows символов', () => {
    expect(safeZipName('Приказ № 5 / 2025: итог?.')).toBe('Приказ № 5 2025 итог');
    expect(safeZipName('   ')).toBe('file');
  });
});
