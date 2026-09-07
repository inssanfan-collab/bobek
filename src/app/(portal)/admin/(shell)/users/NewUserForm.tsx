'use client';

import { useActionState } from 'react';
import { createUserAction, type CreateUserState } from '../tenants/actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';

export function NewUserForm({
  csrf,
  tenants,
  defaultTenantId,
}: {
  csrf: string;
  tenants: { id: string; label: string }[];
  defaultTenantId?: string;
}) {
  const [state, action] = useActionState<CreateUserState, FormData>(createUserAction, {});

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold">Добавить пользователя саду</h2>
      <p className="mt-1 text-sm text-muted">
        Пароль сгенерируется автоматически и покажется один раз. Редактор может публиковать
        контент, но не менять дизайн и настройки.
      </p>

      {state.created ? (
        <div className="mt-4">
          <Alert tone="success" title="Пользователь создан">
            <p>Логин: <strong className="font-mono">{state.created.login}</strong></p>
            <p>Пароль: <strong className="font-mono">{state.created.password}</strong></p>
            <p className="mt-1">Передайте эти данные сотруднику — пароль больше не отобразится.</p>
          </Alert>
        </div>
      ) : null}

      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />

        {state.message ? (
          <div className="sm:col-span-2"><Alert tone="danger">{state.message}</Alert></div>
        ) : null}

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="tenantId">Сад</label>
          <select id="tenantId" name="tenantId" defaultValue={defaultTenantId ?? ''} required className="field">
            <option value="" disabled>Выберите сад</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.label}</option>
            ))}
          </select>
          {state.errors?.tenantId ? <p className="field-error">{state.errors.tenantId}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="fullName">ФИО</label>
          <input id="fullName" name="fullName" required className="field" />
          {state.errors?.fullName ? <p className="field-error">{state.errors.fullName}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="login">Логин</label>
          <input id="login" name="login" required className="field" placeholder="sad12-editor" />
          {state.errors?.login ? <p className="field-error">{state.errors.login}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="role">Роль</label>
          <select id="role" name="role" className="field" defaultValue="TENANT_EDITOR">
            <option value="TENANT_ADMIN">Администратор сада</option>
            <option value="TENANT_EDITOR">Редактор</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="phone">Телефон</label>
          <input id="phone" name="phone" className="field" />
        </div>

        <div className="sm:col-span-2">
          <SubmitButton pendingLabel="Создаём…">Создать пользователя</SubmitButton>
        </div>
      </form>
    </div>
  );
}
