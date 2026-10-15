import type { Locale } from '@/lib/i18n';
import type { TenantScope } from '@/server/db/scope';
import {
  ANTICORRUPTION_KEYS,
  resolveUsefulLinks,
  type UsefulIcon,
  type UsefulLinkRow,
} from '@/lib/useful-links';
import { mediaUrl } from './blocks';

const T = {
  title: { kk: 'Пайдалы сілтемелер', ru: 'Полезные ссылки' },
} as const;

/** Одноцветные значки плиток: свои, без гербов и логотипов госорганов. */
const ICONS: Record<UsefulIcon, string> = {
  building: '<path d="M3 21h18M4 10h16M12 3 4 7v3h16V7z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  egov: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7.5 10.5l3 3 6-6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  scales: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
  phone:
    '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z"/><path d="M9 12l2 2 4-4"/>',
  school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};

/**
 * «Полезные ссылки» сада — плитки госресурсов перед подвалом. Каталог —
 * src/lib/useful-links.ts, выбор сада — таблица UsefulLink, админка —
 * «Полезные ссылки». Вставляется самими страницами перед ThemedFooter,
 * поэтому работает и в шаблонах, и в индивидуальных темах.
 *
 * where: home — главная (блок есть всегда, если сад что-то выбрал);
 * page — остальные страницы (только если сад выбрал «на всех страницах»);
 * anticorruption — страница «Противодействие коррупции»: её плитки
 * показываются всегда, даже если сад их не отмечал.
 */
export async function UsefulLinks({
  db,
  place,
  locale,
  where,
}: {
  db: TenantScope;
  /** Tenant.usefulLinksPlace. */
  place: string;
  locale: Locale;
  where: 'home' | 'page' | 'anticorruption';
}) {
  const showSelected = where === 'home' || place === 'all';
  if (!showSelected && where !== 'anticorruption') return null;

  const saved = showSelected
    ? await db.usefulLinks.findMany({ orderBy: { position: 'asc' }, include: { media: true } })
    : [];
  const rows: UsefulLinkRow[] = saved.map((row) => ({ ...row, mediaSrc: mediaUrl(row.media) }));

  if (where === 'anticorruption') {
    const present = new Set(rows.map((row) => row.catalogKey));
    const missing = ANTICORRUPTION_KEYS.filter((key) => !present.has(key)).map(
      (key): UsefulLinkRow => ({
        id: `catalog-${key}`, catalogKey: key, titleKk: null, titleRu: null,
        noteKk: null, noteRu: null, url: null, mediaSrc: null,
      }),
    );
    rows.unshift(...missing);
  }

  const links = resolveUsefulLinks(rows, locale);
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="useful-links-title" className="useful-links container-page mb-10 mt-12">
      <h2 id="useful-links-title" className="font-display text-xl font-extrabold">{T.title[locale]}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={link.id}>
            {/* Баннер, как на сайтах госорганизаций: цвет — по группе (useful-banner в globals.css),
                у телефона номер крупно, как на плакате. Картинка — только у своего баннера сада. */}
            <a
              href={link.href}
              data-tone={link.tone}
              {...(link.isPhone ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="useful-banner flex h-full min-h-[5.25rem] items-center gap-4 rounded-2xl px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.number ? (
                <span className="shrink-0 font-display text-3xl font-extrabold leading-none tracking-tight">{link.number}</span>
              ) : link.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.image} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: ICONS[link.icon] }}
                />
              )}
              <span className="min-w-0">
                <span className="block font-bold leading-snug">{link.title}</span>
                {link.note ? <span className="useful-banner-note mt-0.5 block text-sm">{link.note}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
