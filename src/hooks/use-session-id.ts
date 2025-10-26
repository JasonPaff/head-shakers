import { useState } from 'react';

import { getOrCreateSessionId } from '@/utils/session-utils';

/**
 * Custom hook for managing session IDs in client components
 * Provides session ID generation with optional override capability
 *
 * @param providedSessionId - Optional external session ID to use instead of generating one
 * @returns The effective session ID (provided or internally generated)
 */
export function useSessionId(providedSessionId?: string): null | string {
  const [sessionId] = useState<null | string>(() => {
    // only generate on the client-side to avoid SSR issues
    if (typeof window !== 'undefined' && !providedSessionId) {
      return getOrCreateSessionId();
    }
    return null;
  });

  return providedSessionId || sessionId;
}
