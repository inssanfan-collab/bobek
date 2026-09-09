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
import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Тақырып', ru: 'Заголовок' },
  titleHint: {
    kk: 'Қазақша нұсқа толтырылмаса, орысшасы көрсетіледі.',
    ru: 'Если казахский вариант не заполнен, будет показан русский.',
  },
  excerpt: { kk: 'Қысқаша сипаттама', ru: 'Краткий анонс' },
  excerptHint: {
    kk: 'Жаңалықтар тізімінде көрінеді. Бос қалдырсаңыз — мәтіннің алғашқы жолдарын аламыз.',
    ru: 'Показывается в списке новостей. Если оставить пустым — возьмём первые строки текста.',
  },
  body: { kk: 'Мәтін', ru: 'Текст' },
  publication: { kk: 'Жариялау', ru: 'Публикация' },
  status: { kk: 'Күйі', ru: 'Состояние' },
  publish: { kk: 'Жариялау', ru: 'Опубликовать' },
  saveDraft: { kk: 'Жоба ретінде сақтау', ru: 'Сохранить черновиком' },
  publishedAt: { kk: 'Жариялау күні', ru: 'Дата публикации' },
  pin: { kk: 'Тізімнің басына бекіту', ru: 'Закрепить наверху списка' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  cancel: { kk: 'Болдырмау', ru: 'Отмена' },
} as const;

export function PostForm({
  csrf,
  host,
  section,
  post,
  cover,
  library,
  canEdit,
  locale,
}: {
  csrf: string;
  host: string;
  section: Section;
  post?: Post | null;
  cover?: Media | null;
  library: PickableMedia[];
  canEdit: boolean;
  locale: Locale;
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
          label={T.title[locale]}
          hint={T.titleHint[locale]}
          ru={<input name="titleRu" required defaultValue={post?.titleRu ?? ''} className="field" placeholder="Наурыз мейрамы в нашем саду" />}
          kk={<input name="titleKk" defaultValue={post?.titleKk ?? ''} className="field" placeholder="Балабақшамыздағы Наурыз мейрамы" />}
        />

        <BilingualField
          label={T.excerpt[locale]}
          hint={T.excerptHint[locale]}
          ru={<textarea name="excerptRu" rows={2} defaultValue={post?.excerptRu ?? ''} className="field" />}
          kk={<textarea name="excerptKk" rows={2} defaultValue={post?.excerptKk ?? ''} className="field" />}
        />
      </section>

      <section className="card space-y-4 p-6">
        <BilingualField
          label={T.body[locale]}
          ru={<RichText name="bodyRu" defaultValue={post?.bodyRu ?? ''} placeholder="Расскажите, как прошёл праздник…" disabled={!canEdit} locale={locale} />}
          kk={<RichText name="bodyKk" defaultValue={post?.bodyKk ?? ''} placeholder="Мереке қалай өткенін жазыңыз…" disabled={!canEdit} locale={locale} />}
        />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">{T.publication[locale]}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="status">{T.status[locale]}</label>
            <select id="status" name="status" defaultValue={post?.status ?? 'PUBLISHED'} className="field">
              <option value="PUBLISHED">{T.publish[locale]}</option>
              <option value="DRAFT">{T.saveDraft[locale]}</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="publishedAt">{T.publishedAt[locale]}</label>
            <input id="publishedAt" name="publishedAt" type="date" defaultValue={dateValue} className="field" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="isPinned" defaultChecked={post?.isPinned} className="h-4 w-4" />
          {T.pin[locale]}
        </label>

        <CoverPicker
          defaultMediaId={cover?.id ?? post?.coverMediaId ?? ''}
          library={library}
          disabled={!canEdit}
          locale={locale}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton>{post ? T.save[locale] : T.publish[locale]}</SubmitButton>
        <Link href="/admin/posts" className="btn-secondary">{T.cancel[locale]}</Link>
      </div>
    </ActionForm>
  );
}
