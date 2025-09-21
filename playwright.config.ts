import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// load E2E environment variables
dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'null',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  timeout: 240 * 1000,
  projects: [
    {
      name: 'global setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'authenticated-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['global setup'],
      testMatch: /authenticated\.spec\.ts/,
    },
    {
      name: 'auth-flow-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // No shared storageState - each test handles its own auth
      },
      dependencies: ['global setup'],
      testMatch: /auth-flow\.spec\.ts/,
    },
    {
      name: 'other-tests-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['global setup'],
      testMatch: /^(?!.*\/(authenticated|auth-flow)\.spec\.ts$).*\.spec\.ts$/,
    },
    {
      name: 'authenticated-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['global setup'],
      testMatch: /authenticated\.spec\.ts/,
    },
    {
      name: 'auth-flow-firefox',
      use: {
        ...devices['Desktop Firefox'],
        // No shared storageState - each test handles its own auth
      },
      dependencies: ['global setup'],
      testMatch: /auth-flow\.spec\.ts/,
    },
    {
      name: 'other-tests-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['global setup'],
      testMatch: /^(?!.*\/(authenticated|auth-flow)\.spec\.ts$).*\.spec\.ts$/,
    },
    // {
    //   name: 'authenticated-webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'playwright/.clerk/user.json',
    //   },
    //   dependencies: ['global setup'],
    //   testMatch: /authenticated\.spec\.ts/,
    // },
    // {
    //   name: 'auth-flow-webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     // No shared storageState - each test handles its own auth
    //   },
    //   dependencies: ['global setup'],
    //   testMatch: /auth-flow\.spec\.ts/,
    // },
    // {
    //   name: 'other-tests-webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: 'playwright/.clerk/user.json',
    //   },
    //   dependencies: ['global setup'],
    //   testMatch: /(?!authenticated|auth-flow).*\.spec\.ts/,
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240 * 1000,
  },
});
