import 'server-only';
import { promises as fs } from 'node:fs';

/**
 * Состояние сервера для системного раздела админки.
 *
 * Админка ничего на сервере не выполняет: веб-приложение, умеющее запускать
 * systemctl, — это дыра размером с сервер. Состояние раз в четверть часа
 * собирает `/usr/local/bin/edusad-system-report` (таймер systemd), а мы
 * только читаем готовый файл.
 */

export type CertificateInfo = {
  name: string;
  domains: string[];
  expiresAt: string | null;
  daysLeft: number | null;
  /** webroot — проверка файлом, nginx — плагином, standalone — своим сервером на 80 порту. */
  method: string;
  alert: boolean;
};

export type ServiceInfo = {
  name: string;
  active: boolean;
  enabled: boolean;
  since: string;
};

export type SystemReport = {
  collectedAt: string;
  certificates: CertificateInfo[];
  services: ServiceInfo[];
  certbot: {
    active: boolean;
    schedule: string;
    nextRun: string;
    lastRun: string;
    /** Хук, перечитывающий сертификаты службами. Без него обновление не доедет до посетителя. */
    reloadHook: boolean;
  };
  disk: { totalGb: number; usedGb: number; freeGb: number; percent: number };
  memory: { totalMb: number; freeMb: number; percent: number };
  app: { commit: string; commitAt: string };
};

const REPORT_PATH = process.env.SYSTEM_REPORT_PATH ?? '/var/lib/edusad/system.json';

/** Данные старше этого срока считаем несвежими: таймер ходит каждые 15 минут. */
const STALE_MINUTES = 60;

export async function readSystemReport(): Promise<SystemReport | null> {
  try {
    const raw = await fs.readFile(REPORT_PATH, 'utf8');
    return JSON.parse(raw) as SystemReport;
  } catch {
    // На машине разработчика файла нет, и это не ошибка — раздел скажет,
    // что данных пока не собрано.
    return null;
  }
}

export function isStale(report: SystemReport): boolean {
  const collected = new Date(report.collectedAt).getTime();
  if (Number.isNaN(collected)) return true;
  return Date.now() - collected > STALE_MINUTES * 60_000;
}

export function reportPath(): string {
  return REPORT_PATH;
}
