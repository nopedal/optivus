'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/signin?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          router.push('/');
        } else {
          // No session found, redirect to sign in
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/signin?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-600 dark:text-neutral-400" />
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}