import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatMoney } from '@/lib/labels';
import { deleteClub, saveClub } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ClubsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [clubs, csrf] = await Promise.all([
    prisma.club.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title="Кружки и услуги"
        description="Английский, хореография, логопед, подготовка к школе. Родители сравнивают сады в том числе по ним."
      />

      {ctx.canEdit ? (
        <form action={saveClub} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Добавить кружок</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="nameRu">Название (рус.) *</label>
            <input id="nameRu" name="nameRu" required className="field" placeholder="Английский язык" />
          </div>
          <div>
            <label className="field-label" htmlFor="nameKk">Атауы (қаз.)</label>
            <input id="nameKk" name="nameKk" className="field" placeholder="Ағылшын тілі" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="descRu">Описание (рус.)</label>
            <textarea id="descRu" name="descRu" rows={2} className="field" placeholder="Игровые занятия в малых группах по 8 детей" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="descKk">Сипаттамасы (қаз.)</label>
            <textarea id="descKk" name="descKk" rows={2} className="field" placeholder="8 баладан тұратын шағын топтардағы ойын сабақтары" />
          </div>
          <div>
            <label className="field-label" htmlFor="teacher">Кто ведёт</label>
            <input id="teacher" name="teacher" className="field" placeholder="Ахметова Г. С." />
          </div>
          <div>
            <label className="field-label" htmlFor="schedule">Расписание</label>
            <input id="schedule" name="schedule" className="field" placeholder="Вт, Чт — 16:00" />
          </div>
          <div>
            <label className="field-label" htmlFor="ageRange">Возраст</label>
            <input id="ageRange" name="ageRange" className="field" placeholder="от 4 лет" />
          </div>
          <div>
            <label className="field-label" htmlFor="priceKzt">Цена в месяц, ₸</label>
            <input id="priceKzt" name="priceKzt" type="number" min={0} className="field" placeholder="8000" />
            <label className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="isFree" className="h-4 w-4" />
              Бесплатно
            </label>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Добавить</SubmitButton>
          </div>
        </form>
      ) : null}

      {clubs.length === 0 ? (
        <EmptyState
          icon="🎨"
          title="Кружков пока нет"
          description="Если сад ведёт дополнительные занятия — расскажите о них здесь."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clubs.map((club) => (
            <article key={club.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-lg font-bold">{club.nameRu}</h2>
                <span className={`badge ${club.isFree || club.priceKzt == null ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-soft text-brand-ink'}`}>
                  {club.isFree || club.priceKzt == null ? 'Бесплатно' : `${formatMoney(club.priceKzt)} / мес.`}
                </span>
              </div>
              {club.descRu ? <p className="mt-2 text-sm text-muted">{club.descRu}</p> : null}
              <p className="mt-2 text-sm text-muted">
                {[club.teacher, club.schedule, club.ageRange].filter(Boolean).join(' · ')}
              </p>
              {ctx.canEdit ? (
                <form action={deleteClub} className="mt-3">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={club.id} />
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
