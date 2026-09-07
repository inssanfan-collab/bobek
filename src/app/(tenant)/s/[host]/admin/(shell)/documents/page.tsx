import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DOC_CATEGORY_LABEL, formatDate } from '@/lib/labels';
import { deleteDocument, saveDocument } from '../actions';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [documents, csrf] = await Promise.all([
    ctx.db.documents.findMany({ orderBy: [{ category: 'asc' }, { position: 'asc' }], include: { media: true } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Документы"
        description="Устав, лицензия, правила приёма, приказы, госзакупки, отчёты — то, что спрашивают при проверках."
      />

      {ctx.canEdit ? (
        <form action={saveDocument} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Добавить документ</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="titleRu">Название по-русски *</label>
            <input id="titleRu" name="titleRu" required className="field" placeholder="Устав организации" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleKk">Қазақша</label>
            <input id="titleKk" name="titleKk" className="field" placeholder="Ұйым жарғысы" />
          </div>
          <div>
            <label className="field-label" htmlFor="category">Категория</label>
            <select id="category" name="category" className="field" defaultValue="CHARTER">
              {Object.entries(DOC_CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="file">Файл *</label>
            <input id="file" name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx" className="field" />
            <p className="field-hint">PDF, Word или Excel, до 20 МБ.</p>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingLabel="Загружаем…">Добавить документ</SubmitButton>
          </div>
        </form>
      ) : null}

      {documents.length === 0 ? (
        <EmptyState icon="📄" title="Документов пока нет" description="Начните с устава и правил приёма." />
      ) : (
        <div className="card divide-y divide-line">
          {documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="text-2xl" aria-hidden>📄</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{doc.titleRu}</span>
                <span className="block text-sm text-muted">
                  {DOC_CATEGORY_LABEL[doc.category]} · {formatDate(doc.publishedAt)} ·{' '}
                  {Math.max(1, Math.round(doc.media.size / 1024))} КБ
                </span>
              </span>
              <a href={`/api/media/${doc.mediaId}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
                Открыть
              </a>
              {ctx.canEdit ? (
                <form action={deleteDocument}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={doc.id} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">Удалить</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
