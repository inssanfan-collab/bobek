import type { Metadata, Viewport } from 'next';

/**
 * Админку портала можно поставить на телефон или компьютер как приложение
 * (PWA): значок, отдельное окно, push-уведомления — раздел «Уведомления».
 * Описание приложения — public/admin.webmanifest, фоновый скрипт —
 * public/admin-sw.js. Здесь, а не в (shell): установить приложение можно
 * и со страницы входа.
 *
 * Значок свой — самолётик на тёмной бирюзе админки (public/admin-icon.svg),
 * чтобы вкладка отличалась от сайта портала. Задавать все три: icons здесь
 * не дополняет значки layout портала, а заменяет их, и без icon вкладка
 * оставалась вовсе без значка.
 */
export const metadata: Metadata = {
  manifest: '/admin.webmanifest',
  appleWebApp: { capable: true, title: 'EduSad админ', statusBarStyle: 'default' },
  icons: {
    icon: [
      { url: '/admin-icon.svg', type: 'image/svg+xml' },
      { url: '/admin-icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/admin-apple-touch-icon.png',
  },
};

export const viewport: Viewport = { themeColor: '#0E6E85' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
