import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'null',
  globalSetup: resolve(__dirname, './tests/e2e/global.setup.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  timeout: 240 * 1000,

  projects: [
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'authenticated',
      testMatch: '**/home-authenticated.spec.ts',
      use: {
        storageState: 'playwright/.clerk/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'unauthenticated',
      testMatch: '**/home-unauthenticated.spec.ts',
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 240 * 1000,
  },
});
