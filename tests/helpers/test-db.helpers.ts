import { Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';

import { CONFIG } from '@/lib/constants';
import * as schema from '@/lib/db/schema';

// create the test database connection
const createTestDb = () => {
  const connectionString = process.env.DATABASE_URL_TEST;

  if (!connectionString) {
    throw new Error('DATABASE_URL_TEST is required for test database connection');
  }

  // use regular pg driver for local databases (localhost)
  if (connectionString.includes('localhost')) {
    const testPool = new PgPool({
      connectionString,
      connectionTimeoutMillis: CONFIG.DATABASE.QUERY_TIMEOUT,
      idleTimeoutMillis: CONFIG.DATABASE.TRANSACTION_TIMEOUT,
      max: CONFIG.DATABASE.CONNECTION_POOL_SIZE,
    });

    return drizzlePg(testPool, { schema });
  }

  // use Neon serverless driver for remote databases
  const testPool = new NeonPool({
    connectionString,
    connectionTimeoutMillis: CONFIG.DATABASE.QUERY_TIMEOUT,
    idleTimeoutMillis: CONFIG.DATABASE.TRANSACTION_TIMEOUT,
    max: CONFIG.DATABASE.CONNECTION_POOL_SIZE,
    maxUses: CONFIG.DATABASE.MAX_USES,
  });

  return drizzle(testPool, { schema });
};

// lazy initialization to allow for dynamic DATABASE_URL_TEST
let _testDb: null | ReturnType<typeof createTestDb> = null;

export const testDb = new Proxy({} as ReturnType<typeof createTestDb>, {
  get(_target, prop) {
    if (!_testDb) _testDb = createTestDb();
    return _testDb[prop as keyof typeof _testDb];
  },
});
