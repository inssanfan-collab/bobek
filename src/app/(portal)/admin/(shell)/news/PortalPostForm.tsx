'use client';

import Link from 'next/link';
import { RichText } from '@/components/admin/RichText';
import { BilingualField } from '@/components/admin/BilingualField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { savePortalPost } from './actions';
import type { PortalPost } from '@prisma/client';

export function PortalPostForm({ csrf, post }: { csrf: string; post?: PortalPost | null }) {
  return (
    <form action={savePortalPost} className="space-y-5">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <section className="card space-y-4 p-6">
        <BilingualField
          label="Заголовок"
          ru={<input name="titleRu" required defaultValue={post?.titleRu ?? ''} className="field" />}
          kk={<input name="titleKk" defaultValue={post?.titleKk ?? ''} className="field" />}
        />
        <BilingualField
          label="Краткий анонс"
          hint="Показывается в списке новостей портала."
          ru={<textarea name="excerptRu" rows={2} defaultValue={post?.excerptRu ?? ''} className="field" />}
          kk={<textarea name="excerptKk" rows={2} defaultValue={post?.excerptKk ?? ''} className="field" />}
        />
      </section>

      <section className="card p-6">
        <BilingualField
          label="Текст"
          ru={<RichText name="bodyRu" defaultValue={post?.bodyRu ?? ''} placeholder="Текст новости…" />}
          kk={<RichText name="bodyKk" defaultValue={post?.bodyKk ?? ''} placeholder="Жаңалық мәтіні…" />}
        />
      </section>

      <section className="card p-6">
        <label className="field-label" htmlFor="status">Состояние</label>
        <select id="status" name="status" defaultValue={post?.status ?? 'PUBLISHED'} className="field max-w-xs">
          <option value="PUBLISHED">Опубликовать</option>
          <option value="DRAFT">Сохранить черновиком</option>
        </select>
      </section>

      <div className="flex gap-3">
        <SubmitButton>{post ? 'Сохранить' : 'Опубликовать'}</SubmitButton>
        <Link href="/admin/news" className="btn-secondary">Отмена</Link>
      </div>
    </form>
  );
}
