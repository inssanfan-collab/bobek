'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createTenantAction, type CreateTenantState } from '../actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { TEMPLATES, PALETTES } from '@/lib/templates';
import { KIND } from '@/lib/labels';
import { DEFAULT_LOCALE, pick, type Locale } from '@/lib/i18n';
import { slugify } from '@/lib/slug';

const T = {
  step1: { kk: 'Балабақша атауы', ru: 'Название сада' },
  inRu: { kk: 'Орысша', ru: 'По-русски' },
  inKk: { kk: 'Қазақша', ru: 'Қазақша' },
  kind: { kk: 'Ұйым түрі', ru: 'Тип организации' },
  step2: { kk: 'Сайт мекенжайы', ru: 'Адрес сайта' },
  subdomain: { kk: 'Субдомен', ru: 'Поддомен' },
  subdomainHint: {
    kk: 'Латын әрпі, сандар және дефис. Бұл мекенжайды балабақша ата-аналарға айтады — қысқа болғаны жақсы.',
    ru: 'Латиница, цифры и дефис. Этот адрес сад будет диктовать родителям — чем короче, тем лучше.',
  },
  step3: { kk: 'Байланыс және орналасуы', ru: 'Контакты и расположение' },
  district: { kk: 'Қала ауданы', ru: 'Район города' },
  districtHint: { kk: 'Портал каталогында сүзгі ретінде қолданылады.', ru: 'Используется как фильтр в каталоге портала.' },
  address: { kk: 'Мекенжайы', ru: 'Адрес' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  email: { kk: 'Электрондық пошта', ru: 'Электронная почта' },
  step4: { kk: 'Сыртқы көрінісі', ru: 'Внешний вид' },
  template: { kk: 'Үлгі', ru: 'Шаблон' },
  palette: { kk: 'Палитра', ru: 'Палитра' },
  step5: { kk: 'Балабақша әкімшісі', ru: 'Администратор сада' },
  fullName: { kk: 'Аты-жөні', ru: 'ФИО' },
  login: { kk: 'Логин', ru: 'Логин' },
  loginHint: { kk: 'Латын әрпі. Кіру кезінде осыны енгізеді.', ru: 'Латиница. Его будут вводить при входе.' },
  creating: { kk: 'Балабақша құрылуда…', ru: 'Создаём сад…' },
  create: { kk: 'Балабақша құру және кіру деректерін беру', ru: 'Создать сад и выдать доступы' },
  cancel: { kk: 'Болдырмау', ru: 'Отмена' },
  created: { kk: 'Балабақша құрылды', ru: 'Сад создан' },
  memo: { kk: 'Кіру жаднамасы', ru: 'Памятка доступа' },
  siteAddress: { kk: 'Сайт мекенжайы', ru: 'Адрес сайта' },
  adminAddress: { kk: 'Әкімші бөліміне кіру', ru: 'Вход в админку' },
  password: { kk: 'Құпия сөз', ru: 'Пароль' },
  whatNext: { kk: 'Әрі қарай не істеу керек', ru: 'Что делать дальше' },
  next1: {
    kk: 'Әкімші бөлімінің мекенжайын ашып, осы логин мен құпия сөзбен кіріңіз.',
    ru: 'Откройте адрес админки и войдите с этим логином и паролем.',
  },
  next2: {
    kk: 'Жүйе құпия сөзді ауыстыруды сұрайды — өз құпия сөзіңізді ойлап тауып, жазып қойыңыз.',
    ru: 'Система попросит сменить пароль — придумайте свой и запишите его.',
  },
  next3: {
    kk: '«Балабақша туралы» бөлімін толтырыңыз, фото және алғашқы жаңалық қосыңыз.',
    ru: 'Заполните раздел «О саде», добавьте фото и первую новость.',
  },
  next4: {
    kk: 'Сайт дайын болғанда — портал әкімшісіне хабарлаңыз, ол оны жұртшылыққа ашады.',
    ru: 'Когда сайт готов — сообщите администратору портала, он откроет его публично.',
  },
  createMore: { kk: 'Тағы біреуін құру', ru: 'Создать ещё один' },
  saveMemo: {
    kk: 'Жаднаманы сақтаңыз немесе басып шығарыңыз — құпия сөз тек қазір көрсетіледі.',
    ru: 'Сохраните или распечатайте памятку — пароль показывается только сейчас.',
  },
} as const;

export function NewTenantForm({
  csrf,
  portalDomain,
  locale = DEFAULT_LOCALE,
}: {
  csrf: string;
  portalDomain: string;
  locale?: Locale;
}) {
  const [state, action] = useActionState<CreateTenantState, FormData>(createTenantAction, {});
  const [slug, setSlug] = useState('');
  const [login, setLogin] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loginTouched, setLoginTouched] = useState(false);
  const [palette, setPalette] = useState('mandarin');

  if (state.created) return <AccessSheet created={state.created} locale={locale} />;

  /** Адрес и логин подставляются из названия, пока админ их не поправил вручную. */
  function onNameChange(value: string) {
    const suggestion = slugify(value).slice(0, 24);
    if (!slugTouched) setSlug(suggestion);
    if (!loginTouched) setLogin(suggestion ? `${suggestion}-admin`.slice(0, 40) : '');
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />

      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <Step number={1} title={T.step1[locale]}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${T.inRu[locale]} *`} error={state.errors?.nameRu}>
            <input
              name="nameRu"
              required
              className="field"
              placeholder="Ясли-сад №12 «Балдырған»"
              onChange={(e) => onNameChange(e.target.value)}
            />
          </Field>
          <Field label={`${T.inKk[locale]} *`} error={state.errors?.nameKk}>
            <input name="nameKk" required className="field" placeholder="№12 «Балдырған» бөбекжайы" />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={T.kind[locale]}>
            <select name="kind" className="field" defaultValue="NURSERY_GARDEN">
              {Object.entries(KIND).map(([value, phrase]) => (
                <option key={value} value={value}>{phrase[locale]}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-end gap-2 pb-2.5 text-sm font-semibold">
            <input type="checkbox" name="isPrivate" className="h-4 w-4" />
            Частный сад
          </label>
        </div>
      </Step>

      <Step number={2} title={T.step2[locale]}>
        <Field label={`${T.subdomain[locale]} *`} error={state.errors?.slug} hint={T.subdomainHint[locale]}>
          <div className="flex items-center gap-2">
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className="field"
              placeholder="sad12"
            />
            <span className="whitespace-nowrap text-sm text-muted">.{portalDomain}</span>
          </div>
        </Field>
        {slug ? (
          <p className="mt-2 text-sm">
            Сайт откроется по адресу{' '}
            <strong className="text-brand">https://{slug}.{portalDomain}</strong>
          </p>
        ) : null}
      </Step>

      <Step number={3} title={T.step3[locale]}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={T.district[locale]} hint={T.districtHint[locale]}>
            <input name="district" className="field" placeholder="Астана" />
          </Field>
          <Field label={T.address[locale]}>
            <input name="addressRu" className="field" placeholder="г. Актобе, ул. Абая, 12" />
          </Field>
          <Field label={T.phone[locale]}>
            <input name="phone" className="field" placeholder="+7 (7132) 00-00-00" />
          </Field>
          <Field label={T.email[locale]}>
            <input name="email" type="email" className="field" placeholder="sad12@mail.kz" />
          </Field>
        </div>
      </Step>

      <Step number={4} title={T.step4[locale]}>
        <fieldset>
          <legend className="field-label">{T.template[locale]}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((template, index) => (
              <label key={template.code} className="card cursor-pointer p-4 has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30">
                <input
                  type="radio"
                  name="templateCode"
                  value={template.code}
                  defaultChecked={index === 0}
                  className="sr-only"
                />
                <p className="font-display font-bold">{pick(locale, template.nameKk, template.nameRu)}</p>
                <p className="mt-1 text-xs text-muted">{pick(locale, template.descriptionKk, template.descriptionRu)}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="field-label">{T.palette[locale]}</legend>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((item) => (
              <label
                key={item.code}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                  palette === item.code ? 'border-brand ring-2 ring-brand/30' : 'border-line'
                }`}
              >
                <input
                  type="radio"
                  name="palette"
                  value={item.code}
                  checked={palette === item.code}
                  onChange={() => setPalette(item.code)}
                  className="sr-only"
                />
                <span className="h-4 w-4 rounded-full" style={{ background: item.swatch }} aria-hidden />
                {pick(locale, item.nameKk, item.nameRu)}
              </label>
            ))}
          </div>
        </fieldset>
      </Step>

      <Step number={5} title={T.step5[locale]}>
        <p className="mb-3 text-sm text-muted">
          Пароль сгенерируется автоматически и покажется один раз — сразу после создания.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${T.fullName[locale]} *`} error={state.errors?.adminFullName}>
            <input name="adminFullName" required className="field" placeholder="Сериккызы Айгүл" />
          </Field>
          <Field label={T.phone[locale]}>
            <input name="adminPhone" className="field" placeholder="+7 (777) 000-00-00" />
          </Field>
          <Field label={`${T.login[locale]} *`} error={state.errors?.adminLogin} hint={T.loginHint[locale]}>
            <input
              name="adminLogin"
              required
              value={login}
              onChange={(e) => {
                setLoginTouched(true);
                setLogin(e.target.value.toLowerCase());
              }}
              className="field"
              placeholder="sad12-admin"
            />
          </Field>
        </div>
      </Step>

      <div className="flex gap-3">
        <SubmitButton pendingLabel={T.creating[locale]}>{T.create[locale]}</SubmitButton>
        <Link href="/admin/tenants" className="btn-secondary">{T.cancel[locale]}</Link>
      </div>
    </form>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 flex items-center gap-3 font-display text-lg font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-sm text-white">{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      {children}
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

function AccessSheet({
  created,
  locale,
}: {
  created: NonNullable<CreateTenantState['created']>;
  locale: Locale;
}) {
  return (
    <div className="space-y-4">
      <Alert tone="success" title={T.created[locale]}>
        {T.saveMemo[locale]}
      </Alert>

      <div className="card p-6 print:border-none print:shadow-none" id="access-sheet">
        <h2 className="font-display text-xl font-extrabold">{T.memo[locale]}</h2>
        <p className="mt-1 text-muted">{created.nameRu}</p>

        <dl className="mt-5 space-y-3">
          <Row label={T.siteAddress[locale]} value={created.siteUrl} />
          <Row label={T.adminAddress[locale]} value={created.adminUrl} />
          <Row label={T.login[locale]} value={created.login} />
          <Row label={T.password[locale]} value={created.password} />
        </dl>

        <div className="mt-5 rounded-2xl bg-brand-soft p-4 text-sm text-brand-ink">
          <p className="font-semibold">{T.whatNext[locale]}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>{T.next1[locale]}</li>
            <li>{T.next2[locale]}</li>
            <li>{T.next3[locale]}</li>
            <li>{T.next4[locale]}</li>
          </ol>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          Распечатать памятку
        </button>
        <Link href={`/admin/tenants/${created.tenantId}`} className="btn-secondary">
          Открыть карточку сада
        </Link>
        <Link href="/admin/tenants/new" className="btn-ghost">{T.createMore[locale]}</Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 border-b border-line pb-2">
      <dt className="w-40 shrink-0 text-sm text-muted">{label}</dt>
      <dd className="font-mono text-lg font-bold">{value}</dd>
    </div>
  );
}
