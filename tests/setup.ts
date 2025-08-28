import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { ensureCleanDatabase, setupTestDatabase } from './helpers/database';

// setup MSW server for API mocking
export const server = setupServer();

// global test setup
beforeAll(async () => {
  console.log('Setting up test environment...');

  // start MSW server
  server.listen({ onUnhandledRequest: 'warn' });

  // ensure the test database is available and clean
  try {
    await ensureCleanDatabase();
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// cleanup after all tests
afterAll(() => {
  console.log('Cleaning up test environment...');
  server.close();
});

// reset state between tests
beforeEach(() => {
  server.resetHandlers();
});

// cleanup after each test
afterEach(async () => {
  // optional: reset the database state after each test
  await setupTestDatabase();
});
