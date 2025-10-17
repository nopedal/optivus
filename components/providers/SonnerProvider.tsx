"use client";

import { Toaster } from 'sonner';

export function SonnerProvider() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{
        className: "dark:bg-gray-800 dark:text-gray-100",
        duration: 3000
      }}
    />
  );
}