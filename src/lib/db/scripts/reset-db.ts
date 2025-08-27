import 'dotenv/config';
import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

async function resetDatabase() {
  console.log('🗑️  Resetting database completely...');

  try {
    // drop all tables with CASCADE to handle foreign key dependencies
    // get all table names (including drizzle tables)
    const tablesResult = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    // handle Neon's result structure
    const tables = (tablesResult as any).rows || tablesResult;

    if (tables.length > 0) {
      // drop all tables
      const tableNames = tables.map((t: any) => `"${t.tablename}"`).join(', ');
      await db.execute(sql.raw(`DROP TABLE IF EXISTS ${tableNames} CASCADE`));
      console.log(`✅ Dropped ${tables.length} tables`);
    }

    // also drop custom types/enums
    const customTypesResult = await db.execute(sql`
      SELECT typname FROM pg_type 
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typtype = 'e'
    `);

    const customTypes = (customTypesResult as any).rows || customTypesResult;

    if (customTypes.length > 0) {
      for (const type of customTypes) {
        await db.execute(sql.raw(`DROP TYPE IF EXISTS "${type.typname}" CASCADE`));
      }
      console.log(`✅ Dropped ${customTypes.length} custom types`);
    }

    console.log('✅ Database reset complete');
    console.log('⚠️  You will need to run migrations to recreate the schema:');
    console.log('   npm run db:migrate');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

void resetDatabase();
