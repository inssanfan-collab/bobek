'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import type { Locale } from '@/lib/i18n';
import { importInstagram, previewInstagram, type ImportState, type InstagramCard, type PreviewState } from './actions';

const T = {
  links: { kk: 'Посттардың сілтемелері', ru: 'Ссылки на посты' },
  linksHint: {
    kk: 'Instagram-да постты ашып, «Бөлісу» → «Сілтемені көшіру» басыңыз да, осында қойыңыз. Бірнеше сілтемені әр жолға қоюға болады, бір рет 12-ге дейін.',
    ru: 'В Instagram откройте пост, нажмите «Поделиться» → «Копировать ссылку» и вставьте сюда. Можно несколько ссылок, каждую с новой строки, до 12 за раз.',
  },
  show: { kk: 'Көрсету', ru: 'Показать' },
  loading: { kk: 'Instagram-нан аламыз…', ru: 'Забираем из Instagram…' },
  transfer: { kk: 'Жаңалықтарға көшіру', ru: 'Перенести в новости' },
  transferring: { kk: 'Көшіреміз…', ru: 'Переносим…' },
  title: { kk: 'Жаңалық тақырыбы', ru: 'Заголовок новости' },
  noCaption: { kk: 'Посттың мәтіні жоқ', ru: 'У поста нет подписи' },
  reel: { kk: 'Бейне', ru: 'Ролик' },
  photo: { kk: 'Фото', ru: 'Фото' },
  exists: { kk: 'Сайтта бар', ru: 'Уже на сайте' },
  foreign: { kk: 'Бұл сіздің Instagram емес', ru: 'Это не ваш Instagram' },
  failed: {
    kk: 'Бұл посттарды ашу мүмкін болмады — аккаунт ашық екенін және сілтеме дұрыс екенін тексеріңіз:',
    ru: 'Эти посты открыть не удалось — проверьте, что аккаунт открытый и ссылка верная:',
  },
  done: { kk: 'Жаңалықтарға көшірілді', ru: 'Перенесено в новости' },
  nothingNew: { kk: 'Жаңа пост жоқ — таңдалғандардың бәрі сайтта бар.', ru: 'Нового нет — все выбранные посты уже на сайте.' },
  open: { kk: 'ашу', ru: 'открыть' },
  again: { kk: 'Тағы көшіру', ru: 'Перенести ещё' },
  selected: { kk: 'Таңдалды', ru: 'Выбрано' },
} as const;

function Submit({ idle, busy, disabled }: { idle: string; busy: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending || disabled}>
      {pending ? busy : idle}
    </button>
  );
}

/**
 * Перенос постов Instagram в новости. Шаг 1 — сотрудник вставляет ссылки,
 * сервер открывает посты и показывает карточки. Шаг 2 — отмечает нужные,
 * при желании правит заголовки, и они становятся новостями.
 */
export function InstagramImport({ host, csrf, locale, defaultLinks }: { host: string; csrf: string; locale: Locale; defaultLinks?: string }) {
  const [preview, previewAction] = useActionState<PreviewState, FormData>(previewInstagram, {});
  const [result, importAction] = useActionState<ImportState, FormData>(importInstagram, {});
  // Отметки, которые сотрудник переключил: свой новый пост отмечен сразу,
  // пост чужого аккаунта — нет, но отметить его можно (второй аккаунт, репост).
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  const cards = preview.cards ?? [];
  const isOn = (card: InstagramCard) => !card.exists && (!card.foreign !== flipped.has(card.code));
  const chosen = cards.filter(isOn);

  const hidden = (
    <>
      <input type="hidden" name={CSRF_FIELD} value={csrf} />
      <input type="hidden" name="host" value={host} />
    </>
  );

  if (result.created) {
    return (
      <section className="card space-y-4 p-6">
        {result.created.length ? (
          <Alert tone="success" title={`${T.done[locale]}: ${result.created.length}`}>
            <ul className="mt-2 space-y-1">
              {result.created.map((item) => (
                <li key={item.href}>
                  {item.title} — <a className="font-semibold underline" href={item.href}>{T.open[locale]}</a>
                </li>
              ))}
            </ul>
          </Alert>
        ) : (
          <Alert tone="info">{T.nothingNew[locale]}</Alert>
        )}
        {result.failed?.length ? <FailedList links={result.failed} locale={locale} /> : null}
        <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>{T.again[locale]}</button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <form action={(data) => { setFlipped(new Set()); previewAction(data); }} className="card space-y-3 p-6">
        {hidden}
        {preview.error ? <Alert tone="danger">{preview.error}</Alert> : null}
        <label className="field-label" htmlFor="ig-links">{T.links[locale]}</label>
        <textarea
          id="ig-links"
          name="links"
          rows={4}
          required
          defaultValue={defaultLinks}
          className="field font-mono text-sm"
          placeholder="https://www.instagram.com/reel/…"
        />
        <p className="field-hint">{T.linksHint[locale]}</p>
        <Submit idle={T.show[locale]} busy={T.loading[locale]} />
      </form>

      {preview.failed?.length ? <FailedList links={preview.failed} locale={locale} /> : null}

      {cards.length ? (
        <form action={importAction} className="space-y-4">
          {hidden}
          {result.error ? <Alert tone="danger">{result.error}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const can = !card.exists;
              const on = isOn(card);
              return (
                <article key={card.code} className={`card overflow-hidden ${can ? '' : 'opacity-60'}`}>
                  <label className="relative block cursor-pointer">
                    {card.imageUrl ? (
                      // Обложку показываем прямо с Instagram: к себе она сохранится только при переносе.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt="" referrerPolicy="no-referrer" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="grid aspect-square w-full place-items-center bg-brand-soft text-4xl" aria-hidden>📷</div>
                    )}
                    <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold shadow">
                      <input
                        type="checkbox"
                        name="code"
                        value={card.code}
                        checked={on}
                        disabled={!can}
                        onChange={() => setFlipped((prev) => {
                          const next = new Set(prev);
                          if (next.has(card.code)) next.delete(card.code); else next.add(card.code);
                          return next;
                        })}
                        className="h-4 w-4"
                      />
                      {card.exists ? T.exists[locale] : card.foreign ? T.foreign[locale] : card.kind === 'reel' ? T.reel[locale] : T.photo[locale]}
                    </span>
                  </label>
                  <div className="space-y-2 p-4">
                    <p className="text-xs text-muted">
                      {card.dateText} · <a href={card.url} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>
                    </p>
                    <label className="field-label" htmlFor={`title-${card.code}`}>{T.title[locale]}</label>
                    <input id={`title-${card.code}`} name={`title-${card.code}`} defaultValue={card.title} maxLength={200} disabled={!can} className="field" />
                    <p className="line-clamp-4 whitespace-pre-line text-sm text-muted">{card.caption || T.noCaption[locale]}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Submit idle={`${T.transfer[locale]} (${chosen.length})`} busy={T.transferring[locale]} disabled={chosen.length === 0} />
          </div>
        </form>
      ) : null}
    </div>
  );
}

function FailedList({ links, locale }: { links: string[]; locale: Locale }) {
  return (
    <Alert tone="warn">
      {T.failed[locale]}
      <ul className="mt-2 space-y-1 break-all text-sm">
        {links.map((link) => <li key={link}><a href={link} target="_blank" rel="noopener noreferrer" className="underline">{link}</a></li>)}
      </ul>
    </Alert>
  );
}
