import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/lib/db/migrations',
  casing: 'snake_case',
  schema: './src/lib/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
  schemaFilter: ['public', 'feature_planner'],
  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public',
  },
});
