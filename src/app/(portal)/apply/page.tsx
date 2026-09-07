import type { Metadata } from 'next';
import { csrfToken } from '@/server/auth/csrf';
import { ApplyForm } from './ApplyForm';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Заявка на подключение',
  description: 'Оставьте заявку — подготовим сайт детского сада с админкой и выдадим доступы.',
};

export default async function ApplyPage() {
  const csrf = await csrfToken();

  return (
    <div className="container-page py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Подключить детский сад</h1>
          <p className="mt-3 text-muted">
            Заполните форму — перезвоним, уточним название и создадим сайт. Обычно это занимает
            один рабочий день.
          </p>

          <div className="card mt-6 space-y-4 p-6">
            <div>
              <p className="text-sm text-muted">Стоимость</p>
              <p className="font-display text-3xl font-extrabold">{formatMoney(env.subscriptionPrice)} / год</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> Адрес ваш-сад.{env.portalDomain}</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> Админка и обучение по телефону</li>
              <li className="flex gap-2"><span className="text-emerald-600" aria-hidden>✓</span> Хостинг, копии, поддержка</li>
            </ul>
            <p className="text-sm text-muted">
              Собственный домен сад покупает сам — подключим бесплатно.
            </p>
          </div>
        </div>

        <ApplyForm csrf={csrf} />
      </div>
    </div>
  );
}
