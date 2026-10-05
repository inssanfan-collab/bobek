import { env } from '@/lib/env';

/**
 * «Страница не найдена» на сайте сада. Языка запроса здесь не узнать,
 * поэтому подписи на двух языках. Главная — относительной ссылкой «/»:
 * она ведёт на главную того же сада, на каком бы домене он ни открыт.
 */
export default function TenantNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl" aria-hidden>🧸</span>
      <h1 className="mt-6 font-display text-3xl font-extrabold">Бет табылмады · Страница не найдена</h1>
      <p className="mt-2 max-w-md text-muted">
        Мекенжай қате терілген болуы мүмкін. Возможно, адрес набран с ошибкой.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {/* Обычная ссылка, не Link: страница 404 отрисована по внутреннему адресу /s/<домен>/…,
            и клиентский переход на «/» до главной сада не доходит. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- нужен полный переход через middleware */}
        <a href="/" className="btn-primary">Басты бетке · На главную</a>
        <a href={`https://${env.portalDomain}/catalog`} className="btn-secondary">
          Балабақшалар каталогы · Каталог садов
        </a>
      </div>
    </div>
  );
}
