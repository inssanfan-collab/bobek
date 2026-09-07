import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { sectionMeta } from '@/lib/sections';
import { toPlainText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export default async function PagesListPage({ params }: { params: Promise<{ host: string }> }) {
  const ctx = await tenantAdmin((await params).host);

  const sections = await ctx.db.sections.findMany({
    where: { type: { in: ['PAGE', 'TRUSTEE_BOARD', 'ANTICORRUPTION'] } },
    orderBy: { position: 'asc' },
    include: { page: true },
  });

  return (
    <>
      <PageHeader
        title="Страницы"
        description="Текстовые разделы: о саде, родителям, попечительский совет и другие."
      />

      {sections.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Текстовых разделов нет"
          description="Добавьте их в разделе «Разделы меню»."
          action={<Link href="/admin/sections" className="btn-primary mt-2">Открыть разделы</Link>}
        />
      ) : (
        <div className="card divide-y divide-line">
          {sections.map((section) => {
            const preview = toPlainText(section.page?.bodyRu ?? section.page?.bodyKk, 120);
            const meta = sectionMeta(section.type, section.slug);
            return (
              <Link
                key={section.id}
                href={`/admin/pages/${section.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-soft/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl" aria-hidden>
                  {meta?.icon ?? '📄'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{section.titleRu}</span>
                  <span className="block truncate text-sm text-muted">
                    {preview || 'Страница пока пустая — нажмите, чтобы заполнить'}
                  </span>
                </span>
                <span className="text-sm font-semibold text-brand">Редактировать →</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
