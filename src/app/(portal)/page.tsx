import Link from 'next/link';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

const FEATURES = [
  { icon: '📰', title: 'Новости и объявления', text: 'Утренники, карантин, собрания — родители узнают сразу, а не из чата.' },
  { icon: '📷', title: 'Фотогалерея', text: 'Альбомы с праздников. Загрузка пачкой, размер фото уменьшается сам.' },
  { icon: '📄', title: 'Документы', text: 'Устав, лицензия, правила приёма, госзакупки — всё на виду у проверяющих.' },
  { icon: '👩‍🏫', title: 'Педагоги и группы', text: 'Состав, образование, стаж, категории, свободные места по группам.' },
  { icon: '🍎', title: 'Меню питания', text: 'Меню по дням или скан утверждённого. Самый частый вопрос родителей.' },
  { icon: '✉️', title: 'Виртуальная приёмная', text: 'Обращения родителей приходят прямо в вашу админку.' },
];

const STEPS = [
  { n: 1, title: 'Оставляете заявку', text: 'Звоните или заполняете форму. Нужны только название сада и телефон.' },
  { n: 2, title: 'Получаете сайт и доступы', text: 'Мы создаём сайт и выдаём памятку: адрес, логин и пароль от админки.' },
  { n: 3, title: 'Наполняете сами', text: 'Заходите в админку и добавляете новости, фото и документы. Обучение не нужно.' },
];

export default async function PortalHome() {
  const [gardenCount, latestGardens] = await Promise.all([
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: { profile: true, domains: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="decor pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-soft blur-3xl" aria-hidden />
        <div className="decor pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" aria-hidden />

        <div className="container-page relative grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="badge bg-brand-soft text-brand-ink">Актюбинская область</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Свой сайт детского сада —{' '}
              <span className="text-brand">за 20 000 ₸ в год</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Готовый движок с админкой: новости, объявления, фотогалерея, документы, педагоги,
              меню питания. Заполняете сами, без программиста. Сайт на казахском и русском.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/apply" className="btn-primary px-6 py-3 text-base">Подключить свой сад</Link>
              <Link href="/catalog" className="btn-secondary px-6 py-3 text-base">Посмотреть каталог</Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-muted">Садов на портале</dt>
                <dd className="font-display text-2xl font-extrabold">{gardenCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Запуск сайта</dt>
                <dd className="font-display text-2xl font-extrabold">1 день</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Языки</dt>
                <dd className="font-display text-2xl font-extrabold">ҚАЗ / РУС</dd>
              </div>
            </dl>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-line bg-brand-soft/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
              <span className="ml-3 truncate rounded-lg bg-card px-3 py-1 text-xs text-muted">
                sad12.{env.portalDomain}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-brand/80 to-accent/70" aria-hidden />
              <div className="grid grid-cols-3 gap-3" aria-hidden>
                {['📰', '📷', '📄'].map((icon) => (
                  <div key={icon} className="grid h-20 place-items-center rounded-2xl bg-brand-soft text-2xl">
                    {icon}
                  </div>
                ))}
              </div>
              <div className="space-y-2" aria-hidden>
                <div className="h-3 w-3/4 rounded-full bg-line" />
                <div className="h-3 w-full rounded-full bg-line" />
                <div className="h-3 w-2/3 rounded-full bg-line" />
              </div>
              <p className="text-sm text-muted">
                Так выглядит сайт сада сразу после подключения — остаётся добавить фотографии и новости.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="font-display text-3xl font-extrabold">Что входит в сайт</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Набор разделов собран по требованиям к сайтам дошкольных организаций — то,
          что спрашивают проверяющие и ищут родители.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-6">
              <span className="text-3xl" aria-hidden>{feature.icon}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="container-page">
          <h2 className="font-display text-3xl font-extrabold">Как это работает</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="relative rounded-2xl border border-line p-6">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand font-display text-lg font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-2xl border border-brand/30 bg-brand-soft p-6 sm:p-8">
            <h3 className="font-display text-2xl font-extrabold text-brand-ink">20 000 ₸ в год — всё включено</h3>
            <p className="mt-2 max-w-2xl text-brand-ink/80">
              Адрес вида <strong>ваш-сад.{env.portalDomain}</strong>, движок, админка, хостинг,
              обновления и поддержка. Если сад хочет собственный домен — он покупает его
              самостоятельно, а мы бесплатно подключаем.
            </p>
            <Link href="/pricing" className="btn-primary mt-5">Подробнее о тарифе</Link>
          </div>
        </div>
      </section>

      {latestGardens.length > 0 ? (
        <section className="container-page py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold">Сады на портале</h2>
            <Link href="/catalog" className="btn-ghost">Весь каталог →</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestGardens.map((tenant) => (
              <a
                key={tenant.id}
                href={`https://${tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`}`}
                className="card p-5 transition hover:shadow-lift"
              >
                <p className="font-display text-lg font-bold">{tenant.profile?.nameRu ?? tenant.slug}</p>
                {tenant.profile?.district ? (
                  <p className="mt-1 text-sm text-muted">{tenant.profile.district}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-brand">Открыть сайт →</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
