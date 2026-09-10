import type { Locale } from '@/lib/i18n';
import Image from 'next/image';

interface BentoFeaturesProps {
  locale: Locale;
}

export function BentoFeatures({ locale }: BentoFeaturesProps) {
  const isKk = locale === 'kk';

  return (
    <section className="py-24 relative overflow-hidden bg-white/60">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[900px] rounded-full bg-orange-400/10 blur-[140px] -z-10" />

      <div className="container-page">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200/80 px-4 py-1.5 text-xs font-black text-orange-800 mb-4 shadow-xs">
            <span>✨</span>
            <span>{isKk ? 'Балабақша сайттарына қойылатын мемлекеттік стандарт' : 'Стандарт сайтов дошкольных организаций РК'}</span>
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isKk
              ? 'Балабақша сайтын заманауи және қауіпсіз ететін 5 модуль'
              : 'Всё, что обязано быть на сайте детского сада — в единой 3D-платформе'}
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            {isKk
              ? 'Тексеруші комиссиялар (МОН, СЭС, прокуратура) мен актөбелік ата-аналардың барлық сұрақтары ескерілген.'
              : 'Собрано строго по требованиям проверяющих органов (МОН, СЭС) и ожиданиям актюбинских родителей.'}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: 2-column wide Hero Bento card - Turnkey website & CMS with 3D Director render */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-[36px] border-2 border-slate-100 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 text-white px-3 py-1 text-xs font-black mb-4 shadow-sm">
                  🚀 {isKk ? '24 сағатта дайын' : 'Запуск за 24 часа'}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {isKk
                    ? 'Заманауи сайт және қарапайым әкімші бөлімі'
                    : 'Готовый сайт сада и личный кабинет заведующей'}
                </h3>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {isKk
                    ? 'Бағдарламашыны жалдаудың немесе күрделі техникалық тапсырма жазудың қажеті жоқ. Біз сайтты толық дайындап, логин мен пароль береміз. Жаңалықтар, фото және мәзірді өзіңіз оңай саласыз.'
                    : 'Вам не нужно искать веб-мастеров и платить за каждую правку. Вы получаете готовый красивый сайт с доменом и памятку к админке. Заполнение проще, чем пост в соцсетях.'}
                </p>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-slate-800 shadow-xs">
                    ✓ {isKk ? 'Қазақша & орысша' : 'Двуязычие (KZ/RU)'}
                  </span>
                  <span className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-slate-800 shadow-xs">
                    ✓ {isKk ? 'Смартфоннан басқару' : 'Управление со смартфона'}
                  </span>
                  <span className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-slate-800 shadow-xs">
                    ✓ {isKk ? 'Шектеусіз жазбалар' : 'Без лимита новостей'}
                  </span>
                </div>
              </div>

              {/* 3D Visual Asset */}
              <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xl border-2 border-white">
                <Image
                  src="/assets/redesign/director-dashboard.jpg"
                  alt="Director with 3D CMS Dashboard"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: SanPiN Meal Menu with 3D illustration */}
          <div className="group relative overflow-hidden rounded-[36px] border-2 border-slate-100 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-md border border-slate-100 mb-6">
                <Image
                  src="/assets/redesign/sanpin-meal.jpg"
                  alt="SanPiN Meal Illustration"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500 text-white px-3 py-0.5 text-[11px] font-black shadow-sm">
                  СанПиН РК
                </div>
              </div>

              <h3 className="font-display text-xl font-black text-slate-900 leading-tight">
                {isKk ? 'Электронды ас мәзірі (СанПиН)' : 'Электронное меню питания по СанПиН'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isKk
                  ? 'Ата-аналар чатта сұрамай-ақ, күнделікті таңғы ас, түскі ас пен бесіндікті калориясымен сайттан көреді.'
                  : 'Ежедневное меню с калориями и утвержденным рационом. Снимает 90% вопросов родителей в чатах.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{isKk ? 'Бекітілген кесте' : 'Утвержденный график'}</span>
              <span className="text-emerald-700 font-black">100% сәйкестік ✓</span>
            </div>
          </div>

          {/* Card 3: Safe Kids Photo Gallery with 3D Classroom image */}
          <div className="group relative overflow-hidden rounded-[36px] border-2 border-slate-100 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-md border border-slate-100 mb-6">
                <Image
                  src="/assets/redesign/classroom-kids.jpg"
                  alt="Classroom kids playing"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 rounded-full bg-blue-600 text-white px-3 py-0.5 text-[11px] font-black shadow-sm">
                  EXIF Safe
                </div>
              </div>

              <h3 className="font-display text-xl font-black text-slate-900 leading-tight">
                {isKk ? 'Қауіпсіз балалар фотогалереясы' : 'Безопасная фотогалерея детей'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isKk
                  ? 'Фото жүктеген кезде геолокация мен GPS метадеректері автоматты түрде өшіріледі, өлшемі жеңілдетіледі.'
                  : 'Автоматическое удаление геотегов и координат смартфона. Фотографии сжимаются без потери четкости.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{isKk ? 'Балалардың қауіпсіздігі' : 'Защита персональных данных'}</span>
              <span className="text-blue-700 font-black">GPS Scrubbing ✓</span>
            </div>
          </div>

          {/* Card 4: Kazakhstan Cloud Servers & Security with 3D Shield */}
          <div className="group relative overflow-hidden rounded-[36px] border-2 border-slate-100 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-md border border-slate-100 mb-6">
                <Image
                  src="/assets/redesign/security-shield.jpg"
                  alt="Security shield"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 rounded-full bg-amber-500 text-white px-3 py-0.5 text-[11px] font-black shadow-sm">
                  KZ Hosting
                </div>
              </div>

              <h3 className="font-display text-xl font-black text-slate-900 leading-tight">
                {isKk ? 'ҚР серверлеріндегі деректер' : 'Серверы строго в Казахстане'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isKk
                  ? 'ҚР «Дербес деректер туралы» заңының барлық талаптары орындалған. .KZ және .EDU.KZ домендері қорғалған.'
                  : 'Сайты хостятся на VPS в Казахстане. Никаких рисков блокировки зарубежных конструкторов.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{isKk ? 'Заңға 100% сай' : 'Закон о персональных данных'}</span>
              <span className="text-amber-700 font-black">edu.kz & kz ✓</span>
            </div>
          </div>

          {/* Card 5: Documents for inspections */}
          <div className="group relative overflow-hidden rounded-[36px] border-2 border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl mb-6 shadow-sm">
                📜
              </div>
              <h3 className="font-display text-xl font-black text-slate-900 leading-tight">
                {isKk ? 'Тексеруші органдарға арналған құжаттар' : 'Нормативная база для комиссий'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {isKk
                  ? 'Жарғы, лицензия, мемлекеттік сатып алулар, антитеррорлық паспорт және санитарлық қорытындылар.'
                  : 'Структура разделов составлена строго по чек-листу проверок прокуратуры, СЭС и отдела образования.'}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2 text-[11px] font-bold">
                <span className="rounded-xl bg-white border border-slate-200 p-2 text-center text-slate-800 shadow-xs">
                  📄 Лицензия
                </span>
                <span className="rounded-xl bg-white border border-slate-200 p-2 text-center text-slate-800 shadow-xs">
                  🏛️ Устав сада
                </span>
                <span className="rounded-xl bg-white border border-slate-200 p-2 text-center text-slate-800 shadow-xs">
                  💰 Госзакупки
                </span>
                <span className="rounded-xl bg-white border border-slate-200 p-2 text-center text-slate-800 shadow-xs">
                  🛡️ Антитеррор
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-black text-purple-700">
              100% готовность к проверке
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
