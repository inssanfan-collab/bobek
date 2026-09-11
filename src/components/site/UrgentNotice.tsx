import { pick, type Locale } from '@/lib/i18n';
import { UiIcon } from './UiIcon';
import type { TenantProfile } from '@prisma/client';

const TONES = {
  INFO: 'border-sky-300 bg-sky-50 text-sky-900',
  WARN: 'border-amber-300 bg-amber-50 text-amber-900',
  URGENT: 'border-red-300 bg-red-50 text-red-900',
} as const;

const ICONS = { INFO: 'info', WARN: 'warn', URGENT: 'urgent' } as const;

/**
 * Полоса срочного объявления на всех страницах: карантин, отмена занятий,
 * изменение режима. Обычное объявление лежит в своём разделе, а такое
 * должно попасться на глаза сразу, куда бы родитель ни зашёл.
 */
export function UrgentNotice({ profile, locale }: { profile: TenantProfile | null; locale: Locale }) {
  if (!profile) return null;

  const text = pick(locale, profile.noticeKk, profile.noticeRu);
  if (!text) return null;

  // Сад ставит срок и забывает про объявление — снимаем его сами.
  if (profile.noticeUntil && profile.noticeUntil < new Date()) return null;

  return (
    <div className={`border-b ${TONES[profile.noticeTone]}`} role="status">
      <div className="container-page flex items-start gap-3 py-3">
        <UiIcon name={ICONS[profile.noticeTone]} className="mt-0.5 h-5 w-5 flex-none" />
        <p className="font-semibold">{text}</p>
      </div>
    </div>
  );
}
