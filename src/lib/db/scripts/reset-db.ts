import 'dotenv/config';
import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

async function resetDatabase() {
  console.log('🗑️  Resetting database completely...');

  try {
    // drop all tables with CASCADE to handle foreign key dependencies
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

    console.log('✅ Database reset complete - all tables dropped');
    console.log('⚠️  You will need to run migrations to recreate the schema:');
    console.log('   bun run db:migrate');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  void resetDatabase();
}
