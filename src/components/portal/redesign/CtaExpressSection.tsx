import type { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { withLocale } from '@/lib/i18n';

interface CtaExpressSectionProps {
  locale: Locale;
}

export function CtaExpressSection({ locale }: CtaExpressSectionProps) {
  const isKk = locale === 'kk';

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-8 sm:p-14 text-white shadow-2xl">
          {/* Subtle background glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur mb-6">
              <span>🚀</span>
              <span>{isKk ? 'Ақтөбе балабақшаларына арналған арнайы ұсыныс' : 'Специальное предложение для садов Актобе'}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {isKk
                ? 'Балабақшаңыздың ресми сайтын бүгін іске қосыңыз'
                : 'Запустите современный официальный сайт своего сада уже сегодня'}
            </h2>

            <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
              {isKk
                ? 'Жылына небәрі 50 000 ₸. Тексерушілер сұрайтын барлық бөлімдер, қос тілді қолдау және шексіз жаңалықтар.'
                : 'Всего 50 000 ₸ в год под ключ. Без скрытых платежей, без программистов, с официальным договором и закрывающими документами.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={withLocale('/apply', locale)}
                className="rounded-2xl bg-brand px-8 py-4 text-base font-bold text-white hover:brightness-110 shadow-lg hover:shadow-xl transition"
              >
                {isKk ? 'Балабақшаны қосуға өтінім беру →' : 'Подключить свой сад сейчас →'}
              </Link>

              <a
                href="https://wa.me/77010000000?text=Здравствуйте!+Хотим+подключить+детский+сад+к+Bobegim"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-bold text-white hover:bg-white/20 backdrop-blur transition"
              >
                <span>💬</span>
                <span>{isKk ? 'WhatsApp-қа жазу' : 'Написать в WhatsApp'}</span>
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isKk ? 'ЭСФ және АВР беріледі' : 'Официальный договор, ЭСФ и АВР'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isKk ? 'Серверлер ҚР аумағында' : 'Серверы в Казахстане (VPS РК)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{isKk ? '24/7 техникалық көмек' : 'Поддержка по телефону и WhatsApp'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
