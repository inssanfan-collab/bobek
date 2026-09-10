'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Locale } from '@/lib/i18n';

interface MockupProps {
  locale: Locale;
}

export function HeroInteractiveMockup({ locale }: MockupProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'groups' | 'admin'>('home');
  const isKk = locale === 'kk';

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-2xl">
      {/* Decorative ambient background glows */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-orange-400/30 via-amber-300/30 to-emerald-400/25 blur-3xl opacity-80 animate-pulse"
        aria-hidden
      />

      {/* Floating Trust Badge 1 - Top Left */}
      <div className="absolute -top-6 -left-6 z-30 hidden sm:flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-emerald-200 shrink-0">
          <Image
            src="/assets/redesign/security-shield.jpg"
            alt="Safety guarantee"
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900 leading-tight">
            {isKk ? 'МОН & СЭС 100%' : 'Стандарты МОН РК & СЭС'}
          </p>
          <p className="text-[11px] font-bold text-emerald-600">
            {isKk ? 'Тексеруге толық дайын' : 'Готов к проверкам 2026'}
          </p>
        </div>
      </div>

      {/* Floating Trust Badge 2 - Bottom Right */}
      <div className="absolute -bottom-6 -right-6 z-30 hidden sm:flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-orange-200 shrink-0">
          <Image
            src="/assets/redesign/sanpin-meal.jpg"
            alt="SanPiN food"
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900 leading-tight">
            {isKk ? 'СанПиН ас мәзірі' : 'Ежедневное меню СанПиН'}
          </p>
          <p className="text-[11px] font-bold text-orange-600">
            {isKk ? 'Ата-аналарға ашық' : 'Прозрачно для родителей'}
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Device Container */}
      <div className="relative overflow-hidden rounded-[32px] border-2 border-white bg-white/95 shadow-2xl backdrop-blur-xl">
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-rose-400 shadow-xs" />
            <span className="h-3.5 w-3.5 rounded-full bg-amber-400 shadow-xs" />
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-xs" />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-1 text-xs text-slate-700 shadow-xs">
            <span className="text-emerald-600 font-black">🔒</span>
            <span className="font-mono text-slate-900 font-bold">sad12.edu.kz</span>
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
              {isKk ? 'Онлайн' : 'Онлайн'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black text-slate-600">Bobegim 2.0</span>
          </div>
        </div>

        {/* Interactive Device Tabs */}
        <div className="flex border-b border-slate-100 bg-white px-5 py-2.5 overflow-x-auto gap-2 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`rounded-xl px-4 py-2 font-black transition-all ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            🏠 {isKk ? 'Басты бет' : 'Главная'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`rounded-xl px-4 py-2 font-black transition-all ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            🍎 {isKk ? 'Тамақтану мәзірі' : 'Меню дня'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`rounded-xl px-4 py-2 font-black transition-all ${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            👶 {isKk ? 'Топтар' : 'Группы'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`rounded-xl px-4 py-2 font-black transition-all ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ⚙️ {isKk ? 'Әкімші бөлімі' : 'Админка'}
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="p-5 min-h-[340px] bg-slate-50/50">
          {activeTab === 'home' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Kindergarten 3D Hero Mini Card */}
              <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <Image
                  src="/assets/redesign/hero-banner.jpg"
                  alt="Балдырған балабақшасы"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                      {isKk ? 'Мемлекеттік тапсырыс' : 'Госзаказ'}
                    </span>
                    <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                      12 топ
                    </span>
                  </div>
                  <h4 className="font-display text-base sm:text-lg font-black leading-tight text-white drop-shadow-sm">
                    {isKk ? '№12 «Балдырған» бөбекжай-балабақшасы' : 'Ясли-сад №12 «Балдырған»'}
                  </h4>
                  <p className="text-[11px] text-white/90">
                    {isKk ? 'Ақтөбе қ., Абай даңғылы, 12' : 'г. Актобе, пр. Абая, 12'}
                  </p>
                </div>
              </div>

              {/* Action Badges inside Mockup */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
                  <span className="text-xl">👩‍🏫</span>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {isKk ? 'Педагогтар' : 'Педагоги'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-600">24 маман</p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
                  <span className="text-xl">📜</span>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {isKk ? 'Құжаттар' : 'Лицензия'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600">№KZ44VAA</p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
                  <span className="text-xl">🏛️</span>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    {isKk ? 'Darabala кезегі' : 'Очередь Darabala'}
                  </p>
                  <p className="text-[10px] font-bold text-blue-600">Darabala.kz →</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <Image
                      src="/assets/redesign/sanpin-meal.jpg"
                      alt="SanPiN meal"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-black text-slate-900">
                      {isKk ? 'Бүгінгі тамақтану мәзірі (СанПиН)' : 'Утвержденное меню на сегодня'}
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold">
                      {isKk ? '10 қыркүйек 2026 ж., Бейсенбі' : '10 сентября 2026 г., Четверг'}
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                  {isKk ? 'Бекітілген' : 'По нормам РК'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <div>
                    <span className="font-black text-orange-600 text-[11px] uppercase tracking-wide">
                      {isKk ? 'Таңғы ас (08:30)' : 'Завтрак (08:30)'}
                    </span>
                    <p className="text-slate-800 font-bold mt-0.5">
                      {isKk ? 'Сүтті сұлы ботқасы, май қосылған нан, какао' : 'Каша овсяная молочная, бутерброд с маслом, какао'}
                    </p>
                  </div>
                  <span className="text-slate-600 font-mono font-bold text-[11px]">340 ккал</span>
                </div>

                <div className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <div>
                    <span className="font-black text-orange-600 text-[11px] uppercase tracking-wide">
                      {isKk ? 'Түскі ас (12:30)' : 'Обед (12:30)'}
                    </span>
                    <p className="text-slate-800 font-bold mt-0.5">
                      {isKk ? 'Көкөніс көжесі, күріш қосылған котлет, компот' : 'Суп овощной, котлета мясная с рисом, компот из сухофруктов'}
                    </p>
                  </div>
                  <span className="text-slate-600 font-mono font-bold text-[11px]">520 ккал</span>
                </div>

                <div className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <div>
                    <span className="font-black text-orange-600 text-[11px] uppercase tracking-wide">
                      {isKk ? 'Бесіндік (16:00)' : 'Полдник (16:00)'}
                    </span>
                    <p className="text-slate-800 font-bold mt-0.5">
                      {isKk ? 'Сүзбе пісірмесі, алма, жылы сүт' : 'Запеканка творожная со сметаной, яблоко, теплое молоко'}
                    </p>
                  </div>
                  <span className="text-slate-600 font-mono font-bold text-[11px]">280 ккал</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <Image
                      src="/assets/redesign/classroom-kids.jpg"
                      alt="Classroom"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-black text-slate-900">
                      {isKk ? 'Топтар мен бос орындар' : 'Список групп и наличие мест'}
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold">
                      {isKk ? '12 топ, 280 тәрбиеленуші' : '12 групп, 280 воспитанников'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src="/assets/redesign/kid-boy.jpg"
                        alt="Boy"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">
                        {isKk ? '«Құлыншақ» сәбилер тобы (2–3 жас)' : 'Ясельная группа «Құлыншақ» (2–3 года)'}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {isKk ? 'Тәрбиеші: Сағынбаева А. Қ.' : 'Воспитатель: Сагынбаева А. К.'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-800">
                    {isKk ? '2 орын' : '2 места'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src="/assets/redesign/kid-girl.jpg"
                        alt="Girl"
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">
                        {isKk ? '«Жұлдыз» ересектер тобы (4–5 жас)' : 'Старшая группа «Жұлдыз» (4–5 лет)'}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        {isKk ? 'Тәрбиеші: Өтепова Г. Б.' : 'Воспитатель: Утепова Г. Б.'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-800">
                    {isKk ? '1 орын' : '1 место'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <Image
                      src="/assets/redesign/director-dashboard.jpg"
                      alt="Director"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-black text-slate-900">
                      {isKk ? 'Балабақша әкімшісінің кабинеті' : 'Личный кабинет заведующей'}
                    </h4>
                    <p className="text-[11px] font-mono text-emerald-700 font-bold">
                      sad12-admin (онлайн)
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-slate-900 px-3 py-1 text-[11px] font-bold text-white">
                  Bobegim CMS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-3 shadow-xs">
                  <p className="font-black text-orange-950 text-xs">
                    + {isKk ? 'Жаңалық жариялау' : 'Добавить новость'}
                  </p>
                  <p className="text-[10px] text-orange-800/80 mt-1">
                    {isKk ? 'Фото мен мәтін қосу 1 минутта' : 'Публикация в 1 клик на сайте'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <p className="font-black text-slate-900 text-xs">
                    📸 {isKk ? 'Фотоальбом қосу' : 'Безопасное фото'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {isKk ? 'EXIF геодеректері өшеді' : 'Авто-удаление GPS EXIF'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <p className="font-black text-slate-900 text-xs">
                    🍎 {isKk ? 'Мәзірді жаңарту' : 'СанПиН Меню'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {isKk ? 'Бүгінгі тамақ кестесі' : 'Завтрак, обед, полдник'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <p className="font-black text-slate-900 text-xs">
                    📄 {isKk ? 'Тексеріс құжаттары' : 'Нормативная база'}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {isKk ? 'Устав, лицензия, актілер' : 'Для комиссий МОН и СЭС'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3 text-xs">
          <span className="text-[11px] font-bold text-slate-600">
            {isKk
              ? '👆 Жоғарыдағы батырмаларды басып, сайтты тексеріп көріңіз'
              : '👆 Кликайте по вкладкам выше, чтобы протестировать сайт'}
          </span>
          <span className="font-black text-orange-600 text-xs flex items-center gap-1">
            <span>✨</span>
            <span>{isKk ? 'Толық дайын жүйе' : 'Готово к работе'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
