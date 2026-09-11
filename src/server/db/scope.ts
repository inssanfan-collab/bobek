import { prisma } from '@/server/db';
import { searchSite } from '@/server/db/search';
import type { Prisma } from '@prisma/client';

/**
 * Репозиторий, который физически не умеет обратиться к контенту без tenantId.
 * Кросс-тенантная утечка — главный риск платформы, поэтому в коде админки и сайта
 * прямые вызовы prisma.post / prisma.media запрещены: только через scoped().
 *
 * Дженерики сохраняют вывод типов Prisma, поэтому include/select работают как обычно.
 */
export type TenantScope = ReturnType<typeof scoped>;

type MaybeArgs = { where?: Record<string, unknown> } | undefined;

/** Подмешивает tenantId в where так, что перекрыть его снаружи нельзя. */
function withTenant<T>(args: MaybeArgs, tenantId: string): T {
  return { ...(args ?? {}), where: { ...(args?.where ?? {}), tenantId } } as T;
}

export function scoped(tenantId: string) {
  if (!tenantId) throw new Error('scoped() вызван без tenantId');

  return {
    tenantId,

    /** Полнотекстовый поиск по публичной части сайта — тоже только внутри сада. */
    search: (query: string) => searchSite(tenantId, query),

    sections: {
      findMany: <T extends Prisma.SectionFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.SectionFindManyArgs>) =>
        prisma.section.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.SectionGetPayload<T>[]>,
      findFirst: <T extends Prisma.SectionFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.SectionFindFirstArgs>) =>
        prisma.section.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.SectionGetPayload<T> | null>,
      count: (args?: { where?: Prisma.SectionWhereInput }) =>
        prisma.section.count(withTenant(args as MaybeArgs, tenantId)),
    },

    posts: {
      findMany: <T extends Prisma.PostFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.PostFindManyArgs>) =>
        prisma.post.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.PostGetPayload<T>[]>,
      findFirst: <T extends Prisma.PostFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.PostFindFirstArgs>) =>
        prisma.post.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.PostGetPayload<T> | null>,
      count: (args?: { where?: Prisma.PostWhereInput }) =>
        prisma.post.count(withTenant(args as MaybeArgs, tenantId)),
    },

    pages: {
      findMany: <T extends Prisma.PageFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.PageFindManyArgs>) =>
        prisma.page.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.PageGetPayload<T>[]>,
      findFirst: <T extends Prisma.PageFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.PageFindFirstArgs>) =>
        prisma.page.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.PageGetPayload<T> | null>,
    },

    media: {
      findMany: <T extends Prisma.MediaFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.MediaFindManyArgs>) =>
        prisma.media.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.MediaGetPayload<T>[]>,
      findFirst: <T extends Prisma.MediaFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.MediaFindFirstArgs>) =>
        prisma.media.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.MediaGetPayload<T> | null>,
      count: (args?: { where?: Prisma.MediaWhereInput }) =>
        prisma.media.count(withTenant(args as MaybeArgs, tenantId)),
    },

    albums: {
      findMany: <T extends Prisma.AlbumFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.AlbumFindManyArgs>) =>
        prisma.album.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.AlbumGetPayload<T>[]>,
      findFirst: <T extends Prisma.AlbumFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.AlbumFindFirstArgs>) =>
        prisma.album.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.AlbumGetPayload<T> | null>,
    },

    documents: {
      findMany: <T extends Prisma.DocumentFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.DocumentFindManyArgs>) =>
        prisma.document.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.DocumentGetPayload<T>[]>,
      findFirst: <T extends Prisma.DocumentFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.DocumentFindFirstArgs>) =>
        prisma.document.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.DocumentGetPayload<T> | null>,
    },

    docFolders: {
      findMany: <T extends Prisma.DocumentFolderFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.DocumentFolderFindManyArgs>) =>
        prisma.documentFolder.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.DocumentFolderGetPayload<T>[]>,
      findFirst: <T extends Prisma.DocumentFolderFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.DocumentFolderFindFirstArgs>) =>
        prisma.documentFolder.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.DocumentFolderGetPayload<T> | null>,
      count: (args?: { where?: Prisma.DocumentFolderWhereInput }) =>
        prisma.documentFolder.count(withTenant(args as MaybeArgs, tenantId)),
    },

    staff: {
      findMany: <T extends Prisma.StaffMemberFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.StaffMemberFindManyArgs>) =>
        prisma.staffMember.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.StaffMemberGetPayload<T>[]>,
      findFirst: <T extends Prisma.StaffMemberFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.StaffMemberFindFirstArgs>) =>
        prisma.staffMember.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.StaffMemberGetPayload<T> | null>,
    },

    groups: {
      findMany: <T extends Prisma.GroupFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.GroupFindManyArgs>) =>
        prisma.group.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.GroupGetPayload<T>[]>,
      findFirst: <T extends Prisma.GroupFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.GroupFindFirstArgs>) =>
        prisma.group.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.GroupGetPayload<T> | null>,
    },

    menuDays: {
      findMany: <T extends Prisma.MenuDayFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.MenuDayFindManyArgs>) =>
        prisma.menuDay.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.MenuDayGetPayload<T>[]>,
      findFirst: <T extends Prisma.MenuDayFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.MenuDayFindFirstArgs>) =>
        prisma.menuDay.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.MenuDayGetPayload<T> | null>,
    },

    feedback: {
      findMany: <T extends Prisma.FeedbackMessageFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.FeedbackMessageFindManyArgs>) =>
        prisma.feedbackMessage.findMany(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.FeedbackMessageGetPayload<T>[]>,
      findFirst: <T extends Prisma.FeedbackMessageFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.FeedbackMessageFindFirstArgs>) =>
        prisma.feedbackMessage.findFirst(withTenant<T>(args as MaybeArgs, tenantId)) as Promise<Prisma.FeedbackMessageGetPayload<T> | null>,
      count: (args?: { where?: Prisma.FeedbackMessageWhereInput }) =>
        prisma.feedbackMessage.count(withTenant(args as MaybeArgs, tenantId)),
    },
  };
}

export class NotFoundError extends Error {}

type OwnedModel =
  | 'post' | 'section' | 'media' | 'album' | 'document' | 'documentFolder'
  | 'staffMember' | 'group' | 'menuDay' | 'feedbackMessage' | 'page'
  | 'club' | 'faqItem';

/**
 * Проверка владения перед update/delete: Prisma не умеет составной where по id+tenantId
 * в операциях, возвращающих запись, поэтому владение подтверждаем явным запросом.
 */
export async function assertOwned(model: OwnedModel, id: string, tenantId: string): Promise<void> {
  const delegates = {
    post: prisma.post, section: prisma.section, media: prisma.media, album: prisma.album,
    document: prisma.document, documentFolder: prisma.documentFolder,
    staffMember: prisma.staffMember, group: prisma.group,
    menuDay: prisma.menuDay, feedbackMessage: prisma.feedbackMessage, page: prisma.page,
    club: prisma.club, faqItem: prisma.faqItem,
  } as const;

  type OwnerLookup = {
    findUnique: (a: { where: { id: string }; select: { tenantId: true } }) => Promise<{ tenantId: string } | null>;
  };

  const row = await (delegates[model] as unknown as OwnerLookup).findUnique({
    where: { id },
    select: { tenantId: true },
  });

  if (!row || row.tenantId !== tenantId) {
    throw new NotFoundError(`${model}:${id} не принадлежит саду ${tenantId}`);
  }
}
