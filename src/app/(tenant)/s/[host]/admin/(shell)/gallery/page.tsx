import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { ActionForm } from '@/components/ActionForm';
import { saveAlbum } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Фотогалерея', ru: 'Фотогалерея' },
  lead: {
    kk: 'Мерекелердің, сабақтардың және топ күнделігінің альбомдары.',
    ru: 'Альбомы с праздников, занятий и будней групп.',
  },
  consentTitle: {
    kk: 'Балалардың фотосын жарияламас бұрын',
    ru: 'Прежде чем публиковать фото детей',
  },
  consentText: {
    kk: ' — ата-аналардан суреттерді орналастыруға жазбаша келісім алынғанына көз жеткізіңіз. Түсірілім координаттарын фотодан автоматты түрде өшіреміз.',
    ru: ' — убедитесь, что от родителей получено письменное согласие на размещение изображений. Координаты съёмки из фотографий мы удаляем автоматически.',
  },
  newAlbum: { kk: 'Жаңа альбом', ru: 'Новый альбом' },
  name: { kk: 'Атауы', ru: 'Название' },
  takenOn: { kk: 'Түсірілген күні', ru: 'Дата съёмки' },
  create: { kk: 'Альбом жасау', ru: 'Создать альбом' },
  empty: { kk: 'Әзірге альбомдар жоқ', ru: 'Альбомов пока нет' },
  emptyHint: {
    kk: 'Альбом жасап, оған фотосуреттер жүктеңіз.',
    ru: 'Создайте альбом и загрузите в него фотографии.',
  },
  photos: { kk: 'фото', ru: 'фото' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

export default async function GalleryPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [albums, csrf] = await Promise.all([
    ctx.db.albums.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      include: {
        items: { orderBy: { position: 'asc' }, take: 1, include: { media: true } },
        _count: { select: { items: true } },
      },
    }),
    csrfToken(),
  ]);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>{T.consentTitle[locale]}</strong>{T.consentText[locale]}
      </div>

      {ctx.canEdit ? (
        <ActionForm action={saveAlbum} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <div className="sm:col-span-2">
            <h2 className="font-display text-lg font-bold">{T.newAlbum[locale]}</h2>
          </div>
          <div>
            <label className="field-label" htmlFor="titleRu">{T.name[locale]} {T.inRu[locale]} *</label>
            <input id="titleRu" name="titleRu" required className="field" placeholder="Наурыз мейрамы" />
          </div>
          <div>
            <label className="field-label" htmlFor="titleKk">{T.name[locale]} {T.inKk[locale]}</label>
            <input id="titleKk" name="titleKk" className="field" placeholder="Наурыз мейрамы" />
          </div>
          <div>
            <label className="field-label" htmlFor="takenOn">{T.takenOn[locale]}</label>
            <input id="takenOn" name="takenOn" type="date" className="field" />
          </div>
          <div className="flex items-end">
            <SubmitButton>{T.create[locale]}</SubmitButton>
          </div>
        </ActionForm>
      ) : null}

      {albums.length === 0 ? (
        <EmptyState icon="📷" title={T.empty[locale]} description={T.emptyHint[locale]} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const cover = album.items[0]?.media;
            return (
              <Link key={album.id} href={`/admin/gallery/${album.id}`} className="card overflow-hidden transition hover:shadow-lift">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/media/${cover.id}`} alt="" className="h-40 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-40 place-items-center bg-brand-soft text-3xl" aria-hidden>📷</div>
                )}
                <div className="p-4">
                  <p className="font-display font-bold">{pick(locale, album.titleKk, album.titleRu)}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {album._count.items} {T.photos[locale]}
                    {album.takenOn ? ` · ${formatDate(album.takenOn, locale)}` : ''}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
