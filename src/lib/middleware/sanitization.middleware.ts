import DOMPurify from 'isomorphic-dompurify';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata, AuthContext } from '@/lib/utils/next-safe-action';

export const sanitizationMiddleware = createMiddleware<{
  ctx: AuthContext;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, next }) => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
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
