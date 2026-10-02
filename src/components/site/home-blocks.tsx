import type { Club, Group, Media, RoutineItem, StaffMember } from '@prisma/client';
import type { Stat } from '@/lib/home-stats';
import { mediaUrl, SiteLink } from '@/components/site/blocks';
import { pick, type Locale } from '@/lib/i18n';
import { formatAgeRange } from '@/lib/labels';

/**
 * Блоки главной из данных сада — для тем, собранных по структуре
 * популярных сайтов садов: счётчики, распорядок дня, педагоги, кружки,
 * группы, полоса записи. Отзывы, цены и частые вопросы — ReviewList,
 * PriceList, FaqList из sections. Каждый блок помечен data-block: тема
 * красит его своим CSS, а разметка общая. Нет данных — блок не рисуется.
 */

const T = {
  free: { kk: 'Тегін', ru: 'Бесплатно' },
  perMonth: { kk: 'айына', ru: 'в месяц' },
  freePlaces: { kk: 'Бос орын', ru: 'Свободно' },
  enroll: { kk: 'Экскурсияға жазылу', ru: 'Записаться на экскурсию' },
  enrollLead: {
    kk: 'Өтінім қалдырыңыз — балабақша қызметкері хабарласып, ыңғайлы уақытты келіседі.',
    ru: 'Оставьте заявку — сотрудник сада перезвонит и договорится об удобном времени.',
  },
  queue: { kk: 'Балабақшаға кезек — Darabala.kz', ru: 'Очередь в сад — Darabala.kz' },
} as const;

export type StaffWithPhoto = StaffMember & { photo: Media | null };

export function StatsRow({ stats, className }: { stats: Stat[]; className?: string }) {
  if (stats.length === 0) return null;
  return (
    <dl data-block="stats" className={className ?? 'flex flex-wrap gap-6'}>
      {stats.map((stat) => (
        <div key={stat.label} className="hb-stat">
          <dt className="sr-only">{stat.label}</dt>
          <dd className="hb-stat-value">{stat.value}</dd>
          <dd className="hb-stat-label" aria-hidden>{stat.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RoutineCards({ items, locale, className }: { items: RoutineItem[]; locale: Locale; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ol data-block="routine" className={className ?? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
      {items.map((item) => (
        <li key={item.id} className="hb-routine-item">
          <span className="hb-routine-time">{item.time}</span>
          <span className="hb-routine-title">{pick(locale, item.titleKk, item.titleRu)}</span>
        </li>
      ))}
    </ol>
  );
}

export function StaffCards({ staff, locale, limit = 6, className }: { staff: StaffWithPhoto[]; locale: Locale; limit?: number; className?: string }) {
  if (staff.length === 0) return null;
  return (
    <ul data-block="staff" className={className ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
      {staff.slice(0, limit).map((member) => {
        const photo = mediaUrl(member.photo);
        return (
          <li key={member.id} className="hb-staff-card">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- медиа отдаёт свой роут
              <img src={photo} alt="" className="hb-staff-photo" loading="lazy" />
            ) : (
              <span className="hb-staff-photo hb-staff-photo-empty" aria-hidden>
                {member.fullName.trim().charAt(0)}
              </span>
            )}
            <span className="hb-staff-name">{member.fullName}</span>
            <span className="hb-staff-role">{pick(locale, member.positionKk, member.positionRu)}</span>
            {member.categoryName || member.experience ? (
              <span className="hb-staff-meta">{[member.categoryName, member.experience].filter(Boolean).join(' · ')}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ClubCards({ clubs, locale, className }: { clubs: Club[]; locale: Locale; className?: string }) {
  if (clubs.length === 0) return null;
  return (
    <ul data-block="clubs" className={className ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
      {clubs.map((club) => (
        <li key={club.id} className="hb-club-card">
          <span className="hb-club-name">{pick(locale, club.nameKk, club.nameRu)}</span>
          {pick(locale, club.descKk, club.descRu) ? <span className="hb-club-desc">{pick(locale, club.descKk, club.descRu)}</span> : null}
          <span className="hb-club-meta">
            {club.ageRange ? <span>{club.ageRange}</span> : null}
            {club.isFree || club.priceKzt == null ? (
              <span>{T.free[locale]}</span>
            ) : (
              <span>{club.priceKzt.toLocaleString('ru-RU')} ₸ / {T.perMonth[locale]}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GroupCards({ groups, locale, className }: { groups: Group[]; locale: Locale; className?: string }) {
  if (groups.length === 0) return null;
  return (
    <ul data-block="groups" className={className ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
      {groups.map((group) => (
        <li key={group.id} className="hb-group-card">
          <span className="hb-group-name">{pick(locale, group.nameKk, group.nameRu)}</span>
          {group.ageFrom != null || group.ageTo != null ? (
            <span className="hb-group-age">{formatAgeRange(group.ageFrom, group.ageTo, locale)}</span>
          ) : null}
          {group.placesFree > 0 ? <span className="hb-group-free">{T.freePlaces[locale]}: {group.placesFree}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Полоса «Записаться на экскурсию»: ведёт на виртуальную приёмную сада —
 * там форма с защитой от спама. Без приёмной — на очередь Darabala.kz.
 */
export function EnrollBand({ feedbackSlug, locale, className }: { feedbackSlug?: string | null; locale: Locale; className?: string }) {
  return (
    <section data-block="enroll" className={className ?? 'card flex flex-wrap items-center justify-between gap-4 p-6'}>
      <div className="max-w-xl">
        <h2 className="hb-enroll-title">{T.enroll[locale]}</h2>
        <p className="hb-enroll-lead">{T.enrollLead[locale]}</p>
      </div>
      {feedbackSlug ? (
        <SiteLink href={`/${feedbackSlug}`} locale={locale} className="btn-primary hb-enroll-button">{T.enroll[locale]}</SiteLink>
      ) : (
        <a href="https://darabala.kz" target="_blank" rel="noopener noreferrer" className="btn-primary hb-enroll-button">{T.queue[locale]}</a>
      )}
    </section>
  );
}
