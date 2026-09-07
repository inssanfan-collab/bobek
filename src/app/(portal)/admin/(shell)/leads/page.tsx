import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDateTime } from '@/lib/labels';
import { markLeadHandled } from './actions';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  await requireSuperadmin();
  const [leads, csrf] = await Promise.all([
    prisma.lead.findMany({ orderBy: [{ isHandled: 'asc' }, { createdAt: 'desc' }], take: 200 }),
    csrfToken(),
  ]);

  if (leads.length === 0) {
    return (
      <>
        <PageHeader title="Заявки" />
        <EmptyState icon="📥" title="Заявок пока нет" description="Заявки с формы на портале появятся здесь." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Заявки" description="Обращения садов с формы подключения." />
      <div className="space-y-3">
        {leads.map((lead) => (
          <article key={lead.id} className={`card p-5 ${lead.isHandled ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">{lead.gardenName}</p>
                <p className="text-sm text-muted">
                  {lead.personName} · <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="font-semibold text-brand">{lead.phone}</a>
                  {lead.email ? ` · ${lead.email}` : ''}
                </p>
              </div>
              <span className="text-sm text-muted">{formatDateTime(lead.createdAt)}</span>
            </div>
            {lead.comment ? <p className="mt-3 text-sm">{lead.comment}</p> : null}
            {!lead.isHandled ? (
              <form action={markLeadHandled} className="mt-4">
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="leadId" value={lead.id} />
                <button type="submit" className="btn-secondary text-sm">Отметить обработанной</button>
              </form>
            ) : (
              <p className="mt-3 text-sm font-semibold text-emerald-700">Обработана</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
