import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { siteContext } from '@/server/tenant/context';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Сайт временно недоступен',
  // Заглушку индексировать нельзя: иначе она заменит в поиске настоящий сайт
  // и останется там и после того, как сад оплатит.
  robots: { index: false, follow: false },
};

/**
 * Что видит посетитель приостановленного сада.
 *
 * Причина — неоплата — названа прямо: так решил владелец портала, и так
 * записано в оферте (8.2.1). Строка для администрации сада нужна, чтобы
 * сотрудник, открывший свой сайт, сразу понял, куда обращаться. Телефон
 * и адрес оставляем — ради них родитель чаще всего и открывает сайт.
 *
 * Текст сразу на двух языках: на заглушку попадают по редиректу, и язык,
 * выбранный на странице, до неё не доезжает.
 */
export default async function UnavailablePage({ params }: { params: Promise<{ host: string }> }) {
  const { tenant, profile } = await siteContext((await params).host);

  // Сад оплатил — сайт открыт, заглушка больше не нужна.
  if (tenant.status === 'ACTIVE') redirect('/');
  if (tenant.status !== 'SUSPENDED') notFound();

  const logo = profile?.logoMediaId ? `/api/media/${profile.logoMediaId}` : null;
  const phone = profile?.phone;

  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 py-12">
      <div className="card w-full max-w-lg p-8 text-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- логотип сада отдаётся своим роутом
          <img src={logo} alt="" className="mx-auto h-20 w-20 rounded-2xl object-contain" />
        ) : null}

        <p className="mt-4 font-display text-xl font-bold">{profile?.nameKk}</p>
        {profile?.nameRu && profile.nameRu !== profile.nameKk ? (
          <p className="font-display text-lg text-muted">{profile.nameRu}</p>
        ) : null}

        <h1 className="mt-6 font-display text-2xl font-extrabold">Сайт уақытша қолжетімсіз</h1>
        <p className="mt-1 font-display text-xl font-bold text-muted">Сайт временно недоступен</p>

        <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Сайттың жұмысы қызмет ақысының төленбеуіне байланысты тоқтатылды.</p>
          <p className="mt-1 font-semibold">Работа сайта приостановлена в связи с неоплатой услуги.</p>
        </div>

        <p className="mt-4 text-sm text-muted">
          Балабақшамен телефон арқылы хабарласуға болады.
          <br />
          Связаться с детским садом можно по телефону.
        </p>

        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="btn-primary mt-6 inline-flex text-lg"
          >
            {phone}
          </a>
        ) : null}

        {profile?.addressKk || profile?.addressRu ? (
          <p className="mt-4 text-sm text-muted">{profile.addressRu || profile.addressKk}</p>
        ) : null}

        <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
          Балабақша әкімшілігіне: жұмысты қайта бастау үшін EduSad-пен хабарласыңыз.
          <br />
          Администрации детского сада: для возобновления работы свяжитесь с EduSad —{' '}
          <a href={`https://${env.portalDomain}/contacts`} className="font-semibold text-brand">
            {env.portalDomain}
          </a>
        </p>
      </div>
    </main>
  );
}
