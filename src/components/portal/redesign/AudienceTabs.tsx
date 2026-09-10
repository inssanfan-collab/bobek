'use client';

import { useState } from 'react';
import Link from 'next/link';
import { withLocale, type Locale } from '@/lib/i18n';

interface AudienceTabsProps {
  locale: Locale;
}

export function AudienceTabs({ locale }: AudienceTabsProps) {
  const [role, setRole] = useState<'director' | 'parent'>('director');
  const isKk = locale === 'kk';

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Switcher Pill Bar */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-line bg-card p-1.5 shadow-soft">
          <button
            type="button"
            onClick={() => setRole('director')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              role === 'director'
                ? 'bg-brand text-white shadow-md'
                : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <span>🏛</span>
            <span>{isKk ? 'Меңгерушілер мен балабақшаларға' : 'Заведующим и детским садам'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              role === 'parent'
                ? 'bg-accent text-white shadow-md'
                : 'text-muted hover:text-ink hover:bg-surface'
            }`}
          >
            <span>👨‍👩‍👦</span>
            <span>{isKk ? 'Ақтөбелік ата-аналарға' : 'Родителям Актобе'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Panel */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-card/80 p-6 sm:p-8 shadow-soft backdrop-blur transition-all">
        {role === 'director' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
              <div>
                <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-ink">
                  {isKk ? 'Балабақша әкімшілігі үшін шешім' : 'Решение для руководства сада'}
                </span>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  {isKk
                    ? 'Тексерушілерге 100% дайын ресми сайт — 24 сағатта'
                    : 'Официальный сайт сада по всем требованиям проверок за 24 часа'}
                </h3>
              </div>
              <div className="shrink-0 text-right sm:text-right">
                <span className="text-xs text-muted block">{isKk ? 'Тариф' : 'Тариф всё включено'}</span>
                <span className="font-display text-2xl font-extrabold text-brand">50 000 ₸</span>
                <span className="text-xs text-muted"> / {isKk ? 'жыл' : 'год'}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-lg">
                  ⚡
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Бағдарламашысыз' : 'Без программиста'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Қарапайым әкімші бөлімі. Жаңалықтар, құжаттар мен фотоларды өзіңіз оңай саласыз.'
                    : 'Понятная админка на казахском и русском. Новости, фото и документы загружаются в 2 клика.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-lg">
                  📋
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Тексеріс талаптары' : 'Нормы МОН и СЭС'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Жарғы, лицензия, мемлекеттік сатып алулар, тамақтану мәзірі — барлық міндетті бөлімдер бар.'
                    : 'Все обязательные разделы: лицензия, устав, питание по СанПиН, педагоги, госзакупки.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-lg">
                  🌐
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'edu.kz домені' : 'Домен .edu.kz'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Білім беру мекемесінің мәртебесін көрсететін ресми доменді тегін қосуға көмектесеміз.'
                    : 'Помогаем официально оформить и настроить домен образовательной организации edu.kz.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 text-lg">
                  🛡
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'ҚР серверлері' : 'Серверы в РК'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Деректер Қазақстан аумағында сақталады. Заң талаптары толық орындалады.'
                    : 'Хранение данных строго на территории Казахстана. Закон о персональных данных соблюден.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{isKk ? 'Бухгалтерияға ресми шот-фактура (ЭСФ) мен акт беріледі' : 'Предоставляем договор, ЭСФ и АВР для бухгалтерии сада'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={withLocale('/pricing', locale)}
                  className="rounded-xl border border-line bg-card px-4 py-2 text-xs font-bold text-ink hover:bg-surface transition"
                >
                  {isKk ? 'Толық шарттар →' : 'Подробнее о тарифе →'}
                </Link>
                <Link
                  href={withLocale('/apply', locale)}
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-sm transition"
                >
                  {isKk ? 'Балабақшаны қосу' : 'Подключить свой сад'}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                  {isKk ? 'Ақтөбелік ата-аналарға көмек' : 'Помощь родителям Актобе'}
                </span>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  {isKk
                    ? 'Ақтөбе балабақшалары туралы барлық ақпарат бір жерде'
                    : 'Вся правда о детских садах Актобе в одном месте'}
                </h3>
              </div>
              <Link
                href={withLocale('/catalog', locale)}
                className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-sm transition text-center"
              >
                {isKk ? 'Каталогты ашу →' : 'Открыть каталог садов →'}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 text-lg">
                  📍
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Үйге жақын сандар' : 'Поиск по району'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Астана, Алматы, Батыс-2, 11-12 мөлтек аудандар бойынша сандарды картадан қараңыз.'
                    : 'Удобный фильтр по районам Актобе, типу сада (гос/частный) и языку обучения.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-lg">
                  🥗
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Күнделікті мәзір' : 'Меню питания детей'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Балаңыз бүгін не ішіп-жегенін чаттан сұрамай-ақ сайттан көріңіз.'
                    : 'Смотрите утвержденное меню на каждый день: калории, завтрак, обед и полдник.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-lg">
                  🏛
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Darabala.kz кезегі' : 'Очередь Darabala.kz'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Мемлекеттік балабақша кезегіне тікелей өту үшін ресми сілтемелер мен нұсқаулықтар.'
                    : 'Прямые ссылки и пошаговые подсказки, как встать в очередь через портал Darabala.kz.'}
                </p>
              </div>

              <div className="rounded-2xl border border-line/60 bg-surface/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-lg">
                  👩‍🏫
                </div>
                <h4 className="mt-3 font-display font-bold text-ink">
                  {isKk ? 'Тәрбиешілер құрамы' : 'Педагоги и группы'}
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {isKk
                    ? 'Тәрбиешінің санаты, өтілі және топтағы бос орындар туралы ашық ақпарат.'
                    : 'Стаж воспитателей, категории, отзывы и актуальное количество свободных мест.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted">
                {isKk
                  ? '💡 Барлық деректерді балабақшалардың өздері ресми түрде жаңартып отырады'
                  : '💡 Все сайты садов модерируются и обновляются официальными администрациями садов'}
              </p>
              <Link
                href={withLocale('/parents', locale)}
                className="text-xs font-bold text-accent hover:underline"
              >
                {isKk ? 'Ата-аналарға арналған жадынама →' : 'Памятка для родителей →'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
