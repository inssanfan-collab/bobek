import Link from 'next/link';
import { pick, type Locale } from '@/lib/i18n';
import { withLocale } from '@/server/tenant/context';
import { formatAgeRange, formatDate, formatDocCount, formatFolderCount } from '@/lib/labels';
import { childrenByParent, deepDocCounts, folderPath, subtreeIds } from '@/lib/doc-tree';
import { mediaUrl, type AlbumWithCover, type PostWithCover } from '@/components/site/blocks';
import { EmptyState } from '@/components/ui/EmptyState';
import { UiIcon } from '@/components/site/UiIcon';
import { isOfficeDoc } from '@/lib/media-kind';
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
  openDoc: { kk: 'Ашу', ru: 'Открыть' },
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
  path: { kk: 'Бумаға апаратын жол', ru: 'Путь к папке' },
  up: { kk: 'Бір деңгей жоғары', ru: 'На уровень выше' },
  folderEmpty: { kk: 'Бұл бумада әзірге құжат жоқ.', ru: 'В этой папке пока нет документов.' },
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
              // Кружок на обложке: в списке должно быть видно, что внутри ролик,
              // а не только текст.
              <span className="relative block h-40 w-full shrink-0 sm:w-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="h-full w-full rounded-2xl object-cover" loading="lazy" />
                {post.videoUrl ? (
                  <span className="absolute inset-0 grid place-items-center" aria-hidden>
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/85 shadow-soft">
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-brand-ink">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                ) : null}
              </span>
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
              // Портрет намеренно без увеличения: это подпись к карточке,
              // а не снимок, который приходят разглядывать.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={member.fullName}
                className="mx-auto h-28 w-28 rounded-full object-cover"
                loading="lazy"
              />
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
          {/* Сначала открыть, а не скачать: родитель обычно хочет прочитать
              правила приёма, а не завести их в папке «Загрузки». PDF браузер
              покажет сам; Word и Excel он открыть не умеет и всё равно
              скачает — поэтому отдельная кнопка «Скачать» остаётся. */}
          {/* PDF браузер открывает сам. Word и Excel он не умеет, поэтому они
              ведут на нашу страницу с просмотрщиком — посетитель остаётся
              на сайте сада, а не уходит на чужой домен. */}
          <span className="flex shrink-0 gap-2">
            {isOfficeDoc(doc.media.mime) ? (
              <Link href={withLocale(`/doc/${doc.id}`, locale)} className="btn-secondary text-sm">
                {T.openDoc[locale]}
              </Link>
            ) : (
              <a
                href={`/api/media/${doc.mediaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                {T.openDoc[locale]}
              </a>
            )}
            <a
              href={`/api/media/${doc.mediaId}?download=1`}
              className="btn-ghost text-sm"
              aria-label={`${T.download[locale]}: ${pick(locale, doc.titleKk, doc.titleRu)}`}
            >
              {T.download[locale]}
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Документы — как папки в проводнике: открыл папку, внутри вложенные папки
 * и файлы, сверху путь назад. У иных садов полторы сотни файлов, разложенных
 * по восьми разделам самооценки и по учебным годам, и сплошной список (или
 * гармошка в три уровня) читать невозможно.
 *
 * Папка — отдельный адрес (`?folder=`), а не раскрывашка на JavaScript:
 * ссылку на «VII. Оценка знаний / 2024 - 2025» можно переслать, кнопка
 * «Назад» в браузере работает, поисковик видит каждую папку.
 */
export function DocumentList({
  folders,
  documents,
  locale,
  basePath,
  rootTitle,
  rootId = null,
  currentId = null,
}: {
  folders: DocumentFolder[];
  documents: DocWithMedia[];
  locale: Locale;
  /** Адрес раздела: к нему дописывается `?folder=`. */
  basePath: string;
  /** Первое звено пути — название раздела сада. */
  rootTitle: string;
  /** «Документы из папки» показывают одну папку — она и есть корень. */
  rootId?: string | null;
  currentId?: string | null;
}) {
  const counts = deepDocCounts(folders, documents);
  const children = childrenByParent(folders);
  // Пустые папки родителю не показываем: «зайди — там ничего нет» раздражает.
  const visible = (id: string) => (counts.get(id) ?? 0) > 0;

  // Открыть можно только папку внутри корня раздела: иначе через
  // «документы из папки» по подобранному адресу смотрели бы соседние.
  const allowed = rootId ? subtreeIds(folders, rootId) : null;
  const openId = currentId && (!allowed || allowed.has(currentId)) && folders.some((f) => f.id === currentId)
    ? currentId
    : rootId;

  const fullPath = folderPath(folders, openId);
  const rootIndex = rootId ? fullPath.findIndex((f) => f.id === rootId) : -1;
  const trail = fullPath.slice(rootIndex + 1);

  const subfolders = (children.get(openId) ?? []).filter((f) => visible(f.id));
  const files = documents.filter((doc) => (doc.folderId ?? null) === openId);

  const href = (id: string | null) =>
    withLocale(id && id !== rootId ? `${basePath}?folder=${id}` : basePath, locale);

  if (subfolders.length === 0 && files.length === 0 && trail.length === 0) return <Empty locale={locale} />;

  return (
    <div className="space-y-4">
      {trail.length > 0 ? (
        <nav aria-label={T.path[locale]} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Link href={href(rootId)} className="font-semibold text-brand-ink hover:underline">
            {rootTitle}
          </Link>
          {trail.map((folder, index) => {
            const last = index === trail.length - 1;
            const label = pick(locale, folder.titleKk, folder.titleRu);
            return (
              <span key={folder.id} className="flex items-center gap-2">
                <span aria-hidden className="text-muted">/</span>
                {last ? (
                  <span aria-current="page" className="font-semibold">{label}</span>
                ) : (
                  <Link href={href(folder.id)} className="font-semibold text-brand-ink hover:underline">{label}</Link>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}

      {trail.length > 0 ? (
        <h2 className="flex items-center gap-3 font-display text-2xl font-bold">
          <UiIcon name="folder" className="h-7 w-7 shrink-0 text-brand-ink" />
          {pick(locale, trail[trail.length - 1]!.titleKk, trail[trail.length - 1]!.titleRu)}
        </h2>
      ) : null}

      {subfolders.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {subfolders.map((folder) => {
            const inner = (children.get(folder.id) ?? []).filter((f) => visible(f.id)).length;
            return (
              <li key={folder.id}>
                <Link
                  href={href(folder.id)}
                  className="card flex h-full items-center gap-3 p-4 transition hover:shadow-lift sm:p-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                    <UiIcon name="folder" className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold leading-snug">
                      {pick(locale, folder.titleKk, folder.titleRu)}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {inner > 0 ? `${formatFolderCount(inner, locale)} · ` : ''}
                      {formatDocCount(counts.get(folder.id) ?? 0, locale)}
                    </span>
                  </span>
                  <UiIcon name="chevron" className="h-5 w-5 shrink-0 -rotate-90 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <div className="card overflow-hidden">
          <DocRows items={files} locale={locale} />
        </div>
      ) : subfolders.length === 0 ? (
        <p className="text-muted">{T.folderEmpty[locale]}</p>
      ) : null}

      {trail.length > 0 ? (
        <Link href={href(trail.length > 1 ? trail[trail.length - 2]!.id : rootId)} className="btn-ghost text-sm">
          ← {T.up[locale]}
        </Link>
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
