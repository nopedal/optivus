'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/update-password'];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = authRoutes.includes(pathname);
      
      if (!user && !isAuthRoute) {
        // Redirect to login if not authenticated and not on an auth page
        router.push('/auth/signin');
      } else if (user && isAuthRoute) {
        // Redirect to home if authenticated and on an auth page
        router.push('/');
      }
    }
  }, [user, isLoading, router, pathname]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</h2>
        </div>
      </div>
    );
  }

  // If not on auth route and not authenticated, don't render children (redirect will happen)
  if (!user && !authRoutes.includes(pathname)) {
    return null;
  }

  // If on auth route and authenticated, don't render children (redirect will happen)
  if (user && authRoutes.includes(pathname)) {
    return null;
  }

  // Otherwise render children
  return <>{children}</>;
}