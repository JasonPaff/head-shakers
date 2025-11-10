import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata, AuthContext, PublicContext } from '@/lib/utils/next-safe-action';

/**
 * Strip HTML tags from a string
 * This is a lightweight alternative to DOMPurify for serverless environments
 */
const stripHtmlTags = (value: string): string => {
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  // Remove any remaining potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, '');
  return sanitized;
};

export const sanitizationMiddleware = createMiddleware<{
  ctx: AuthContext;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, next }) => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return stripHtmlTags(value);
    }

    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
    }

    return value;
  };

  return next({
    ctx: {
      sanitizedInput: sanitizeValue(clientInput),
    },
  });
});

export const publicSanitizationMiddleware = createMiddleware<{
  ctx: PublicContext;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, next }) => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return stripHtmlTags(value);
    }

    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
    }

    return value;
  };

  return next({
    ctx: {
      sanitizedInput: sanitizeValue(clientInput),
    },
  });
});
