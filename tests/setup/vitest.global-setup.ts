/**
 * Vitest Global Setup for Integration Tests
 *
 * This file runs once before all tests start.
 * It initializes the PostgreSQL test container and sets
 * the TEST_DATABASE_URL environment variable for test workers.
 */

import { startTestDatabase, stopTestDatabase } from './test-db';

export default async function globalSetup(): Promise<() => Promise<void>> {
  console.log('\n[Global Setup] Initializing test environment...');

  // Start the test database container
  const connectionString = await startTestDatabase();

  // Set environment variable for test workers
  process.env.TEST_DATABASE_URL = connectionString;

  console.log('[Global Setup] Test environment ready\n');

  // Return teardown function
  return async () => {
    console.log('\n[Global Teardown] Cleaning up test environment...');
    await stopTestDatabase();
    console.log('[Global Teardown] Cleanup complete\n');
  };
}
