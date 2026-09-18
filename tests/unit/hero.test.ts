import { describe, expect, it } from 'vitest';
import type { TenantProfile } from '@prisma/client';
import { ctaLink, headerExtras, heroContent } from '@/lib/hero';

const base = {
  nameKk: '«Күншуақ» бөбекжайы', nameRu: 'Ясли-сад «Күншуақ»',
  aboutKk: 'Балабақша туралы', aboutRu: 'О нашем саде', district: 'Алматинский район',
  phone: '+7 (7132) 21-11-12', workHours: 'Пн–Пт, 7:30–18:30',
} as unknown as TenantProfile;

describe('первый экран', () => {
  it('ничего не заполнено — название и «О саде», без кнопок, как было', () => {
    const hero = heroContent(base, 'ru');
    expect(hero).toEqual({ eyebrow: '', title: 'Ясли-сад «Күншуақ»', highlight: '', lead: 'О нашем саде', buttons: [] });
  });

  it('свои тексты и кнопки; перевода нет — берётся второй язык', () => {
    const hero = heroContent({
      ...base,
      heroTitleRu: 'Счастливое детство среди', heroHighlightRu: 'природы и сказки',
      heroCta1TextRu: 'Записаться', heroCta1Url: '/feedback',
      heroCta2TextRu: 'Instagram', heroCta2Url: 'https://instagram.com/sad',
    } as TenantProfile, 'kk');
    expect(hero.title).toBe('Счастливое детство среди');
    expect(hero.highlight).toBe('природы и сказки');
    expect(hero.buttons).toEqual([
      { text: 'Записаться', href: '/feedback?lang=kk', external: false },
      { text: 'Instagram', href: 'https://instagram.com/sad', external: true },
    ]);
  });

  it('кнопка без текста или без ссылки не показывается', () => {
    expect(ctaLink('', '/feedback', 'ru')).toBeNull();
    expect(ctaLink('Позвонить', '', 'ru')).toBeNull();
    expect(ctaLink('Позвонить', 'tel:+77132211112', 'ru')).toEqual({ text: 'Позвонить', href: 'tel:+77132211112', external: false });
  });
});

describe('шапка', () => {
  it('по умолчанию — район, без телефона и кнопки', () => {
    expect(headerExtras(base, 'ru')).toEqual({ tagline: 'Алматинский район', taglineCustom: false, cta: null, phone: null, hours: null });
  });

  it('своя подпись, телефон с часами и кнопка', () => {
    const extras = headerExtras({
      ...base, headerTaglineRu: 'Детский эко-сад', headerShowPhone: true,
      headerCtaTextRu: 'Записаться на экскурсию', headerCtaUrl: '/feedback',
    } as TenantProfile, 'ru');
    expect(extras.tagline).toBe('Детский эко-сад');
    expect(extras.taglineCustom).toBe(true);
    expect(extras.phone).toBe('+7 (7132) 21-11-12');
    expect(extras.hours).toBe('Пн–Пт, 7:30–18:30');
    expect(extras.cta).toEqual({ text: 'Записаться на экскурсию', href: '/feedback', external: false });
  });
});
