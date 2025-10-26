import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: true, // for database tests
    //   },
    // },
    // Exclude E2E tests from Vitest - these should be run with Playwright
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',
      'tests/e2e/**',
      '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'coverage/**',
        'dist/**',
        'build/**',
        '.next/**',
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/migrations/**',
        '**/scripts/**',
        'src/app/**/*.tsx',
        'src/app/globals.css',
        'src/components/ui/**',
        'src/**/types.ts',
        'src/**/constants/**',
        'src/**/schema/**',
        'src/instrumentation*.ts',
        'sentry.*.config.ts',
        'drizzle.config.ts',
        'postcss.config.mjs',
        'eslint.config.mjs',
        'next.config.ts',
        'next-env.d.ts',
        '_next-typesafe-url_.d.ts',
      ],
      // thresholds: {
      //   global: {
      //     branches: 80,
      //     functions: 80,
      //     lines: 80,
      //     statements: 80,
      //   },
      //   perFile: true,
      //   branches: 70,
      //   functions: 70,
      //   lines: 70,
      //   statements: 70,
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
