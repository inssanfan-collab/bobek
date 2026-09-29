import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Locale } from '@/lib/i18n';
import type { GuideStep } from '@/components/portal/sales/StepPlayer';

export type GuideManifest = {
  tasks: Record<string, {
    title: Record<Locale, string>;
    sub: Record<Locale, string>;
    video: Partial<Record<Locale, string>>;
    steps: Partial<Record<Locale, GuideStep[]>>;
  }>;
};

/**
 * Файлы инструкции (ролики, кадры, manifest.json) собирает pnpm guide:record
 * и кладёт в public/guide. В git они не входят — на сервер копируются
 * отдельно, поэтому читающие их страницы (/guide и живая админка на главной)
 * спокойно переживают их отсутствие.
 */
export async function readGuideManifest(): Promise<GuideManifest | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), 'public', 'guide', 'manifest.json'), 'utf8')) as GuideManifest;
  } catch {
    return null;
  }
}
