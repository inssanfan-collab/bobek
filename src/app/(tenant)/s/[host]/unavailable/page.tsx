import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { siteContext } from '@/server/tenant/context';

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
 * Причину родителям не называем: неоплата — дело сада и портала, а не повод
 * выставлять сад в неловком свете. Зато оставляем телефон и адрес — ради них
 * родитель чаще всего и открывает сайт.
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
      </div>
    </main>
  );
}
