import { env } from '@/lib/env';

export default function TenantNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl" aria-hidden>🧸</span>
      <h1 className="mt-6 font-display text-3xl font-extrabold">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-muted">
        Возможно, раздел отключён или адрес набран с ошибкой.
      </p>
      <a href={`https://${env.portalDomain}/catalog`} className="btn-secondary mt-6">
        Каталог детских садов
      </a>
    </div>
  );
}
