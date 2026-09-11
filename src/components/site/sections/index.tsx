import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { formatAgeRange, formatDate, formatDocCount } from '@/lib/labels';
import { mediaUrl, type AlbumWithCover, type PostWithCover } from '@/components/site/blocks';
import { EmptyState } from '@/components/ui/EmptyState';
import { UiIcon } from '@/components/site/UiIcon';
import type {
  Club, Document, DocumentFolder, FaqItem, Group, Media, MenuDay, StaffMember, TenantProfile,
} from '@prisma/client';

const T = {
  empty: { kk: 'Мазмұн әзірге қосылмаған', ru: 'Материалы пока не добавлены' },
  emptyHint: {
    kk: 'Бөлім толтырылу үстінде. Кейінірек қараңыз.',
    ru: 'Раздел пока заполняется. Загляните позже.',
  },
  download: { kk: 'Жүктеу', ru: 'Скачать' },
  free: { kk: 'Бос орын', ru: 'Свободно мест' },
  total: { kk: 'Барлық орын', ru: 'Всего мест' },
  teachers: { kk: 'Тәрбиешілер', ru: 'Воспитатели' },
  language: { kk: 'Оқыту тілі', ru: 'Язык обучения' },
  breakfast: { kk: 'Таңғы ас', ru: 'Завтрак' },
  lunch: { kk: 'Түскі ас', ru: 'Обед' },
  snack: { kk: 'Бесін ас', ru: 'Полдник' },
  dinner: { kk: 'Кешкі ас', ru: 'Ужин' },
  photos: { kk: 'сурет', ru: 'фото' },
  noPrice: { kk: 'Тегін', ru: 'Бесплатно' },
  perMonth: { kk: 'айына', ru: 'в месяц' },
  teacher: { kk: 'Жетекші', ru: 'Ведёт' },
  schedule: { kk: 'Кесте', ru: 'Расписание' },
  age: { kk: 'Жасы', ru: 'Возраст' },
} as const;

export function Empty({ locale }: { locale: Locale }) {
  return <EmptyState icon="🌱" title={T.empty[locale]} description={T.emptyHint[locale]} />;
}

export function PostFeed({
  posts,
  locale,
  basePath,
}: {
  posts: PostWithCover[];
  locale: Locale;
  basePath: string;
}) {
  if (posts.length === 0) return <Empty locale={locale} />;

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const cover = mediaUrl(post.coverMedia);
        return (
          <article key={post.id} className="card flex flex-col gap-4 p-5 sm:flex-row">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-40 w-full shrink-0 rounded-2xl object-cover sm:w-56" loading="lazy" />
            ) : null}
            <div className="min-w-0">
              <p className="text-sm text-muted">{formatDate(post.publishedAt, locale)}</p>
              <h2 className="mt-1 font-display text-xl font-bold">
                <Link href={withLocale(`${basePath}/${post.slug}`, locale)} className="hover:text-brand">
                  {pick(locale, post.titleKk, post.titleRu)}
                </Link>
              </h2>
              {pick(locale, post.excerptKk, post.excerptRu) ? (
                <p className="mt-2 text-muted">{pick(locale, post.excerptKk, post.excerptRu)}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function StaffList({ staff, locale }: { staff: (StaffMember & { photo: Media | null })[]; locale: Locale }) {
  if (staff.length === 0) return <Empty locale={locale} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {staff.map((member) => {
        const photo = mediaUrl(member.photo);
        return (
          <article key={member.id} className="card p-5 text-center">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="mx-auto h-28 w-28 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand-soft text-3xl" aria-hidden>
                👩‍🏫
              </div>
            )}
            <h2 className="mt-4 font-display text-lg font-bold">{member.fullName}</h2>
            <p className="text-sm font-semibold text-brand">{pick(locale, member.positionKk, member.positionRu)}</p>
            {pick(locale, member.educationKk, member.educationRu) ? (
              <p className="mt-2 text-sm text-muted">{pick(locale, member.educationKk, member.educationRu)}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
              {member.experience ? <span className="badge bg-brand-soft text-brand-ink">{member.experience}</span> : null}
              {member.categoryName ? <span className="badge bg-brand-soft text-brand-ink">{member.categoryName}</span> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function GroupList({ groups, locale }: { groups: Group[]; locale: Locale }) {
  if (groups.length === 0) return <Empty locale={locale} />;

  const LANGS: Record<string, string> = { kk: 'Қазақша', ru: 'Русский', mixed: 'Смешанная' };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <article key={group.id} className="card p-5">
          <h2 className="font-display text-lg font-bold">{pick(locale, group.nameKk, group.nameRu)}</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {formatAgeRange(group.ageFrom, group.ageTo, locale) ? (
              <div className="flex gap-2">
                <dt className="text-muted">{locale === 'kk' ? 'Жасы' : 'Возраст'}:</dt>
                <dd>{formatAgeRange(group.ageFrom, group.ageTo, locale)}</dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="text-muted">{T.language[locale]}:</dt>
              <dd>{LANGS[group.language] ?? group.language}</dd>
            </div>
            {group.teachers ? (
              <div className="flex gap-2">
                <dt className="text-muted">{T.teachers[locale]}:</dt>
                <dd>{group.teachers}</dd>
              </div>
            ) : null}
            {group.placesTotal ? (
              <div className="flex gap-2">
                <dt className="text-muted">{T.total[locale]}:</dt>
                <dd>{group.placesTotal}</dd>
              </div>
            ) : null}
          </dl>
          {group.placesFree > 0 ? (
            <p className="badge mt-3 bg-emerald-100 text-emerald-800">
              {T.free[locale]}: {group.placesFree}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

type DocWithMedia = Document & { media: Media };

function DocRows({ items, locale }: { items: DocWithMedia[]; locale: Locale }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((doc) => (
        <li key={doc.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
          <UiIcon name="file" className="h-6 w-6 shrink-0 text-brand-ink" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{pick(locale, doc.titleKk, doc.titleRu)}</span>
            <span className="block text-sm text-muted">
              {formatDate(doc.publishedAt, locale)} · {Math.max(1, Math.round(doc.media.size / 1024))} КБ
            </span>
          </span>
          <a href={`/api/media/${doc.mediaId}?download=1`} className="btn-secondary text-sm">
            {T.download[locale]}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Документы разложены по папкам сада и свёрнуты: у иных садов их полторы сотни,
 * и сплошной список читать невозможно. Сворачивание сделано на <details> —
 * работает без JavaScript, открывается с клавиатуры, а браузерный поиск
 * по странице сам раскрывает нужную папку.
 */
export function DocumentList({
  folders,
  documents,
  locale,
}: {
  folders: DocumentFolder[];
  documents: DocWithMedia[];
  locale: Locale;
}) {
  if (documents.length === 0) return <Empty locale={locale} />;

  const byFolder = new Map<string, DocWithMedia[]>();
  const loose: DocWithMedia[] = [];
  for (const doc of documents) {
    if (!doc.folderId) {
      loose.push(doc);
      continue;
    }
    const list = byFolder.get(doc.folderId) ?? [];
    list.push(doc);
    byFolder.set(doc.folderId, list);
  }

  const filled = folders.filter((folder) => (byFolder.get(folder.id)?.length ?? 0) > 0);
  // Единственную папку прятать незачем — раскрываем сразу.
  const openByDefault = filled.length === 1;

  return (
    <div className="space-y-3">
      {filled.map((folder) => {
        const items = byFolder.get(folder.id) ?? [];
        return (
          <details key={folder.id} id={`doc-${folder.id}`} className="card group overflow-hidden" open={openByDefault}>
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 font-display text-lg font-bold sm:px-5">
              <UiIcon name="folder" className="h-6 w-6 shrink-0 text-brand-ink" />
              <span className="min-w-0 flex-1">{pick(locale, folder.titleKk, folder.titleRu)}</span>
              <span className="hidden text-sm font-normal text-muted sm:inline">
                {formatDocCount(items.length, locale)}
              </span>
              <UiIcon name="chevron" className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-line">
              <DocRows items={items} locale={locale} />
            </div>
          </details>
        );
      })}

      {loose.length > 0 ? (
        <div className="card overflow-hidden">
          <DocRows items={loose} locale={locale} />
        </div>
      ) : null}
    </div>
  );
}

export function MenuTable({ days, locale }: { days: MenuDay[]; locale: Locale }) {
  if (days.length === 0) return <Empty locale={locale} />;

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <article key={day.id} className="card p-5">
          <h2 className="font-display text-lg font-bold">{formatDate(day.date, locale)}</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Meal label={T.breakfast[locale]} value={pick(locale, day.breakfastKk, day.breakfastRu)} />
            <Meal label={T.lunch[locale]} value={pick(locale, day.lunchKk, day.lunchRu)} />
            <Meal label={T.snack[locale]} value={pick(locale, day.snackKk, day.snackRu)} />
            <Meal label={T.dinner[locale]} value={pick(locale, day.dinnerKk, day.dinnerRu)} />
          </dl>
          {day.scanMediaId ? (
            <a href={`/api/media/${day.scanMediaId}`} className="btn-ghost mt-3 text-sm" target="_blank" rel="noreferrer">
              {locale === 'kk' ? 'Бекітілген мәзір' : 'Утверждённое меню'} →
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function Meal({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-brand-soft/50 p-3">
      <dt className="text-sm font-semibold text-brand-ink">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export function AlbumGrid({
  albums,
  locale,
  basePath,
}: {
  albums: (AlbumWithCover & { _count?: { items: number } })[];
  locale: Locale;
  basePath: string;
}) {
  if (albums.length === 0) return <Empty locale={locale} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => {
        const cover = mediaUrl(album.items[0]?.media);
        return (
          <Link key={album.id} href={withLocale(`${basePath}/${album.slug}`, locale)} className="card group overflow-hidden">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-48 w-full object-cover transition group-hover:scale-[1.02]" loading="lazy" />
            ) : (
              <div className="h-48 bg-brand-soft" aria-hidden />
            )}
            <div className="p-4">
              <p className="font-display font-bold group-hover:text-brand">{pick(locale, album.titleKk, album.titleRu)}</p>
              <p className="mt-0.5 text-sm text-muted">
                {album.takenOn ? `${formatDate(album.takenOn, locale)} · ` : ''}
                {album._count?.items ?? album.items.length} {T.photos[locale]}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function VacanciesBlock({
  profile,
  groups,
  locale,
}: {
  profile: TenantProfile | null;
  groups: Group[];
  locale: Locale;
}) {
  const withFree = groups.filter((g) => g.placesFree > 0);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="text-sm text-muted">{locale === 'kk' ? 'Барлығы бос орын' : 'Всего свободных мест'}</p>
        <p className="font-display text-4xl font-extrabold">{profile?.placesFree ?? 0}</p>
        <p className="mt-2 text-sm text-muted">
          {locale === 'kk'
            ? 'Кезекке тұру — Darabala.kz порталы арқылы.'
            : 'Постановка в очередь — через портал Darabala.kz.'}
        </p>
        <a
          href="https://darabala.kz"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4 text-sm"
        >
          {locale === 'kk' ? 'Нұсқаулық' : 'Как встать в очередь'} →
        </a>
      </div>

      {withFree.length > 0 ? <GroupList groups={withFree} locale={locale} /> : null}
    </div>
  );
}


export function ClubList({ clubs, locale }: { clubs: Club[]; locale: Locale }) {
  if (clubs.length === 0) return <Empty locale={locale} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {clubs.map((club) => (
        <article key={club.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-lg font-bold">{pick(locale, club.nameKk, club.nameRu)}</h2>
            {club.isFree || club.priceKzt == null ? (
              <span className="badge bg-emerald-100 text-emerald-800">{T.noPrice[locale]}</span>
            ) : (
              <span className="badge bg-brand-soft text-brand-ink">
                {club.priceKzt.toLocaleString('ru-RU')} ₸ / {T.perMonth[locale]}
              </span>
            )}
          </div>

          {pick(locale, club.descKk, club.descRu) ? (
            <p className="mt-2 text-muted">{pick(locale, club.descKk, club.descRu)}</p>
          ) : null}

          <dl className="mt-3 space-y-1 text-sm">
            {club.teacher ? (
              <div className="flex gap-2">
                <dt className="text-muted">{T.teacher[locale]}:</dt>
                <dd>{club.teacher}</dd>
              </div>
            ) : null}
            {club.schedule ? (
              <div className="flex gap-2">
                <dt className="text-muted">{T.schedule[locale]}:</dt>
                <dd>{club.schedule}</dd>
              </div>
            ) : null}
            {club.ageRange ? (
              <div className="flex gap-2">
                <dt className="text-muted">{T.age[locale]}:</dt>
                <dd>{club.ageRange}</dd>
              </div>
            ) : null}
          </dl>
        </article>
      ))}
    </div>
  );
}

export function FaqList({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  if (items.length === 0) return <Empty locale={locale} />;

  return (
    <div className="max-w-3xl space-y-3">
      {items.map((item) => (
        // <details> вместо скрипта: работает без JavaScript и доступно с клавиатуры.
        <details key={item.id} className="card group p-5">
          <summary className="cursor-pointer list-none font-display text-lg font-bold marker:hidden">
            <span className="mr-2 text-brand" aria-hidden>+</span>
            {pick(locale, item.questionKk, item.questionRu)}
          </summary>
          {pick(locale, item.answerKk, item.answerRu) ? (
            <p className="mt-3 whitespace-pre-line text-muted">
              {pick(locale, item.answerKk, item.answerRu)}
            </p>
          ) : null}
        </details>
      ))}
    </div>
  );
}
