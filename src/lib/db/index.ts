import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { CONFIG } from '@/lib/constants';

import * as schema from './schema/index';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: CONFIG.DATABASE.QUERY_TIMEOUT,
  idleTimeoutMillis: CONFIG.DATABASE.TRANSACTION_TIMEOUT,
  max: CONFIG.DATABASE.CONNECTION_POOL_SIZE,
  maxUses: CONFIG.DATABASE.MAX_USES,
});

export const db = drizzle(pool, { schema });
