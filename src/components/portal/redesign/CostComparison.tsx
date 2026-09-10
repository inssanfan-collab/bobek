import type { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { withLocale } from '@/lib/i18n';

interface CostComparisonProps {
  locale: Locale;
}

export function CostComparison({ locale }: CostComparisonProps) {
  const isKk = locale === 'kk';

  return (
    <section className="py-20 bg-surface/50 border-y border-line/60">
      <div className="container-page">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900 mb-3">
            💡 {isKk ? 'Тиімділік пен үнемдеу' : 'Экономика решения'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            {isKk
              ? 'Балабақшаға жеке сайт жасаудың 3 жолын салыстырыңыз'
              : 'Почему 50 000 ₸ в год — самое выгодное решение для сада'}
          </h2>
          <p className="mt-3 text-muted text-base sm:text-lg">
            {isKk
              ? 'Веб-студия, қарапайым шетелдік конструктор немесе балабақшаларға арнайы жасалған Bobegim жүйесі.'
              : 'Сравните реальные расходы на разработку, хостинг, поддержку и риски проверок.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
          {/* Column 1: Web Studio */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8 flex flex-col justify-between shadow-soft opacity-90 hover:opacity-100 transition">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {isKk ? 'Веб-студияға тапсырыс' : 'Заказ у веб-студии'}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {isKk ? 'Нөлден жасалатын сайт' : 'Индивидуальная разработка'}
                  </p>
                </div>
                <span className="text-2xl">🏛️</span>
              </div>

              <div className="py-5">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                  400 000 ₸+
                </span>
                <p className="text-xs text-muted mt-1">
                  {isKk ? '+ ай сайынғы қызмет көрсету' : '+ хостинг и оплата за правки'}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Әзірлеу мерзімі: 2–3 ай' : 'Срок разработки: от 1 до 3 месяцев'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Кез келген жаңалықты қосу үшін бағдарламашыға төлеу' : 'Каждое изменение или добавление новости оплачивается отдельно'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Әзірлеуші жоғалып кетсе, сайт қараусыз қалады' : 'Риск: веб-мастер пропадет или сменит номер'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">!</span>
                  <span>{isKk ? 'Домен мен хостингті жыл сайын өзіңіз төлейсіз' : 'Хостинг и домен нужно администрировать самим'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-line text-center text-xs text-muted font-medium">
              {isKk ? 'Қымбат және ұзақ' : 'Высокая стоимость и зависимость'}
            </div>
          </div>

          {/* Column 2: Bobegim (Highlighted Winner) */}
          <div className="relative rounded-3xl border-2 border-brand bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lift md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-bold text-white shadow-md">
              ★ {isKk ? 'Ең ұтымды таңдау' : 'Рекомендуемый выбор'}
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand/20">
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    Bobegim
                  </h3>
                  <p className="text-xs text-brand font-semibold mt-0.5">
                    {isKk ? 'Дайын мамандандырылған платформа' : 'Платформа для садов Казахстана'}
                  </p>
                </div>
                <span className="text-2xl">🧸</span>
              </div>

              <div className="py-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand">
                    50 000 ₸
                  </span>
                  <span className="text-xs font-bold text-muted">/ {isKk ? 'жыл' : 'год'}</span>
                </div>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  ✓ {isKk ? 'Бәрі кіреді, ешқандай қосымша төлемсіз' : 'Всё включено, без скрытых платежей'}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-ink font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{isKk ? 'Іске қосу: 24 сағат ішінде' : 'Запуск сайта в течение 24 часов'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{isKk ? 'Ыңғайлы әкімші бөлімі — бағдарламашысыз' : 'Понятная админка: новости и фото грузите сами'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{isKk ? 'Тексеру талаптары: мәзір, құжаттар, педагогика' : 'Разделы по стандартам МОН РК и СЭС'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{isKk ? 'Қазақстандағы сенімді хостинг және тұрақты қолдау' : 'Хостинг в РК, резервные копии и поддержка'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{isKk ? 'Ресми келісімшарт, ЭСФ, актілер беріледі' : 'Договор, ЭСФ и акты для бухгалтерии сада'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-brand/20">
              <Link
                href={withLocale('/apply', locale)}
                className="w-full flex items-center justify-center rounded-xl bg-brand py-3 text-sm font-bold text-white hover:brightness-110 shadow-md transition"
              >
                {isKk ? 'Балабақшаны қосу' : 'Подключить свой сад'}
              </Link>
            </div>
          </div>

          {/* Column 3: Site Builders */}
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8 flex flex-col justify-between shadow-soft opacity-90 hover:opacity-100 transition">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {isKk ? 'Шетелдік конструкторлар' : 'Конструкторы (Wix/Tilda)'}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {isKk ? 'Жалпыға арналған конструктор' : 'Универсальные конструкторы'}
                  </p>
                </div>
                <span className="text-2xl">🧱</span>
              </div>

              <div className="py-5">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                  70 000 ₸+
                </span>
                <p className="text-xs text-muted mt-1">
                  {isKk ? '/ жыл (валюта бағамына байланысты)' : '/ год подписка + настройка'}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Серверлері шетелде (ҚР заңына қайшы келу қаупі)' : 'Серверы за рубежом (риск нарушения закона РК о данных)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Қазақша/орысша қос тілді баптау өте қиын' : 'Сложная и дорогая настройка двуязычия (KZ/RU)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{isKk ? 'Мәзір мен білім құжаттарына арнайы модульдер жоқ' : 'Нет готовых модулей для СанПиН меню и документов'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">!</span>
                  <span>{isKk ? 'Блоктарды қолмен реттеу үшін уақыт керек' : 'Требует много часов на верстку и дизайн'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-line text-center text-xs text-muted font-medium">
              {isKk ? 'Қиын және бейімделмеген' : 'Сложно и не адаптировано под РК'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
