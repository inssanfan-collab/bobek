import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Родителям',
  description:
    'Как встать в очередь в детский сад в Актобе через egov.kz, какие документы нужны и как выбрать сад.',
};

const STEPS = [
  {
    title: 'Встать в очередь',
    text: 'Очередь ведётся государством на портале egov.kz. Понадобятся ИИН ребёнка и ЭЦП. Можно выбрать до четырёх садов.',
    link: { href: 'https://egov.kz/cms/ru/articles/child/2Fdetskiii_sad_rk', label: 'Инструкция на egov.kz' },
  },
  {
    title: 'Дождаться направления',
    text: 'Когда подойдёт очередь, придёт уведомление о свободном месте. Направление нужно подтвердить в срок, иначе оно уйдёт следующему в очереди.',
    link: { href: 'https://balabaqsha.snation.kz/', label: 'Портал дошкольного образования' },
  },
  {
    title: 'Собрать документы',
    text: 'Обычно нужны: свидетельство о рождении, паспорт здоровья ребёнка, справка о состоянии здоровья и документ одного из родителей. Точный список уточняйте в саду.',
    link: null,
  },
];

export default function ParentsPage() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Родителям</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Коротко о том, как устроено попадание в детский сад в Казахстане, и где смотреть
        информацию о конкретном саде.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="card flex gap-4 p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand font-display text-lg font-extrabold text-white">
              {index + 1}
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">{step.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{step.text}</p>
              {step.link ? (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand underline"
                >
                  {step.link.label} →
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-soft p-6">
        <h2 className="font-display text-xl font-bold text-brand-ink">Мы не ведём очередь</h2>
        <p className="mt-2 text-sm text-brand-ink/80">
          Постановка в очередь и выдача направлений — государственная услуга. Наш портал показывает
          официальные сайты садов: контакты, педагогов, документы, меню и свободные места.
        </p>
        <Link href="/catalog" className="btn-primary mt-4">Открыть каталог садов</Link>
      </div>
    </div>
  );
}
