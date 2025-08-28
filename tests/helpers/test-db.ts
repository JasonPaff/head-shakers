import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { CONFIG } from '@/lib/constants';
import * as schema from '@/lib/db/schema';

const testPool = new Pool({
  connectionString: process.env.DATABASE_URL_TEST,
  connectionTimeoutMillis: CONFIG.DATABASE.QUERY_TIMEOUT,
  idleTimeoutMillis: CONFIG.DATABASE.TRANSACTION_TIMEOUT,
  max: CONFIG.DATABASE.CONNECTION_POOL_SIZE,
  maxUses: CONFIG.DATABASE.MAX_USES,
});

export const testDb = drizzle(testPool, { schema });
