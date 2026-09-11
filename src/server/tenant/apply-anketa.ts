import 'server-only';
import { prisma } from '@/server/db';
import { sanitizeContent } from '@/lib/sanitize';
import type { Anketa } from '@/server/import/anketa';

/**
 * Досыпает в только что созданный сад то, чего нет в форме создания:
 * остальные поля паспорта, группы и педагогов.
 *
 * Отдельно от createTenant намеренно. Создание сада — это всё или ничего:
 * половина сада хуже, чем неначатый. А анкета — сведения, которые сад и так
 * будет править сам, и сорвать из-за них создание сайта нельзя: доступы уже
 * показаны администратору и второй раз их не выдать.
 */
export async function applyAnketa(tenantId: string, anketa: Anketa): Promise<void> {
  const f = anketa.fields;
  const text = (key: string) => (f[key]?.trim() ? f[key].trim() : undefined);
  const number = (key: string) => {
    const parsed = Number(f[key]);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const flag = (key: string) => (f[key] === undefined ? undefined : f[key] === 'on');

  const placesTotal = number('placesTotal');
  const placesFree = number('placesFree');

  await prisma.tenantProfile.update({
    where: { tenantId },
    data: {
      shortNameRu: text('shortNameRu'),
      shortNameKk: text('shortNameKk'),
      bin: text('bin'),
      licenseNo: text('licenseNo'),
      addressKk: text('addressKk'),
      phoneExtra: text('phoneExtra'),
      workHours: text('workHours'),
      headNameRu: text('headNameRu'),
      headNameKk: text('headNameKk'),
      groupsCount: number('groupsCount'),
      placesTotal,
      placesFree:
        placesTotal !== undefined && placesFree !== undefined && placesFree > placesTotal
          ? placesTotal
          : placesFree,
      langKk: flag('langKk'),
      langRu: flag('langRu'),
      // Текст из Excel санитизируем как любой пользовательский HTML: Word и
      // Excel охотно кладут в буфер разметку вместе с текстом.
      aboutRu: text('aboutRu') ? sanitizeContent(text('aboutRu')!) : undefined,
      aboutKk: text('aboutKk') ? sanitizeContent(text('aboutKk')!) : undefined,
      whatsapp: text('whatsapp'),
      instagram: text('instagram'),
      youtube: text('youtube'),
      facebook: text('facebook'),
      telegram: text('telegram'),
    },
  });

  if (anketa.groups.length > 0) {
    await prisma.group.createMany({
      data: anketa.groups.map((group, position) => ({
        tenantId,
        nameRu: group.nameRu,
        nameKk: group.nameKk,
        ageFrom: group.ageFrom,
        ageTo: group.ageTo,
        language: group.language,
        teachers: group.teachers,
        placesTotal: group.placesTotal,
        placesFree: group.placesFree,
        position,
        isVisible: true,
      })),
    });
  }

  if (anketa.staff.length > 0) {
    await prisma.staffMember.createMany({
      data: anketa.staff.map((member, position) => ({
        tenantId,
        fullName: member.fullName,
        positionRu: member.positionRu,
        positionKk: member.positionKk,
        educationRu: member.educationRu,
        educationKk: member.educationKk,
        experience: member.experience,
        categoryName: member.categoryName,
        position,
        isVisible: true,
      })),
    });
  }
}
