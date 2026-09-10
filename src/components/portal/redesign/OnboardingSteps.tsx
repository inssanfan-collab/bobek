import type { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { withLocale } from '@/lib/i18n';

interface OnboardingStepsProps {
  locale: Locale;
}

export function OnboardingSteps({ locale }: OnboardingStepsProps) {
  const isKk = locale === 'kk';

  const STEPS = [
    {
      step: '01',
      badge: isKk ? '1 минут' : '1 минута',
      title: isKk ? 'Өтінім қалдырасыз' : 'Оставляете быструю заявку',
      desc: isKk
        ? 'Сайттағы нысанды толтырасыз немесе WhatsApp-қа жазасыз. Тек балабақша атауы мен телефон нөмірі қажет.'
        : 'Заполняете форму на сайте или звоните нам. Нужны только название сада и номер телефона для связи.',
      icon: '📝',
    },
    {
      step: '02',
      badge: isKk ? '24 сағат' : '24 часа',
      title: isKk ? 'Дайын сайт пен доступын аласыз' : 'Получаете готовый сайт и доступы',
      desc: isKk
        ? 'Біз сайтты іске қосып, келісімшарт жасаймыз және әкімші бөлімінің логин-паролін береміз.'
        : 'Мы разворачиваем сайт, привязываем домен, оформляем официальный договор и выдаем памятку с доступами.',
      icon: '🔑',
    },
    {
      step: '03',
      badge: isKk ? 'Оқытусыз' : 'Без обучения',
      title: isKk ? 'Өзіңіз оңай толтырасыз' : 'Наполняете сайт без программиста',
      desc: isKk
        ? 'Әкімші бөліміне кіріп, жаңалықтар, фото және тамақтану мәзірін қосасыз. Ешқандай күрделілік жоқ.'
        : 'Заходите в удобную админку с телефона или ПК и публикуете новости, фотоальбомы и меню дня в 2 клика.',
      icon: '🎉',
    },
  ];

  return (
    <section className="py-20 bg-surface/30">
      <div className="container-page">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3.5 py-1 text-xs font-bold text-brand-ink mb-3">
            🛣️ {isKk ? 'Іске қосу процесі' : 'Простой запуск'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {isKk
              ? 'Балабақша сайтын іске қосу қалай жүзеге асады'
              : 'Как запустить сайт детского сада за 3 простых шага'}
          </h2>
          <p className="mt-3 text-muted text-base sm:text-lg">
            {isKk
              ? 'Күрделі келісімдерсіз және ұзақ айлар күтпестен — барлығы 24 сағат ішінде.'
              : 'Без многомесячных согласований и сложных ТЗ — всё готово уже на следующий день.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="relative rounded-3xl border border-line bg-card p-8 shadow-soft flex flex-col justify-between hover:shadow-lift transition duration-300"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-line">
                  <span className="font-display text-3xl font-extrabold text-brand/30">
                    {item.step}
                  </span>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-ink">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-line text-2xl mb-4">
                  {item.icon}
                </div>

                <h3 className="font-display text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {idx === 2 ? (
                <div className="mt-8 pt-4 border-t border-line">
                  <Link
                    href={withLocale('/apply', locale)}
                    className="w-full flex items-center justify-center rounded-xl bg-brand py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm transition"
                  >
                    {isKk ? 'Қазір өтінім қалдыру →' : 'Подать заявку сейчас →'}
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
