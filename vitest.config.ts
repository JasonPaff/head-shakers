import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // for database tests
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
