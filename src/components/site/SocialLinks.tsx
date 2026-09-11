import type { TenantProfile } from '@prisma/client';
import { UiIcon, type UiIconName } from './UiIcon';
import type { Locale } from '@/lib/i18n';

const T = {
  title: { kk: 'Әлеуметтік желілер', ru: 'Мы в соцсетях' },
  write: { kk: 'WhatsApp арқылы жазу', ru: 'Написать в WhatsApp' },
} as const;

/** Номер для ссылки wa.me — только цифры, без плюса и скобок. */
function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // Казахстанские номера часто записывают с 8 в начале — wa.me требует код страны.
  return digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
}

export function SocialLinks({
  profile,
  locale,
  withTitle = true,
}: {
  profile: TenantProfile | null;
  locale: Locale;
  withTitle?: boolean;
}) {
  if (!profile) return null;

  const items = [
    profile.instagram && { label: 'Instagram', href: profile.instagram, icon: 'instagram' as const },
    profile.youtube && { label: 'YouTube', href: profile.youtube, icon: 'youtube' as const },
    profile.facebook && { label: 'Facebook', href: profile.facebook, icon: 'facebook' as const },
    profile.telegram && { label: 'Telegram', href: profile.telegram, icon: 'telegram' as const },
  ].filter(Boolean) as { label: string; href: string; icon: UiIconName }[];

  if (items.length === 0 && !profile.whatsapp) return null;

  return (
    <div>
      {withTitle ? <p className="mb-2 font-semibold">{T.title[locale]}</p> : null}
      <div className="flex flex-wrap gap-2">
        {profile.whatsapp ? (
          <a
            href={`https://wa.me/${waNumber(profile.whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            <UiIcon name="chat" className="h-4 w-4" /> {T.write[locale]}
          </a>
        ) : null}
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            <UiIcon name={item.icon} className="h-4 w-4" /> {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
