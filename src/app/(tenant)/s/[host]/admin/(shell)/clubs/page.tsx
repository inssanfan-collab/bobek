import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatMoney } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { deleteClub, saveClub } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Үйірмелер мен қызметтер', ru: 'Кружки и услуги' },
  lead: {
    kk: 'Ағылшын тілі, хореография, логопед, мектепке дайындық. Ата-аналар балабақшаларды осылар бойынша да салыстырады.',
    ru: 'Английский, хореография, логопед, подготовка к школе. Родители сравнивают сады в том числе по ним.',
  },
  addHeading: { kk: 'Үйірме қосу', ru: 'Добавить кружок' },
  name: { kk: 'Атауы', ru: 'Название' },
  description: { kk: 'Сипаттамасы', ru: 'Описание' },
  teacher: { kk: 'Кім жүргізеді', ru: 'Кто ведёт' },
  schedule: { kk: 'Кестесі', ru: 'Расписание' },
  age: { kk: 'Жасы', ru: 'Возраст' },
  price: { kk: 'Айлық бағасы, ₸', ru: 'Цена в месяц, ₸' },
  free: { kk: 'Тегін', ru: 'Бесплатно' },
  perMonth: { kk: '/ айына', ru: '/ мес.' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Әзірге үйірмелер жоқ', ru: 'Кружков пока нет' },
  emptyHint: {
    kk: 'Балабақшада қосымша сабақтар болса — осында жазыңыз.',
    ru: 'Если сад ведёт дополнительные занятия — расскажите о них здесь.',
  },
  remove: { kk: 'Жою', ru: 'Удалить' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
  ageExample: { kk: '4 жастан', ru: 'от 4 лет' },
  scheduleExample: { kk: 'Сс, Бс — 16:00', ru: 'Вт, Чт — 16:00' },
} as const;

export default async function ClubsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [clubs, csrf] = await Promise.all([
    prisma.club.findMany({ where: { tenantId: ctx.tenantId }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {ctx.canEdit ? (
        <form action={saveClub} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="nameRu">{T.name[locale]} {T.inRu[locale]} *</label>
            <input id="nameRu" name="nameRu" required className="field" placeholder="Английский язык" />
          </div>
          <div>
            <label className="field-label" htmlFor="nameKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="nameKk" name="nameKk" className="field" placeholder="Ағылшын тілі" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="descRu">{T.description[locale]} {T.inRu[locale]}</label>
            <textarea id="descRu" name="descRu" rows={2} className="field" placeholder="Игровые занятия в малых группах по 8 детей" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="descKk">{T.description[locale]} {T.inKk[locale]}</label>
            <textarea id="descKk" name="descKk" rows={2} className="field" placeholder="8 баладан тұратын шағын топтардағы ойын сабақтары" />
          </div>
          <div>
            <label className="field-label" htmlFor="teacher">{T.teacher[locale]}</label>
            <input id="teacher" name="teacher" className="field" placeholder="Ахметова Г. С." />
          </div>
          <div>
            <label className="field-label" htmlFor="schedule">{T.schedule[locale]}</label>
            <input id="schedule" name="schedule" className="field" placeholder={T.scheduleExample[locale]} />
          </div>
          <div>
            <label className="field-label" htmlFor="ageRange">{T.age[locale]}</label>
            <input id="ageRange" name="ageRange" className="field" placeholder={T.ageExample[locale]} />
          </div>
          <div>
            <label className="field-label" htmlFor="priceKzt">{T.price[locale]}</label>
            <input id="priceKzt" name="priceKzt" type="number" min={0} className="field" placeholder="8000" />
            <label className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="isFree" className="h-4 w-4" />
              {T.free[locale]}
            </label>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {clubs.length === 0 ? (
        <EmptyState
          icon="🎨"
          title={T.empty[locale]}
          description={T.emptyHint[locale]}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clubs.map((club) => (
            <article key={club.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-lg font-bold">{pick(locale, club.nameKk, club.nameRu)}</h2>
                <span className={`badge ${club.isFree || club.priceKzt == null ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-soft text-brand-ink'}`}>
                  {club.isFree || club.priceKzt == null
                    ? T.free[locale]
                    : `${formatMoney(club.priceKzt)} ${T.perMonth[locale]}`}
                </span>
              </div>
              {pick(locale, club.descKk, club.descRu) ? (
                <p className="mt-2 text-sm text-muted">{pick(locale, club.descKk, club.descRu)}</p>
              ) : null}
              <p className="mt-2 text-sm text-muted">
                {[club.teacher, club.schedule, club.ageRange].filter(Boolean).join(' · ')}
              </p>
              {ctx.canEdit ? (
                <form action={deleteClub} className="mt-3">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={club.id} />
                  <button type="submit" className="btn-ghost px-3 py-1 text-xs text-red-600">{T.remove[locale]}</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
