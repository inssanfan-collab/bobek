import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';

export const metadata: Metadata = {
  title: 'Тарифы',
  description: 'Сайт детского сада за 20 000 ₸ в год: движок, админка, хостинг, поддержка, адрес на домене портала.',
};

const INCLUDED = [
  'Адрес вида ваш-сад.' + env.portalDomain,
  'Готовый движок: 3 шаблона и 6 цветовых палитр',
  'Админка для наполнения — новости, галерея, документы, педагоги, меню',
  'Двуязычие: казахский и русский',
  'Версия для слабовидящих',
  'Хостинг, обновления и резервные копии',
  'Поддержка и восстановление доступа',
];

const NOT_INCLUDED = [
  'Собственный домен (например, ваш-сад.kz) — сад покупает сам, мы бесплатно подключаем',
  'Профессиональная фотосъёмка сада',
  'Наполнение контентом за вас (можем сделать за отдельную плату)',
];

export default function PricingPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Тариф</h1>
      <p className="mt-2 max-w-2xl text-muted">Один тариф без скрытых доплат и ограничений по количеству новостей и фото.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card border-brand/40 bg-brand-soft p-8">
          <p className="font-semibold text-brand-ink">Сайт детского сада</p>
          <p className="mt-2 font-display text-5xl font-extrabold text-brand-ink">
            {formatMoney(env.subscriptionPrice)}
          </p>
          <p className="mt-1 text-brand-ink/80">в год</p>
          <Link href="/apply" className="btn-primary mt-6 w-full">Оставить заявку</Link>
          <p className="mt-3 text-sm text-brand-ink/70">
            Оплата по счёту или на Kaspi. Сайт запускаем в течение одного рабочего дня.
          </p>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">Что входит</h2>
            <ul className="mt-4 space-y-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-emerald-600" aria-hidden>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-xl font-bold">Что не входит</h2>
            <ul className="mt-4 space-y-2">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted">
                  <span aria-hidden>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-display text-xl font-bold">Частые вопросы</h2>
        <dl className="mt-4 space-y-5">
          <div>
            <dt className="font-semibold">Что будет, если не продлить подписку?</dt>
            <dd className="mt-1 text-sm text-muted">
              Сайт продолжит работать ещё {env.subscriptionGraceDays} дней, но админка перейдёт в режим
              только чтения. Мы напомним заранее — за 30, 14 и 3 дня до окончания.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Можно ли перенести сайт на свой домен?</dt>
            <dd className="mt-1 text-sm text-muted">
              Да. Сад покупает домен у казахстанского регистратора и оформляет его на себя,
              прописывает A-запись — мы подключаем бесплатно. Прежний адрес продолжит работать.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Кто заполняет сайт?</dt>
            <dd className="mt-1 text-sm text-muted">
              Сотрудник сада через админку. Она рассчитана на методиста или воспитателя —
              специальных знаний не нужно.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Забыли пароль — что делать?</dt>
            <dd className="mt-1 text-sm text-muted">
              Позвоните администратору портала: он сбросит пароль и продиктует новый.
              Все такие действия фиксируются в журнале.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
