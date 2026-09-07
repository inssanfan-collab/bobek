const TRANSLIT: Record<string, string> = {
  а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'i', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'n', о: 'o',
  ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'u', ү: 'u', ф: 'f', х: 'h',
  һ: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', і: 'i', ь: '', э: 'e',
  ю: 'yu', я: 'ya',
};

/** Транслитерация казахской и русской кириллицы в адрес страницы. */
export function slugify(input: string, maxLength = 60): string {
  const lower = input.toLowerCase().trim();
  let out = '';
  for (const char of lower) {
    if (char in TRANSLIT) out += TRANSLIT[char];
    else if (/[a-z0-9]/.test(char)) out += char;
    else out += '-';
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-$/, '');
}

/** Добавляет числовой суффикс, пока адрес не станет уникальным. */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'stranica';
  if (!(await exists(root))) return root;
  for (let i = 2; i < 200; i += 1) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
