import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load E2E environment variables (including DATABASE_URL for E2E branch)
// The .env.e2e file should contain DATABASE_URL pointing to the dedicated E2E testing branch
dotenv.config({ path: '.env.e2e' });

// Auth storage paths
const authDir = './playwright/.auth';
const adminAuth = `${authDir}/admin.json`;
const userAuth = `${authDir}/user.json`;
const newUserAuth = `${authDir}/new-user.json`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Add retries locally to handle transient dev server issues
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  globalSetup: path.resolve(__dirname, './tests/e2e/global.setup.ts'),
  globalTeardown: path.resolve(__dirname, './tests/e2e/global.teardown.ts'),

  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    ...devices['Desktop Chrome'],
  },

  projects: [
    // ═══════════════════════════════════════════════════════════════
    // SETUP PROJECT
    // Database branch is created in globalSetup before any project runs
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'auth-setup',
      testMatch: /setup\/auth\.setup\.ts/,
      // Run auth setup tests serially to reduce concurrent DB load on fresh endpoint
      fullyParallel: false,
    },

    // ═══════════════════════════════════════════════════════════════
    // TEST PROJECTS
    // All depend on auth-setup for authenticated sessions
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'smoke',
      testDir: './tests/e2e/specs/smoke',
      dependencies: ['auth-setup'],
      use: {
        storageState: userAuth,
      },
    },
    {
      name: 'user-authenticated',
      testDir: './tests/e2e/specs/user',
      dependencies: ['auth-setup'],
      use: {
        storageState: userAuth,
      },
    },
    {
      name: 'admin-authenticated',
      testDir: './tests/e2e/specs/admin',
      dependencies: ['auth-setup'],
      use: {
        storageState: adminAuth,
      },
    },
    {
      name: 'new-user-authenticated',
      testDir: './tests/e2e/specs/onboarding',
      dependencies: ['auth-setup'],
      use: {
        storageState: newUserAuth,
      },
    },
    {
      name: 'unauthenticated',
      testDir: './tests/e2e/specs/public',
      // No auth needed, but still waits for auth-setup to ensure all setup is complete
      dependencies: ['auth-setup'],
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
  ],

  webServer: {
    // Use production build for stability (recommended by Neon guide)
    // Dev mode has hot reloading issues that can cause transient connection errors
    command: process.env.CI ? 'npm run build && npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000, // 5 minutes to allow for build time
    // Pass E2E environment variables to the web server
    // DATABASE_URL from .env.e2e points to the dedicated E2E testing branch
    env: {
      ...process.env,
      // Ensure correct NODE_ENV for the test environment
      NODE_ENV: process.env.CI ? 'production' : 'development',
    },
  },
});
