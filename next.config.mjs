/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Медиа отдаётся с локального диска через /api/media, внешние источники не нужны.
  images: { remotePatterns: [] },
  // Запас над MAX_UPLOAD_MB: тело запроса больше самого файла на границы
  // формы и служебные поля. Без этого запаса загрузка падает не нашей
  // понятной ошибкой, а обрывом на уровне Next.
  experimental: {
    serverActions: { bodySizeLimit: '55mb' },
    // Каждый запрос к сайту сада проходит через middleware (подмена адреса
    // под /s/<host>), а у него свой предел тела — 10 МБ. Сверх него Next
    // молча обрезает форму, и загрузка файла больше 10 МБ падала с
    // «Unexpected end of form», хотя serverActions разрешал больше.
    middlewareClientMaxBodySize: '55mb',
  },
  // Заголовки защиты для всех страниц портала и садов (11.10.2026).
  // HTTPS (HSTS) ставит nginx. Встраивать наши страницы можно только
  // самим себе: админку нельзя спрятать в рамку чужого сайта и подсунуть
  // под клик. Предпросмотр в редакторе — srcDoc, просмотрщик документов
  // встраивает сайт Microsoft, а не нас, — их это не задевает.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
