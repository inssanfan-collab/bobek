import type { ComponentType, ReactNode } from 'react';
import type { Section, TenantProfile } from '@prisma/client';
import type { Locale } from '@/lib/i18n';
import type { HomeProps } from '@/templates/types';
import type { ThemeInfo } from './catalog';

/** Раздел меню с вложенными — как его отдаёт siteMenu(). */
export type MenuSection = Section & { children?: Section[] };

/**
 * Что получает шапка темы. Кнопки «для слабовидящих» и переключатель языка
 * приходят готовыми (`tools`), меню — тоже (`nav`): тема решает, где их
 * поставить и как оформить, но убрать не может — их ждут проверяющие,
 * и e2e-тест тем проверяет, что они на месте.
 */
export type ThemeHeaderProps = {
  profile: TenantProfile | null;
  sections: MenuSection[];
  locale: Locale;
  pathname: string;
  /** Адрес главной с учётом языка. */
  homeHref: string;
  /** Кнопка версии для слабовидящих и переключатель языка. Обязательны к показу. */
  tools: ReactNode;
  /** Готовое меню сайта (с подменю и мобильной версией). Обязательно к показу. */
  nav: ReactNode;
};

export type ThemeFooterProps = {
  profile: TenantProfile | null;
  sections: MenuSection[];
  locale: Locale;
  portalDomain: string;
};

/**
 * Индивидуальная тема сада. Всё, кроме кода и названий, необязательно:
 * тема, где задан только CSS, просто перекрашивает стандартный сайт.
 *
 * Тема получает готовые данные и только рисует их. Ходить в базу, в
 * server-actions и в настройки ей запрещено — это проверяет
 * tests/unit/themes.test.ts.
 */
export type ThemeParts = {
  Home?: ComponentType<HomeProps>;
  Header?: ComponentType<ThemeHeaderProps>;
  Footer?: ComponentType<ThemeFooterProps>;
};

export type SiteTheme = ThemeInfo & ThemeParts;
