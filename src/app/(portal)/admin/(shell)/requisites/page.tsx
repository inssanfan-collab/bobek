import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { portalSettings } from '@/server/docs/contract';
import { saveRequisites } from './actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Деректемелер', ru: 'Реквизиты' },
  lead: {
    kk: 'Осы деректер шартқа, шотқа және актіге қойылады. Бір рет толтырылады, өзгергенде түзетіледі.',
    ru: 'Эти данные подставляются в договор, счёт и акт. Заполняются один раз, правятся при изменении.',
  },
  hint: { kk: 'Неге керек', ru: 'Зачем это здесь' },
  hintText: {
    kk: 'Деректемелер кодта емес, дерекқорда тұр: банк, мекенжай және қол қоюшы ауысады, ал ол үшін бастапқы кодты түзету дұрыс емес.',
    ru: 'Реквизиты хранятся в базе, а не в коде: меняются банк, адрес и подписант, и править ради этого исходники неправильно.',
  },

  org: { kk: 'Ұйым', ru: 'Организация' },
  companyName: { kk: 'Атауы', ru: 'Наименование' },
  ownerName: { kk: 'Басшысының аты-жөні', ru: 'ФИО руководителя' },
  taxId: { kk: 'ЖСН / БСН', ru: 'ИИН / БИН' },
  basis: { kk: 'Неғiзiнде әрекет етеді', ru: 'Действует на основании' },
  address: { kk: 'Мекенжайы', ru: 'Адрес' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  email: { kk: 'E-mail', ru: 'E-mail' },

  bank: { kk: 'Банк деректемелері', ru: 'Банковские реквизиты' },
  bankName: { kk: 'Банктің атауы', ru: 'Наименование банка' },
  iban: { kk: 'ЖСК (IIK)', ru: 'ИИК (IBAN)' },
  bic: { kk: 'БСК (BIC)', ru: 'БИК' },
  kbe: { kk: 'КБе', ru: 'Кбе' },
  kbeHint: {
    kk: 'Жеке кәсіпкер үшін әдетте 19, заңды тұлға үшін 17.',
    ru: 'Для индивидуального предпринимателя обычно 19, для юридического лица 17.',
  },
  taxNote: { kk: 'Салық режимі туралы жол', ru: 'Строка о налоговом режиме' },
  taxNoteHint: {
    kk: 'Құжаттарда сол күйінде басылады: «ҚҚС салынбайды».',
    ru: 'Печатается в документах как есть: «НДС не облагается».',
  },

  signature: { kk: 'Қол қоюшы', ru: 'Подписант' },
  signerName: { kk: 'Аты-жөні', ru: 'ФИО' },
  signerTitle: { kk: 'Лауазымы', ru: 'Должность' },

  kkLabel: { kk: 'Қазақша', ru: 'По-казахски' },
  ruLabel: { kk: 'Орысша', ru: 'По-русски' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
} as const;

export default async function RequisitesPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const [settings, csrf] = await Promise.all([portalSettings(), csrfToken()]);

  const pair = (
    label: string,
    nameKk: string,
    nameRu: string,
    valueKk: string,
    valueRu: string,
    placeholder?: string,
  ) => (
    <div className="sm:col-span-2">
      <span className="field-label">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">{T.kkLabel[locale]}</span>
          <input name={nameKk} defaultValue={valueKk} className="field" placeholder={placeholder} />
        </label>
        <label className="block">
          <span className="text-xs text-muted">{T.ruLabel[locale]}</span>
          <input name={nameRu} defaultValue={valueRu} className="field" placeholder={placeholder} />
        </label>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <Alert tone="info" title={T.hint[locale]} className="mb-5">
        {T.hintText[locale]}
      </Alert>

      <form action={saveRequisites} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">{T.org[locale]}</h2>

          {pair(T.companyName[locale], 'companyNameKk', 'companyNameRu', settings.companyNameKk, settings.companyNameRu, 'ИП «Digital Chain»')}
          {pair(T.ownerName[locale], 'ownerNameKk', 'ownerNameRu', settings.ownerNameKk, settings.ownerNameRu)}
          {pair(T.basis[locale], 'basisKk', 'basisRu', settings.basisKk, settings.basisRu, 'свидетельства о регистрации')}
          {pair(T.address[locale], 'addressKk', 'addressRu', settings.addressKk, settings.addressRu)}

          <label className="block">
            <span className="field-label">{T.taxId[locale]}</span>
            <input name="taxId" defaultValue={settings.taxId} className="field" inputMode="numeric" />
          </label>
          <label className="block">
            <span className="field-label">{T.phone[locale]}</span>
            <input name="phone" defaultValue={settings.phone} className="field" />
          </label>
          <label className="block">
            <span className="field-label">{T.email[locale]}</span>
            <input name="email" type="email" defaultValue={settings.email} className="field" />
          </label>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">{T.bank[locale]}</h2>

          {pair(T.bankName[locale], 'bankNameKk', 'bankNameRu', settings.bankNameKk, settings.bankNameRu, 'АО «Kaspi Bank»')}

          <label className="block sm:col-span-2">
            <span className="field-label">{T.iban[locale]}</span>
            <input name="iban" defaultValue={settings.iban} className="field font-mono" placeholder="KZ00 0000 0000 0000 0000" />
          </label>
          <label className="block">
            <span className="field-label">{T.bic[locale]}</span>
            <input name="bic" defaultValue={settings.bic} className="field font-mono" placeholder="CASPKZKA" />
          </label>
          <label className="block">
            <span className="field-label">{T.kbe[locale]}</span>
            <input name="kbe" defaultValue={settings.kbe} className="field" inputMode="numeric" maxLength={2} />
            <span className="mt-1 block text-xs text-muted">{T.kbeHint[locale]}</span>
          </label>

          {pair(T.taxNote[locale], 'taxNoteKk', 'taxNoteRu', settings.taxNoteKk, settings.taxNoteRu, 'НДС не облагается.')}
          <p className="text-xs text-muted sm:col-span-2">{T.taxNoteHint[locale]}</p>
        </section>

        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">{T.signature[locale]}</h2>
          {pair(T.signerName[locale], 'signerNameKk', 'signerNameRu', settings.signerNameKk, settings.signerNameRu)}
          {pair(T.signerTitle[locale], 'signerTitleKk', 'signerTitleRu', settings.signerTitleKk, settings.signerTitleRu, 'Индивидуальный предприниматель')}
        </section>

        <button type="submit" className="btn-primary">{T.save[locale]}</button>
      </form>
    </>
  );
}
