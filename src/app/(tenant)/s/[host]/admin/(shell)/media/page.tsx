import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader, StatCard } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { deleteMediaAction, uploadMedia } from '../actions';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 60;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);
  const page = Math.max(1, Number.parseInt(search.page ?? '1', 10) || 1);

  const [files, total, csrf] = await Promise.all([
    ctx.db.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    ctx.db.media.count(),
    csrfToken(),
  ]);

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Файлы"
        description="Все загруженные фотографии и документы сада. Отсюда можно удалить лишнее."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Файлов всего" value={total} />
        <StatCard label="На этой странице" value={formatSize(totalBytes)} />
      </div>

      {ctx.canEdit ? (
        <form action={uploadMedia} className="card mb-6 p-6">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <label className="field-label" htmlFor="files">Загрузить файлы</label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            required
            accept="image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.xls,.xlsx"
            className="field"
          />
          <p className="field-hint">
            Изображения уменьшаются автоматически, данные о месте съёмки удаляются.
            Одинаковые файлы не дублируются.
          </p>
          <div className="mt-4">
            <SubmitButton pendingLabel="Загружаем…">Загрузить</SubmitButton>
          </div>
        </form>
      ) : null}

      {files.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="Файлов пока нет"
          description="Они появятся здесь, когда вы добавите фотографии в галерею или документы."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((file) => {
            const isImage = file.mime.startsWith('image/');
            return (
              <figure key={file.id} className="card overflow-hidden">
                <a href={`/api/media/${file.id}`} target="_blank" rel="noreferrer" className="block">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/media/${file.id}`} alt={file.origName} className="h-28 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-28 place-items-center bg-brand-soft text-3xl" aria-hidden>📄</div>
                  )}
                </a>
                <figcaption className="p-2">
                  <p className="truncate text-xs font-semibold" title={file.origName}>{file.origName}</p>
                  <p className="text-xs text-muted">
                    {formatSize(file.size)}
                    {file.width ? ` · ${file.width}×${file.height}` : ''}
                  </p>
                  <p className="text-xs text-muted">{formatDate(file.createdAt)}</p>
                  {ctx.canEdit ? (
                    <form action={deleteMediaAction} className="mt-1">
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="host" value={host} />
                      <input type="hidden" name="mediaId" value={file.id} />
                      <button type="submit" className="btn-ghost w-full px-2 py-1 text-xs text-red-600">
                        Удалить
                      </button>
                    </form>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}

      {pages > 1 ? (
        <div className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 ? <a href={`?page=${page - 1}`} className="btn-secondary">← Назад</a> : null}
          <span className="text-muted">Страница {page} из {pages}</span>
          {page < pages ? <a href={`?page=${page + 1}`} className="btn-secondary">Вперёд →</a> : null}
        </div>
      ) : null}
    </>
  );
}
