import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { ROLE } from '@/lib/labels';
import { ActionForm } from '@/components/ActionForm';
import { changeOwnPassword } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Құпия сөзім', ru: 'Мой пароль' },
  setOwn: { kk: 'Өз құпия сөзіңізді қойыңыз', ru: 'Задайте свой пароль' },
  setOwnHint: {
    kk: 'Қазір портал әкімшісі берген уақытша құпия сөз қолданылып тұр.',
    ru: 'Сейчас используется временный пароль, выданный администратором портала.',
  },
  current: { kk: 'Ағымдағы құпия сөз', ru: 'Текущий пароль' },
  next: { kk: 'Жаңа құпия сөз', ru: 'Новый пароль' },
  nextHint: {
    kk: 'Кемінде 8 таңба, ең болмағанда бір әріп пен бір сан.',
    ru: 'Минимум 8 символов, хотя бы одна буква и одна цифра.',
  },
  repeat: { kk: 'Жаңа құпия сөзді қайталаңыз', ru: 'Повторите новый пароль' },
  reloginHint: {
    kk: 'Құпия сөзді ауыстырғаннан кейін барлық құрылғыда қайта кіру қажет.',
    ru: 'После смены пароля вход выполняется заново — на всех устройствах.',
  },
  submit: { kk: 'Құпия сөзді ауыстыру', ru: 'Сменить пароль' },
  forgot: { kk: 'Құпия сөзді ұмыттыңыз ба?', ru: 'Забыли пароль?' },
  forgotHint: {
    kk: 'Поштамен қалпына келтіру қарастырылмаған. Портал әкімшісіне қоңырау шалыңыз — ол құпия сөзді тастап, жаңасын айтады.',
    ru: 'Восстановление по почте не предусмотрено. Позвоните администратору портала — он сбросит пароль и продиктует новый.',
  },
} as const;

export default async function AccountPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const csrf = await csrfToken();
  const locale = ctx.user.locale;

  return (
    <>
      <PageHeader title={T.title[locale]} description={`${ctx.user.fullName} · ${ROLE[ctx.user.role][locale]}`} />

      {ctx.user.mustChangePassword ? (
        <div className="mb-6">
          <Alert tone="warn" title={T.setOwn[locale]}>
            {T.setOwnHint[locale]}
          </Alert>
        </div>
      ) : null}

      <ActionForm action={changeOwnPassword} className="card max-w-md space-y-4 p-6">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <div>
          <label className="field-label" htmlFor="current">{T.current[locale]}</label>
          <input id="current" name="current" type="password" required autoComplete="current-password" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="next">{T.next[locale]}</label>
          <input id="next" name="next" type="password" required autoComplete="new-password" className="field" />
          <p className="field-hint">{T.nextHint[locale]}</p>
        </div>
        <div>
          <label className="field-label" htmlFor="repeat">{T.repeat[locale]}</label>
          <input id="repeat" name="repeat" type="password" required autoComplete="new-password" className="field" />
        </div>

        <p className="text-sm text-muted">
          {T.reloginHint[locale]}
        </p>

        <SubmitButton>{T.submit[locale]}</SubmitButton>
      </ActionForm>

      <div className="mt-6 max-w-md">
        <Alert tone="info" title={T.forgot[locale]}>
          {T.forgotHint[locale]}
        </Alert>
      </div>
    </>
  );
}
