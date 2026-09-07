import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';

export const metadata: Metadata = { title: 'Контакты' };

export default function ContactsPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Контакты</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold">Для детских садов</h2>
          <p className="mt-2 text-sm text-muted">
            Подключение сайта, продление подписки, восстановление доступа, подключение
            собственного домена.
          </p>
          <Link href="/apply" className="btn-primary mt-4">Оставить заявку</Link>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold">Для родителей</h2>
          <p className="mt-2 text-sm text-muted">
            По вопросам конкретного сада пишите прямо в его виртуальную приёмную — на сайте сада
            в разделе «Виртуальная приёмная». Так обращение попадёт сразу к заведующей.
          </p>
          <Link href="/catalog" className="btn-secondary mt-4">Найти сад</Link>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">Портал: {env.portalDomain} · г. Актобе, Актюбинская область</p>
    </div>
  );
}
