'use client';

import Link from 'next/link';
import { RichText } from '@/components/admin/RichText';
import { BilingualField } from '@/components/admin/BilingualField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { ActionForm } from '@/components/ActionForm';
import { CoverPicker, type PickableMedia } from '@/components/admin/CoverPicker';
import { savePost } from '../actions';
import type { Media, Post, Section } from '@prisma/client';

export function PostForm({
  csrf,
  host,
  section,
  post,
  cover,
  library,
  canEdit,
}: {
  csrf: string;
  host: string;
  section: Section;
  post?: Post | null;
  cover?: Media | null;
  library: PickableMedia[];
  canEdit: boolean;
}) {
  const publishedAt = post?.publishedAt ?? new Date();
  const dateValue = publishedAt.toISOString().slice(0, 10);

  return (
    <ActionForm action={savePost} className="space-y-5">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="host" value={host} />
      <input type="hidden" name="sectionId" value={section.id} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <section className="card space-y-4 p-6">
        <BilingualField
          label="Заголовок"
          hint="Если казахский вариант не заполнен, будет показан русский."
          ru={<input name="titleRu" required defaultValue={post?.titleRu ?? ''} className="field" placeholder="Наурыз мейрамы в нашем саду" />}
          kk={<input name="titleKk" defaultValue={post?.titleKk ?? ''} className="field" placeholder="Балабақшамыздағы Наурыз мейрамы" />}
        />

        <BilingualField
          label="Краткий анонс"
          hint="Показывается в списке новостей. Если оставить пустым — возьмём первые строки текста."
          ru={<textarea name="excerptRu" rows={2} defaultValue={post?.excerptRu ?? ''} className="field" />}
          kk={<textarea name="excerptKk" rows={2} defaultValue={post?.excerptKk ?? ''} className="field" />}
        />
      </section>

      <section className="card space-y-4 p-6">
        <BilingualField
          label="Текст"
          ru={<RichText name="bodyRu" defaultValue={post?.bodyRu ?? ''} placeholder="Расскажите, как прошёл праздник…" disabled={!canEdit} />}
          kk={<RichText name="bodyKk" defaultValue={post?.bodyKk ?? ''} placeholder="Мереке қалай өткенін жазыңыз…" disabled={!canEdit} />}
        />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">Публикация</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="status">Состояние</label>
            <select id="status" name="status" defaultValue={post?.status ?? 'PUBLISHED'} className="field">
              <option value="PUBLISHED">Опубликовать</option>
              <option value="DRAFT">Сохранить черновиком</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="publishedAt">Дата публикации</label>
            <input id="publishedAt" name="publishedAt" type="date" defaultValue={dateValue} className="field" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="isPinned" defaultChecked={post?.isPinned} className="h-4 w-4" />
          Закрепить наверху списка
        </label>

        <CoverPicker
          defaultMediaId={cover?.id ?? post?.coverMediaId ?? ''}
          library={library}
          disabled={!canEdit}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton>{post ? 'Сохранить' : 'Опубликовать'}</SubmitButton>
        <Link href="/admin/posts" className="btn-secondary">Отмена</Link>
      </div>
    </ActionForm>
  );
}
