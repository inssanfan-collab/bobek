'use client';

import Link from 'next/link';
import { RichText } from '@/components/admin/RichText';
import { BilingualField } from '@/components/admin/BilingualField';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { savePortalPost } from './actions';
import type { PortalPost } from '@prisma/client';
import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Тақырып', ru: 'Заголовок' },
  excerpt: { kk: 'Қысқаша сипаттама', ru: 'Краткий анонс' },
  excerptHint: {
    kk: 'Портал жаңалықтарының тізімінде көрсетіледі.',
    ru: 'Показывается в списке новостей портала.',
  },
  body: { kk: 'Мәтін', ru: 'Текст' },
  status: { kk: 'Күйі', ru: 'Состояние' },
  publish: { kk: 'Жариялау', ru: 'Опубликовать' },
  saveDraft: { kk: 'Жоба ретінде сақтау', ru: 'Сохранить черновиком' },
  cancel: { kk: 'Болдырмау', ru: 'Отмена' },
} as const;

export function PortalPostForm({
  csrf,
  post,
  locale,
}: {
  csrf: string;
  post?: PortalPost | null;
  locale: Locale;
}) {
  return (
    <form action={savePortalPost} className="space-y-5">
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <section className="card space-y-4 p-6">
        <BilingualField
          label={T.title[locale]}
          ru={<input name="titleRu" required defaultValue={post?.titleRu ?? ''} className="field" />}
          kk={<input name="titleKk" defaultValue={post?.titleKk ?? ''} className="field" />}
        />
        <BilingualField
          label={T.excerpt[locale]}
          hint={T.excerptHint[locale]}
          ru={<textarea name="excerptRu" rows={2} defaultValue={post?.excerptRu ?? ''} className="field" />}
          kk={<textarea name="excerptKk" rows={2} defaultValue={post?.excerptKk ?? ''} className="field" />}
        />
      </section>

      <section className="card p-6">
        <BilingualField
          label={T.body[locale]}
          ru={<RichText locale={locale} name="bodyRu" defaultValue={post?.bodyRu ?? ''} placeholder="Текст новости…" />}
          kk={<RichText locale={locale} name="bodyKk" defaultValue={post?.bodyKk ?? ''} placeholder="Жаңалық мәтіні…" />}
        />
      </section>

      <section className="card p-6">
        <label className="field-label" htmlFor="status">{T.status[locale]}</label>
        <select id="status" name="status" defaultValue={post?.status ?? 'PUBLISHED'} className="field max-w-xs">
          <option value="PUBLISHED">{T.publish[locale]}</option>
          <option value="DRAFT">{T.saveDraft[locale]}</option>
        </select>
      </section>

      <div className="flex gap-3">
        <SubmitButton>{post ? 'Сохранить' : 'Опубликовать'}</SubmitButton>
        <Link href="/admin/news" className="btn-secondary">{T.cancel[locale]}</Link>
      </div>
    </form>
  );
}
