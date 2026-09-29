'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { assertCanEdit } from '@/server/auth/guards';
import { assertCsrf } from '@/server/auth/csrf';
import { audit } from '@/server/audit';
import { saveUpload } from '@/server/media';
import { fetchInstagramImage, fetchInstagramPost } from '@/server/instagram';
import { sanitizeContent, toPlainText } from '@/lib/sanitize';
import { slugify, uniqueSlug } from '@/lib/slug';
import { formatDate } from '@/lib/labels';
import { ActionError, toActionError } from '@/lib/action-state';
import {
  accountFromProfile, bodyFromCaption, cleanCaption, extractInstagramCodes, INSTAGRAM_BATCH_LIMIT, looksKazakh,
  titleFromCaption, type InstagramPost,
} from '@/lib/instagram';

/** Карточка поста для выбора: что покажем сотруднику перед переносом. */
export type InstagramCard = {
  code: string;
  url: string;
  kind: 'reel' | 'photo';
  caption: string;
  date: string | null;
  /** Дата для глаз, на языке админки. */
  dateText: string;
  imageUrl: string | null;
  title: string;
  /** Уже есть новость с этим постом — выбрать нельзя. */
  exists: boolean;
  /** Пост другого аккаунта, не того, что в паспорте сада: не отмечен сразу, но перенести можно. */
  foreign: boolean;
};

export type PreviewState = {
  error?: string;
  cards?: InstagramCard[];
  /** Ссылки, по которым пост открыть не удалось. */
  failed?: string[];
};

export type ImportState = {
  error?: string;
  created?: { title: string; href: string }[];
  failed?: string[];
};

async function gate(formData: FormData) {
  const ctx = await tenantAdmin(String(formData.get('host') ?? ''));
  await assertCsrf(formData);
  assertCanEdit(ctx);
  return ctx;
}

/** Код поста уже встречался в новостях сада: ссылка на ролик у нас хранится в videoUrl. */
async function existingCodes(tenantId: string, codes: string[]): Promise<Set<string>> {
  if (codes.length === 0) return new Set();
  const rows = await prisma.post.findMany({
    where: { tenantId, OR: codes.map((code) => ({ videoUrl: { contains: `/${code}/` } })) },
    select: { videoUrl: true },
  });
  return new Set(codes.filter((code) => rows.some((row) => row.videoUrl?.includes(`/${code}/`))));
}

/** Посты по кодам — по четыре одновременно: Instagram не любит поток запросов. */
async function fetchAll(codes: string[]): Promise<Map<string, InstagramPost | null>> {
  const result = new Map<string, InstagramPost | null>();
  for (let i = 0; i < codes.length; i += 4) {
    const chunk = codes.slice(i, i + 4);
    const posts = await Promise.all(chunk.map((code) => fetchInstagramPost(code)));
    chunk.forEach((code, index) => result.set(code, posts[index] ?? null));
  }
  return result;
}

const FALLBACK_TITLE = { kk: 'Жаңалық', ru: 'Новость' } as const;

export async function previewInstagram(_prev: PreviewState, formData: FormData): Promise<PreviewState> {
  let locale: 'kk' | 'ru' = 'ru';
  try {
    const ctx = await gate(formData);
    locale = ctx.user.locale;
    const codes = extractInstagramCodes(String(formData.get('links') ?? ''));
    if (codes.length === 0) {
      throw new ActionError({
        kk: 'Instagram-дағы посттың сілтемесін қойыңыз: «Бөлісу» → «Сілтемені көшіру».',
        ru: 'Вставьте ссылку на пост в Instagram: «Поделиться» → «Копировать ссылку».',
      });
    }

    const [posts, exists] = await Promise.all([fetchAll(codes), existingCodes(ctx.tenantId, codes)]);
    const profile = await prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId }, select: { instagram: true } });
    const own = accountFromProfile(profile?.instagram);
    const cards: InstagramCard[] = [];
    const failed: string[] = [];
    for (const code of codes) {
      const post = posts.get(code);
      if (!post) {
        failed.push(`https://www.instagram.com/p/${code}/`);
        continue;
      }
      const dateText = post.date ? formatDate(new Date(`${post.date}T12:00:00+05:00`), locale) : '';
      cards.push({
        code: post.code,
        url: post.url,
        kind: post.kind,
        caption: cleanCaption(post.caption),
        date: post.date,
        dateText,
        imageUrl: post.imageUrl,
        title: titleFromCaption(post.caption, dateText ? `${FALLBACK_TITLE[locale]}, ${dateText}` : FALLBACK_TITLE[locale]),
        exists: exists.has(post.code),
        foreign: Boolean(own && post.account && post.account !== own),
      });
    }
    return { cards, failed };
  } catch (error) {
    return { error: toActionError(error, locale).error };
  }
}

/** Подпись → HTML новости: абзац на строку, всё экранировано и пропущено через санитайзер. */
function captionHtml(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return sanitizeContent(escaped.split('\n').map((line) => `<p>${line}</p>`).join(''));
}

export async function importInstagram(_prev: ImportState, formData: FormData): Promise<ImportState> {
  let locale: 'kk' | 'ru' = 'ru';
  try {
    const ctx = await gate(formData);
    locale = ctx.user.locale;
    const picked = formData.getAll('code').map(String).filter(Boolean).slice(0, INSTAGRAM_BATCH_LIMIT);
    if (picked.length === 0) {
      throw new ActionError({ kk: 'Кем дегенде бір постты таңдаңыз.', ru: 'Отметьте хотя бы один пост.' });
    }

    const section = await ctx.db.sections.findFirst({ where: { type: 'NEWS' }, select: { id: true, slug: true } });
    if (!section) {
      throw new ActionError({ kk: 'Сайтта «Жаңалықтар» бөлімі жоқ.', ru: 'На сайте нет раздела «Новости».' });
    }

    // Текст и обложку берём заново с Instagram, а не из формы: форма —
    // только выбор постов и заголовки, которые мог поправить сотрудник.
    const [posts, exists] = await Promise.all([fetchAll(picked), existingCodes(ctx.tenantId, picked)]);
    const created: { title: string; href: string }[] = [];
    const failed: string[] = [];

    for (const [index, code] of picked.entries()) {
      const post = posts.get(code);
      if (!post) { failed.push(`https://www.instagram.com/p/${code}/`); continue; }
      if (exists.has(code)) continue;

      const title = String(formData.get(`title-${code}`) ?? '').trim().slice(0, 200)
        || titleFromCaption(post.caption, FALLBACK_TITLE[locale]);
      const caption = bodyFromCaption(post.caption, title);

      // Подпись идёт на своём языке; второй язык сайт подставит тем же текстом,
      // пока сотрудник не впишет перевод. Машинный перевод не выдумываем.
      const kazakh = looksKazakh(`${title} ${caption}`);
      const body = caption ? captionHtml(caption) : null;
      const excerpt = body ? toPlainText(body, 180) || null : null;

      let coverMediaId: string | null = null;
      if (post.imageUrl) {
        const file = await fetchInstagramImage(post.imageUrl);
        if (file) coverMediaId = (await saveUpload(file, ctx.tenantId)).id;
      }

      // Дату Instagram отдаёт без времени — ставим полдень и сдвигаем на минуты,
      // чтобы посты одного дня стояли в том порядке, в каком их вставили.
      const publishedAt = post.date
        ? new Date(new Date(`${post.date}T12:00:00+05:00`).getTime() - index * 60_000)
        : new Date();

      const slug = await uniqueSlug(`${slugify(title).slice(0, 60)}-${code.toLowerCase()}`, async (candidate) =>
        Boolean(await ctx.db.posts.findFirst({ where: { slug: candidate }, select: { id: true } })),
      );

      const row = await prisma.post.create({
        data: {
          tenantId: ctx.tenantId,
          sectionId: section.id,
          slug,
          titleKk: title,
          titleRu: title,
          bodyKk: kazakh ? body : null,
          bodyRu: kazakh ? null : body,
          excerptKk: kazakh ? excerpt : null,
          excerptRu: kazakh ? null : excerpt,
          // И ролик, и фото Instagram показывает своим проигрывателем —
          // карусель листается прямо в новости. По этой ссылке и узнаём повтор.
          videoUrl: post.url,
          coverMediaId,
          status: 'PUBLISHED',
          publishedAt,
        },
        select: { id: true, slug: true },
      });
      await audit(ctx.user, 'content.create', { tenantId: ctx.tenantId, entity: 'post', entityId: row.id, meta: { source: 'instagram', code } });
      created.push({ title, href: `/admin/posts/${row.id}` });
    }

    revalidatePath('/admin/posts');
    revalidatePath('/admin/instagram');
    return { created, failed };
  } catch (error) {
    return { error: toActionError(error, locale).error };
  }
}
