"use client";

import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface UseToastReturn {
  toast: (options: {
    title?: string;
    description?: string;
    variant?: ToastType;
  }) => void;
}

export const useSonner = (): UseToastReturn => {
  const showToast = ({ 
    title = '', 
    description = '', 
    variant = 'success'
  }: {
    title?: string;
    description?: string;
    variant?: ToastType;
  }) => {
    if (variant === 'error') {
      toast.error(title, {
        description
      });
    } else if (variant === 'warning') {
      toast.warning(title, {
        description
      });
    } else if (variant === 'info') {
      toast.info(title, {
        description
      });
    } else {
      toast.success(title, {
        description
      });
    }
  };

  return { toast: showToast };
};