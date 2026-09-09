import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { SECTION_CATALOG, sectionMeta } from '@/lib/sections';
import { pick } from '@/lib/i18n';
import { addSection, moveSection, renameSection, toggleSection } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Мәзір бөлімдері', ru: 'Разделы меню' },
  lead: {
    kk: 'Қажет бөлімдерді қосыңыз, ретін және атауын өзгертіңіз. Жасырылған бөлім сайт мәзірінен жоғалады.',
    ru: 'Включайте нужные разделы, меняйте их порядок и названия. Скрытый раздел исчезает из меню сайта.',
  },
  nameRu: { kk: 'Атауы орысша', ru: 'Название по-русски' },
  nameKk: { kk: 'Атауы қазақша', ru: 'Название по-казахски' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  up: { kk: 'Жоғары', ru: 'Выше' },
  down: { kk: 'Төмен', ru: 'Ниже' },
  hide: { kk: 'Жасыру', ru: 'Скрыть' },
  show: { kk: 'Көрсету', ru: 'Показать' },
  addHeading: { kk: 'Бөлім қосу', ru: 'Добавить раздел' },
  add: { kk: 'Қосу', ru: 'Добавить' },
} as const;

export default async function SectionsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [sections, csrf] = await Promise.all([
    ctx.db.sections.findMany({ where: { parentId: null }, orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  const existing = new Set(sections.map((s) => s.slug));
  const available = SECTION_CATALOG.filter((meta) => !existing.has(meta.slug));

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
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
                    aria-label={T.nameRu[locale]}
                    disabled={!ctx.canEdit}
                  />
                  <input
                    name="titleKk"
                    defaultValue={section.titleKk}
                    className="field min-w-40 flex-1"
                    aria-label={T.nameKk[locale]}
                    disabled={!ctx.canEdit}
                  />
                  {ctx.canEdit ? (
                    <button type="submit" className="btn-secondary text-sm">{T.save[locale]}</button>
                  ) : null}
                </form>

                {ctx.canEdit ? (
                  <div className="flex items-center gap-1">
                    <MoveButton csrf={csrf} host={host} id={section.id} direction="up" disabled={index === 0} label={T.up[locale]} symbol="↑" />
                    <MoveButton csrf={csrf} host={host} id={section.id} direction="down" disabled={index === sections.length - 1} label={T.down[locale]} symbol="↓" />
                    <form action={toggleSection}>
                      <input type="hidden" name={CSRF_FIELD} value={csrf} />
                      <input type="hidden" name="host" value={host} />
                      <input type="hidden" name="id" value={section.id} />
                      <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
                        {section.isVisible ? T.hide[locale] : T.show[locale]}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>

              <p className="mt-2 pl-13 text-sm text-muted">
                <code className="rounded bg-brand-soft px-1.5 py-0.5 text-xs">/{section.slug}</code>{' '}
                {pick(locale, meta?.hintKk, meta?.hintRu)}
              </p>
            </div>
          );
        })}
      </div>

      {ctx.canEdit && available.length > 0 ? (
        <section className="card mt-8 p-6">
          <h2 className="font-display text-lg font-bold">{T.addHeading[locale]}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {available.map((meta) => (
              <form key={meta.slug} action={addSection} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="host" value={host} />
                <input type="hidden" name="slug" value={meta.slug} />
                <span className="text-xl" aria-hidden>{meta.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{pick(locale, meta.titleKk, meta.titleRu)}</span>
                  <span className="block text-xs text-muted">{pick(locale, meta.hintKk, meta.hintRu)}</span>
                </span>
                <button type="submit" className="btn-secondary text-sm">{T.add[locale]}</button>
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
