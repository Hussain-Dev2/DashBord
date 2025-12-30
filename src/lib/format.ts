/**
 * Utility functions for consistent formatting across server and client
 */

/**
 * Format a number as currency with consistent locale
 * @param amount - The number to format
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date with consistent locale
 * @param date - The date to format
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format a date and time with consistent locale
 * @param date - The date to format
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const dateStr = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
  
  const timeStr = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
  
  return `${dateStr} at ${timeStr}`
}
