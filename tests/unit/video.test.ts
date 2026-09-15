import { describe, expect, it } from 'vitest';
import { parseVideo } from '@/lib/video';

describe('parseVideo', () => {
  it('разбирает обычную ссылку YouTube', () => {
    const video = parseVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5');
    expect(video?.kind).toBe('youtube');
    expect(video?.id).toBe('dQw4w9WgXcQ');
    expect(video?.posterUrl).toContain('dQw4w9WgXcQ');
  });

  it('понимает короткую ссылку и Shorts — ими делятся с телефона', () => {
    expect(parseVideo('https://youtu.be/dQw4w9WgXcQ')?.id).toBe('dQw4w9WgXcQ');
    expect(parseVideo('https://www.youtube.com/shorts/dQw4w9WgXcQ')?.id).toBe('dQw4w9WgXcQ');
  });

  it('разбирает ролик Instagram и с именем аккаунта в адресе, и без него', () => {
    expect(parseVideo('https://www.instagram.com/reel/DaUoIlliIkI/')?.id).toBe('DaUoIlliIkI');
    expect(parseVideo('https://www.instagram.com/aisha2022/reel/DaUoIlliIkI/?igsh=x')?.id)
      .toBe('DaUoIlliIkI');
  });

  it('у Instagram обложки нет: её отдают только по токену', () => {
    expect(parseVideo('https://www.instagram.com/p/DaUoIlliIkI/')?.posterUrl).toBeNull();
  });

  it('ссылку без протокола принимает — сад копирует адрес как придётся', () => {
    expect(parseVideo('youtube.com/watch?v=dQw4w9WgXcQ')?.kind).toBe('youtube');
  });

  it('чужой сервис и мусор отклоняет', () => {
    expect(parseVideo('https://vk.com/video1_2')).toBeNull();
    expect(parseVideo('просто текст')).toBeNull();
    expect(parseVideo('')).toBeNull();
    expect(parseVideo(null)).toBeNull();
  });

  it('не принимает ссылку на профиль вместо ролика', () => {
    expect(parseVideo('https://www.instagram.com/aishabalabakshasy2022/')).toBeNull();
    expect(parseVideo('https://www.youtube.com/@channel')).toBeNull();
  });
});
