import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { formatDate } from '@/lib/labels';
import { pick } from '@/lib/i18n';
import { clearNotice, saveNotice } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Шұғыл хабарландыру', ru: 'Срочное объявление' },
  lead: {
    kk: 'Сайттың барлық бетіндегі жолақ: карантин, сабақтың болмауы, режимнің өзгеруі.',
    ru: 'Полоса на всех страницах сайта: карантин, отмена занятий, изменение режима.',
  },
  onlyAdmin: {
    kk: 'Шұғыл хабарландыруды балабақша әкімшісі жариялай алады.',
    ru: 'Публиковать срочное объявление может администратор сада.',
  },
  shownNow: { kk: 'Хабарландыру қазір сайтта көрсетіліп тұр', ru: 'Объявление сейчас показывается на сайте' },
  expired: { kk: 'Хабарландырудың мерзімі бітті, енді көрсетілмейді', ru: 'Объявление истекло и уже не показывается' },
  until: { kk: '%s дейін', ru: 'до %s' },
  text: { kk: 'Мәтін', ru: 'Текст' },
  tone: { kk: 'Қалай ерекшелеу', ru: 'Как выделить' },
  showUntil: { kk: 'Қашанға дейін көрсету', ru: 'Показывать до' },
  showUntilHint: {
    kk: 'Осы күннен кейін хабарландыру өзі алынады — ұмытып кетпейсіз.',
    ru: 'После этой даты объявление снимется само — не забудете убрать.',
  },
  publish: { kk: 'Хабарландыруды жариялау', ru: 'Опубликовать объявление' },
  clear: { kk: 'Хабарландыруды қазір алу', ru: 'Снять объявление сейчас' },
  inRu: { kk: '(орыс.)', ru: '(рус.)' },
  inKk: { kk: '(қаз.)', ru: '(каз.)' },
} as const;

const TONES = [
  { value: 'INFO', label: { kk: 'Ақпарат — көк жолақ', ru: 'Информация — синяя полоса' } },
  { value: 'WARN', label: { kk: 'Назар аударыңыз — сары жолақ', ru: 'Внимание — жёлтая полоса' } },
  { value: 'URGENT', label: { kk: 'Шұғыл — қызыл жолақ', ru: 'Срочно — красная полоса' } },
];

export default async function NoticePage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  const [profile, csrf] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
  ]);

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title={T.title[locale]} />
        <Alert tone="info">{T.onlyAdmin[locale]}</Alert>
      </>
    );
  }

  const active = Boolean(profile?.noticeRu || profile?.noticeKk);
  const expired = profile?.noticeUntil ? profile.noticeUntil < new Date() : false;

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
      />

      {active ? (
        <div className="mb-6">
          <Alert tone={expired ? 'info' : 'warn'} title={expired ? T.expired[locale] : T.shownNow[locale]}>
            {pick(locale, profile?.noticeKk, profile?.noticeRu)}
            {profile?.noticeUntil
              ? ` (${T.until[locale].replace('%s', formatDate(profile.noticeUntil, locale))})`
              : ''}
          </Alert>
        </div>
      ) : null}

      <form action={saveNotice} className="card grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="noticeRu">{T.text[locale]} {T.inRu[locale]}</label>
          <textarea
            id="noticeRu"
            name="noticeRu"
            rows={2}
            defaultValue={profile?.noticeRu ?? ''}
            className="field"
            placeholder="С 10 по 20 марта группа «Гүлдер» закрыта на карантин"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="noticeKk">{T.text[locale]} {T.inKk[locale]}</label>
          <textarea id="noticeKk" name="noticeKk" rows={2} defaultValue={profile?.noticeKk ?? ''} className="field" />
        </div>

        <div>
          <label className="field-label" htmlFor="noticeTone">{T.tone[locale]}</label>
          <select id="noticeTone" name="noticeTone" defaultValue={profile?.noticeTone ?? 'WARN'} className="field">
            {TONES.map((tone) => (
              <option key={tone.value} value={tone.value}>{tone.label[locale]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="noticeUntil">{T.showUntil[locale]}</label>
          <input
            id="noticeUntil"
            name="noticeUntil"
            type="date"
            defaultValue={profile?.noticeUntil ? profile.noticeUntil.toISOString().slice(0, 10) : ''}
            className="field"
          />
          <p className="field-hint">{T.showUntilHint[locale]}</p>
        </div>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <SubmitButton>{T.publish[locale]}</SubmitButton>
        </div>
      </form>

      {active ? (
        <form action={clearNotice} className="mt-4">
          <input type="hidden" name={CSRF_FIELD} value={csrf} />
          <input type="hidden" name="host" value={host} />
          <button type="submit" className="btn-secondary text-sm">{T.clear[locale]}</button>
        </form>
      ) : null}
    </>
  );
}
