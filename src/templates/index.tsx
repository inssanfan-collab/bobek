import { KlassikHome } from './klassik/Home';
import { ZhuldyzHome } from './zhuldyz/Home';
import { ErtegiHome } from './ertegi/Home';
import { BulaqHome } from './bulaq/Home';
import { AlatauHome } from './alatau/Home';
import { KagazHome } from './kagaz/Home';
import type { HomeProps } from './types';

const HOMES = {
  klassik: KlassikHome,
  zhuldyz: ZhuldyzHome,
  ertegi: ErtegiHome,
  bulaq: BulaqHome,
  alatau: AlatauHome,
  kagaz: KagazHome,
} as const;

/** Неизвестный код шаблона не должен ронять сайт — откатываемся на «Классик». */
export function TemplateHome({ code, ...props }: HomeProps & { code: string }) {
  const Component = HOMES[code as keyof typeof HOMES] ?? KlassikHome;
  return <Component {...props} />;
}
