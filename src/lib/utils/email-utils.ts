/**
 * Normalize email address for consistent storage and lookup
 * Converts to lowercase and trims whitespace
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
