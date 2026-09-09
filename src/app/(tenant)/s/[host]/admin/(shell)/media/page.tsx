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

const T = {
  title: { kk: 'Файлдар', ru: 'Файлы' },
  lead: {
    kk: 'Балабақшаның жүктелген барлық фотосуреттері мен құжаттары. Артығын осы жерден жоюға болады.',
    ru: 'Все загруженные фотографии и документы сада. Отсюда можно удалить лишнее.',
  },
  totalFiles: { kk: 'Барлық файл', ru: 'Файлов всего' },
  onThisPage: { kk: 'Осы бетте', ru: 'На этой странице' },
  upload: { kk: 'Файлдарды жүктеу', ru: 'Загрузить файлы' },
  uploadHint: {
    kk: 'Суреттер автоматты түрде кішірейеді, түсірілім орны туралы деректер өшіріледі. Бірдей файлдар қайталанбайды.',
    ru: 'Изображения уменьшаются автоматически, данные о месте съёмки удаляются. Одинаковые файлы не дублируются.',
  },
  uploading: { kk: 'Жүктелуде…', ru: 'Загружаем…' },
  uploadButton: { kk: 'Жүктеу', ru: 'Загрузить' },
  empty: { kk: 'Әзірге файлдар жоқ', ru: 'Файлов пока нет' },
  emptyHint: {
    kk: 'Галереяға фото немесе құжат қосқанда осында пайда болады.',
    ru: 'Они появятся здесь, когда вы добавите фотографии в галерею или документы.',
  },
  remove: { kk: 'Жою', ru: 'Удалить' },
  prev: { kk: '← Артқа', ru: '← Назад' },
  next: { kk: 'Алға →', ru: 'Вперёд →' },
  pageOf: { kk: '%2$s ішінен %1$s бет', ru: 'Страница %1$s из %2$s' },
} as const;

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;
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
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label={T.totalFiles[locale]} value={total} />
        <StatCard label={T.onThisPage[locale]} value={formatSize(totalBytes)} />
      </div>

      {ctx.canEdit ? (
        <form action={uploadMedia} className="card mb-6 p-6">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <label className="field-label" htmlFor="files">{T.upload[locale]}</label>
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
            {T.uploadHint[locale]}
          </p>
          <div className="mt-4">
            <SubmitButton pendingLabel={T.uploading[locale]}>{T.uploadButton[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {files.length === 0 ? (
        <EmptyState
          icon="🗂"
          title={T.empty[locale]}
          description={T.emptyHint[locale]}
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
                  <p className="text-xs text-muted">{formatDate(file.createdAt, locale)}</p>
                  {ctx.canEdit ? (
                    <form action={deleteMediaAction} className="mt-1">
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="host" value={host} />
                      <input type="hidden" name="mediaId" value={file.id} />
                      <button type="submit" className="btn-ghost w-full px-2 py-1 text-xs text-red-600">
                        {T.remove[locale]}
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
          {page > 1 ? <a href={`?page=${page - 1}`} className="btn-secondary">{T.prev[locale]}</a> : null}
          <span className="text-muted">
            {T.pageOf[locale].replace('%1$s', String(page)).replace('%2$s', String(pages))}
          </span>
          {page < pages ? <a href={`?page=${page + 1}`} className="btn-secondary">{T.next[locale]}</a> : null}
        </div>
      ) : null}
    </>
  );
}
