import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatAgeRange } from '@/lib/labels';
import { deleteGroup, saveGroup } from '../actions';

export const dynamic = 'force-dynamic';

export default async function GroupsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [groups, csrf] = await Promise.all([
    ctx.db.groups.findMany({ orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Группы"
        description="Свободные места из этой таблицы попадают в каталог портала — держите их в актуальном состоянии."
      />

      {ctx.canEdit ? (
        <form action={saveGroup} className="card mb-6 grid gap-4 p-6 sm:grid-cols-3">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-3">
            <h2 className="font-display text-lg font-bold">Добавить группу</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="nameRu">Название (рус.) *</label>
            <input id="nameRu" name="nameRu" required className="field" placeholder="Старшая «Күншуақ»" />
          </div>
          <div>
            <label className="field-label" htmlFor="nameKk">Атауы (қаз.)</label>
            <input id="nameKk" name="nameKk" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="language">Язык обучения</label>
            <select id="language" name="language" className="field" defaultValue="kk">
              <option value="kk">Қазақша</option>
              <option value="ru">Русский</option>
              <option value="mixed">Смешанная</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="ageFrom">Возраст от, мес.</label>
            <input id="ageFrom" name="ageFrom" type="number" min={0} max={96} className="field" placeholder="36" />
          </div>
          <div>
            <label className="field-label" htmlFor="ageTo">до, мес.</label>
            <input id="ageTo" name="ageTo" type="number" min={0} max={96} className="field" placeholder="48" />
          </div>
          <div>
            <label className="field-label" htmlFor="teachers">Воспитатели</label>
            <input id="teachers" name="teachers" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="placesTotal">Всего мест</label>
            <input id="placesTotal" name="placesTotal" type="number" min={0} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="placesFree">Свободно</label>
            <input id="placesFree" name="placesFree" type="number" min={0} defaultValue={0} className="field" />
          </div>
          <div className="flex items-end">
            <SubmitButton>Добавить</SubmitButton>
          </div>
        </form>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState icon="🧸" title="Группы не заполнены" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Группа</th>
                <th className="px-4 py-3 font-semibold">Возраст</th>
                <th className="px-4 py-3 font-semibold">Язык</th>
                <th className="px-4 py-3 font-semibold">Мест</th>
                <th className="px-4 py-3 font-semibold">Свободно</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-4 py-3 font-semibold">{group.nameRu}</td>
                  <td className="px-4 py-3 text-muted">{formatAgeRange(group.ageFrom, group.ageTo) ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{group.language}</td>
                  <td className="px-4 py-3">{group.placesTotal ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${group.placesFree > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {group.placesFree}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {ctx.canEdit ? (
                      <form action={deleteGroup}>
                        <input type="hidden" name={CSRF_FIELD} value={csrf} />
                        <input type="hidden" name="host" value={host} />
                        <input type="hidden" name="id" value={group.id} />
                        <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">Удалить</button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
