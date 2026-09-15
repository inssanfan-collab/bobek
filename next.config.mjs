/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Медиа отдаётся с локального диска через /api/media, внешние источники не нужны.
  images: { remotePatterns: [] },
  // Запас над MAX_UPLOAD_MB: тело запроса больше самого файла на границы
  // формы и служебные поля. Без этого запаса загрузка падает не нашей
  // понятной ошибкой, а обрывом на уровне Next.
  experimental: { serverActions: { bodySizeLimit: '110mb' } },
};

export default nextConfig;
