import { setupServer } from 'msw/node';

import { handlers } from '../mocks/handlers';

// Create the MSW server with all handlers
export const server = setupServer(...handlers);
