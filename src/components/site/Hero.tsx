import Link from 'next/link';
import type { ReactNode } from 'react';
import type { HeroContent, HeroLink } from '@/lib/hero';

/*
 * Общие части первого экрана главной: плашка, заголовок с выделенной частью
 * и кнопки. Раскладку и размеры задаёт шаблон (className) — здесь только
 * то, что должно выглядеть одинаково в любом шаблоне.
 *
 * tone: 'plain' — текст на светлом фоне; 'light' — на фото или цветной
 * полосе, где текст белый.
 */
type Tone = 'plain' | 'light';

export function HeroEyebrow({ hero, tone }: { hero: HeroContent; tone: Tone }) {
  if (!hero.eyebrow) return null;
  return (
    <p
      className={`inline-flex max-w-full items-center rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider ${
        tone === 'light' ? 'bg-white/15 text-white ring-1 ring-white/35 backdrop-blur' : 'bg-brand-soft text-brand-ink ring-1 ring-brand/20'
      }`}
    >
      {hero.eyebrow}
    </p>
  );
}

/** Заголовок первого экрана. Выделенная часть — второй строкой, цветом палитры. */
export function HeroTitle({
  hero,
  tone,
  className,
  withEyebrow = true,
}: {
  hero: HeroContent;
  tone: Tone;
  className: string;
  /** Шаблон со своей плашкой (Қағаз) рисует её сам. */
  withEyebrow?: boolean;
}) {
  return (
    <>
      {withEyebrow && hero.eyebrow ? (
        <div className="mb-4">
          <HeroEyebrow hero={hero} tone={tone} />
        </div>
      ) : null}
      <h1 className={className}>
        {hero.title}
        {hero.highlight ? (
          <>
            {' '}
            <br className="hidden sm:block" />
            <span className={tone === 'light' ? 'hero-highlight-light' : 'hero-highlight'}>{hero.highlight}</span>
          </>
        ) : null}
      </h1>
    </>
  );
}

function HeroButton({ link, primary, tone }: { link: HeroLink; primary: boolean; tone: Tone }) {
  const className =
    tone === 'light'
      ? primary
        ? 'btn bg-white text-brand-ink shadow-lift hover:-translate-y-0.5'
        : 'btn text-white ring-1 ring-white/60 hover:bg-white/10'
      : primary
        ? 'btn-primary shadow-soft'
        : 'btn-secondary';
  const inner = (
    <>
      {link.text}
      {primary ? <span aria-hidden>→</span> : null}
    </>
  );
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
  ) : link.href.startsWith('/') ? (
    <Link href={link.href} className={className}>{inner}</Link>
  ) : (
    // tel: и mailto: — обычной ссылкой.
    <a href={link.href} className={className}>{inner}</a>
  );
}

/**
 * Кнопки первого экрана. Сад их не задал — показываем то, что шаблон
 * рисовал раньше (обычно кнопку с телефоном): children.
 */
export function HeroButtons({ hero, tone, children }: { hero: HeroContent; tone: Tone; children?: ReactNode }) {
  if (hero.buttons.length === 0) return <>{children}</>;
  return (
    <>
      {hero.buttons.map((link, index) => (
        <HeroButton key={link.href + index} link={link} primary={index === 0} tone={tone} />
      ))}
    </>
  );
}
