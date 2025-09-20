import { randomUUID } from 'crypto';

/**
 * Generate a session ID on the client side using a fallback method
 * Falls back to timestamp + random when crypto.randomUUID is not available
 * @returns {string} A unique session identifier
 */
export function generateClientSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return generateSessionId();
  }

  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate a unique session ID for view tracking correlation
 * Uses crypto.randomUUID() for secure, unique session identification
 * @returns {string} A unique session identifier
 */
export function generateSessionId(): string {
  return randomUUID();
}

/**
 * Get or create a session ID for the current session
 * Stores in sessionStorage to persist across page navigation within the session
 * @returns {string} Session ID for the current session
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // server-side, generate new session ID
    return generateSessionId();
  }

  const SESSION_KEY = 'head_shakers_session_id';

  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = generateClientSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  } catch {
    // fallback if sessionStorage is not available (private browsing, etc.)
    return generateClientSessionId();
  }
}
