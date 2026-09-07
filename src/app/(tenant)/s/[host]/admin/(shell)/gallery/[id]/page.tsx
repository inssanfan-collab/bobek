import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { ActionForm } from '@/components/ActionForm';
import { deleteAlbum, removeAlbumItem, saveAlbum, uploadMedia } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ host: string; id: string }>;
}) {
  const { host, id } = await params;
  const ctx = await tenantAdmin(host);

  const album = await ctx.db.albums.findFirst({
    where: { id },
    include: { items: { orderBy: { position: 'asc' }, include: { media: true } } },
  });
  if (!album) notFound();

  const csrf = await csrfToken();

  return (
    <>
      <PageHeader
        title={album.titleRu}
        description={`${album.items.length} фото`}
        action={<Link href="/admin/gallery" className="btn-secondary">К альбомам</Link>}
      />

      {ctx.canEdit ? (
        <>
          <form action={uploadMedia} className="card mb-6 p-6">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="host" value={host} />
            <input type="hidden" name="albumId" value={album.id} />
            <label className="field-label" htmlFor="files">Добавить фотографии</label>
            <input
              id="files"
              name="files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              className="field"
            />
            <p className="field-hint">
              Можно выбрать сразу несколько файлов. Размер уменьшится автоматически,
              данные о месте съёмки будут удалены.
            </p>
            <div className="mt-4">
              <SubmitButton pendingLabel="Загружаем…">Загрузить</SubmitButton>
            </div>
          </form>

          <ActionForm action={saveAlbum} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
            <input type="hidden" name={CSRF_FIELD} value={csrf} />
            <input type="hidden" name="host" value={host} />
            <input type="hidden" name="id" value={album.id} />
            <div className="sm:col-span-2">
              <h2 className="font-display text-lg font-bold">Об альбоме</h2>
            </div>
            <div>
              <label className="field-label" htmlFor="titleRu">Название по-русски</label>
              <input id="titleRu" name="titleRu" required defaultValue={album.titleRu} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="titleKk">Қазақша</label>
              <input id="titleKk" name="titleKk" defaultValue={album.titleKk} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="descRu">Описание</label>
              <textarea id="descRu" name="descRu" rows={2} defaultValue={album.descRu ?? ''} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="takenOn">Дата съёмки</label>
              <input
                id="takenOn"
                name="takenOn"
                type="date"
                defaultValue={album.takenOn ? album.takenOn.toISOString().slice(0, 10) : ''}
                className="field"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <SubmitButton>Сохранить</SubmitButton>
            </div>
          </ActionForm>
        </>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {album.items.map((item) => (
          <figure key={item.id} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/media/${item.media.id}`} alt="" className="h-36 w-full object-cover" loading="lazy" />
            {ctx.canEdit ? (
              <form action={removeAlbumItem} className="p-2">
                <input type="hidden" name={CSRF_FIELD} value={csrf} />
                <input type="hidden" name="host" value={host} />
                <input type="hidden" name="albumId" value={album.id} />
                <input type="hidden" name="mediaId" value={item.media.id} />
                <button type="submit" className="btn-ghost w-full px-2 py-1 text-xs text-red-600">Убрать</button>
              </form>
            ) : null}
          </figure>
        ))}
      </div>

      {ctx.canEdit ? (
        <ActionForm action={deleteAlbum} className="mt-8 border-t border-line pt-6">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <input type="hidden" name="id" value={album.id} />
          <button type="submit" className="btn-ghost text-sm text-red-600">Удалить альбом целиком</button>
        </ActionForm>
      ) : null}
    </>
  );
}
