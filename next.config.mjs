/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Медиа отдаётся с локального диска через /api/media, внешние источники не нужны.
  images: { remotePatterns: [] },
  experimental: { serverActions: { bodySizeLimit: '25mb' } },
};

export default nextConfig;
