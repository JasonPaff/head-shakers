import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load E2E environment variables
dotenv.config({ path: '.env.e2e' });

// Read E2E branch connection string if available
// Note: This is called at config parse time, so the file must exist
// Database branch is created in globalSetup before the web server starts
function getE2EDatabaseUrl(): string | undefined {
  const branchInfoFile = path.join(__dirname, 'playwright/.e2e-branch.json');
  if (fs.existsSync(branchInfoFile)) {
    try {
      const branchInfo = JSON.parse(fs.readFileSync(branchInfoFile, 'utf-8'));
      return branchInfo.connectionString;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Auth storage paths
const authDir = './playwright/.auth';
const adminAuth = `${authDir}/admin.json`;
const userAuth = `${authDir}/user.json`;
const newUserAuth = `${authDir}/new-user.json`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
    // Spread all env vars from parent process, then override DATABASE_URL with E2E branch
    env: {
      ...process.env,
      // Override database URL with E2E branch connection string
      DATABASE_URL: getE2EDatabaseUrl() || process.env.DATABASE_URL || '',
      // Ensure correct NODE_ENV for the test environment
      NODE_ENV: process.env.CI ? 'production' : 'development',
    },
  },
});
