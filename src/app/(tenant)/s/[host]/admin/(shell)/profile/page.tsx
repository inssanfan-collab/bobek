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

const T = {
  title: { kk: 'Балабақша төлқұжаты', ru: 'Паспорт сада' },
  lead: {
    kk: 'Бұл деректер тақырыпшада, төменгі жолақта, байланыстарда және портал каталогында көрсетіледі.',
    ru: 'Эти данные показываются в шапке, подвале, контактах и в каталоге портала.',
  },
  onlyAdmin: {
    kk: 'Балабақша төлқұжатын балабақша әкімшісі өзгерте алады.',
    ru: 'Изменять паспорт сада может администратор сада.',
  },
  names: { kk: 'Атаулары', ru: 'Названия' },
  fullName: { kk: 'Толық атауы', ru: 'Полное название' },
  shortName: { kk: 'Қысқаша атауы', ru: 'Короткое название' },
  contacts: { kk: 'Байланыс және мекенжай', ru: 'Контакты и адрес' },
  address: { kk: 'Мекенжайы', ru: 'Адрес' },
  district: { kk: 'Қала ауданы', ru: 'Район города' },
  workHours: { kk: 'Жұмыс режимі', ru: 'Режим работы' },
  workHoursExample: { kk: 'Дс–Жм, 07:30–18:30', ru: 'Пн–Пт, 07:30–18:30' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  phoneExtra: { kk: 'Қосымша телефон', ru: 'Дополнительный телефон' },
  email: { kk: 'Электрондық пошта', ru: 'Электронная почта' },
  lat: { kk: 'Ендік', ru: 'Широта' },
  lng: { kk: 'Бойлық', ru: 'Долгота' },
  coordsHint: {
    kk: 'Бос қалдырыңыз — мекенжай бойынша анықтаймыз. Карта белгісі дұрыс тұрмаса, координаттарды қолмен жазыңыз: олар автоматты түрде табылғаннан маңыздырақ.',
    ru: 'Оставьте пустыми — определим по адресу. Если метка на карте встала не туда, впишите координаты вручную: они важнее найденных автоматически.',
  },
  organization: { kk: 'Ұйым', ru: 'Организация' },
  bin: { kk: 'БСН', ru: 'БИН' },
  licenseNo: { kk: 'Лицензия нөмірі', ru: 'Номер лицензии' },
  headName: { kk: 'Меңгеруші (аты-жөні)', ru: 'Заведующая (ФИО)' },
  groupsCount: { kk: 'Топтар саны', ru: 'Количество групп' },
  languages: { kk: 'Оқыту тілдері', ru: 'Языки обучения' },
  socials: { kk: 'Әлеуметтік желілер мен мессенджерлер', ru: 'Соцсети и мессенджеры' },
  socialsHint: {
    kk: 'Ата-аналар қоңырау шалғаннан гөрі WhatsApp-қа жазып, Instagram қарайды. Сілтемелер сайттың төменгі жолағында және «Байланыс» бөлімінде шығады.',
    ru: 'Родители пишут в WhatsApp и смотрят Instagram чаще, чем звонят. Ссылки появятся в подвале сайта и в разделе «Контакты».',
  },
  whatsapp: { kk: 'WhatsApp (нөмір)', ru: 'WhatsApp (номер)' },
  instagram: { kk: 'Instagram (сілтеме)', ru: 'Instagram (ссылка)' },
  about: { kk: 'Балабақша туралы', ru: 'О саде' },
  aboutShort: { kk: 'Қысқаша сипаттама', ru: 'Краткое описание' },
  save: { kk: 'Төлқұжатты сақтау', ru: 'Сохранить паспорт' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function ProfilePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title={T.title[locale]} />
        <Alert tone="info">{T.onlyAdmin[locale]}</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      <form action={saveProfile} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-bold">{T.names[locale]}</h2>
          <BilingualField
            label={T.fullName[locale]}
            ru={<input name="nameRu" required defaultValue={profile?.nameRu ?? ''} className="field" />}
            kk={<input name="nameKk" defaultValue={profile?.nameKk ?? ''} className="field" />}
          />
          <BilingualField
            label={T.shortName[locale]}
            hint="Показывается в шапке сайта, если полное слишком длинное."
            ru={<input name="shortNameRu" defaultValue={profile?.shortNameRu ?? ''} className="field" placeholder="Ясли-сад №12" />}
            kk={<input name="shortNameKk" defaultValue={profile?.shortNameKk ?? ''} className="field" />}
          />
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.contacts[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="addressRu">{T.address[locale]} {T.inRu[locale]}</label>
            <input id="addressRu" name="addressRu" defaultValue={profile?.addressRu ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="addressKk">{T.address[locale]} {T.inKk[locale]}</label>
            <input id="addressKk" name="addressKk" defaultValue={profile?.addressKk ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="district">{T.district[locale]}</label>
            <input id="district" name="district" defaultValue={profile?.district ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="workHours">{T.workHours[locale]}</label>
            <input id="workHours" name="workHours" defaultValue={profile?.workHours ?? ''} className="field" placeholder={T.workHoursExample[locale]} />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">{T.phone[locale]}</label>
            <input id="phone" name="phone" defaultValue={profile?.phone ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="phoneExtra">{T.phoneExtra[locale]}</label>
            <input id="phoneExtra" name="phoneExtra" defaultValue={profile?.phoneExtra ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">{T.email[locale]}</label>
            <input id="email" name="email" type="email" defaultValue={profile?.email ?? ''} className="field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="lat">{T.lat[locale]}</label>
              <input id="lat" name="lat" defaultValue={profile?.lat ?? ''} className="field" placeholder="50.283" />
            </div>
            <div>
              <label className="field-label" htmlFor="lng">{T.lng[locale]}</label>
              <input id="lng" name="lng" defaultValue={profile?.lng ?? ''} className="field" placeholder="57.166" />
            </div>
            <p className="col-span-2 text-sm text-muted">
              {T.coordsHint[locale]}
            </p>
          </div>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.organization[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="bin">{T.bin[locale]}</label>
            <input id="bin" name="bin" defaultValue={profile?.bin ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="licenseNo">{T.licenseNo[locale]}</label>
            <input id="licenseNo" name="licenseNo" defaultValue={profile?.licenseNo ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="headNameRu">{T.headName[locale]} {T.inRu[locale]}</label>
            <input id="headNameRu" name="headNameRu" defaultValue={profile?.headNameRu ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="headNameKk">{T.headName[locale]} {T.inKk[locale]}</label>
            <input id="headNameKk" name="headNameKk" defaultValue={profile?.headNameKk ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="groupsCount">{T.groupsCount[locale]}</label>
            <input id="groupsCount" name="groupsCount" type="number" min={0} defaultValue={profile?.groupsCount ?? ''} className="field" />
          </div>
          <fieldset className="flex items-end gap-4">
            <legend className="field-label">{T.languages[locale]}</legend>
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

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.socials[locale]}</h2>
            <p className="mt-1 text-sm text-muted">
              {T.socialsHint[locale]}
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="whatsapp">{T.whatsapp[locale]}</label>
            <input id="whatsapp" name="whatsapp" defaultValue={profile?.whatsapp ?? ''} className="field" placeholder="+7 777 000 00 00" />
          </div>
          <div>
            <label className="field-label" htmlFor="instagram">{T.instagram[locale]}</label>
            <input id="instagram" name="instagram" defaultValue={profile?.instagram ?? ''} className="field" placeholder="https://instagram.com/sad12" />
          </div>
          <div>
            <label className="field-label" htmlFor="youtube">YouTube</label>
            <input id="youtube" name="youtube" defaultValue={profile?.youtube ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="telegram">Telegram</label>
            <input id="telegram" name="telegram" defaultValue={profile?.telegram ?? ''} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="facebook">Facebook</label>
            <input id="facebook" name="facebook" defaultValue={profile?.facebook ?? ''} className="field" />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-display text-lg font-bold">{T.about[locale]}</h2>
          <BilingualField
            label={T.aboutShort[locale]}
            hint="Показывается на главной странице под названием. Два-три предложения."
            ru={<textarea name="aboutRu" rows={4} defaultValue={profile?.aboutRu ?? ''} className="field" placeholder="Наш сад работает с 1985 года…" />}
            kk={<textarea name="aboutKk" rows={4} defaultValue={profile?.aboutKk ?? ''} className="field" placeholder="Балабақшамыз 1985 жылдан бері жұмыс істейді…" />}
          />
        </section>

        <SubmitButton>{T.save[locale]}</SubmitButton>
      </form>
    </>
  );
}
