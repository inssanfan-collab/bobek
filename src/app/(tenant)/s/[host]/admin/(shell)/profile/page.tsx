import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { BilingualField } from '@/components/admin/BilingualField';
import { saveProfile } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title="Паспорт сада" />
        <Alert tone="info">Изменять паспорт сада может администратор сада.</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Паспорт сада"
        description="Эти данные показываются в шапке, подвале, контактах и в каталоге портала."
      />

      <form action={saveProfile} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">Названия</h2>
          <BilingualField
            label="Полное название"
            ru={<input name="nameRu" required defaultValue={profile?.nameRu ?? ''} className="field" />}
            kk={<input name="nameKk" defaultValue={profile?.nameKk ?? ''} className="field" />}
          />
          <BilingualField
            label="Короткое название"
            hint="Показывается в шапке сайта, если полное слишком длинное."
            ru={<input name="shortNameRu" defaultValue={profile?.shortNameRu ?? ''} className="field" placeholder="Ясли-сад №12" />}
            kk={<input name="shortNameKk" defaultValue={profile?.shortNameKk ?? ''} className="field" />}
          />
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Контакты и адрес</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="addressRu">Адрес</label>
            <input id="addressRu" name="addressRu" defaultValue={profile?.addressRu ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="addressKk">Мекенжай</label>
            <input id="addressKk" name="addressKk" defaultValue={profile?.addressKk ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="district">Район города</label>
            <input id="district" name="district" defaultValue={profile?.district ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="workHours">Режим работы</label>
            <input id="workHours" name="workHours" defaultValue={profile?.workHours ?? ''} className="field" placeholder="Пн–Пт, 07:30–18:30" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Телефон</label>
            <input id="phone" name="phone" defaultValue={profile?.phone ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="phoneExtra">Дополнительный телефон</label>
            <input id="phoneExtra" name="phoneExtra" defaultValue={profile?.phoneExtra ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Электронная почта</label>
            <input id="email" name="email" type="email" defaultValue={profile?.email ?? ''} className="field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="lat">Широта</label>
              <input id="lat" name="lat" defaultValue={profile?.lat ?? ''} className="field" placeholder="50.283" />
            </div>
            <div>
              <label className="field-label" htmlFor="lng">Долгота</label>
              <input id="lng" name="lng" defaultValue={profile?.lng ?? ''} className="field" placeholder="57.166" />
            </div>
          </div>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">Организация</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="bin">БИН</label>
            <input id="bin" name="bin" defaultValue={profile?.bin ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="licenseNo">Номер лицензии</label>
            <input id="licenseNo" name="licenseNo" defaultValue={profile?.licenseNo ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="headNameRu">Заведующая (ФИО)</label>
            <input id="headNameRu" name="headNameRu" defaultValue={profile?.headNameRu ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="headNameKk">Меңгеруші (аты-жөні)</label>
            <input id="headNameKk" name="headNameKk" defaultValue={profile?.headNameKk ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="groupsCount">Количество групп</label>
            <input id="groupsCount" name="groupsCount" type="number" min={0} defaultValue={profile?.groupsCount ?? ''} className="field" />
          </div>
          <fieldset className="flex items-end gap-4">
            <legend className="field-label">Языки обучения</legend>
            <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold">
              <input type="checkbox" name="langKk" defaultChecked={profile?.langKk ?? true} className="h-4 w-4" />
              Қазақша
            </label>
            <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold">
              <input type="checkbox" name="langRu" defaultChecked={profile?.langRu ?? true} className="h-4 w-4" />
              Русский
            </label>
          </fieldset>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">О саде</h2>
          <BilingualField
            label="Краткое описание"
            hint="Показывается на главной странице под названием. Два-три предложения."
            ru={<textarea name="aboutRu" rows={4} defaultValue={profile?.aboutRu ?? ''} className="field" placeholder="Наш сад работает с 1985 года…" />}
            kk={<textarea name="aboutKk" rows={4} defaultValue={profile?.aboutKk ?? ''} className="field" placeholder="Балабақшамыз 1985 жылдан бері жұмыс істейді…" />}
          />
        </section>

        <SubmitButton>Сохранить паспорт</SubmitButton>
      </form>
    </>
  );
}
