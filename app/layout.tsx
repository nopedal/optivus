import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context';
import { ChatProvider } from '@/contexts/chat-context';
import ProtectedRoute from '@/components/auth/protected-route';
import { SonnerProvider } from '@/components/providers/SonnerProvider';
import FloatingChatButton from '@/components/FloatingChatButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Optivus',
  description: 'jeg har nugatti på ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
            <FloatingChatButton />
          </ChatProvider>
          <SonnerProvider />
        </AuthProvider>
      </body>
    </html>
  );
}