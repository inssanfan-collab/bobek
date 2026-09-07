import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { SECTION_CATALOG, sectionMeta } from '@/lib/sections';
import { addSection, moveSection, renameSection, toggleSection } from '../actions';

export const dynamic = 'force-dynamic';

export default async function SectionsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);

  const [sections, csrf] = await Promise.all([
    ctx.db.sections.findMany({ where: { parentId: null }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  const existing = new Set(sections.map((s) => s.slug));
  const available = SECTION_CATALOG.filter((meta) => !existing.has(meta.slug));

  return (
    <>
      <PageHeader
        title="Разделы меню"
        description="Включайте нужные разделы, меняйте их порядок и названия. Скрытый раздел исчезает из меню сайта."
      />

      <div className="space-y-3">
        {sections.map((section, index) => {
          const meta = sectionMeta(section.type, section.slug);
          return (
            <div key={section.id} className={`card p-4 ${section.isVisible ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl" aria-hidden>
                  {meta?.icon ?? '📄'}
                </span>

                <form action={renameSection} className="flex min-w-0 flex-1 flex-wrap gap-2">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={section.id} />
                  <input
                    name="titleRu"
                    defaultValue={section.titleRu}
                    className="field min-w-40 flex-1"
                    aria-label="Название по-русски"
                    disabled={!ctx.canEdit}
                  />
                  <input
                    name="titleKk"
                    defaultValue={section.titleKk}
                    className="field min-w-40 flex-1"
                    aria-label="Название по-казахски"
                    disabled={!ctx.canEdit}
                  />
                  {ctx.canEdit ? (
                    <button type="submit" className="btn-secondary text-sm">Сохранить</button>
                  ) : null}
                </form>

                {ctx.canEdit ? (
                  <div className="flex items-center gap-1">
                    <MoveButton csrf={csrf} host={host} id={section.id} direction="up" disabled={index === 0} label="Выше" symbol="↑" />
                    <MoveButton csrf={csrf} host={host} id={section.id} direction="down" disabled={index === sections.length - 1} label="Ниже" symbol="↓" />
                    <form action={toggleSection}>
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="host" value={host} />
                      <input type="hidden" name="id" value={section.id} />
                      <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                        {section.isVisible ? 'Скрыть' : 'Показать'}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>

              <p className="mt-2 pl-13 text-sm text-muted">
                <code className="rounded bg-brand-soft px-1.5 py-0.5 text-xs">/{section.slug}</code>{' '}
                {meta?.hintRu}
              </p>
            </div>
          );
        })}
      </div>

      {ctx.canEdit && available.length > 0 ? (
        <section className="card mt-8 p-6">
          <h2 className="font-display text-lg font-bold">Добавить раздел</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {available.map((meta) => (
              <form key={meta.slug} action={addSection} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="host" value={host} />
                <input type="hidden" name="slug" value={meta.slug} />
                <span className="text-xl" aria-hidden>{meta.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{meta.titleRu}</span>
                  <span className="block text-xs text-muted">{meta.hintRu}</span>
                </span>
                <button type="submit" className="btn-secondary text-sm">Добавить</button>
              </form>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function MoveButton({
  csrf, host, id, direction, disabled, label, symbol,
}: {
  csrf: string;
  host: string;
  id: string;
  direction: 'up' | 'down';
  disabled: boolean;
  label: string;
  symbol: string;
}) {
  return (
    <form action={moveSection}>
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="host" value={host} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} className="btn-ghost px-2.5 py-1.5 text-sm" title={label} aria-label={label}>
        {symbol}
      </button>
    </form>
  );
}
