'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n';
import type { VideoRef } from '@/lib/video';

const T = {
  play: { kk: 'Бейнені қосу', ru: 'Смотреть видео' },
  openAt: { kk: 'Бастапқы көзінде ашу', ru: 'Открыть в первоисточнике' },
  youtube: { kk: 'YouTube-та ашу', ru: 'Открыть на YouTube' },
  instagram: { kk: 'Instagram-да ашу', ru: 'Открыть в Instagram' },
} as const;

/**
 * Ролик показывается проигрывателем того сервиса, где он лежит, и только
 * после нажатия. До нажатия на странице нет ни одного чужого запроса:
 * иначе каждый зашедший на новость отдавал бы куки YouTube или Meta,
 * ничего не посмотрев. Заодно страница на телефоне открывается быстро —
 * проигрыватель весит больше, чем вся остальная новость.
 */
export function VideoEmbed({
  video,
  poster,
  title,
  locale,
}: {
  video: VideoRef;
  /** Обложка сада. Для Instagram это единственный источник: свою они не отдают. */
  poster: string | null;
  title: string;
  locale: Locale;
}) {
  const [playing, setPlaying] = useState(false);
  const cover = poster ?? video.posterUrl;

  if (playing) {
    return (
      <div className="mt-6 overflow-hidden rounded-3xl bg-black">
        <iframe
          src={video.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          // Instagram отдаёт вертикальный ролик и свою обвязку с подписью,
          // поэтому окно под него выше, чем под YouTube.
          className={`w-full border-0 ${video.kind === 'instagram' ? 'aspect-[9/14] sm:h-[680px]' : 'aspect-video'}`}
        />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`${T.play[locale]}: ${title}`}
        className="group relative block w-full overflow-hidden rounded-3xl bg-brand-soft"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- обложка приходит от сервиса или из нашего медиа
          <img
            src={cover}
            alt=""
            className={`w-full object-cover ${video.kind === 'instagram' ? 'max-h-[560px]' : 'aspect-video'}`}
            loading="lazy"
          />
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-brand/70 to-accent/60" aria-hidden />
        )}

        <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/35">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-lift transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-brand-ink" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>

      <p className="mt-2 text-sm text-muted">
        <a href={video.pageUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
          {video.kind === 'youtube' ? T.youtube[locale] : T.instagram[locale]} →
        </a>
      </p>
    </div>
  );
}
