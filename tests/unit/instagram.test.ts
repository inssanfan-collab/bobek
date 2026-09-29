import { describe, expect, it } from 'vitest';
import {
  accountFromProfile, bodyFromCaption, cleanCaption, codeFromUrl, decodeEntities, extractInstagramCodes, looksKazakh,
  parseInstagramPage, titleFromCaption,
} from '@/lib/instagram';

/** Страница поста так, как её отдаёт Instagram: только мета-теги, остальное неважно. */
function page(url: string, description: string, image = 'https://scontent.cdninstagram.com/v/cover.jpg?a=1&amp;b=2') {
  const enc = description.replace(/"/g, '&quot;').replace(/[^\x20-\x7e\n]/gu, (ch) => `&#x${ch.codePointAt(0)!.toString(16)};`);
  return `<html><head>
    <meta property="og:type" content="article" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:description" content="${enc}" />
  </head></html>`;
}

describe('extractInstagramCodes', () => {
  it('достаёт коды из ссылок, как их копируют из приложения', () => {
    const text = `https://www.instagram.com/reel/Ddx-7beOw9o/?igsh=MWx3
      instagram.com/p/DdkwL9hIedh
      https://www.instagram.com/akshat.alan/reel/Ddt1y9NoBEY/
      https://www.instagram.com/reel/Ddx-7beOw9o/`;
    expect(extractInstagramCodes(text)).toEqual(['Ddx-7beOw9o', 'DdkwL9hIedh', 'Ddt1y9NoBEY']);
  });

  it('пропускает профиль, чужие сайты и держит предел', () => {
    expect(extractInstagramCodes('https://instagram.com/akshat.alan https://evil.com/reel/Ddx-7beOw9o/')).toEqual([]);
    const many = Array.from({ length: 20 }, (_, i) => `https://instagram.com/p/CODE${String(i).padStart(3, '0')}/`).join(' ');
    expect(extractInstagramCodes(many, 12)).toHaveLength(12);
  });

  it('не путает похожий чужой домен', () => {
    expect(codeFromUrl('https://notinstagram.com/p/Ddx-7beOw9o/')).toBeNull();
    expect(codeFromUrl('https://m.instagram.com/p/Ddx-7beOw9o/')).toBe('Ddx-7beOw9o');
  });
});

describe('parseInstagramPage', () => {
  it('берёт аккаунт, тип, дату, подпись и обложку', () => {
    const html = page(
      'https://www.instagram.com/akshat.alan/reel/Ddt1y9NoBEY/',
      '16 likes, 1 comments - akshat.alan on September 25, 2026: "📚 №1 ПЕДАГОГИКАЛЫҚ КЕҢЕС ӨТТІ\n\nБалабақшамызда кеңес өтті.". ',
    );
    const post = parseInstagramPage(html, 'x');
    expect(post).toMatchObject({
      code: 'Ddt1y9NoBEY',
      account: 'akshat.alan',
      kind: 'reel',
      date: '2026-09-25',
      url: 'https://www.instagram.com/reel/Ddt1y9NoBEY/',
      imageUrl: 'https://scontent.cdninstagram.com/v/cover.jpg?a=1&b=2',
    });
    expect(post?.caption).toBe('📚 №1 ПЕДАГОГИКАЛЫҚ КЕҢЕС ӨТТІ\n\nБалабақшамызда кеңес өтті.');
  });

  it('пост без подписи и фото (/p/)', () => {
    const post = parseInstagramPage(page('https://www.instagram.com/aisha/p/DdkwL9hIedh/', '10 likes, 0 comments - aisha September 21, 2026'), 'x');
    expect(post).toMatchObject({ kind: 'photo', caption: '', date: '2026-09-21', account: 'aisha' });
  });

  it('стена входа — не пост', () => {
    expect(parseInstagramPage('<html><head><title>Login • Instagram</title></head></html>', 'x')).toBeNull();
  });
});

describe('подпись → новость', () => {
  it('снимает хэштеги в конце и отдельные строки из хэштегов', () => {
    expect(cleanCaption('Педкеңес өтті.\n\n#ПедагогикалықКеңес #АланБалабақшасы\nЖаңа жыл! #тәрбие')).toBe('Педкеңес өтті.\nЖаңа жыл!');
  });

  it('заголовок — первая строка без эмодзи; без подписи — запасной', () => {
    expect(titleFromCaption('📚 №1 ПЕДАГОГИКАЛЫҚ КЕҢЕС ӨТТІ\n\nтекст', 'Жаңалық')).toBe('№1 ПЕДАГОГИКАЛЫҚ КЕҢЕС ӨТТІ');
    expect(titleFromCaption('“Күншуақ” тобы\nТәрбиеші: Жапакова А.К.', 'Жаңалық')).toBe('“Күншуақ” тобы');
    expect(titleFromCaption('', 'Жаңалық, 26 қыркүйек')).toBe('Жаңалық, 26 қыркүйек');
    expect(titleFromCaption('#тренд', 'Жаңалық')).toBe('Жаңалық');
  });

  it('длинный заголовок режется по слову', () => {
    const title = titleFromCaption('Баланың ұсақ қол қимылдарын дамыту, қол саусақтарының икемділігін арттыру, түстер мен бейнелерді ажырата білуге үйрету', 'x');
    expect(title.length).toBeLessThanOrEqual(91);
    expect(title.endsWith('…')).toBe(true);
  });

  it('строка-заголовок не повторяется в тексте', () => {
    expect(bodyFromCaption('📚 №1 КЕҢЕС ӨТТІ\n\nКеңес өтті.', '№1 КЕҢЕС ӨТТІ')).toBe('Кеңес өтті.');
    expect(bodyFromCaption('Первая строка\nВторая', 'Свой заголовок')).toBe('Первая строка\nВторая');
  });

  it('язык подписи — по казахским буквам', () => {
    expect(looksKazakh('Педагогтерден тренд')).toBe(false);
    expect(looksKazakh('Балабақшамызда кеңес өтті')).toBe(true);
    expect(looksKazakh('Группа «Зерек» на занятии')).toBe(false);
  });
});

describe('вспомогательное', () => {
  it('аккаунт из паспорта сада', () => {
    expect(accountFromProfile('https://www.instagram.com/akshat.alan')).toBe('akshat.alan');
    expect(accountFromProfile('instagram.com/Aisha_Sad/')).toBe('aisha_sad');
    expect(accountFromProfile('@akshat.alan')).toBe('akshat.alan');
    expect(accountFromProfile('')).toBeNull();
  });

  it('сущности HTML', () => {
    expect(decodeEntities('&#xab;&#x410;&#x41b;&#xbb; &amp; &quot;x&quot; &#1050;')).toBe('«АЛ» & "x" К');
  });
});
