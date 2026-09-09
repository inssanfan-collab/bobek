import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { sectionMeta } from '@/lib/sections';
import { toPlainText } from '@/lib/sanitize';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Беттер', ru: 'Страницы' },
  lead: {
    kk: 'Мәтіндік бөлімдер: балабақша туралы, ата-аналарға, қамқоршылық кеңес және басқалары.',
    ru: 'Текстовые разделы: о саде, родителям, попечительский совет и другие.',
  },
  empty: { kk: 'Мәтіндік бөлімдер жоқ', ru: 'Текстовых разделов нет' },
  emptyHint: { kk: 'Оларды «Мәзір бөлімдері» ішінде қосыңыз.', ru: 'Добавьте их в разделе «Разделы меню».' },
  openSections: { kk: 'Бөлімдерді ашу', ru: 'Открыть разделы' },
  blank: {
    kk: 'Бет әзірге бос — толтыру үшін басыңыз',
    ru: 'Страница пока пустая — нажмите, чтобы заполнить',
  },
  edit: { kk: 'Өңдеу →', ru: 'Редактировать →' },
} as const;

export default async function PagesListPage({ params }: { params: Promise<{ host: string }> }) {
  const ctx = await tenantAdmin((await params).host);
  const locale = ctx.user.locale;

  const sections = await ctx.db.sections.findMany({
    where: { type: { in: ['PAGE', 'TRUSTEE_BOARD', 'ANTICORRUPTION'] } },
    orderBy: { position: 'asc' },
    include: { page: true },
  });

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {sections.length === 0 ? (
        <EmptyState
          icon="📝"
          title={T.empty[locale]}
          description={T.emptyHint[locale]}
          action={<Link href="/admin/sections" className="btn-primary mt-2">{T.openSections[locale]}</Link>}
        />
      ) : (
        <div className="card divide-y divide-line">
          {sections.map((section) => {
            const preview = toPlainText(pick(locale, section.page?.bodyKk, section.page?.bodyRu), 120);
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
                  <span className="block font-semibold">{pick(locale, section.titleKk, section.titleRu)}</span>
                  <span className="block truncate text-sm text-muted">
                    {preview || T.blank[locale]}
                  </span>
                </span>
                <span className="text-sm font-semibold text-brand">{T.edit[locale]}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
