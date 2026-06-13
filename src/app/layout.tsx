import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { NotificationManager } from '@/components/layout/NotificationManager';

export const metadata: Metadata = {
  title: "To'yxona.uz — Online Bron Qilish Platformasi",
  description: "O'zbekistondagi eng yaxshi to'yxonalarni toping va online bron qiling",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <NotificationManager />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
