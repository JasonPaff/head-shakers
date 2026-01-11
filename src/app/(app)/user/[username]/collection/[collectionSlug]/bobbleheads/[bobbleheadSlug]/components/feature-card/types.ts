/**
 * Shared types for the feature card components
 */

/**
 * Represents a photo item with URL and optional alt text
 * altText can be string, null (from database), or undefined (not provided)
 */
export type PhotoItem = {
  altText?: null | string;
  url: string;
};
