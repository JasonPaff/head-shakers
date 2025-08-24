import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  casing: 'snake_case',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
  migrations: {
    prefix: 'timestamp',
    table: '__drizzle_migrations__',
    schema: 'public',
  },
});
