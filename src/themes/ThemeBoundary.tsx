'use client';

import { Component, Suspense, type ReactNode } from 'react';
import { reportThemeError } from './actions';

type Props = {
  theme: string;
  part: 'home' | 'header' | 'footer';
  /** Стандартная версия той же части сайта — её покажем, если тема упала. */
  fallback: ReactNode;
  children: ReactNode;
};

/**
 * Страховка индивидуальной темы: если её вёрстка упала, посетитель видит
 * стандартную шапку, главную или подвал, а не страницу ошибки, а владельцу
 * портала уходит письмо.
 *
 * Suspense здесь не для загрузки. При рендере на сервере error boundary
 * не срабатывает — сервер, встретив ошибку внутри Suspense, отдаёт его
 * fallback, а браузер повторяет рендер и уже там ловит ошибку этим классом.
 * Без Suspense ошибка темы на сервере уронила бы всю страницу.
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
    const fallback = <div data-theme-fallback={this.props.part}>{this.props.fallback}</div>;
    if (this.state.failed) return fallback;
    return <Suspense fallback={fallback}>{this.props.children}</Suspense>;
  }
}
