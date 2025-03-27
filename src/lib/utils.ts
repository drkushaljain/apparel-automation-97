
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with the given currency code
 */
export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Rounds the number to 2 decimal places to avoid floating point precision issues
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Ensures numbers used for currency are properly rounded to avoid floating point issues
 */
export function ensureCurrencyPrecision(amount: number): number {
  // Convert to string with 2 decimals, then back to number to avoid floating point issues
  return parseFloat(amount.toFixed(2));
}

/**
 * Returns appropriate responsive class based on screen size
 * Useful for conditional responsive styling
 */
export function getResponsiveClass(base: string, md?: string, lg?: string): string {
  return cn(
    base,
    md && `md:${md}`,
    lg && `lg:${lg}`
  );
}

/**
 * Truncates text to a specific length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number = 20): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
