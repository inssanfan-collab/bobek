import type { Locale } from '@/lib/i18n';

/**
 * PDF-инструкция для садов на двух языках. Собирает pnpm guide:pdf
 * из scripts/guide-content.ts; имена файлов — здесь, чтобы ссылки
 * на портале и в админке не разошлись со сборкой.
 */
export const GUIDE_PDF: Record<Locale, string> = {
  kk: '/downloads/edusad-nusqaulyq.pdf',
  ru: '/downloads/edusad-instrukciya.pdf',
};
