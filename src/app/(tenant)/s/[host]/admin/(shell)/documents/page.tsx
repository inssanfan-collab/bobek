import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DOC_FOLDER_PRESETS, formatDate, formatDocCount } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import {
  createDocFolder, deleteDocFolder, deleteDocument, moveDocFolder, renameDocFolder, saveDocument,
} from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Құжаттар', ru: 'Документы' },
  lead: {
    kk: 'Құжаттарды бөлімдерге бөліңіз — сайтта әр бөлім бүктелген күйде тұрады, ата-ана керегін бірден табады.',
    ru: 'Разложите документы по разделам — на сайте каждый раздел показывается свёрнутым, и родитель сразу находит нужное.',
  },
  folderHeading: { kk: 'Жаңа бөлім', ru: 'Новый раздел' },
  folderName: { kk: 'Бөлім атауы', ru: 'Название раздела' },
  folderHint: {
    kk: 'Мысалы: «Өзін-өзі бағалау», «Циклограммалар», «Бұйрықтар».',
    ru: 'Например: «Самооценка», «Циклограммы», «Приказы».',
  },
  presets: { kk: 'Дайын атаулар', ru: 'Готовые названия' },
  addFolder: { kk: 'Бөлім қосу', ru: 'Добавить раздел' },
  rename: { kk: 'Атауын өзгерту', ru: 'Переименовать' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  up: { kk: 'Жоғары', ru: 'Выше' },
  down: { kk: 'Төмен', ru: 'Ниже' },
  addHeading: { kk: 'Құжат қосу', ru: 'Добавить документ' },
  name: { kk: 'Атауы', ru: 'Название' },
  folder: { kk: 'Бөлім', ru: 'Раздел' },
  noFolder: { kk: 'Бөлімсіз', ru: 'Без раздела' },
  file: { kk: 'Файл', ru: 'Файл' },
  fileHint: { kk: 'PDF, Word немесе Excel, 20 МБ дейін.', ru: 'PDF, Word или Excel, до 20 МБ.' },
  uploading: { kk: 'Жүктелуде…', ru: 'Загружаем…' },
  add: { kk: 'Құжат қосу', ru: 'Добавить документ' },
  empty: { kk: 'Әзірге құжаттар жоқ', ru: 'Документов пока нет' },
  emptyHint: {
    kk: 'Бөлім жасаңыз да, жарғы мен қабылдау қағидаларынан бастаңыз.',
    ru: 'Создайте раздел и начните с устава и правил приёма.',
  },
  emptyFolder: { kk: 'Бұл бөлім бос', ru: 'В этом разделе пока пусто' },
  open: { kk: 'Ашу', ru: 'Открыть' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  removeFolder: { kk: 'Бөлімді жою', ru: 'Удалить раздел' },
  removeFolderHint: {
    kk: 'Құжаттар жойылмайды — олар «Бөлімсіз» тізіміне көшеді.',
    ru: 'Документы не удаляются — они перейдут в список «Без раздела».',
  },
  kb: { kk: 'КБ', ru: 'КБ' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function DocumentsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [folders, documents, csrf] = await Promise.all([
    ctx.db.docFolders.findMany({ orderBy: { position: 'asc' } }),
    ctx.db.documents.findMany({ orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }], include: { media: true } }),
    csrfToken(),
  ]);

  type Doc = (typeof documents)[number];
  const loose = documents.filter((doc) => !doc.folderId);
  const byFolder = new Map<string, Doc[]>();
  for (const doc of documents) {
    if (!doc.folderId) continue;
    const list = byFolder.get(doc.folderId) ?? [];
    list.push(doc);
    byFolder.set(doc.folderId, list);
  }

  /** Один документ строкой: имя, размер, ссылка и удаление. */
  function DocRow({ doc }: { doc: Doc }) {
    return (
      <div className="flex flex-wrap items-center gap-3 px-5 py-3">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{pick(locale, doc.titleKk, doc.titleRu)}</span>
          <span className="block text-sm text-muted">
            {formatDate(doc.publishedAt, locale)} · {Math.max(1, Math.round(doc.media.size / 1024))} {T.kb[locale]}
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
    );
  }

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <form action={createDocFolder} className="card grid gap-4 p-6">
            <h2 className="font-display text-lg font-bold">{T.folderHeading[locale]}</h2>
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="host" value={host} />
            <div>
              <label className="field-label" htmlFor="folderRu">{T.folderName[locale]} {T.inRu[locale]} *</label>
              {/* Список готовых названий — подсказка, поле остаётся свободным для ввода */}
              <input
                id="folderRu" name="titleRu" required className="field" list="folder-presets"
                placeholder="Самооценка"
              />
              <datalist id="folder-presets">
                {DOC_FOLDER_PRESETS.map((preset) => (
                  <option key={preset.ru} value={preset.ru} />
                ))}
              </datalist>
              <p className="field-hint">{T.folderHint[locale]}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="folderKk">{T.folderName[locale]} {T.inKk[locale]}</label>
              <input id="folderKk" name="titleKk" className="field" placeholder="Өзін-өзі бағалау" />
            </div>
            <SubmitButton>{T.addFolder[locale]}</SubmitButton>
          </form>

          <form action={saveDocument} className="card grid gap-4 p-6">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="host" value={host} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="titleRu">{T.name[locale]} {T.inRu[locale]} *</label>
                <input id="titleRu" name="titleRu" required className="field" placeholder="Устав организации" />
              </div>
              <div>
                <label className="field-label" htmlFor="titleKk">{T.name[locale]} {T.inKk[locale]}</label>
                <input id="titleKk" name="titleKk" className="field" placeholder="Ұйым жарғысы" />
              </div>
              <div>
                <label className="field-label" htmlFor="folderId">{T.folder[locale]}</label>
                <select id="folderId" name="folderId" className="field" defaultValue="">
                  <option value="">{T.noFolder[locale]}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{pick(locale, folder.titleKk, folder.titleRu)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="file">{T.file[locale]} *</label>
                <input id="file" name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx" className="field" />
                <p className="field-hint">{T.fileHint[locale]}</p>
              </div>
            </div>
            <SubmitButton pendingLabel={T.uploading[locale]}>{T.add[locale]}</SubmitButton>
          </form>
        </div>
      ) : null}

      {folders.length === 0 && documents.length === 0 ? (
        <EmptyState icon="📄" title={T.empty[locale]} description={T.emptyHint[locale]} />
      ) : (
        <div className="space-y-5">
          {folders.map((folder, index) => {
            const items = byFolder.get(folder.id) ?? [];
            return (
              <section key={folder.id} className="card overflow-hidden">
                <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
                  <h2 className="min-w-0 flex-1 font-display text-lg font-bold">
                    {pick(locale, folder.titleKk, folder.titleRu)}
                    <span className="ml-2 text-sm font-normal text-muted">
                      {formatDocCount(items.length, locale)}
                    </span>
                  </h2>
                  {ctx.canEdit ? (
                    <div className="flex items-center gap-1">
                      {[
                        { dir: 'up', label: T.up[locale], sign: '↑', disabled: index === 0 },
                        { dir: 'down', label: T.down[locale], sign: '↓', disabled: index === folders.length - 1 },
                      ].map((btn) => (
                        <form key={btn.dir} action={moveDocFolder}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="host" value={host} />
                          <input type="hidden" name="id" value={folder.id} />
                          <input type="hidden" name="direction" value={btn.dir} />
                          <button
                            type="submit" className="btn-ghost px-3 py-1.5 text-sm"
                            disabled={btn.disabled} aria-label={btn.label}
                          >
                            {btn.sign}
                          </button>
                        </form>
                      ))}
                      <form action={deleteDocFolder}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="host" value={host} />
                        <input type="hidden" name="id" value={folder.id} />
                        <button
                          type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600"
                          title={T.removeFolderHint[locale]}
                        >
                          {T.removeFolder[locale]}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </header>

                {/* Переименование спрятано: у сада бывает два десятка разделов,
                    и два поля на каждый превратили бы страницу в простыню */}
                {ctx.canEdit ? (
                  <details className="border-b border-line bg-surface">
                    <summary className="cursor-pointer px-5 py-2 text-sm font-semibold text-brand-ink">
                      {T.rename[locale]}
                    </summary>
                    <form action={renameDocFolder} className="flex flex-wrap items-end gap-3 px-5 pb-4">
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="host" value={host} />
                      <input type="hidden" name="id" value={folder.id} />
                      <div className="min-w-[12rem] flex-1">
                        <label className="field-label" htmlFor={`ru-${folder.id}`}>{T.folderName[locale]} {T.inRu[locale]}</label>
                        <input id={`ru-${folder.id}`} name="titleRu" required defaultValue={folder.titleRu} className="field" />
                      </div>
                      <div className="min-w-[12rem] flex-1">
                        <label className="field-label" htmlFor={`kk-${folder.id}`}>{T.folderName[locale]} {T.inKk[locale]}</label>
                        <input id={`kk-${folder.id}`} name="titleKk" defaultValue={folder.titleKk} className="field" />
                      </div>
                      <SubmitButton className="btn-secondary">{T.save[locale]}</SubmitButton>
                    </form>
                  </details>
                ) : null}

                {items.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted">{T.emptyFolder[locale]}</p>
                ) : (
                  <div className="divide-y divide-line">
                    {items.map((doc) => <DocRow key={doc.id} doc={doc} />)}
                  </div>
                )}
              </section>
            );
          })}

          {loose.length > 0 ? (
            <section className="card overflow-hidden">
              <header className="border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  {T.noFolder[locale]}
                  <span className="ml-2 text-sm font-normal text-muted">{formatDocCount(loose.length, locale)}</span>
                </h2>
              </header>
              <div className="divide-y divide-line">
                {loose.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
