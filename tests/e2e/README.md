# E2E Tests with Playwright and Clerk

This directory contains end-to-end tests for the Head Shakers application using Playwright with Clerk authentication.

## Setup

### 1. Install Dependencies

```bash
npm install
npm run test:e2e:install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.e2e.example .env.e2e
```

2. Fill in the required values in `.env.e2e`:
- `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key from the Clerk Dashboard
- `CLERK_SECRET_KEY`: Your Clerk secret key from the Clerk Dashboard
- `E2E_CLERK_USER_USERNAME`: Username for your test user
- `E2E_CLERK_USER_PASSWORD`: Password for your test user

### 3. Create a Test User

1. Go to your Clerk Dashboard
2. Navigate to Users
3. Create a new user with username/password authentication enabled
4. Use these credentials in your `.env.e2e` file

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Debug tests
```bash
npx playwright test --debug
```

## Test Structure

- `global.setup.ts` - Sets up authentication before all tests
- `auth.spec.ts` - Tests authentication flow and access control
- `navigation.spec.ts` - Tests app navigation and routing
- `helpers/test-helpers.ts` - Reusable test utilities and constants

## How It Works

1. **Global Setup**: Before any tests run, `global.setup.ts` authenticates a test user using Clerk and saves the authentication state
2. **Reused Auth State**: All tests use the saved authentication state, so they don't need to log in individually
3. **Clerk Testing Helpers**: We use `@clerk/testing` package to programmatically sign in/out during tests

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test'
import { routes, testIds } from './helpers/test-helpers'

test('my new test', async ({ page }) => {
  // Navigate to a page
  await page.goto(routes.dashboard)

  // Interact with elements
  await page.click(testIds.addBobbleheadButton)

  // Make assertions
  await expect(page).toHaveURL(/.*bobbleheads\/add/)
})
```

## Troubleshooting

### Tests fail with authentication errors
- Ensure your test user exists in Clerk Dashboard
- Verify your Clerk API keys are correct in `.env.e2e`
- Check that username/password authentication is enabled in Clerk

### Browser not installed
Run: `npm run test:e2e:install`

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Ensure your dev server is running if not using `webServer` config

## CI/CD

For CI environments:
1. Set environment variables as secrets
2. Install browsers: `npx playwright install-deps`
3. Run tests: `npm run test:e2e`