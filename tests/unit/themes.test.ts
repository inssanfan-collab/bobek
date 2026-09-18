import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import postcss, { type AtRule, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';
import { THEME_CATALOG as THEMES } from '@/themes/catalog';

/*
 * Правила, которые не дают индивидуальной теме сломать движок или чужие
 * сайты. Тема — это только вёрстка: данные ей приносят готовыми.
 */

const ROOT = path.resolve(__dirname, '../../src/themes');
const themeDirs = readdirSync(ROOT).filter((name) => statSync(path.join(ROOT, name)).isDirectory());

function filesOf(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? filesOf(full) : [full];
  });
}

describe('реестр тем', () => {
  it('коды уникальные и годятся для атрибута и адреса', () => {
    const codes = THEMES.map((theme) => theme.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) expect(code).toMatch(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/);
  });

  it('у каждой темы названия на двух языках и пояснение', () => {
    for (const theme of THEMES) {
      expect(theme.nameRu.trim(), theme.code).not.toBe('');
      expect(theme.nameKk.trim(), theme.code).not.toBe('');
      expect(theme.noteRu.trim(), theme.code).not.toBe('');
    }
  });

  it('каждая папка темы есть в реестре и в themes.css — и наоборот', () => {
    const css = readFileSync(path.join(ROOT, 'themes.css'), 'utf8');
    const imported = Array.from(css.matchAll(/@import '\.\/([a-z0-9-]+)\/theme\.css';/g), (m) => m[1]);
    const registered = THEMES.map((theme) => theme.code);
    // Вёрстку (index.ts) читаем текстом: сам модуль тянет React-компоненты.
    const index = readFileSync(path.join(ROOT, 'index.ts'), 'utf8');
    const block = index.slice(index.indexOf('const PARTS'), index.indexOf('};', index.indexOf('const PARTS')));
    const withParts = Array.from(block.matchAll(/^\s{2}'?([a-z0-9-]+)'?:\s*\{/gm), (m) => m[1]);

    expect([...themeDirs].sort()).toEqual([...registered].sort());
    expect([...imported].sort()).toEqual([...registered].sort());
    // Тема из одного CSS в PARTS может и не попасть, но чужого кода там быть не должно.
    for (const code of withParts) expect(registered).toContain(code);
  });
});

describe('CSS темы действует только на свой сад', () => {
  for (const code of themeDirs) {
    it(code, () => {
      const file = path.join(ROOT, code, 'theme.css');
      const root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
      const scope = `[data-theme='${code}']`;
      const problems: string[] = [];

      root.walkRules((rule: Rule) => {
        // Кадры анимации — внутри @keyframes, их селекторы (from, 50%) не про страницу.
        if (rule.parent?.type === 'atrule' && (rule.parent as AtRule).name.endsWith('keyframes')) return;
        for (const selector of rule.selectors) {
          if (!selector.trim().startsWith(scope)) problems.push(selector.trim());
        }
      });

      root.walkAtRules((at: AtRule) => {
        if (at.name === 'import') problems.push('@import внутри темы');
        // Имена анимаций и шрифтов глобальные — с префиксом темы они не столкнутся с чужими.
        if (at.name.endsWith('keyframes') && !at.params.startsWith(`${code}-`)) {
          problems.push(`@keyframes ${at.params} — имя должно начинаться с «${code}-»`);
        }
        if (at.name === 'font-face') {
          const family = at.nodes?.find((node) => node.type === 'decl' && node.prop === 'font-family');
          const value = family && 'value' in family ? String(family.value).replace(/['"]/g, '') : '';
          if (!value.startsWith(`${code}-`)) problems.push(`@font-face ${value} — имя должно начинаться с «${code}-»`);
        }
      });

      expect(problems, `в ${code}/theme.css правила без ${scope}`).toEqual([]);
    });
  }
});

describe('тема только рисует', () => {
  // Тип импортировать можно откуда угодно: в сборку он не попадает.
  const FORBIDDEN: [RegExp, string][] = [
    [/^\s*import\s+(?!type\b)[^;]*from\s+'@\/server\//m, 'импорт из @/server — база, сессии, настройки'],
    [/^\s*import\s+(?!type\b)[^;]*from\s+'@prisma\/client'/m, 'Prisma — прямой доступ к базе'],
    [/^\s*import\s+(?!type\b)[^;]*from\s+'next\/headers'/m, 'cookies и заголовки запроса'],
    [/^\s*import\s+(?!type\b)[^;]*from\s+'@\/app\//m, 'импорт из маршрутов приложения'],
    [/['"]use server['"]/, 'server actions'],
    // Свои клиентские компоненты в теме запрещены: страховка раскрывает тему
    // на сервере и ловит ошибки там, а ошибка клиентского компонента при
    // отрисовке на сервере уронила бы всю страницу. Интерактив — из движка.
    [/['"]use client['"]/, 'свой клиентский компонент — берите готовые из движка'],
    [/process\.env/, 'переменные окружения'],
    [/dangerouslySetInnerHTML/, 'сырой HTML — текст сада уже очищен в общих блоках'],
  ];

  for (const code of themeDirs) {
    it(code, () => {
      const problems: string[] = [];
      for (const file of filesOf(path.join(ROOT, code)).filter((f) => /\.(ts|tsx)$/.test(f))) {
        const source = readFileSync(file, 'utf8');
        for (const [pattern, why] of FORBIDDEN) {
          if (pattern.test(source)) problems.push(`${path.basename(file)}: ${why}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});
