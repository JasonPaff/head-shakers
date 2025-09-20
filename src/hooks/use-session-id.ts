import { useEffect, useState } from 'react';

import { getOrCreateSessionId } from '@/utils/session-utils';

/**
 * Custom hook for managing session IDs in client components
 * Provides session ID generation with optional override capability
 *
 * @param providedSessionId - Optional external session ID to use instead of generating one
 * @returns The effective session ID (provided or internally generated)
 */
export function useSessionId(providedSessionId?: string): null | string {
  const [sessionId, setSessionId] = useState<null | string>(null);

  useEffect(() => {
    // only generate on the client-side to avoid SSR issues
    if (typeof window !== 'undefined' && !providedSessionId) {
      setSessionId(getOrCreateSessionId());
    } else {
      setSessionId(`fallback_${Date.now()}`);
    }
  }, [providedSessionId]);

  return providedSessionId || sessionId;
}
