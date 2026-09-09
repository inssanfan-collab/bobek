import { prisma } from '@/server/db';
import { requireSuperadmin } from '@/server/auth/guards';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDateTime } from '@/lib/labels';
import { markLeadHandled } from './actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Өтінімдер', ru: 'Заявки' },
  lead: { kk: 'Қосылу нысанынан келген балабақша өтініштері.', ru: 'Обращения садов с формы подключения.' },
  empty: { kk: 'Әзірге өтінімдер жоқ', ru: 'Заявок пока нет' },
  emptyHint: {
    kk: 'Порталдағы нысаннан келген өтінімдер осында шығады.',
    ru: 'Заявки с формы на портале появятся здесь.',
  },
  markHandled: { kk: 'Өңделді деп белгілеу', ru: 'Отметить обработанной' },
  handled: { kk: 'Өңделді', ru: 'Обработана' },
} as const;

export default async function LeadsPage() {
  const user = await requireSuperadmin();
  const locale = user.locale;
  const [leads, csrf] = await Promise.all([
    prisma.lead.findMany({ orderBy: [{ isHandled: 'asc' }, { createdAt: 'desc' }], take: 200 }),
    csrfToken(),
  ]);

  if (leads.length === 0) {
    return (
      <>
        <PageHeader title={T.title[locale]} />
        <EmptyState icon="📥" title={T.empty[locale]} description={T.emptyHint[locale]} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />
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
              <span className="text-sm text-muted">{formatDateTime(lead.createdAt, locale)}</span>
            </div>
            {lead.comment ? <p className="mt-3 text-sm">{lead.comment}</p> : null}
            {!lead.isHandled ? (
              <form action={markLeadHandled} className="mt-4">
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="leadId" value={lead.id} />
                <button type="submit" className="btn-secondary text-sm">{T.markHandled[locale]}</button>
              </form>
            ) : (
              <p className="mt-3 text-sm font-semibold text-emerald-700">{T.handled[locale]}</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
