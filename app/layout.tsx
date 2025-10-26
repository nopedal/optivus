import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';
import { SonnerProvider } from '@/components/providers/SonnerProvider';

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
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
          <SonnerProvider />
        </AuthProvider>
      </body>
    </html>
  );
}