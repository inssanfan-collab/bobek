'use client';

import { Component, type ReactNode } from 'react';
import { reportThemeError } from './actions';

type Props = {
  theme: string;
  part: 'home' | 'header' | 'footer';
  /** Стандартная версия той же части сайта — её покажем, если тема упала. */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * Вторая половина страховки темы — в браузере. Первая на сервере
 * (renderThemePart): там тема раскрывается заранее, и её ошибка сразу
 * заменяется стандартной частью. Здесь ловим то, что может упасть уже
 * у посетителя — при переходах внутри сайта без перезагрузки.
 *
 * Suspense тут намеренно нет: с ним сервер отдавал сначала запасную
 * версию и потом подменял её темой — стандартный сайт мелькал перед
 * индивидуальным, а поисковик видел не ту версию.
 */
export class ThemeBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // В боевой сборке текст ошибки сервера до браузера не доходит — только
    // её код (digest). По нему настоящую ошибку находим в журнале сервера:
    // journalctl -u vsesad | grep <digest>.
    const digest = (error as { digest?: string } | null)?.digest;
    const message = digest
      ? `код ${digest} — подробности в журнале сервера (journalctl -u vsesad | grep ${digest})`
      : error instanceof Error ? error.message : String(error);
    void reportThemeError(this.props.theme, this.props.part, message.slice(0, 500), window.location.href).catch(() => {});
  }

  render() {
    if (this.state.failed) return <div data-theme-fallback={this.props.part}>{this.props.fallback}</div>;
    return this.props.children;
  }
}
