import 'server-only';
import { cloneElement, createElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { headers } from 'next/headers';
import { notifyThemeFailure } from '@/server/notify/theme';

const CLIENT_REFERENCE = Symbol.for('react.client.reference');

function isClientReference(type: unknown): boolean {
  return typeof type === 'function' && (type as { $$typeof?: symbol }).$$typeof === CLIENT_REFERENCE;
}

/**
 * Раскрывает серверные компоненты дерева до обычной разметки, вызывая их
 * прямо здесь. Остаются только теги и клиентские компоненты.
 *
 * Зачем: ошибка в серверном компоненте ловится не там, где он написан
 * в JSX, а позже, при потоковой отдаче страницы, — и без Suspense роняет
 * всю страницу, а с Suspense заставляет сервер сначала отдать запасную
 * версию и потом подменять её (стандартный сайт мелькает перед темой).
 * Раскрыв тему заранее, мы ловим её ошибки обычным try/catch и отдаём
 * в HTML сразу готовую разметку.
 */
async function expand(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(expand));
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const { type, props } = element;

  if (typeof type === 'function' && !isClientReference(type)) {
    const rendered = await (type as (p: unknown) => ReactNode | Promise<ReactNode>)(props);
    const expanded = await expand(rendered);
    // Ключ элемента нужен спискам (новости, разделы) — переносим его на результат.
    return element.key != null ? createElement(Fragment, { key: element.key }, expanded) : expanded;
  }

  // Тег, фрагмент или клиентский компонент: раскрываем то, что передано внутрь.
  const next: Record<string, unknown> = {};
  let changed = false;
  for (const [name, value] of Object.entries(props ?? {})) {
    if (name === 'children' || isValidElement(value) || Array.isArray(value)) {
      next[name] = await expand(value as ReactNode);
      changed = true;
    }
  }
  return changed ? cloneElement(element, next) : element;
}

/**
 * Часть сайта в индивидуальной теме или, если тема упала, стандартная.
 * Ошибка уходит в журнал и письмом владельцу портала.
 */
export async function renderThemePart(
  theme: string,
  part: 'home' | 'header' | 'footer',
  element: ReactElement,
  fallback: ReactNode,
): Promise<{ node: ReactNode; failed: boolean }> {
  try {
    return { node: await expand(element), failed: false };
  } catch (error) {
    const message = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
    const h = await headers();
    const where = `сервер, ${h.get('host') ?? ''}`;
    await notifyThemeFailure(theme, part, message.slice(0, 500), where);
    return { node: fallback, failed: true };
  }
}
