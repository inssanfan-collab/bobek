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

/** Приводит любую ошибку действия к сообщению, которое не стыдно показать сотруднику сада. */
export function toActionError(error: unknown): ActionState {
  const message = error instanceof Error ? error.message : 'Не удалось сохранить. Попробуйте ещё раз.';
  return { error: message };
}
