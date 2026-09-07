import { hash, verify } from '@node-rs/argon2';
import { randomInt } from 'node:crypto';

// Параметры OWASP для argon2id: 19 МиБ, 2 итерации, параллелизм 1.
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export async function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashValue, plain, OPTIONS);
  } catch {
    return false;
  }
}

// Без символов, которые путают при диктовке по телефону: 0/O, 1/l/I, 5/S.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';

/**
 * Пароль, который главный админ диктует заведующей по телефону.
 * Формат «слово-слово-цифры» читается голосом заметно надёжнее случайной строки.
 */
export function generatePassword(): string {
  const chunk = (len: number, alphabet: string) =>
    Array.from({ length: len }, () => alphabet[randomInt(alphabet.length)]).join('');
  return `${chunk(4, ALPHABET)}-${chunk(4, ALPHABET)}-${chunk(3, DIGITS)}`;
}

export function passwordProblem(plain: string): string | null {
  if (plain.length < 8) return 'Пароль должен быть не короче 8 символов';
  if (plain.length > 128) return 'Пароль слишком длинный';
  if (!/[a-zA-Zа-яёА-ЯЁ]/.test(plain)) return 'Добавьте хотя бы одну букву';
  if (!/\d/.test(plain)) return 'Добавьте хотя бы одну цифру';
  return null;
}
