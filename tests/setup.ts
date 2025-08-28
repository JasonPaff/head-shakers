import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach } from 'vitest';

import { setupTestDatabase } from './helpers/database.helper';

// setup MSW server for API mocking
export const server = setupServer();

beforeAll(async () => {
  server.listen();
  await setupTestDatabase();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  server.resetHandlers();
});
