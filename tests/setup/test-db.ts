/**
 * Test Database Setup with Testcontainers
 *
 * This module manages a PostgreSQL container for integration testing.
 * It provides isolated database instances that are automatically
 * cleaned up after tests complete.
 *
 * Usage:
 * - Global setup starts the container and sets TEST_DATABASE_URL
 * - Each test file uses getTestDb() which connects using that URL
 * - resetTestDatabase() clears all data between tests
 */

import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import { Pool } from 'pg';

import * as schema from '@/lib/db/schema/index';

// Known table names from the schema - used for truncation
// This is more reliable than trying to dynamically detect tables
const KNOWN_TABLES = [
  'users',
  'login_history',
  'user_settings',
  'notification_settings',
  'user_blocks',
  'collections',
  'sub_collections',
  'bobbleheads',
  'bobblehead_photos',
  'bobblehead_tags',
  'tags',
  'comments',
  'likes',
  'follows',
  'notifications',
  'featured_content',
  'platform_settings',
  'content_metrics',
  'launch_notifications',
  'content_reports',
  'content_views',
  'search_queries',
];

// Container instance (only used in global setup)
let container: null | StartedPostgreSqlContainer = null;

// Per-worker database connection (initialized lazily)
let pool: null | Pool = null;
let testDb: NodePgDatabase<typeof schema> | null = null;

/**
 * Clean up a specific table.
 * Useful for targeted cleanup in specific tests.
 */
export async function cleanupTable(tableName: string): Promise<void> {
  const db = getTestDb();
  await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" CASCADE`));
}

/**
 * Close the test database connection for this worker.
 * Called automatically during test teardown.
 */
export async function closeTestDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    testDb = null;
  }
}

/**
 * Get the test database instance.
 * Lazily initializes the connection using TEST_DATABASE_URL.
 */
export function getTestDb(): NodePgDatabase<typeof schema> {
  if (!testDb) {
    initializeTestDb();
  }
  return testDb!;
}

/**
 * Check if the test database is initialized.
 */
export function isTestDbInitialized(): boolean {
  return testDb !== null;
}

/**
 * Reset the database by truncating all tables.
 * Call this between tests that need isolated data.
 */
export async function resetTestDatabase(): Promise<void> {
  const db = getTestDb();

  // Use known tables list for reliable truncation
  if (KNOWN_TABLES.length === 0) {
    console.warn('[TestDB] No tables found to truncate');
    return;
  }

  // Truncate all tables with CASCADE to handle foreign keys
  await db.execute(sql.raw(`TRUNCATE TABLE ${KNOWN_TABLES.map((t) => `"${t}"`).join(', ')} CASCADE`));
}

/**
 * Start the PostgreSQL test container and run migrations.
 * This should be called once in global setup.
 * Returns the connection string to be used by test workers.
 */
export async function startTestDatabase(): Promise<string> {
  console.log('[TestDB] Starting PostgreSQL container...');

  // Start PostgreSQL container
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_head_shakers')
    .withUsername('test')
    .withPassword('test')
    .withExposedPorts(5432)
    .start();

  const connectionString = container.getConnectionUri();
  console.log(`[TestDB] Container started at ${container.getHost()}:${container.getPort()}`);

  // Create a temporary connection for migrations
  const migrationPool = new Pool({
    connectionString,
    max: 1,
  });

  const migrationDb = drizzle(migrationPool, { schema });

  // Run migrations
  console.log('[TestDB] Running migrations...');
  const migrationsFolder = path.resolve(process.cwd(), 'src/lib/db/migrations');
  await migrate(migrationDb, { migrationsFolder });
  console.log('[TestDB] Migrations complete');

  // Close migration connection
  await migrationPool.end();

  return connectionString;
}

/**
 * Stop the PostgreSQL test container.
 * This should be called in global teardown.
 */
export async function stopTestDatabase(): Promise<void> {
  console.log('[TestDB] Stopping test database...');

  if (container) {
    await container.stop();
    container = null;
  }

  console.log('[TestDB] Test database stopped');
}

/**
 * Initialize the database connection for this test worker.
 * Uses TEST_DATABASE_URL environment variable set by global setup.
 */
function initializeTestDb(): void {
  const connectionString = process.env.TEST_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      '[TestDB] TEST_DATABASE_URL not set. ' +
        'Make sure global setup ran successfully and set the environment variable.',
    );
  }

  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 5,
  });

  testDb = drizzle(pool, { schema });
}

// Export schema for convenience in tests
export { schema };
