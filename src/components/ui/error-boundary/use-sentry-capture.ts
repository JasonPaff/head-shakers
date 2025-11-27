import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { SENTRY_TAGS } from '@/lib/constants/sentry';

interface SentryCaptureOptions {
  /** Component/section name for tagging */
  name: string;
  /** Additional tags to include */
  tags?: Record<string, string>;
}

/**
 * Hook for capturing errors to Sentry in route-level error.tsx files
 * Use the ErrorBoundary component for component-level error handling
 */
export function useSentryCapture(error: Error | null, options: SentryCaptureOptions): void {
  useEffect(() => {
    if (error) {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: 'true',
          [SENTRY_TAGS.COMPONENT]: options.name,
          [SENTRY_TAGS.FEATURE]: 'error-boundary',
          ...options.tags,
        },
      });
    }
  }, [error, options.name, options.tags]);
}
