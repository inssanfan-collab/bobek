import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { deleteStaff, saveStaff } from '../actions';

export const dynamic = 'force-dynamic';

export default async function StaffPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [staff, csrf] = await Promise.all([
    ctx.db.staff.findMany({ orderBy: { position: 'asc' }, include: { photo: true } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Педагогический состав"
        description="ФИО, должность, образование, стаж и категория — обязательная информация при проверках."
      />

      {ctx.canEdit ? (
        <form action={saveStaff} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Добавить сотрудника</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="fullName">ФИО *</label>
            <input id="fullName" name="fullName" required className="field" placeholder="Сериккызы Айгүл" />
          </div>
          <div>
            <label className="field-label" htmlFor="positionRu">Должность (рус.) *</label>
            <input id="positionRu" name="positionRu" required className="field" placeholder="Воспитатель" />
          </div>
          <div>
            <label className="field-label" htmlFor="positionKk">Лауазымы (қаз.)</label>
            <input id="positionKk" name="positionKk" className="field" placeholder="Тәрбиеші" />
          </div>
          <div>
            <label className="field-label" htmlFor="educationRu">Образование</label>
            <input id="educationRu" name="educationRu" className="field" placeholder="Высшее педагогическое" />
          </div>
          <div>
            <label className="field-label" htmlFor="experience">Стаж</label>
            <input id="experience" name="experience" className="field" placeholder="12 лет" />
          </div>
          <div>
            <label className="field-label" htmlFor="categoryName">Категория</label>
            <input id="categoryName" name="categoryName" className="field" placeholder="Педагог-модератор" />
          </div>
          <div>
            <label className="field-label" htmlFor="photo">Фотография</label>
            <input id="photo" name="photo" type="file" accept="image/*" className="field" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Добавить</SubmitButton>
          </div>
        </form>
      ) : null}

      {staff.length === 0 ? (
        <EmptyState icon="👩‍🏫" title="Сотрудники не добавлены" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <article key={member.id} className="card p-5 text-center">
              {member.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${member.photo.id}`} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand-soft text-3xl" aria-hidden>👩‍🏫</div>
              )}
              <p className="mt-3 font-display font-bold">{member.fullName}</p>
              <p className="text-sm text-brand">{member.positionRu}</p>
              {member.experience ? <p className="mt-1 text-xs text-muted">Стаж: {member.experience}</p> : null}
              {ctx.canEdit ? (
                <form action={deleteStaff} className="mt-3">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={member.id} />
                  <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">Удалить</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
