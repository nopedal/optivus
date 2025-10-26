import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Retry function with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft = 3,
  interval = 1000,
  exponential = true
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) {
      throw error;
    }
    
    // Wait for the specified interval
    await new Promise(resolve => setTimeout(resolve, interval));
    
    // Exponentially increase the interval
    return retry(
      fn,
      retriesLeft - 1,
      exponential ? interval * 2 : interval,
      exponential
    );
  }
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('network') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('connection') ||
    error?.message?.includes('unreachable')
  );
}
