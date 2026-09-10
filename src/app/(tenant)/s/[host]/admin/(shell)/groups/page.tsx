import { Fragment } from 'react';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { ActionForm } from '@/components/ActionForm';
import { formatAgeRange } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { deleteGroup, saveGroup, setGroupPlaces } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Топтар', ru: 'Группы' },
  lead: {
    kk: 'Осы кестедегі бос орындар портал каталогына түседі — оларды өзекті ұстаңыз.',
    ru: 'Свободные места из этой таблицы попадают в каталог портала — держите их в актуальном состоянии.',
  },
  addHeading: { kk: 'Топ қосу', ru: 'Добавить группу' },
  name: { kk: 'Атауы', ru: 'Название' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  ageFrom: { kk: 'Жасы, айдан', ru: 'Возраст от, мес.' },
  ageTo: { kk: 'дейін, ай', ru: 'до, мес.' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  placesTotal: { kk: 'Барлық орын', ru: 'Всего мест' },
  placesFree: { kk: 'Бос орын', ru: 'Свободно' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Топтар толтырылмаған', ru: 'Группы не заполнены' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  savePlaces: { kk: 'Сақтау', ru: 'Сохранить' },
  freeLabel: { kk: 'Бос орын саны', ru: 'Количество свободных мест' },
  editGroup: { kk: 'Топты өзгерту', ru: 'Изменить группу' },
  saveGroupBtn: { kk: 'Өзгерістерді сақтау', ru: 'Сохранить изменения' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
  th: {
    group: { kk: 'Топ', ru: 'Группа' },
    age: { kk: 'Жасы', ru: 'Возраст' },
    language: { kk: 'Тілі', ru: 'Язык' },
    places: { kk: 'Орын', ru: 'Мест' },
    free: { kk: 'Бос', ru: 'Свободно' },
  },
} as const;

/** В базе язык группы лежит кодом, а в таблице показывался как есть — «kk». */
const GROUP_LANGUAGE = {
  kk: { kk: 'Қазақша', ru: 'Қазақша' },
  ru: { kk: 'Орысша', ru: 'Русский' },
  mixed: { kk: 'Аралас', ru: 'Смешанная' },
} as const;

function languageLabel(code: string, locale: 'kk' | 'ru'): string {
  return code in GROUP_LANGUAGE ? GROUP_LANGUAGE[code as keyof typeof GROUP_LANGUAGE][locale] : code;
}

export default async function GroupsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [groups, csrf] = await Promise.all([
    ctx.db.groups.findMany({ orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {ctx.canEdit ? (
        <form action={saveGroup} className="card mb-6 grid gap-4 p-6 sm:grid-cols-3">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-3">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="nameRu">{T.name[locale]} {T.inRu[locale]} *</label>
            <input id="nameRu" name="nameRu" required className="field" placeholder="Старшая «Күншуақ»" />
          </div>
          <div>
            <label className="field-label" htmlFor="nameKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="nameKk" name="nameKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="language">{T.language[locale]}</label>
            <select id="language" name="language" className="field" defaultValue="kk">
              <option value="kk">{GROUP_LANGUAGE.kk[locale]}</option>
              <option value="ru">{GROUP_LANGUAGE.ru[locale]}</option>
              <option value="mixed">{GROUP_LANGUAGE.mixed[locale]}</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="ageFrom">{T.ageFrom[locale]}</label>
            <input id="ageFrom" name="ageFrom" type="number" min={0} max={96} className="field" placeholder="36" />
          </div>
          <div>
            <label className="field-label" htmlFor="ageTo">{T.ageTo[locale]}</label>
            <input id="ageTo" name="ageTo" type="number" min={0} max={96} className="field" placeholder="48" />
          </div>
          <div>
            <label className="field-label" htmlFor="teachers">{T.teachers[locale]}</label>
            <input id="teachers" name="teachers" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="placesTotal">{T.placesTotal[locale]}</label>
            <input id="placesTotal" name="placesTotal" type="number" min={0} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="placesFree">{T.placesFree[locale]}</label>
            <input id="placesFree" name="placesFree" type="number" min={0} defaultValue={0} className="field" />
          </div>
          <div className="flex items-end">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState icon="🧸" title={T.empty[locale]} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{T.th.group[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.th.age[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.th.language[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.th.places[locale]}</th>
                <th className="px-4 py-3 font-semibold">{T.th.free[locale]}</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {groups.map((group) => (
                <Fragment key={group.id}>
                  <tr>
                    <td className="px-4 py-3 font-semibold">{pick(locale, group.nameKk, group.nameRu)}</td>
                    <td className="px-4 py-3 text-muted">{formatAgeRange(group.ageFrom, group.ageTo, locale) ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{languageLabel(group.language, locale)}</td>
                    <td className="px-4 py-3">{group.placesTotal ?? '—'}</td>
                    <td className="px-4 py-3">
                      {ctx.canEdit ? (
                        // Свободные места правятся прямо здесь: это единственное,
                        // что меняется в группе каждую неделю.
                        <ActionForm
                          action={setGroupPlaces}
                          className="min-w-[11rem]"
                          errorClassName="mb-1.5 text-xs"
                        >
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="host" value={host} />
                          <input type="hidden" name="id" value={group.id} />
                          <label className="sr-only" htmlFor={`free-${group.id}`}>
                            {T.freeLabel[locale]}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`free-${group.id}`}
                              name="placesFree"
                              type="number"
                              min={0}
                              max={group.placesTotal ?? undefined}
                              defaultValue={group.placesFree}
                              className="field w-20 px-2.5 py-1.5 text-sm"
                            />
                            <SubmitButton className="btn-secondary px-3 py-1.5 text-xs">
                              {T.savePlaces[locale]}
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      ) : (
                        <span
                          className={`badge ${group.placesFree > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                        >
                          {group.placesFree}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ctx.canEdit ? (
                        <form action={deleteGroup}>
                          <input type="hidden" name={CSRF_FIELD} value={csrf} />
                          <input type="hidden" name="host" value={host} />
                          <input type="hidden" name="id" value={group.id} />
                          <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</button>
                        </form>
                      ) : null}
                    </td>
                  </tr>

                  {ctx.canEdit ? (
                    <tr>
                      <td colSpan={6} className="px-4 pb-4">
                        {/* <details> вместо скрипта: раскрывается без JavaScript
                            и доступно с клавиатуры — как в разделе вопросов на сайте. */}
                        <details className="rounded-2xl border border-line">
                          <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-brand-ink">
                            {T.editGroup[locale]}
                          </summary>
                          <form action={saveGroup} className="grid gap-4 border-t border-line p-4 sm:grid-cols-3">
                            <input type="hidden" name={CSRF_FIELD} value={csrf} />
                            <input type="hidden" name="host" value={host} />
                            <input type="hidden" name="id" value={group.id} />
                            <div>
                              <label className="field-label" htmlFor={`nameRu-${group.id}`}>
                                {T.name[locale]} {T.inRu[locale]} *
                              </label>
                              <input
                                id={`nameRu-${group.id}`}
                                name="nameRu"
                                required
                                defaultValue={group.nameRu}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`nameKk-${group.id}`}>
                                {T.name[locale]} {T.inKk[locale]}
                              </label>
                              <input
                                id={`nameKk-${group.id}`}
                                name="nameKk"
                                defaultValue={group.nameKk ?? ''}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`language-${group.id}`}>
                                {T.language[locale]}
                              </label>
                              <select
                                id={`language-${group.id}`}
                                name="language"
                                defaultValue={group.language}
                                className="field"
                              >
                                <option value="kk">{GROUP_LANGUAGE.kk[locale]}</option>
                                <option value="ru">{GROUP_LANGUAGE.ru[locale]}</option>
                                <option value="mixed">{GROUP_LANGUAGE.mixed[locale]}</option>
                              </select>
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`ageFrom-${group.id}`}>
                                {T.ageFrom[locale]}
                              </label>
                              <input
                                id={`ageFrom-${group.id}`}
                                name="ageFrom"
                                type="number"
                                min={0}
                                max={96}
                                defaultValue={group.ageFrom ?? ''}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`ageTo-${group.id}`}>
                                {T.ageTo[locale]}
                              </label>
                              <input
                                id={`ageTo-${group.id}`}
                                name="ageTo"
                                type="number"
                                min={0}
                                max={96}
                                defaultValue={group.ageTo ?? ''}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`teachers-${group.id}`}>
                                {T.teachers[locale]}
                              </label>
                              <input
                                id={`teachers-${group.id}`}
                                name="teachers"
                                defaultValue={group.teachers ?? ''}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`total-${group.id}`}>
                                {T.placesTotal[locale]}
                              </label>
                              <input
                                id={`total-${group.id}`}
                                name="placesTotal"
                                type="number"
                                min={0}
                                defaultValue={group.placesTotal ?? ''}
                                className="field"
                              />
                            </div>
                            <div>
                              <label className="field-label" htmlFor={`freeFull-${group.id}`}>
                                {T.placesFree[locale]}
                              </label>
                              <input
                                id={`freeFull-${group.id}`}
                                name="placesFree"
                                type="number"
                                min={0}
                                defaultValue={group.placesFree}
                                className="field"
                              />
                            </div>
                            <div className="flex items-end">
                              <SubmitButton>{T.saveGroupBtn[locale]}</SubmitButton>
                            </div>
                          </form>
                        </details>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
