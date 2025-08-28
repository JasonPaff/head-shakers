import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { ensureCleanDatabase, setupTestDatabase } from './helpers/database';
import { checkDockerRequirements } from './helpers/docker-check';
import { startTestDatabase, stopTestDatabase } from './helpers/test-container';

// setup MSW server for API mocking
export const server = setupServer();

// global test setup
beforeAll(async () => {
  console.log('Setting up test environment...');

  // start MSW server
  server.listen({ onUnhandledRequest: 'warn' });

  // try the automatic test database container, fallback to existing DATABASE_URL_TEST
  try {
    if (!process.env.DATABASE_URL_TEST) {
      console.log('No DATABASE_URL_TEST found, checking Docker...');

      const dockerCheck = checkDockerRequirements();
      if (!dockerCheck.isAvailable || !dockerCheck.isRunning) {
        throw new Error(`Docker setup issue: ${dockerCheck.error}`);
      }

      console.log('Docker available, starting automatic container...');
      const testDbUrl = await startTestDatabase();
      process.env.DATABASE_URL_TEST = testDbUrl;
    } else {
      console.log('Using existing DATABASE_URL_TEST configuration');
    }

    // run migrations on the test database
    await ensureCleanDatabase();
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    console.log('\n💡 Solutions:');
    console.log('  1. Start Docker Desktop');
    console.log('  2. Or set DATABASE_URL_TEST in .env for manual connection');
    console.log('  3. Or use: npm run test:db:docker');
    throw error;
  }
});

// cleanup after all tests
afterAll(async () => {
  console.log('Cleaning up test environment...');
  server.close();
  await stopTestDatabase();
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
