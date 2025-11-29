/**
 * Helper function to mask email for privacy in Sentry context
 * Shows first 3 characters and domain only (e.g., "joh***@example.com")
 */
export function maskEmail(email: string): string {
  const parts = email.split('@');
  const localPart = parts[0] ?? '';
  const domain = parts[1] ?? '';
  const visibleChars = Math.min(3, localPart.length);
  return localPart.substring(0, visibleChars) + '***@' + domain;
}

/**
 * Normalize email address for consistent storage and lookup
 * Converts to lowercase and trims whitespace
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
