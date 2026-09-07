import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { ROLE_LABEL } from '@/lib/labels';
import { ActionForm } from '@/components/ActionForm';
import { changeOwnPassword } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const csrf = await csrfToken();

  return (
    <>
      <PageHeader title="Мой пароль" description={`${ctx.user.fullName} · ${ROLE_LABEL[ctx.user.role]}`} />

      {ctx.user.mustChangePassword ? (
        <div className="mb-6">
          <Alert tone="warn" title="Задайте свой пароль">
            Сейчас используется временный пароль, выданный администратором портала.
          </Alert>
        </div>
      ) : null}

      <ActionForm action={changeOwnPassword} className="card max-w-md space-y-4 p-6">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <div>
          <label className="field-label" htmlFor="current">Текущий пароль</label>
          <input id="current" name="current" type="password" required autoComplete="current-password" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="next">Новый пароль</label>
          <input id="next" name="next" type="password" required autoComplete="new-password" className="field" />
          <p className="field-hint">Минимум 8 символов, хотя бы одна буква и одна цифра.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="repeat">Повторите новый пароль</label>
          <input id="repeat" name="repeat" type="password" required autoComplete="new-password" className="field" />
        </div>

        <p className="text-sm text-muted">
          После смены пароля вход выполняется заново — на всех устройствах.
        </p>

        <SubmitButton>Сменить пароль</SubmitButton>
      </ActionForm>

      <div className="mt-6 max-w-md">
        <Alert tone="info" title="Забыли пароль?">
          Восстановление по почте не предусмотрено. Позвоните администратору портала —
          он сбросит пароль и продиктует новый.
        </Alert>
      </div>
    </>
  );
}
