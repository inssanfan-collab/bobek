import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { clearNotice, saveNotice } from '../actions';

export const dynamic = 'force-dynamic';

const TONES = [
  { value: 'INFO', label: 'Информация — синяя полоса' },
  { value: 'WARN', label: 'Внимание — жёлтая полоса' },
  { value: 'URGENT', label: 'Срочно — красная полоса' },
];

export default async function NoticePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title="Срочное объявление" />
        <Alert tone="info">Публиковать срочное объявление может администратор сада.</Alert>
      </>
    );
  }

  const active = Boolean(profile?.noticeRu || profile?.noticeKk);
  const expired = profile?.noticeUntil ? profile.noticeUntil < new Date() : false;

  return (
    <>
      <PageHeader
        title="Срочное объявление"
        description="Полоса на всех страницах сайта: карантин, отмена занятий, изменение режима."
      />

      {active ? (
        <div className="mb-6">
          <Alert tone={expired ? 'info' : 'warn'} title={expired ? 'Объявление истекло и уже не показывается' : 'Объявление сейчас показывается на сайте'}>
            {profile?.noticeRu}
            {profile?.noticeUntil ? ` (до ${formatDate(profile.noticeUntil)})` : ''}
          </Alert>
        </div>
      ) : null}

      <form action={saveNotice} className="card grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="noticeRu">Текст (рус.)</label>
          <textarea
            id="noticeRu"
            name="noticeRu"
            rows={2}
            defaultValue={profile?.noticeRu ?? ''}
            className="field"
            placeholder="С 10 по 20 марта группа «Гүлдер» закрыта на карантин"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="noticeKk">Мәтін (қаз.)</label>
          <textarea id="noticeKk" name="noticeKk" rows={2} defaultValue={profile?.noticeKk ?? ''} className="field" />
        </div>

        <div>
          <label className="field-label" htmlFor="noticeTone">Как выделить</label>
          <select id="noticeTone" name="noticeTone" defaultValue={profile?.noticeTone ?? 'WARN'} className="field">
            {TONES.map((tone) => (
              <option key={tone.value} value={tone.value}>{tone.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="noticeUntil">Показывать до</label>
          <input
            id="noticeUntil"
            name="noticeUntil"
            type="date"
            defaultValue={profile?.noticeUntil ? profile.noticeUntil.toISOString().slice(0, 10) : ''}
            className="field"
          />
          <p className="field-hint">После этой даты объявление снимется само — не забудете убрать.</p>
        </div>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <SubmitButton>Опубликовать объявление</SubmitButton>
        </div>
      </form>

      {active ? (
        <form action={clearNotice} className="mt-4">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <button type="submit" className="btn-secondary text-sm">Снять объявление сейчас</button>
        </form>
      ) : null}
    </>
  );
}
