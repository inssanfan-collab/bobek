import { tenantAdmin } from '@/server/tenant/admin-context';
import { flattenTree, indentLabel } from '@/lib/doc-tree';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { ActionForm } from '@/components/ActionForm';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import {
  canDeleteSection, CUSTOM_KINDS, SECTION_CATALOG, sectionMeta, sectionSettings,
} from '@/lib/sections';
import { pick, type Locale } from '@/lib/i18n';
import type { Section } from '@prisma/client';
import { addSection, deleteSection, moveSection, toggleSection, updateSection } from '../actions';
import { NewSectionForm } from './NewSectionForm';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Мәзір бөлімдері', ru: 'Разделы меню' },
  lead: {
    kk: 'Сайт мәзірін өзіңіз жинайсыз: бөлімдерді қосыңыз, атауын, мекенжайын және ретін өзгертіңіз, бірін екіншісінің ішіне салыңыз.',
    ru: 'Меню сайта вы собираете сами: добавляйте разделы, меняйте названия, адреса и порядок, вкладывайте один раздел в другой.',
  },
  up: { kk: 'Жоғары', ru: 'Выше' },
  down: { kk: 'Төмен', ru: 'Ниже' },
  hide: { kk: 'Жасыру', ru: 'Скрыть' },
  show: { kk: 'Көрсету', ru: 'Показать' },
  hidden: { kk: 'жасырылған', ru: 'скрыт' },
  custom: { kk: 'өз бөлімі', ru: 'свой раздел' },
  configure: { kk: 'Баптау', ru: 'Настроить' },
  openOnSite: { kk: 'Сайтта ашу ↗', ru: 'Открыть на сайте ↗' },

  titleRu: { kk: 'Атауы орысша', ru: 'Название по-русски' },
  titleKk: { kk: 'Атауы қазақша', ru: 'Название по-казахски' },
  slug: { kk: 'Мекенжайы', ru: 'Адрес' },
  slugWarn: {
    kk: 'Мекенжайды өзгертсеңіз, ескі сілтемелер мен бетбелгілер жұмыс істемей қалады.',
    ru: 'Если сменить адрес, старые ссылки и закладки на раздел перестанут работать.',
  },
  place: { kk: 'Мәзірдегі орны', ru: 'Где в меню' },
  topLevel: { kk: 'Басты мәзірде', ru: 'В главном меню' },
  inside: { kk: 'Ішінде: %s', ru: 'Внутри: %s' },
  hasChildren: {
    kk: 'Бұл бөлімнің ішкі бөлімдері бар, сондықтан ол басты мәзірде қалады.',
    ru: 'В этом разделе есть вложенные, поэтому он остаётся в главном меню.',
  },
  folder: { kk: 'Құжаттар бумасы', ru: 'Папка с документами' },
  url: { kk: 'Сілтеме мекенжайы', ru: 'Адрес ссылки' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },

  deleteHeading: { kk: 'Бөлімді жою', ru: 'Удалить раздел' },
  deletePage: {
    kk: 'Беттің мәтіні де жойылады. Ішкі бөлімдер басты мәзірге көтеріледі.',
    ru: 'Текст страницы тоже будет удалён. Вложенные разделы поднимутся в главное меню.',
  },
  deleteFolder: {
    kk: 'Мәзір тармағы ғана жойылады — буманың құжаттары орнында қалады.',
    ru: 'Удалится только пункт меню — документы папки останутся на месте.',
  },
  deleteLink: { kk: 'Мәзір тармағы жойылады.', ru: 'Пункт меню будет удалён.' },
  confirm: { kk: 'Иә, бұл бөлімді жою', ru: 'Да, удалить этот раздел' },
  delete: { kk: 'Жою', ru: 'Удалить' },
  cannotDelete: {
    kk: 'Бұл бөлімді жоюға болмайды — онымен бірге барлық жазбалар жоғалады. Қажет болмаса, жасырыңыз.',
    ru: 'Этот раздел удалить нельзя — вместе с ним пропадут все его записи. Если он не нужен, скройте его.',
  },

  standardHeading: { kk: 'Стандартты бөлімдер', ru: 'Стандартные разделы' },
  standardLead: {
    kk: 'Мектепке дейінгі ұйым сайтына әдетте қажет бөлімдер. Әрқайсысын бір рет қосуға болады.',
    ru: 'Разделы, которые обычно нужны сайту дошкольной организации. Каждый добавляется один раз.',
  },
  add: { kk: 'Қосу', ru: 'Добавить' },
} as const;

type Row = Section & { children: Section[] };

export default async function SectionsPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [all, folders, csrf] = await Promise.all([
    ctx.db.sections.findMany({ orderBy: { position: 'asc' } }),
    ctx.db.docFolders.findMany({ orderBy: { position: 'asc' } }),
    csrfToken(),
  ]);

  const rows: Row[] = all
    .filter((section) => !section.parentId)
    .map((section) => ({ ...section, children: all.filter((child) => child.parentId === section.id) }));

  // Раздел, чей родитель по какой-то причине не нашёлся, не должен пропасть из списка.
  const orphans = all.filter((section) => section.parentId && !all.some((p) => p.id === section.parentId));
  for (const orphan of orphans) rows.push({ ...orphan, children: [] });

  const existing = new Set(all.map((s) => s.slug));
  const available = SECTION_CATALOG.filter((meta) => !existing.has(meta.slug));

  // Во что можно вложить: только разделы верхнего уровня, кроме ссылок.
  const parentOptions = rows
    .filter((row) => !row.parentId && row.type !== 'LINK')
    .map((row) => ({ id: row.id, label: pick(locale, row.titleKk, row.titleRu) }));
  // Папки вложенные — в списке они идут деревом, с отступом по глубине.
  const folderOptions = flattenTree(folders).map(({ folder, depth }) => ({
    id: folder.id,
    label: indentLabel(pick(locale, folder.titleKk, folder.titleRu), depth),
  }));

  const siteBase = `https://${ctx.primaryHost}`;

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id}>
            <SectionCard
              section={row}
              siblingsCount={rows.length}
              index={index}
              hasChildren={row.children.length > 0}
              parentOptions={parentOptions}
              folderOptions={folderOptions}
              csrf={csrf}
              host={host}
              locale={locale}
              canEdit={ctx.canEdit}
              siteBase={siteBase}
            />
            {row.children.length > 0 ? (
              <div className="ml-6 mt-2 space-y-2 border-l-2 border-line pl-4">
                {row.children.map((child, childIndex) => (
                  <SectionCard
                    key={child.id}
                    section={child}
                    siblingsCount={row.children.length}
                    index={childIndex}
                    hasChildren={false}
                    parentOptions={parentOptions}
                    folderOptions={folderOptions}
                    csrf={csrf}
                    host={host}
                    locale={locale}
                    canEdit={ctx.canEdit}
                    siteBase={siteBase}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {ctx.canEdit ? (
        <NewSectionForm csrf={csrf} host={host} locale={locale} parents={parentOptions} folders={folderOptions} />
      ) : null}

      {ctx.canEdit && available.length > 0 ? (
        <section className="card mt-8 p-6">
          <h2 className="font-display text-lg font-bold">{T.standardHeading[locale]}</h2>
          <p className="mt-1 text-sm text-muted">{T.standardLead[locale]}</p>
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

function SectionCard({
  section, siblingsCount, index, hasChildren, parentOptions, folderOptions,
  csrf, host, locale, canEdit, siteBase,
}: {
  section: Section;
  siblingsCount: number;
  index: number;
  hasChildren: boolean;
  parentOptions: { id: string; label: string }[];
  folderOptions: { id: string; label: string }[];
  csrf: string;
  host: string;
  locale: Locale;
  canEdit: boolean;
  siteBase: string;
}) {
  const settings = sectionSettings(section.settings);
  const meta = sectionMeta(section.type, section.slug);
  const kind = settings.custom
    ? CUSTOM_KINDS.find((item) => item.type === section.type)
    : section.type === 'LINK'
      ? CUSTOM_KINDS.find((item) => item.kind === 'link')
      : undefined;
  const icon = kind?.icon ?? meta?.icon ?? '📄';
  const hint = settings.custom ? kind?.hint[locale] : pick(locale, meta?.hintKk, meta?.hintRu);
  const isLink = section.type === 'LINK';
  const isFolderSection = section.type === 'DOCUMENTS' && settings.custom;
  const deletable = canDeleteSection(section);
  const siteHref = isLink ? settings.url ?? '#' : `${siteBase}/${section.slug}`;

  return (
    <div className={`card p-4 ${section.isVisible ? '' : 'opacity-70'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {pick(locale, section.titleKk, section.titleRu)}
            {settings.custom ? <span className="badge ml-2 bg-brand-soft text-xs text-brand-ink">{T.custom[locale]}</span> : null}
            {!section.isVisible ? <span className="badge ml-2 bg-slate-100 text-xs text-slate-600">{T.hidden[locale]}</span> : null}
          </p>
          <p className="truncate text-sm text-muted">
            <code className="rounded bg-brand-soft px-1.5 py-0.5 text-xs">{isLink ? settings.url : `/${section.slug}`}</code>
            {hint ? <> · {hint}</> : null}
          </p>
        </div>

        {canEdit ? (
          <div className="flex items-center gap-1">
            <MoveButton csrf={csrf} host={host} id={section.id} direction="up" disabled={index === 0} label={T.up[locale]} symbol="↑" />
            <MoveButton csrf={csrf} host={host} id={section.id} direction="down" disabled={index === siblingsCount - 1} label={T.down[locale]} symbol="↓" />
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

      {canEdit ? (
        <details className="group mt-3 rounded-2xl border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold">
            <span>{T.configure[locale]}</span>
            <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>▾</span>
          </summary>

          <div className="space-y-5 border-t border-line p-4">
            <ActionForm action={updateSection} className="space-y-4">
              <input type="hidden" name={CSRF_FIELD} value={csrf} />
              <input type="hidden" name="host" value={host} />
              <input type="hidden" name="id" value={section.id} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor={`ru-${section.id}`}>{T.titleRu[locale]}</label>
                  <input id={`ru-${section.id}`} name="titleRu" required maxLength={80} defaultValue={section.titleRu} className="field" />
                </div>
                <div>
                  <label className="field-label" htmlFor={`kk-${section.id}`}>{T.titleKk[locale]}</label>
                  <input id={`kk-${section.id}`} name="titleKk" maxLength={80} defaultValue={section.titleKk} className="field" />
                </div>
              </div>

              {isLink ? (
                <div>
                  <label className="field-label" htmlFor={`url-${section.id}`}>{T.url[locale]}</label>
                  <input id={`url-${section.id}`} name="url" required inputMode="url" defaultValue={settings.url ?? ''} className="field" />
                  <input type="hidden" name="slug" value={section.slug} />
                </div>
              ) : (
                <div>
                  <label className="field-label" htmlFor={`slug-${section.id}`}>{T.slug[locale]}</label>
                  <div className="flex items-center gap-1">
                    <span className="text-muted">/</span>
                    <input id={`slug-${section.id}`} name="slug" required maxLength={60} defaultValue={section.slug} className="field font-mono text-sm" />
                  </div>
                  <p className="mt-1 text-xs text-muted">{T.slugWarn[locale]}</p>
                </div>
              )}

              {isFolderSection ? (
                <div>
                  <label className="field-label" htmlFor={`folder-${section.id}`}>{T.folder[locale]}</label>
                  <select id={`folder-${section.id}`} name="folderId" required defaultValue={settings.folderId ?? ''} className="field">
                    {folderOptions.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.label}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="field-label" htmlFor={`parent-${section.id}`}>{T.place[locale]}</label>
                {hasChildren ? (
                  <>
                    <input type="hidden" name="parentId" value="" />
                    <p className="text-sm text-muted">{T.hasChildren[locale]}</p>
                  </>
                ) : (
                  <select id={`parent-${section.id}`} name="parentId" defaultValue={section.parentId ?? ''} className="field">
                    <option value="">{T.topLevel[locale]}</option>
                    {parentOptions
                      .filter((option) => option.id !== section.id)
                      .map((option) => (
                        <option key={option.id} value={option.id}>{T.inside[locale].replace('%s', option.label)}</option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SubmitButton>{T.save[locale]}</SubmitButton>
                <a href={siteHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand">
                  {T.openOnSite[locale]}
                </a>
              </div>
            </ActionForm>

            <div className="border-t border-line pt-4">
              {deletable ? (
                <ActionForm action={deleteSection} className="space-y-3">
                  <input type="hidden" name={CSRF_FIELD} value={csrf} />
                  <input type="hidden" name="host" value={host} />
                  <input type="hidden" name="id" value={section.id} />
                  <p className="text-sm font-semibold">{T.deleteHeading[locale]}</p>
                  <p className="text-sm text-muted">
                    {isLink ? T.deleteLink[locale] : isFolderSection ? T.deleteFolder[locale] : T.deletePage[locale]}
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="confirm" className="h-4 w-4" />
                    {T.confirm[locale]}
                  </label>
                  <button type="submit" className="btn-ghost text-sm text-red-700 hover:bg-red-50">{T.delete[locale]}</button>
                </ActionForm>
              ) : (
                <p className="text-sm text-muted">{T.cannotDelete[locale]}</p>
              )}
            </div>
          </div>
        </details>
      ) : null}
    </div>
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
