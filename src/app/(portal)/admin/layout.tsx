import type { Metadata, Viewport } from 'next';

/**
 * Админку портала можно поставить на телефон или компьютер как приложение
 * (PWA): значок, отдельное окно, push-уведомления — раздел «Уведомления».
 * Описание приложения — public/admin.webmanifest, фоновый скрипт —
 * public/admin-sw.js. Здесь, а не в (shell): установить приложение можно
 * и со страницы входа.
 */
export const metadata: Metadata = {
  manifest: '/admin.webmanifest',
  appleWebApp: { capable: true, title: 'EduSad админ', statusBarStyle: 'default' },
  icons: { apple: '/admin-icon-192.png' },
};

export const viewport: Viewport = { themeColor: '#6A58D8' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
