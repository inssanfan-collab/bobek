'use client';

import { useState } from 'react';
import { ActionForm } from '@/components/ActionForm';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { CUSTOM_KINDS, type CustomKind } from '@/lib/sections';
import type { Locale } from '@/lib/i18n';
import { createSection } from '../actions';

type Option = { id: string; label: string };

const T = {
  heading: { kk: 'Өз бөліміңізді құру', ru: 'Создать свой раздел' },
  lead: {
    kk: 'Стандартты жиынтықта жоқ бөлім керек болса. Мұндай бөлімдерді қанша болса да құруға болады.',
    ru: 'Если нужного раздела нет в стандартном наборе. Таких разделов можно создать сколько угодно.',
  },
  kind: { kk: 'Бөлімнің түрі', ru: 'Вид раздела' },
  titleRu: { kk: 'Атауы орысша', ru: 'Название по-русски' },
  titleKk: { kk: 'Атауы қазақша', ru: 'Название по-казахски' },
  titleKkHint: { kk: 'Бос болса — орысшасы көрсетіледі.', ru: 'Если пусто — покажем русское.' },
  slug: { kk: 'Мекенжайы', ru: 'Адрес' },
  slugHint: {
    kk: 'Міндетті емес. Бос болса, атауынан жасаймыз.',
    ru: 'Необязательно. Если пусто — соберём из названия.',
  },
  place: { kk: 'Мәзірдегі орны', ru: 'Где в меню' },
  topLevel: { kk: 'Басты мәзірде', ru: 'В главном меню' },
  inside: { kk: 'Ішінде: %s', ru: 'Внутри: %s' },
  folder: { kk: 'Құжаттар бумасы', ru: 'Папка с документами' },
  chooseFolder: { kk: '— буманы таңдаңыз —', ru: '— выберите папку —' },
  noFolders: {
    kk: 'Бумалар әлі жоқ. Алдымен «Құжаттар» бөлімінде бума құрыңыз.',
    ru: 'Папок пока нет. Сначала создайте папку в разделе «Документы».',
  },
  url: { kk: 'Сілтеме мекенжайы', ru: 'Адрес ссылки' },
  urlHint: {
    kk: 'Мысалы: darabala.kz немесе https://instagram.com/…',
    ru: 'Например: darabala.kz или https://instagram.com/…',
  },
  create: { kk: 'Құру', ru: 'Создать' },
} as const;

/**
 * Форма своего раздела. Клиентская ради одного: поля «папка» и «ссылка»
 * нужны только своему виду раздела, и показывать их всем — значит
 * заставлять заведующую гадать, что из этого заполнять.
 */
export function NewSectionForm({
  csrf,
  host,
  locale,
  parents,
  folders,
}: {
  csrf: string;
  host: string;
  locale: Locale;
  parents: Option[];
  folders: Option[];
}) {
  const [kind, setKind] = useState<CustomKind>('page');

  return (
    <section className="card mt-8 p-6">
      <h2 className="font-display text-lg font-bold">{T.heading[locale]}</h2>
      <p className="mt-1 text-sm text-muted">{T.lead[locale]}</p>

      <ActionForm action={createSection} className="mt-5 space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <fieldset>
          <legend className="field-label">{T.kind[locale]}</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {CUSTOM_KINDS.map((item) => {
              const disabled = item.kind === 'folder' && folders.length === 0;
              return (
                <label
                  key={item.kind}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-3 ${
                    kind === item.kind ? 'border-brand bg-brand-soft/60' : 'border-line'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={item.kind}
                    checked={kind === item.kind}
                    disabled={disabled}
                    onChange={() => setKind(item.kind)}
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block font-semibold">
                      <span aria-hidden>{item.icon}</span> {item.title[locale]}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">{item.hint[locale]}</span>
                    {disabled ? <span className="mt-1 block text-xs font-semibold">{T.noFolders[locale]}</span> : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="new-titleRu">{T.titleRu[locale]} *</label>
            <input id="new-titleRu" name="titleRu" required maxLength={80} className="field" placeholder="Логопед" />
          </div>
          <div>
            <label className="field-label" htmlFor="new-titleKk">{T.titleKk[locale]}</label>
            <input id="new-titleKk" name="titleKk" maxLength={80} className="field" placeholder="Логопед" />
            <p className="mt-1 text-xs text-muted">{T.titleKkHint[locale]}</p>
          </div>
        </div>

        {kind === 'folder' ? (
          <div>
            <label className="field-label" htmlFor="new-folder">{T.folder[locale]} *</label>
            <select id="new-folder" name="folderId" required className="field" defaultValue="">
              <option value="" disabled>{T.chooseFolder[locale]}</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.label}</option>
              ))}
            </select>
          </div>
        ) : null}

        {kind === 'link' ? (
          <div>
            <label className="field-label" htmlFor="new-url">{T.url[locale]} *</label>
            <input id="new-url" name="url" required inputMode="url" className="field" placeholder="darabala.kz" />
            <p className="mt-1 text-xs text-muted">{T.urlHint[locale]}</p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="new-parent">{T.place[locale]}</label>
            <select id="new-parent" name="parentId" className="field" defaultValue="">
              <option value="">{T.topLevel[locale]}</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>{T.inside[locale].replace('%s', parent.label)}</option>
              ))}
            </select>
          </div>
          {kind !== 'link' ? (
            <div>
              <label className="field-label" htmlFor="new-slug">{T.slug[locale]}</label>
              <div className="flex items-center gap-1">
                <span className="text-muted">/</span>
                <input id="new-slug" name="slug" maxLength={60} className="field font-mono text-sm" placeholder="logoped" />
              </div>
              <p className="mt-1 text-xs text-muted">{T.slugHint[locale]}</p>
            </div>
          ) : null}
        </div>

        <SubmitButton>{T.create[locale]}</SubmitButton>
      </ActionForm>
    </section>
  );
}
