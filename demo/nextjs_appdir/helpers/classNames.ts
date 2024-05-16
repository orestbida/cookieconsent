import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

/**
 * Helper function for properly merging multiple classname values.
 *
 * @param inputs Class name values
 * @returns Properly merged class name
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}