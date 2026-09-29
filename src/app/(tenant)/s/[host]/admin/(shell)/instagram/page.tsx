import Link from 'next/link';
import { tenantAdmin } from '@/server/tenant/admin-context';
import { csrfToken } from '@/server/auth/csrf';
import { prisma } from '@/server/db';
import { PageHeader } from '@/components/admin/AdminShell';
import { Alert } from '@/components/ui/Alert';
import { accountFromProfile } from '@/lib/instagram';
import { InstagramImport } from './InstagramImport';

export const dynamic = 'force-dynamic';

const T = {
  title: { kk: 'Instagram-нан жаңалықтар', ru: 'Новости из Instagram' },
  lead: {
    kk: 'Instagram-дағы посттарды сайттың жаңалықтарына көшіреміз: мәтіні, күні, мұқабасы, ал бейне жаңалықтың ішінде ойнайды.',
    ru: 'Переносим посты из Instagram в новости сайта: текст, дата, обложка, а ролик играет прямо в новости.',
  },
  account: { kk: 'Балабақшаның Instagram-ы', ru: 'Instagram сада' },
  noAccount: {
    kk: '«Балабақша төлқұжатында» Instagram көрсетілмеген — оны көрсетсеңіз, бөтен аккаунттың посттарын байқап қаламыз.',
    ru: 'В «Паспорте сада» не указан Instagram — укажите его, и мы заметим, если по ошибке вставлена ссылка на чужой аккаунт.',
  },
  toProfile: { kk: 'Төлқұжатқа өту', ru: 'Открыть паспорт' },
  howTitle: { kk: 'Қалай жасалады', ru: 'Как это работает' },
  how: {
    kk: [
      'Instagram-да постты ашып, «Бөлісу» → «Сілтемені көшіру» басыңыз.',
      'Сілтемелерді төмендегі өріске қойып, «Көрсету» басыңыз.',
      'Керегін белгілеп, қажет болса тақырыбын түзетіп, «Жаңалықтарға көшіру» басыңыз.',
    ],
    ru: [
      'В Instagram откройте пост и нажмите «Поделиться» → «Копировать ссылку».',
      'Вставьте ссылки в поле ниже и нажмите «Показать».',
      'Отметьте нужные, при желании поправьте заголовок и нажмите «Перенести в новости».',
    ],
  },
  language: {
    kk: 'Мәтін посттағы тілде сақталады. Сайттың екінші тілінде де сол мәтін көрінеді — аударманы жаңалықтың өзінде кейін жазуға болады.',
    ru: 'Текст сохраняется на языке поста. На втором языке сайта покажется тот же текст — перевод можно дописать потом в самой новости.',
  },
  readOnly: { kk: 'Қазір тек қарауға болады.', ru: 'Сейчас доступен только просмотр.' },
} as const;

export default async function InstagramPage({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const ctx = await tenantAdmin(host);
  const locale = ctx.user.locale;
  const [csrf, profile] = await Promise.all([
    csrfToken(),
    prisma.tenantProfile.findUnique({ where: { tenantId: ctx.tenantId }, select: { instagram: true } }),
  ]);
  const account = accountFromProfile(profile?.instagram);

  return (
    <>
      <PageHeader title={T.title[locale]} description={T.lead[locale]} />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="card p-5">
          <h2 className="font-display text-base font-bold">{T.howTitle[locale]}</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {T.how[locale].map((line) => <li key={line}>{line}</li>)}
          </ol>
          <p className="mt-3 text-sm text-muted">{T.language[locale]}</p>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-base font-bold">{T.account[locale]}</h2>
          {account ? (
            <p className="mt-2">
              <a href={`https://www.instagram.com/${account}/`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">
                @{account}
              </a>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {T.noAccount[locale]} <Link href="/admin/profile" className="font-semibold text-brand underline">{T.toProfile[locale]}</Link>
            </p>
          )}
        </section>
      </div>

      {ctx.canEdit ? (
        <InstagramImport host={host} csrf={csrf} locale={locale} />
      ) : (
        <Alert tone="warn">{T.readOnly[locale]}</Alert>
      )}
    </>
  );
}
