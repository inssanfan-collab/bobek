import { prisma } from '@/server/db';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { PageHeader } from '@/components/admin/AdminShell';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Alert } from '@/components/ui/Alert';
import { ActionForm } from '@/components/ActionForm';
import { BilingualField } from '@/components/admin/BilingualField';
import { CSRF_FIELD } from '@/server/auth/csrf.client';
import { pick } from '@/lib/i18n';
import { saveHomepage } from '../actions';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Басты бет', ru: 'Главная страница' },
  lead: {
    kk: 'Тақырыпша мен басты беттің бірінші экранындағы мәтіндер. Барлығы міндетті емес: бос өріс — бұрынғыдай қалады.',
    ru: 'Тексты шапки и первого экрана главной. Всё необязательно: пустое поле — остаётся как было.',
  },
  onlyAdmin: {
    kk: 'Басты бет мәтіндерін балабақша әкімшісі өзгерте алады.',
    ru: 'Менять тексты главной может администратор сада.',
  },
  designHint: {
    kk: 'Тақырыпшаның түрі мен түсі — «Сыртқы көрінісі» бөлімінде.',
    ru: 'Вид и цвет шапки выбираются в разделе «Внешний вид».',
  },
  header: { kk: 'Сайт тақырыпшасы', ru: 'Шапка сайта' },
  tagline: { kk: 'Атаудың астындағы жазу', ru: 'Подпись под названием' },
  taglineHint: { kk: 'Мысалы: «Эко-балабақша». Бос болса — аудан көрсетіледі.', ru: 'Например: «Детский эко-сад». Пусто — показываем район.' },
  showPhone: { kk: 'Тақырыпшада телефон мен жұмыс уақытын көрсету', ru: 'Показывать в шапке телефон и часы работы' },
  showPhoneHint: { kk: 'Олар «Балабақша төлқұжатынан» алынады.', ru: 'Берутся из «Паспорта сада».' },
  headerCta: { kk: 'Тақырыпшадағы батырма', ru: 'Кнопка в шапке' },
  headerCtaHint: {
    kk: 'Мысалы: «Экскурсияға жазылу». Мәтін мен сілтеме екеуі де толтырылса ғана көрінеді.',
    ru: 'Например: «Записаться на экскурсию». Видна, только если заполнены и текст, и ссылка.',
  },
  hero: { kk: 'Бірінші экран', ru: 'Первый экран главной' },
  heroHint: {
    kk: 'Ата-ана сайтқа кіргенде ең алдымен көретіні. Бос болса — балабақша атауы мен «Біз туралы» мәтіні.',
    ru: 'Первое, что видит родитель. Если пусто — название сада и текст «О саде» из паспорта.',
  },
  eyebrow: { kk: 'Тақырып үстіндегі жазу', ru: 'Плашка над заголовком' },
  eyebrowHint: { kk: 'Қысқа ұран: «Үйлесімді өсу кеңістігі».', ru: 'Короткий девиз: «Пространство гармоничного взросления».' },
  heroTitle: { kk: 'Тақырып', ru: 'Заголовок' },
  heroTitleHint: { kk: 'Бос болса — балабақша атауы.', ru: 'Пусто — название сада.' },
  highlight: { kk: 'Тақырыптың түспен ерекшеленген бөлігі', ru: 'Выделенная цветом часть заголовка' },
  highlightHint: {
    kk: 'Тақырыптан кейін жаңа жолдан палитра түсімен шығады: «Табиғат пен ертегі арасындағы бақытты балалық шақ».',
    ru: 'Идёт второй строкой цветом палитры: «Счастливое детство среди» + «природы и сказки».',
  },
  heroLead: { kk: 'Сипаттама', ru: 'Описание' },
  heroLeadHint: { kk: 'Бір-екі сөйлем. Бос болса — «Біз туралы» мәтіні.', ru: 'Одно-два предложения. Пусто — текст «О саде».' },
  button1: { kk: 'Басты батырма', ru: 'Главная кнопка' },
  button2: { kk: 'Екінші батырма', ru: 'Вторая кнопка' },
  buttonText: { kk: 'Мәтіні', ru: 'Текст' },
  buttonUrl: { kk: 'Қайда апарады', ru: 'Куда ведёт' },
  urlHint: {
    kk: 'Тізімнен таңдаңыз немесе сілтеме жазыңыз: /contacts, tel:+7…, https://…',
    ru: 'Выберите из списка или впишите: /contacts, tel:+7…, https://…',
  },
  call: { kk: 'Қоңырау шалу', ru: 'Позвонить' },
  save: { kk: 'Сақтау', ru: 'Сохранить' },
  saved: { kk: 'Сақталды. Сайтта өзгерістер бірден көрінеді.', ru: 'Сохранено. На сайте изменения видны сразу.' },
  openSite: { kk: 'Сайттың басты бетін ашу', ru: 'Открыть главную сайта' },
} as const;

export default async function HomepageSettings({
  params,
  searchParams,
}: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ host }, { saved }] = await Promise.all([params, searchParams]);
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;

  if (!ctx.canManageSettings) {
    return (
      <>
        <PageHeader title={T.title[locale]} />
        <Alert tone="info">{T.onlyAdmin[locale]}</Alert>
      </>
    );
  }

  const [profile, csrf, sections] = await Promise.all([
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId } }),
    csrfToken(),
    ctx.db.sections.findMany({ where: { isVisible: true }, orderBy: { position: 'asc' } }),
  ]);
  const p = profile;

  const text = (name: string, value: string | null | undefined, placeholder = '', max = 80) => (
    <input name={name} defaultValue={value ?? ''} maxLength={max} placeholder={placeholder} className="field" />
  );
  const urlInput = (name: string, value: string | null | undefined) => (
    <input name={name} defaultValue={value ?? ''} list="homepage-links" maxLength={300} className="field font-mono text-sm" placeholder="/contacts" />
  );

  return (
    <>
      <PageHeader
        title={T.title[locale]}
        description={T.lead[locale]}
        action={
          <a href={`https://${ctx.primaryHost}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            {T.openSite[locale]} ↗
          </a>
        }
      />

      {saved ? (
        <div className="mb-5">
          <Alert tone="success">{T.saved[locale]}</Alert>
        </div>
      ) : null}

      {/* Подсказки для полей «Куда ведёт»: разделы сайта, приёмная, телефон. */}
      <datalist id="homepage-links">
        {sections
          .filter((section) => section.type !== 'LINK')
          .map((section) => (
            <option key={section.id} value={`/${section.slug}`}>{pick(locale, section.titleKk, section.titleRu)}</option>
          ))}
        {p?.phone ? <option value={`tel:${p.phone.replace(/[^\d+]/g, '')}`}>{T.call[locale]}</option> : null}
      </datalist>

      <ActionForm action={saveHomepage} className="space-y-5">
        <input type="hidden" name={CSRF_FIELD} value={csrf} />
        <input type="hidden" name="host" value={host} />

        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-bold">{T.header[locale]}</h2>
            <p className="mt-1 text-sm text-muted">{T.designHint[locale]}</p>
          </div>

          <BilingualField
            label={T.tagline[locale]}
            hint={T.taglineHint[locale]}
            ru={text('headerTaglineRu', p?.headerTaglineRu, 'Детский эко-сад', 60)}
            kk={text('headerTaglineKk', p?.headerTaglineKk, 'Эко-балабақша', 60)}
          />

          <label className="flex items-start gap-3">
            <input type="checkbox" name="headerShowPhone" defaultChecked={p?.headerShowPhone ?? false} className="mt-1 h-4 w-4" />
            <span>
              <span className="block font-semibold">{T.showPhone[locale]}</span>
              <span className="block text-sm text-muted">{T.showPhoneHint[locale]}</span>
            </span>
          </label>

          <div className="rounded-2xl border border-line p-4">
            <p className="font-semibold">{T.headerCta[locale]}</p>
            <p className="field-hint">{T.headerCtaHint[locale]}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <BilingualField
                label={T.buttonText[locale]}
                ru={text('headerCtaTextRu', p?.headerCtaTextRu, 'Записаться на экскурсию', 40)}
                kk={text('headerCtaTextKk', p?.headerCtaTextKk, 'Экскурсияға жазылу', 40)}
              />
              <div>
                <label className="field-label">{T.buttonUrl[locale]}</label>
                {urlInput('headerCtaUrl', p?.headerCtaUrl)}
                <p className="field-hint">{T.urlHint[locale]}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="card space-y-5 p-6">
          <div>
            <h2 className="font-display text-lg font-bold">{T.hero[locale]}</h2>
            <p className="mt-1 text-sm text-muted">{T.heroHint[locale]}</p>
          </div>

          <BilingualField
            label={T.eyebrow[locale]}
            hint={T.eyebrowHint[locale]}
            ru={text('heroEyebrowRu', p?.heroEyebrowRu, 'Пространство гармоничного взросления', 60)}
            kk={text('heroEyebrowKk', p?.heroEyebrowKk, 'Үйлесімді өсу кеңістігі', 60)}
          />
          <BilingualField
            label={T.heroTitle[locale]}
            hint={T.heroTitleHint[locale]}
            ru={text('heroTitleRu', p?.heroTitleRu, 'Счастливое детство среди', 90)}
            kk={text('heroTitleKk', p?.heroTitleKk, 'Бақытты балалық шақ', 90)}
          />
          <BilingualField
            label={T.highlight[locale]}
            hint={T.highlightHint[locale]}
            ru={text('heroHighlightRu', p?.heroHighlightRu, 'природы и сказки', 60)}
            kk={text('heroHighlightKk', p?.heroHighlightKk, 'табиғат пен ертегі арасында', 60)}
          />
          <BilingualField
            label={T.heroLead[locale]}
            hint={T.heroLeadHint[locale]}
            ru={<textarea name="heroLeadRu" defaultValue={p?.heroLeadRu ?? ''} rows={3} maxLength={300} className="field" />}
            kk={<textarea name="heroLeadKk" defaultValue={p?.heroLeadKk ?? ''} rows={3} maxLength={300} className="field" />}
          />

          {([1, 2] as const).map((n) => (
            <div key={n} className="rounded-2xl border border-line p-4">
              <p className="font-semibold">{n === 1 ? T.button1[locale] : T.button2[locale]}</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <BilingualField
                  label={T.buttonText[locale]}
                  ru={text(`heroCta${n}TextRu`, n === 1 ? p?.heroCta1TextRu : p?.heroCta2TextRu, n === 1 ? 'Записаться на экскурсию' : 'Наши группы', 40)}
                  kk={text(`heroCta${n}TextKk`, n === 1 ? p?.heroCta1TextKk : p?.heroCta2TextKk, n === 1 ? 'Экскурсияға жазылу' : 'Біздің топтар', 40)}
                />
                <div>
                  <label className="field-label">{T.buttonUrl[locale]}</label>
                  {urlInput(`heroCta${n}Url`, n === 1 ? p?.heroCta1Url : p?.heroCta2Url)}
                  <p className="field-hint">{T.urlHint[locale]}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <SubmitButton>{T.save[locale]}</SubmitButton>
      </ActionForm>
    </>
  );
}
