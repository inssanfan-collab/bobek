import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { deleteStaff, saveStaff } from '../actions';
import { FileInput } from '@/components/admin/FileInput';
import type { Locale } from '@/lib/i18n';
import type { StaffMember } from '@prisma/client';

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
  edit: { kk: 'Өзгерту', ru: 'Изменить' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  photoKeep: { kk: 'Жаңа фото таңдалмаса, бұрынғысы қалады.', ru: 'Если новое фото не выбрано, останется прежнее.' },
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
          <StaffFields locale={locale} />
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
                <details className="group mt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-center gap-2 [&::-webkit-details-marker]:hidden">
                    <span className="btn-secondary px-3 py-1 text-xs">{T.edit[locale]}</span>
                  </summary>
                  <form action={saveStaff} className="mt-4 grid gap-3 text-left">
                    <input type="hidden" name={CSRF_FIELD} value={csrf} />
                    <input type="hidden" name="host" value={host} />
                    <input type="hidden" name="id" value={member.id} />
                    <StaffFields locale={locale} member={member} />
                    <p className="text-xs text-muted sm:col-span-2">{T.photoKeep[locale]}</p>
                    <div className="sm:col-span-2">
                      <SubmitButton>{T.save[locale]}</SubmitButton>
                    </div>
                  </form>
                </details>
              ) : null}
              {ctx.canEdit ? (
                <form action={deleteStaff} className="mt-2">
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

/**
 * Поля сотрудника — одни и те же для «Добавить» и «Изменить». У формы
 * изменения id полей с префиксом сотрудника: карточек на странице много,
 * а подпись должна находить своё поле.
 */
function StaffFields({ locale, member }: { locale: Locale; member?: StaffMember }) {
  const id = (name: string) => (member ? `${member.id}-${name}` : name);
  return (
    <>
      <div>
        <label className="field-label" htmlFor={id('fullName')}>{T.fullName[locale]} *</label>
        <input id={id('fullName')} name="fullName" required className="field" placeholder="Сериккызы Айгүл" defaultValue={member?.fullName} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('positionRu')}>{T.position[locale]} {T.inRu[locale]} *</label>
        <input id={id('positionRu')} name="positionRu" required className="field" placeholder="Воспитатель" defaultValue={member?.positionRu} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('positionKk')}>{T.position[locale]} {T.inKk[locale]}</label>
        <input id={id('positionKk')} name="positionKk" className="field" placeholder="Тәрбиеші" defaultValue={member?.positionKk ?? ''} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('educationRu')}>{T.education[locale]} {T.inRu[locale]}</label>
        <input id={id('educationRu')} name="educationRu" className="field" placeholder="Высшее педагогическое" defaultValue={member?.educationRu ?? ''} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('educationKk')}>{T.education[locale]} {T.inKk[locale]}</label>
        <input id={id('educationKk')} name="educationKk" className="field" placeholder="Жоғары педагогикалық" defaultValue={member?.educationKk ?? ''} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('experience')}>{T.experience[locale]}</label>
        <input id={id('experience')} name="experience" className="field" placeholder={T.experienceExample[locale]} defaultValue={member?.experience ?? ''} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('categoryName')}>{T.category[locale]}</label>
        <input id={id('categoryName')} name="categoryName" className="field" placeholder="Педагог-модератор" defaultValue={member?.categoryName ?? ''} />
      </div>
      <div>
        <label className="field-label" htmlFor={id('photo')}>{T.photo[locale]}</label>
        <FileInput id={id('photo')} name="photo" accept="image/*" locale={locale} />
      </div>
    </>
  );
}
