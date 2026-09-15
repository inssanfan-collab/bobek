/**
 * Чем показывать файл на сайте.
 *
 * PDF браузер открывает сам. Word и Excel он открывать не умеет, поэтому
 * для них есть отдельная страница с просмотрщиком.
 */
const OFFICE_MIME = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export function isOfficeDoc(mime: string): boolean {
  return OFFICE_MIME.has(mime);
}
