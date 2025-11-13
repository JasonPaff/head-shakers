/**
 * Slug Utility Functions
 * Provides URL-safe slug generation, validation, and collision handling
 */

/**
 * Regular expression pattern for valid slugs
 * - Must start and end with lowercase letter or number
 * - Can contain lowercase letters, numbers, and hyphens
 * - No consecutive hyphens
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Ensure a slug is unique by appending a numeric suffix if needed
 *
 * Format: slug-2, slug-3, etc.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug string
 *
 * @example
 * ensureUniqueSlug("my-slug", ["my-slug", "my-slug-2"]) // "my-slug-3"
 * ensureUniqueSlug("my-slug", ["other-slug"]) // "my-slug"
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: Array<string>): string {
  // If the base slug doesn't exist, return it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Find the highest numeric suffix
  let counter = 2;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

/**
 * Generate a URL-safe slug from a string
 *
 * Handles:
 * - Special characters (removed/replaced)
 * - Spaces (converted to hyphens)
 * - Unicode characters (normalized and converted)
 * - Lowercase conversion
 * - Trailing/leading hyphens (removed)
 * - Consecutive hyphens (collapsed to single)
 *
 * @param name - The input string to convert to a slug
 * @returns A URL-safe slug string
 *
 * @example
 * generateSlug("My Awesome Collection!") // "my-awesome-collection"
 * generateSlug("Café & Bar") // "cafe-bar"
 * generateSlug("   Spaces   Everywhere   ") // "spaces-everywhere"
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters, keep spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate that a string is a properly formatted slug
 *
 * Valid slugs:
 * - Lowercase letters (a-z)
 * - Numbers (0-9)
 * - Hyphens (-)
 * - Must start and end with letter or number
 * - No consecutive hyphens
 *
 * @param slug - The string to validate
 * @returns True if valid slug format, false otherwise
 *
 * @example
 * validateSlug("my-valid-slug") // true
 * validateSlug("My-Invalid-Slug") // false
 * validateSlug("invalid--slug") // false
 * validateSlug("-invalid") // false
 */
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  return SLUG_PATTERN.test(slug);
}
