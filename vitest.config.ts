import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Environment
    environment: 'jsdom',

    // Global setup for test database (Testcontainers)
    // Note: teardown is returned from globalSetup function
    globalSetup: ['./tests/setup/vitest.global-setup.ts'],

    // Per-file setup (MSW, mocks, etc.)
    setupFiles: ['./tests/setup/vitest.setup.ts'],

    // Test file patterns (exclude e2e - handled by Playwright)
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'tests/integration/**/*.integration.test.{ts,tsx}',
      'tests/components/**/*.test.tsx',
    ],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*', '.worktrees/**/*'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/lib/db/schema/**',
        'src/lib/db/migrations/**',
        'src/lib/db/scripts/**',
        'src/instrumentation*.ts',
        'src/middleware.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },

    // Reporter configuration
    reporters: ['default'],

    // Globals - allows using describe, it, expect without imports
    globals: true,

    // Pool configuration - using forks for better isolation
    pool: 'forks',

    // Run integration tests sequentially to avoid database deadlocks
    fileParallelism: false,

    // Timeout (increased for integration tests with database)
    testTimeout: 30000,

    // Retry flaky tests in CI
    retry: process.env.CI ? 2 : 0,
  },
});
