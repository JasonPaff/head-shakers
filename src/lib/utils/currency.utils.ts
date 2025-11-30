/**
 * Currency Utility Functions
 * Provides consistent currency formatting across the application
 */

/**
 * Format a numeric value as USD currency
 *
 * @param value - The numeric value to format (can be null, undefined, string, or number)
 * @returns Formatted currency string, defaults to '$0.00' for invalid values
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency("500") // "$500.00"
 * formatCurrency(null) // "$0.00"
 */
export function formatCurrency(value: null | number | string | undefined): string {
  if (value === null || value === undefined) {
    return '$0.00';
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(numericValue);
}
