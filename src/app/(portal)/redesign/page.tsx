import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/server/db';
import { env } from '@/lib/env';
import { formatMoney } from '@/lib/labels';
import { localeFromParam, pick, withLocale } from '@/lib/i18n';
import { RedesignPage } from '@/components/portal/redesign/RedesignChrome';
import { HeroInteractiveMockup } from '@/components/portal/redesign/HeroInteractiveMockup';
import { AudienceTabs } from '@/components/portal/redesign/AudienceTabs';
import { BentoFeatures } from '@/components/portal/redesign/BentoFeatures';
import { CostComparison } from '@/components/portal/redesign/CostComparison';
import { LiveGardenExplorer, type SerializedGarden } from '@/components/portal/redesign/LiveGardenExplorer';
import { OnboardingSteps } from '@/components/portal/redesign/OnboardingSteps';
import { FaqAccordion } from '@/components/portal/redesign/FaqAccordion';
import { CtaExpressSection } from '@/components/portal/redesign/CtaExpressSection';

export const dynamic = 'force-dynamic';

const T = {
  regionBadge: {
    kk: '📍 Ақтөбе облысының ресми білім порталы',
    ru: '📍 Официальная платформа детских садов Актюбинской области',
  },
  heroTitleBefore: {
    kk: 'Балабақшаның заманауи ресми сайты —',
    ru: 'Современный официальный сайт детского сада —',
  },
  heroPrice: {
    kk: 'жылына %s',
    ru: 'за %s в год',
  },
  heroLead: {
    kk: 'Тексерушілер мен ата-аналардың талаптарына сай келетін дайын 3D жүйе: тамақтану мәзірі, құжаттар, фотогалерея, педагогтар және бос орындар. Бағдарламашысыз, жеке әкімші бөлімімен, қазақ және орыс тілдерінде.',
    ru: 'Готовое решение под ключ: личный кабинет заведующей, меню питания по СанПиН, фотогалерея с защитой приватности детей, документы для проверок и список свободных мест. Без программиста, строго на серверах в РК.',
  },
  connectCta: {
    kk: 'Балабақшаны қосуға өтінім беру',
    ru: 'Подключить свой сад сейчас',
  },
  catalogCta: {
    kk: 'Ақтөбе сандарының каталогы',
    ru: 'Каталог садов Актобе',
  },
  statPriceLabel: {
    kk: 'Бекітілген тариф',
    ru: 'Фиксированный тариф',
  },
  statPriceSub: {
    kk: 'Бәрі кіреді, жасырын төлемсіз',
    ru: 'Всё включено, без доплат',
  },
  statLaunchLabel: {
    kk: 'Іске қосу мерзімі',
    ru: 'Срок запуска',
  },
  statLaunchValue: {
    kk: '24 сағат',
    ru: '24 часа',
  },
  statInspectionLabel: {
    kk: 'Тексеруге дайындық',
    ru: 'Готовность к проверкам',
  },
  statInspectionValue: {
    kk: '100% МОН / СЭС',
    ru: '100% МОН / СЭС',
  },
  statLangLabel: {
    kk: 'Мемлекеттік тіл',
    ru: 'Два языка',
  },
  statLangValue: {
    kk: 'ҚАЗ / РУС',
    ru: 'ҚАЗ / РУС',
  },
} as const;

export default async function RedesignHomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = localeFromParam((await searchParams).lang);

  // Load actual active tenants from database
  const [gardenCount, activeTenants] = await Promise.all([
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: {
        profile: true,
        domains: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 9,
    }),
  ]);

  const serializedGardens: SerializedGarden[] = activeTenants.map((tenant) => ({
    id: tenant.id,
    slug: tenant.slug,
    name: pick(locale, tenant.profile?.nameKk, tenant.profile?.nameRu) || tenant.slug,
    district: tenant.profile?.district ?? null,
    isPrivate: tenant.profile?.isPrivate ?? false,
    phone: tenant.profile?.phone ?? null,
    address: pick(locale, tenant.profile?.addressKk, tenant.profile?.addressRu) || null,
    domainUrl: `https://${tenant.domains[0]?.host ?? `${tenant.slug}.${env.portalDomain}`}`,
  }));

  const formattedPrice = formatMoney(env.subscriptionPrice);

  return (
    <RedesignPage locale={locale}>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28">
        {/* Soft Ambient Background Orbs */}
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[650px] w-[650px] rounded-full bg-gradient-to-bl from-orange-400/25 via-amber-200/30 to-transparent blur-[140px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-40 h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-200/25 to-transparent blur-[130px]"
          aria-hidden
        />

        <div className="container-page relative">
          {/* Top Hero Grid */}
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Left Column: Headlines, Trust badges, CTAs */}
            <div>
              {/* Regional Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-4 py-1.5 text-xs font-black text-orange-950 shadow-xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
                <span>{T.regionBadge[locale]}</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
                {T.heroTitleBefore[locale]}{' '}
                <span className="relative inline-block text-orange-600">
                  <span className="relative z-10">{T.heroPrice[locale].replace('%s', formattedPrice)}</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-300/50 -rotate-1 rounded-sm -z-0" />
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                {T.heroLead[locale]}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={withLocale('/apply', locale)}
                  className="rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-8 py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 active:scale-[0.99] transition duration-200 flex items-center gap-2"
                >
                  <span>{T.connectCta[locale]}</span>
                  <span className="text-lg">→</span>
                </Link>
                <Link
                  href={withLocale('/catalog', locale)}
                  className="rounded-2xl border-2 border-slate-200 bg-white/90 px-7 py-4 text-sm sm:text-base font-black text-slate-800 shadow-sm hover:bg-slate-50 hover:border-orange-300 transition duration-200 backdrop-blur"
                >
                  {T.catalogCta[locale]}
                </Link>
              </div>

              {/* Trust Indicators / Stats Row */}
              <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <dt className="text-xs text-slate-600 font-bold">{T.statPriceLabel[locale]}</dt>
                  <dd className="mt-0.5 font-display text-2xl sm:text-3xl font-black text-orange-600">
                    {formattedPrice}
                  </dd>
                  <p className="text-[11px] text-emerald-700 font-bold">{T.statPriceSub[locale]}</p>
                </div>

                <div>
                  <dt className="text-xs text-slate-600 font-bold">{T.statLaunchLabel[locale]}</dt>
                  <dd className="mt-0.5 font-display text-2xl sm:text-3xl font-black text-slate-900">
                    {T.statLaunchValue[locale]}
                  </dd>
                  <p className="text-[11px] text-slate-600 font-bold">{locale === 'kk' ? 'Кілтпен тапсыру' : 'Под ключ'}</p>
                </div>

                <div>
                  <dt className="text-xs text-slate-600 font-bold">{T.statInspectionLabel[locale]}</dt>
                  <dd className="mt-0.5 font-display text-2xl sm:text-3xl font-black text-slate-900">
                    {T.statInspectionValue[locale]}
                  </dd>
                  <p className="text-[11px] text-emerald-700 font-bold">{locale === 'kk' ? 'Заңға сәйкес' : 'Чек-лист норм'}</p>
                </div>

                <div>
                  <dt className="text-xs text-slate-600 font-bold">{T.statLangLabel[locale]}</dt>
                  <dd className="mt-0.5 font-display text-2xl sm:text-3xl font-black text-slate-900">
                    {T.statLangValue[locale]}
                  </dd>
                  <p className="text-[11px] text-slate-600 font-bold">{locale === 'kk' ? 'Толық аударма' : 'Полный перевод'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity 3D Interactive Mockup */}
            <div className="relative">
              <HeroInteractiveMockup locale={locale} />
            </div>
          </div>

          {/* Dual Persona Switcher: Directors ↔ Parents */}
          <div className="mt-24">
            <AudienceTabs locale={locale} />
          </div>
        </div>
      </section>

      {/* BENTO GRID: 3D COMPREHENSIVE PLATFORM CAPABILITIES */}
      <BentoFeatures locale={locale} />

      {/* LIVE GARDEN EXPLORER: REAL ACTUALLY WORKING SITES IN AKTOBE */}
      <LiveGardenExplorer
        locale={locale}
        gardens={serializedGardens}
        totalCount={gardenCount}
      />

      {/* COST AND SOLUTION COMPARISON */}
      <CostComparison locale={locale} />

      {/* 3-STEP ONBOARDING ROADMAP */}
      <OnboardingSteps locale={locale} />

      {/* FAQ SECTION */}
      <FaqAccordion locale={locale} />

      {/* FINAL EXPRESS CTA BANNER */}
      <CtaExpressSection locale={locale} />
    </RedesignPage>
  );
}
