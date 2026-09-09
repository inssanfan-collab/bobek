import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

/**
 * Результат формы админки.
 *
 * `redirectTo` возвращается вместо серверного redirect() намеренно: переход
 * внутри server action не проходит через middleware, поэтому путь вида `/admin/posts`
 * разрешается в маршруты портала, а не сада, и сотрудник получает 404.
 * Клиент делает настоящий переход браузера — он через middleware проходит.
 */
export type ActionState = {
  error?: string;
  redirectTo?: string;
};

export const EMPTY_ACTION_STATE: ActionState = {};

/**
 * Ошибка действия, которую увидит сотрудник, — сразу на двух языках.
 *
 * Обычный Error тоже допустим: его текст покажется как есть. Так остаются
 * рабочими места, где сообщение приходит не от нас (например, из Prisma).
 */
export class ActionError extends Error {
  readonly kk: string;
  readonly ru: string;

  constructor(phrase: { kk: string; ru: string }) {
    super(phrase.ru);
    this.name = 'ActionError';
    this.kk = phrase.kk;
    this.ru = phrase.ru;
  }
}

const FALLBACK = {
  kk: 'Сақтау мүмкін болмады. Қайталап көріңіз.',
  ru: 'Не удалось сохранить. Попробуйте ещё раз.',
} as const;

/** Приводит любую ошибку действия к сообщению, которое не стыдно показать сотруднику сада. */
export function toActionError(error: unknown, locale: Locale = DEFAULT_LOCALE): ActionState {
  if (error instanceof ActionError) return { error: locale === 'kk' ? error.kk : error.ru };
  if (error instanceof Error) return { error: error.message };
  return { error: FALLBACK[locale] };
}
