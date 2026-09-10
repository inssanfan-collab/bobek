'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { withLocale, type Locale } from '@/lib/i18n';

export interface SerializedGarden {
  id: string;
  slug: string;
  name: string;
  district?: string | null;
  isPrivate?: boolean | null;
  phone?: string | null;
  address?: string | null;
  domainUrl: string;
}

interface LiveGardenExplorerProps {
  locale: Locale;
  gardens: SerializedGarden[];
  totalCount: number;
}

export function LiveGardenExplorer({ locale, gardens, totalCount }: LiveGardenExplorerProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'state' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isKk = locale === 'kk';

  // Extract unique districts from available gardens
  const districts = useMemo(() => {
    const set = new Set<string>();
    gardens.forEach((g) => {
      if (g.district) set.add(g.district);
    });
    return Array.from(set);
  }, [gardens]);

  // Filter gardens based on district, type, and search query
  const filteredGardens = useMemo(() => {
    return gardens.filter((g) => {
      if (selectedDistrict !== 'all' && g.district !== selectedDistrict) {
        return false;
      }
      if (filterType === 'state' && g.isPrivate) {
        return false;
      }
      if (filterType === 'private' && !g.isPrivate) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(query);
        const matchesDistrict = g.district?.toLowerCase().includes(query) ?? false;
        const matchesAddress = g.address?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDistrict && !matchesAddress) return false;
      }
      return true;
    });
  }, [gardens, selectedDistrict, filterType, searchQuery]);

  return (
    <section className="py-20 bg-card">
      <div className="container-page">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {isKk ? 'Қосылған балабақшалар' : 'Живая витрина садов'}
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink">
              {isKk ? 'Ақтөбедегі балабақша сайттары' : 'Сайты детских садов Актобе'}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {isKk
                ? `Порталда қазір ${totalCount} балабақша тіркелген. Төмендегі сайттарға кіріп көріңіз.`
                : `На портале уже работают ${totalCount} садов города. Вы можете зайти на любой из них и оценить работу.`}
            </p>
          </div>

          <Link
            href={withLocale('/catalog', locale)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-soft px-5 py-2.5 text-sm font-bold text-brand-ink hover:bg-brand hover:text-white transition shrink-0"
          >
            <span>{isKk ? 'Барлық сандар каталогы' : 'Весь каталог садов'}</span>
            <span>→</span>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* District Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDistrict('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedDistrict === 'all'
                  ? 'bg-ink text-white'
                  : 'bg-surface text-muted hover:text-ink border border-line'
              }`}
            >
              {isKk ? 'Барлық аудандар' : 'Все районы'}
            </button>
            {districts.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => setSelectedDistrict(district)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedDistrict === district
                    ? 'bg-ink text-white'
                    : 'bg-surface text-muted hover:text-ink border border-line'
                }`}
              >
                {district}
              </button>
            ))}
          </div>

          {/* Quick Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isKk ? 'Сад атауы немесе көше…' : 'Название сада или улица…'}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Garden Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGardens.map((garden) => (
            <a
              key={garden.id}
              href={garden.domainUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col justify-between rounded-3xl border border-line bg-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-card hover:shadow-lift"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-xl text-brand group-hover:scale-105 transition-transform">
                    {garden.isPrivate ? '⭐' : '🏛️'}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      garden.isPrivate
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {garden.isPrivate
                      ? isKk
                        ? 'Жеке балабақша'
                        : 'Частный сад'
                      : isKk
                      ? 'Мемлекеттік (Госзаказ)'
                      : 'Государственный ясли-сад'}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-ink group-hover:text-brand transition-colors line-clamp-2">
                  {garden.name}
                </h3>

                {garden.address && (
                  <p className="mt-2 text-xs text-muted line-clamp-1 flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{garden.address}</span>
                  </p>
                )}

                {garden.phone && (
                  <p className="mt-1 text-xs text-muted flex items-center gap-1.5">
                    <span>📞</span>
                    <span>{garden.phone}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-muted truncate max-w-[170px]">
                  {garden.slug}.edu.kz
                </span>
                <span className="font-bold text-brand group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  <span>{isKk ? 'Сайтқа өту' : 'Открыть сайт'}</span>
                  <span>↗</span>
                </span>
              </div>
            </a>
          ))}

          {filteredGardens.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted">
              <p className="text-base font-semibold text-ink">
                {isKk ? 'Балабақша табылмады' : 'По данному фильтру ничего не найдено'}
              </p>
              <p className="text-xs mt-1">
                {isKk
                  ? 'Басқа сүзгіні таңдап көріңіз немесе іздеу сөзін тазалаңыз.'
                  : 'Попробуйте сбросить поисковый запрос или выбрать другой район.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
