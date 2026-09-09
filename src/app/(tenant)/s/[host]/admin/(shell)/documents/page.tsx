import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DOC_CATEGORY, formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { deleteDocument, saveDocument } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Құжаттар', ru: 'Документы' },
  lead: {
    kk: 'Жарғы, лицензия, қабылдау қағидалары, бұйрықтар, сатып алулар, есептер — тексеру кезінде сұралатыны.',
    ru: 'Устав, лицензия, правила приёма, приказы, госзакупки, отчёты — то, что спрашивают при проверках.',
  },
  addHeading: { kk: 'Құжат қосу', ru: 'Добавить документ' },
  name: { kk: 'Атауы', ru: 'Название' },
  category: { kk: 'Санаты', ru: 'Категория' },
  file: { kk: 'Файл', ru: 'Файл' },
  fileHint: { kk: 'PDF, Word немесе Excel, 20 МБ дейін.', ru: 'PDF, Word или Excel, до 20 МБ.' },
  uploading: { kk: 'Жүктелуде…', ru: 'Загружаем…' },
  add: { kk: 'Құжат қосу', ru: 'Добавить документ' },
  empty: { kk: 'Әзірге құжаттар жоқ', ru: 'Документов пока нет' },
  emptyHint: { kk: 'Жарғы мен қабылдау қағидаларынан бастаңыз.', ru: 'Начните с устава и правил приёма.' },
  open: { kk: 'Ашу', ru: 'Открыть' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  kb: { kk: 'КБ', ru: 'КБ' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function DocumentsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [documents, csrf] = await Promise.all([
    ctx.db.documents.findMany({ orderBy: [{ category: 'asc' }, { position: 'asc' }], include: { media: true } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {ctx.canEdit ? (
        <form action={saveDocument} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="titleRu">{T.name[locale]} {T.inRu[locale]} *</label>
            <input id="titleRu" name="titleRu" required className="field" placeholder="Устав организации" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="titleKk" name="titleKk" className="field" placeholder="Ұйым жарғысы" />
          </div>
          <div>
            <label className="field-label" htmlFor="category">{T.category[locale]}</label>
            <select id="category" name="category" className="field" defaultValue="CHARTER">
              {Object.entries(DOC_CATEGORY).map(([value, phrase]) => (
                <option key={value} value={value}>{phrase[locale]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="file">{T.file[locale]} *</label>
            <input id="file" name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx" className="field" />
            <p className="field-hint">{T.fileHint[locale]}</p>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton pendingLabel={T.uploading[locale]}>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {documents.length === 0 ? (
        <EmptyState icon="📄" title={T.empty[locale]} description={T.emptyHint[locale]} />
      ) : (
        <div className="card divide-y divide-line">
          {documents.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="text-2xl" aria-hidden>📄</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{pick(locale, doc.titleKk, doc.titleRu)}</span>
                <span className="block text-sm text-muted">
                  {DOC_CATEGORY[doc.category][locale]} · {formatDate(doc.publishedAt, locale)} ·{' '}
                  {Math.max(1, Math.round(doc.media.size / 1024))} {T.kb[locale]}
                </span>
              </span>
              <a href={`/api/media/${doc.mediaId}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
                {T.open[locale]}
              </a>
              {ctx.canEdit ? (
                <form action={deleteDocument}>
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={doc.id} />
                  <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">{T.remove[locale]}</button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
