import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { sectionTitle } from '@/server/tenant/section-title';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DOC_FOLDER_PRESETS, formatDate, formatDocCount, formatFolderCount } from '@/lib/labels';
import {
  childrenByParent, deepDocCounts, flattenTree, folderPath, indentLabel, subtreeIds,
} from '@/lib/doc-tree';
import { pick } from '@/lib/i18n';
import { env } from '@/lib/env';
import {
  createDocFolder, deleteDocFolder, deleteDocument, moveDocFolder, renameDocFolder, saveDocument,
} from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Құжаттар', ru: 'Документы' },
  lead: {
    kk: 'Құжаттарды бумаларға салыңыз — бума ішінде тағы бума болуы мүмкін, компьютердегі сияқты. Сайтта да солай көрінеді.',
    ru: 'Разложите документы по папкам — внутри папки могут быть ещё папки, как на компьютере. На сайте они выглядят так же.',
  },
  root: { kk: 'Барлық құжаттар', ru: 'Все документы' },
  folderHeading: { kk: 'Жаңа бума', ru: 'Новая папка' },
  folderHere: { kk: 'Осы буманың ішінде жасалады.', ru: 'Создаётся внутри этой папки.' },
  folderName: { kk: 'Бума атауы', ru: 'Название папки' },
  folderHint: {
    kk: 'Мысалы: «Өзін-өзі бағалау», «2025 - 2026», «Бұйрықтар».',
    ru: 'Например: «Самооценка», «2025 - 2026», «Приказы».',
  },
  addFolder: { kk: 'Бума қосу', ru: 'Добавить папку' },
  edit: { kk: 'Өзгерту', ru: 'Изменить' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  up: { kk: 'Жоғары', ru: 'Выше' },
  down: { kk: 'Төмен', ru: 'Ниже' },
  where: { kk: 'Қай жерде жатыр', ru: 'Где лежит' },
  top: { kk: '— Жоғарғы деңгей —', ru: '— Верхний уровень —' },
  addHeading: { kk: 'Құжаттар қосу', ru: 'Добавить документы' },
  addHere: { kk: 'Файлдар осы бумаға түседі.', ru: 'Файлы попадут в эту папку.' },
  name: { kk: 'Атауы', ru: 'Название' },
  nameHint: {
    kk: 'Бірнеше файл таңдасаңыз, атаулары файл аттарынан алынады — кейін өзгертуге болады.',
    ru: 'Если выбрать несколько файлов, названия возьмутся из имён файлов — их можно поправить потом.',
  },
  folder: { kk: 'Бума', ru: 'Папка' },
  file: { kk: 'Файлдар', ru: 'Файлы' },
  replaceFile: { kk: 'Файлды ауыстыру', ru: 'Заменить файл' },
  fileHint: {
    kk: 'PDF, Word немесе Excel. Бірден бірнешеуін таңдауға болады — бір жүктеуде барлығы %s МБ дейін.',
    ru: 'PDF, Word или Excel. Можно выбрать сразу несколько — за одну загрузку всего до %s МБ.',
  },
  uploading: { kk: 'Жүктелуде…', ru: 'Загружаем…' },
  add: { kk: 'Жүктеу', ru: 'Загрузить' },
  empty: { kk: 'Әзірге құжаттар жоқ', ru: 'Документов пока нет' },
  emptyHint: {
    kk: 'Бума жасаңыз да, жарғы мен қабылдау қағидаларынан бастаңыз.',
    ru: 'Создайте папку и начните с устава и правил приёма.',
  },
  folderEmpty: { kk: 'Бұл бума бос', ru: 'Эта папка пуста' },
  folders: { kk: 'Бумалар', ru: 'Папки' },
  files: { kk: 'Құжаттар', ru: 'Документы' },
  open: { kk: 'Ашу', ru: 'Открыть' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  removeFolder: { kk: 'Буманы жою', ru: 'Удалить папку' },
  removeFolderHint: {
    kk: 'Ішіндегі құжаттар мен бумалар жойылмайды — бір деңгей жоғары көшеді.',
    ru: 'Документы и папки внутри не удаляются — они поднимутся на уровень выше.',
  },
  back: { kk: 'Бір деңгей жоғары', ru: 'На уровень выше' },
  path: { kk: 'Бумаға апаратын жол', ru: 'Путь к папке' },
  kb: { kk: 'КБ', ru: 'КБ' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const [{ host }, search] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;
  // Предел берётся из настроек, а не повторяется числом в тексте: иначе
  // подсказка обещает одно, а загрузка отклоняет по другому.
  const maxUploadMb = Math.round(env.maxUploadBytes / 1024 / 1024);

  const [folders, documents, csrf, title] = await Promise.all([
    ctx.db.docFolders.findMany({ orderBy: { position: 'asc' } }),
    ctx.db.documents.findMany({ orderBy: [{ position: 'asc' }, { publishedAt: 'desc' }], include: { media: true } }),
    csrfToken(),
    sectionTitle(ctx.tenantId, 'DOCUMENTS', locale, T.title[locale]),
  ]);

  type Doc = (typeof documents)[number];
  type Folder = (typeof folders)[number];

  // Чужой или удалённый id в адресе — просто верхний уровень.
  const currentId = folders.some((f) => f.id === search.folder) ? search.folder! : null;
  const trail = folderPath(folders, currentId);
  const current = trail[trail.length - 1] ?? null;

  const children = childrenByParent(folders);
  const counts = deepDocCounts(folders, documents);
  const subfolders = children.get(currentId) ?? [];
  const files = documents.filter((doc) => (doc.folderId ?? null) === currentId);
  const label = (f: Folder) => pick(locale, f.titleKk, f.titleRu);
  const href = (id: string | null) => (id ? `/admin/documents?folder=${id}` : '/admin/documents');

  const hidden = (
    <>
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="host" value={host} />
    </>
  );

  /** Выбор папки: всё дерево с отступами. `skip` — нельзя класть папку в саму себя. */
  function FolderSelect({ id, name, value, skip, allowTop }: {
    id: string; name: string; value: string | null; skip?: Set<string>; allowTop: boolean;
  }) {
    return (
      <select id={id} name={name} className="field" defaultValue={value ?? ''}>
        <option value="">{allowTop ? T.top[locale] : T.root[locale]}</option>
        {flattenTree(folders, skip).map(({ folder, depth }) => (
          <option key={folder.id} value={folder.id}>{indentLabel(label(folder), depth)}</option>
        ))}
      </select>
    );
  }

  /** Один документ строкой: имя, размер, ссылка, правка и удаление. */
  function DocRow({ doc }: { doc: Doc }) {
    return (
      <div className="px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
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
              {hidden}
              <input type="hidden" name="id" value={doc.id} />
              <button type="submit" className="btn-ghost px-3 py-1.5 text-xs text-red-600">{T.remove[locale]}</button>
            </form>
          ) : null}
        </div>
        {ctx.canEdit ? (
          <details className="mt-1">
            <summary className="cursor-pointer text-sm font-semibold text-brand-ink">{T.edit[locale]}</summary>
            <form action={saveDocument} className="mt-3 grid gap-3 sm:grid-cols-2">
              {hidden}
              <input type="hidden" name="id" value={doc.id} />
              <div>
                <label className="field-label" htmlFor={`dru-${doc.id}`}>{T.name[locale]} {T.inRu[locale]} *</label>
                <input id={`dru-${doc.id}`} name="titleRu" required defaultValue={doc.titleRu} className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor={`dkk-${doc.id}`}>{T.name[locale]} {T.inKk[locale]}</label>
                <input id={`dkk-${doc.id}`} name="titleKk" defaultValue={doc.titleKk} className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor={`df-${doc.id}`}>{T.folder[locale]}</label>
                <FolderSelect id={`df-${doc.id}`} name="folderId" value={doc.folderId} allowTop={false} />
              </div>
              <div>
                <label className="field-label" htmlFor={`dfile-${doc.id}`}>{T.replaceFile[locale]}</label>
                <input id={`dfile-${doc.id}`} name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="field" />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton className="btn-secondary">{T.save[locale]}</SubmitButton>
              </div>
            </form>
          </details>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={title} description={T.lead[locale]} />

      {/* Путь: где сейчас находимся. */}
      <nav aria-label={T.path[locale]} className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {current ? (
          <Link href={href(null)} className="font-semibold text-brand-ink hover:underline">📁 {T.root[locale]}</Link>
        ) : (
          <span className="font-semibold">📁 {T.root[locale]}</span>
        )}
        {trail.map((folder, index) => (
          <span key={folder.id} className="flex items-center gap-2">
            <span aria-hidden className="text-muted">/</span>
            {index === trail.length - 1 ? (
              <span aria-current="page" className="font-semibold">{label(folder)}</span>
            ) : (
              <Link href={href(folder.id)} className="font-semibold text-brand-ink hover:underline">{label(folder)}</Link>
            )}
          </span>
        ))}
      </nav>

      {ctx.canEdit ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <form action={saveDocument} className="card grid content-start gap-4 p-6">
            <div>
              <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
              {current ? <p className="mt-1 text-sm text-muted">{T.addHere[locale]}</p> : null}
            </div>
            {hidden}
            <input type="hidden" name="folderId" value={currentId ?? ''} />
            <div>
              <label className="field-label" htmlFor="file">{T.file[locale]} *</label>
              <input id="file" name="file" type="file" multiple required accept=".pdf,.doc,.docx,.xls,.xlsx" className="field" />
              <p className="field-hint">{T.fileHint[locale].replaceAll('%s', String(maxUploadMb))}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="titleRu">{T.name[locale]} {T.inRu[locale]}</label>
                <input id="titleRu" name="titleRu" className="field" placeholder="Устав организации" />
              </div>
              <div>
                <label className="field-label" htmlFor="titleKk">{T.name[locale]} {T.inKk[locale]}</label>
                <input id="titleKk" name="titleKk" className="field" placeholder="Ұйым жарғысы" />
              </div>
            </div>
            <p className="field-hint -mt-2">{T.nameHint[locale]}</p>
            <SubmitButton pendingLabel={T.uploading[locale]}>{T.add[locale]}</SubmitButton>
          </form>

          <form action={createDocFolder} className="card grid content-start gap-4 p-6">
            <div>
              <h2 className="font-display text-lg font-bold">{T.folderHeading[locale]}</h2>
              {current ? <p className="mt-1 text-sm text-muted">{T.folderHere[locale]}</p> : null}
            </div>
            {hidden}
            <input type="hidden" name="parentId" value={currentId ?? ''} />
            <div>
              <label className="field-label" htmlFor="folderRu">{T.folderName[locale]} {T.inRu[locale]} *</label>
              {/* Список готовых названий — подсказка, поле остаётся свободным для ввода */}
              <input id="folderRu" name="titleRu" required className="field" list="folder-presets" placeholder="Самооценка" />
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
            <SubmitButton className="btn-secondary">{T.addFolder[locale]}</SubmitButton>
          </form>
        </div>
      ) : null}

      {folders.length === 0 && documents.length === 0 ? (
        <EmptyState icon="📄" title={T.empty[locale]} description={T.emptyHint[locale]} />
      ) : (
        <div className="space-y-5">
          {subfolders.length > 0 ? (
            <section className="card overflow-hidden">
              <header className="border-b border-line px-5 py-3">
                <h2 className="font-display text-lg font-bold">{T.folders[locale]}</h2>
              </header>
              <ul className="divide-y divide-line">
                {subfolders.map((folder, index) => {
                  const inner = children.get(folder.id)?.length ?? 0;
                  return (
                    <li key={folder.id} className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={href(folder.id)} className="flex min-w-0 flex-1 items-center gap-3 hover:text-brand-ink">
                          <span aria-hidden className="text-2xl">📁</span>
                          <span className="min-w-0">
                            <span className="block font-semibold">{label(folder)}</span>
                            <span className="block text-sm text-muted">
                              {inner > 0 ? `${formatFolderCount(inner, locale)} · ` : ''}
                              {formatDocCount(counts.get(folder.id) ?? 0, locale)}
                            </span>
                          </span>
                        </Link>
                        {ctx.canEdit ? (
                          <div className="flex items-center gap-1">
                            {[
                              { dir: 'up', text: T.up[locale], sign: '↑', disabled: index === 0 },
                              { dir: 'down', text: T.down[locale], sign: '↓', disabled: index === subfolders.length - 1 },
                            ].map((btn) => (
                              <form key={btn.dir} action={moveDocFolder}>
                                {hidden}
                                <input type="hidden" name="id" value={folder.id} />
                                <input type="hidden" name="direction" value={btn.dir} />
                                <button
                                  type="submit" className="btn-ghost px-3 py-1.5 text-sm"
                                  disabled={btn.disabled} aria-label={btn.text}
                                >
                                  {btn.sign}
                                </button>
                              </form>
                            ))}
                            <form action={deleteDocFolder}>
                              {hidden}
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
                      </div>

                      {/* Правка спрятана: у сада бывает два десятка папок,
                          и три поля на каждую превратили бы страницу в простыню */}
                      {ctx.canEdit ? (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-sm font-semibold text-brand-ink">{T.edit[locale]}</summary>
                          <form action={renameDocFolder} className="mt-3 grid gap-3 sm:grid-cols-3">
                            {hidden}
                            <input type="hidden" name="id" value={folder.id} />
                            <div>
                              <label className="field-label" htmlFor={`ru-${folder.id}`}>{T.folderName[locale]} {T.inRu[locale]}</label>
                              <input id={`ru-${folder.id}`} name="titleRu" required defaultValue={folder.titleRu} className="field" />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`kk-${folder.id}`}>{T.folderName[locale]} {T.inKk[locale]}</label>
                              <input id={`kk-${folder.id}`} name="titleKk" defaultValue={folder.titleKk} className="field" />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`parent-${folder.id}`}>{T.where[locale]}</label>
                              <FolderSelect
                                id={`parent-${folder.id}`} name="parentId" value={folder.parentId}
                                skip={subtreeIds(folders, folder.id)} allowTop
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <SubmitButton className="btn-secondary">{T.save[locale]}</SubmitButton>
                            </div>
                          </form>
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {files.length > 0 ? (
            <section className="card overflow-hidden">
              <header className="border-b border-line px-5 py-3">
                <h2 className="font-display text-lg font-bold">
                  {T.files[locale]}
                  <span className="ml-2 text-sm font-normal text-muted">{formatDocCount(files.length, locale)}</span>
                </h2>
              </header>
              <div className="divide-y divide-line">
                {files.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </div>
            </section>
          ) : null}

          {current && subfolders.length === 0 && files.length === 0 ? (
            <p className="text-muted">{T.folderEmpty[locale]}</p>
          ) : null}

          {current ? (
            <Link href={href(current.parentId)} className="btn-ghost text-sm">← {T.back[locale]}</Link>
          ) : null}
        </div>
      )}
    </>
  );
}
