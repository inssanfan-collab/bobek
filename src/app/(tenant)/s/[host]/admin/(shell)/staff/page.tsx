import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deleteStaff, saveStaff } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Педагогтар құрамы', ru: 'Педагогический состав' },
  lead: {
    kk: 'Аты-жөні, лауазымы, білімі, өтілі мен санаты — тексеру кезінде міндетті ақпарат.',
    ru: 'ФИО, должность, образование, стаж и категория — обязательная информация при проверках.',
  },
  addHeading: { kk: 'Қызметкер қосу', ru: 'Добавить сотрудника' },
  fullName: { kk: 'Аты-жөні', ru: 'ФИО' },
  position: { kk: 'Лауазымы', ru: 'Должность' },
  education: { kk: 'Білімі', ru: 'Образование' },
  experience: { kk: 'Өтілі', ru: 'Стаж' },
  category: { kk: 'Санаты', ru: 'Категория' },
  photo: { kk: 'Фотосуреті', ru: 'Фотография' },
  add: { kk: 'Қосу', ru: 'Добавить' },
  empty: { kk: 'Қызметкерлер қосылмаған', ru: 'Сотрудники не добавлены' },
  remove: { kk: 'Жою', ru: 'Удалить' },
  /**
   * Пометка языка у полей контента. Обе версии заполняются независимо от того,
   * на каком языке сама админка, поэтому пометка переводится, а поля остаются.
   */
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
  experienceExample: { kk: '12 жыл', ru: '12 лет' },
} as const;

export default async function StaffPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [staff, csrf] = await Promise.all([
    ctx.db.staff.findMany({ orderBy: { position: 'asc' }, include: { photo: true } }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      {ctx.canEdit ? (
        <form action={saveStaff} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="fullName">{T.fullName[locale]} *</label>
            <input id="fullName" name="fullName" required className="field" placeholder="Сериккызы Айгүл" />
          </div>
          <div>
            <label className="field-label" htmlFor="positionRu">{T.position[locale]} {T.inRu[locale]} *</label>
            <input id="positionRu" name="positionRu" required className="field" placeholder="Воспитатель" />
          </div>
          <div>
            <label className="field-label" htmlFor="positionKk">{T.position[locale]} {T.inKk[locale]}</label>
            <input id="positionKk" name="positionKk" className="field" placeholder="Тәрбиеші" />
          </div>
          <div>
            <label className="field-label" htmlFor="educationRu">{T.education[locale]} {T.inRu[locale]}</label>
            <input id="educationRu" name="educationRu" className="field" placeholder="Высшее педагогическое" />
          </div>
          <div>
            <label className="field-label" htmlFor="educationKk">{T.education[locale]} {T.inKk[locale]}</label>
            <input id="educationKk" name="educationKk" className="field" placeholder="Жоғары педагогикалық" />
          </div>
          <div>
            <label className="field-label" htmlFor="experience">{T.experience[locale]}</label>
            <input id="experience" name="experience" className="field" placeholder={T.experienceExample[locale]} />
          </div>
          <div>
            <label className="field-label" htmlFor="categoryName">{T.category[locale]}</label>
            <input id="categoryName" name="categoryName" className="field" placeholder="Педагог-модератор" />
          </div>
          <div>
            <label className="field-label" htmlFor="photo">{T.photo[locale]}</label>
            <input id="photo" name="photo" type="file" accept="image/*" className="field" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>{T.add[locale]}</SubmitButton>
          </div>
        </form>
      ) : null}

      {staff.length === 0 ? (
        <EmptyState icon="👩‍🏫" title={T.empty[locale]} />
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
              <p className="text-sm text-brand">{pick(locale, member.positionKk, member.positionRu)}</p>
              {member.experience ? (
                <p className="mt-1 text-xs text-muted">{T.experience[locale]}: {member.experience}</p>
              ) : null}
              {ctx.canEdit ? (
                <form action={deleteStaff} className="mt-3">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={member.id} />
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
