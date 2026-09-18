import { describe, expect, it } from 'vitest';
import { greetingName } from '@/lib/person-name';

describe('greetingName', () => {
  it('«Фамилия Имя Отчество» — по имени и отчеству', () => {
    expect(greetingName('Кудайбергенов Асет Амангалиевич')).toBe('Асет Амангалиевич');
    expect(greetingName('Иванова Мария Петровна')).toBe('Мария Петровна');
  });

  it('казахское отчество в обращении не используют — только имя', () => {
    expect(greetingName('Сейтова Айгерим Болатқызы')).toBe('Айгерим');
    expect(greetingName('Нурланов Ерлан Бауыржанұлы')).toBe('Ерлан');
  });

  it('«Фамилия Имя» — по имени', () => {
    expect(greetingName('Суленова Айгерим')).toBe('Айгерим');
    expect(greetingName('Кудайбергенов Асет')).toBe('Асет');
  });

  it('«Имя Фамилия» и «Имя Отчество Фамилия» — тоже правильно', () => {
    expect(greetingName('Асет Кудайбергенов')).toBe('Асет');
    expect(greetingName('Мария Петровна Иванова')).toBe('Мария Петровна');
  });

  it('одно слово и пусто', () => {
    expect(greetingName('Айгерим')).toBe('Айгерим');
    expect(greetingName('  ')).toBe('');
    expect(greetingName(null)).toBe('');
  });
});
