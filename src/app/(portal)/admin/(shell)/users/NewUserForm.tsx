'use client';

import { useActionState } from 'react';
import { createUserAction, type CreateUserState } from '../tenants/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

const T = {
  heading: { kk: 'Балабақшаға пайдаланушы қосу', ru: 'Добавить пользователя саду' },
  created: { kk: 'Пайдаланушы құрылды', ru: 'Пользователь создан' },
  login: { kk: 'Логин: ', ru: 'Логин: ' },
  password: { kk: 'Құпия сөз: ', ru: 'Пароль: ' },
  handOver: {
    kk: 'Бұл деректерді қызметкерге беріңіз — құпия сөз енді көрсетілмейді.',
    ru: 'Передайте эти данные сотруднику — пароль больше не отобразится.',
  },
  garden: { kk: 'Балабақша', ru: 'Сад' },
  chooseGarden: { kk: 'Балабақшаны таңдаңыз', ru: 'Выберите сад' },
  fullName: { kk: 'Аты-жөні', ru: 'ФИО' },
  loginField: { kk: 'Логин', ru: 'Логин' },
  role: { kk: 'Рөлі', ru: 'Роль' },
  tenantAdmin: { kk: 'Балабақша әкімшісі', ru: 'Администратор сада' },
  tenantEditor: { kk: 'Редактор', ru: 'Редактор' },
  phone: { kk: 'Телефон', ru: 'Телефон' },
  creating: { kk: 'Құрылуда…', ru: 'Создаём…' },
  create: { kk: 'Пайдаланушы құру', ru: 'Создать пользователя' },
} as const;

export function NewUserForm({
  csrf,
  tenants,
  defaultTenantId,
  locale = DEFAULT_LOCALE,
}: {
  csrf: string;
  tenants: { id: string; label: string }[];
  defaultTenantId?: string;
  locale?: Locale;
}) {
  const [state, action] = useActionState<CreateUserState, FormData>(createUserAction, {});

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold">{T.heading[locale]}</h2>
      <p className="mt-1 text-sm text-muted">
        Пароль сгенерируется автоматически и покажется один раз. Редактор может публиковать
        контент, но не менять дизайн и настройки.
      </p>

      {state.created ? (
        <div className="mt-4">
          <Alert tone="success" title={T.created[locale]}>
            <p>{T.login[locale]}<strong className="font-mono">{state.created.login}</strong></p>
            <p>{T.password[locale]}<strong className="font-mono">{state.created.password}</strong></p>
            <p className="mt-1">{T.handOver[locale]}</p>
          </Alert>
        </div>
      ) : null}

      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />

        {state.message ? (
          <div className="sm:col-span-2"><Alert tone="danger">{state.message}</Alert></div>
        ) : null}

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="tenantId">{T.garden[locale]}</label>
          <select id="tenantId" name="tenantId" defaultValue={defaultTenantId ?? ''} required className="field">
            <option value="" disabled>{T.chooseGarden[locale]}</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.label}</option>
            ))}
          </select>
          {state.errors?.tenantId ? <p className="field-error">{state.errors.tenantId}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="fullName">{T.fullName[locale]}</label>
          <input id="fullName" name="fullName" required className="field" />
          {state.errors?.fullName ? <p className="field-error">{state.errors.fullName}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="login">{T.loginField[locale]}</label>
          <input id="login" name="login" required className="field" placeholder="sad12-editor" />
          {state.errors?.login ? <p className="field-error">{state.errors.login}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="role">{T.role[locale]}</label>
          <select id="role" name="role" className="field" defaultValue="TENANT_EDITOR">
            <option value="TENANT_ADMIN">{T.tenantAdmin[locale]}</option>
            <option value="TENANT_EDITOR">{T.tenantEditor[locale]}</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="phone">{T.phone[locale]}</label>
          <input id="phone" name="phone" className="field" />
        </div>

        <div className="sm:col-span-2">
          <SubmitButton pendingLabel={T.creating[locale]}>{T.create[locale]}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
