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
    serverActions: { bodySizeLimit: '110mb' },
    // Каждый запрос к сайту сада проходит через middleware (подмена адреса
    // под /s/<host>), а у него свой предел тела — 10 МБ. Сверх него Next
    // молча обрезает форму, и загрузка файла больше 10 МБ падала с
    // «Unexpected end of form», хотя serverActions разрешал 110.
    middlewareClientMaxBodySize: '110mb',
  },
};

export default nextConfig;
