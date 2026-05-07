/**
 * cn — Tailwind CSS class merge utility for NativeWind.
 * Combines clsx + twMerge for conditional class composition without conflicts.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
