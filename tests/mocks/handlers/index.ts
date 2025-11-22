/**
 * MSW Handlers Index
 *
 * Export all mock API handlers from this file.
 * Add new handler files as the test suite grows.
 */

import { authHandlers } from './auth.handlers';
import { bobbleheadsHandlers } from './bobbleheads.handlers';
import { collectionsHandlers } from './collections.handlers';

// Combine all handlers
export const handlers = [...authHandlers, ...collectionsHandlers, ...bobbleheadsHandlers];
