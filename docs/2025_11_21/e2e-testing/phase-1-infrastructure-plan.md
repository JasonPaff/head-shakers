# Phase 1: E2E Testing Infrastructure Plan

## Executive Summary

This document outlines the comprehensive plan for building a production-ready E2E testing infrastructure for Head Shakers using Playwright, Clerk authentication, and Neon database branching. **Phase 1 focuses entirely on local development foundation** - getting the bones strong before adding CI/CD integration.

---

## Table of Contents

1. [Research Findings & Best Practices](#research-findings--best-practices)
2. [Architecture Overview](#architecture-overview)
3. [Clerk Authentication Strategy](#clerk-authentication-strategy)
4. [Neon Database Branching Strategy](#neon-database-branching-strategy)
5. [Playwright Configuration Strategy](#playwright-configuration-strategy)
6. [Custom Fixtures Architecture](#custom-fixtures-architecture)
7. [Directory Structure](#directory-structure)
8. [Environment Configuration](#environment-configuration)
9. [Implementation Checklist](#implementation-checklist)
10. [Open Questions & Decisions](#open-questions--decisions)

---

## Research Findings & Best Practices

### Clerk Testing - Official Best Practices

#### Package: `@clerk/testing/playwright`

The official Clerk testing package provides integration helpers specifically designed for Playwright E2E testing.

#### Key Functions

| Function                               | Purpose                                    | When to Use                              |
| -------------------------------------- | ------------------------------------------ | ---------------------------------------- |
| `clerkSetup()`                         | Obtains a Testing Token for the test suite | Once in global setup, before all tests   |
| `setupClerkTestingToken({ page })`     | Injects Testing Token for a specific test  | Per-test when not using `clerk.signIn()` |
| `clerk.signIn({ page, signInParams })` | Signs in a user programmatically           | In auth setup to create stored states    |

#### Testing Tokens

Testing Tokens are Clerk's mechanism to bypass bot detection during E2E tests:

- Short-lived tokens valid only for specific instances
- Automatically handled when using `clerk.signIn()`
- Can be manually set via `CLERK_TESTING_TOKEN` env var
- Work in both development and production (with limitations)

#### Supported Sign-In Strategies

| Strategy     | Requirements                                     | Best For                 |
| ------------ | ------------------------------------------------ | ------------------------ |
| `password`   | User with password enabled                       | Most E2E scenarios       |
| `phone_code` | Test phone number (e.g., `+15555550100`)         | Phone-based auth testing |
| `email_code` | Test email (e.g., `user+clerk_test@example.com`) | Email-based auth testing |

**Note:** Multi-factor authentication is NOT supported by the testing helpers.

#### `clerk.signIn()` Parameters

```typescript
clerk.signIn({
  page: Page,                    // Playwright Page object
  signInParams: {
    strategy: 'password',        // 'password' | 'phone_code' | 'email_code'
    identifier: string,          // Email, phone, or username
    password?: string,           // Required for 'password' strategy
  },
  // OR use emailAddress directly (requires CLERK_SECRET_KEY)
  emailAddress?: string,
  setupClerkTestingTokenOptions?: {
    frontendApiUrl?: string,     // Override Frontend API URL
  },
})
```

#### Storage State Pattern

Clerk recommends saving authentication state to files for reuse:

```
playwright/
  .clerk/           # Git-ignored directory
    admin.json      # Admin role auth state
    user.json       # Regular user auth state
    new-user.json   # New user auth state
```

**Critical:** Must navigate to a page that loads Clerk BEFORE calling `clerk.signIn()`.

#### Multiple Roles Pattern

Official pattern for testing multiple user roles:

1. Create separate setup tests for each role
2. Each setup test saves to a different storage file
3. Test files/groups use `test.use({ storageState: '...' })` to load specific role
4. Tests can also create multiple browser contexts for role interaction testing

---

### Neon Database Branching - Official Best Practices

#### Package: `@neondatabase/api-client`

The official Neon TypeScript SDK provides programmatic access to all Neon management operations.

#### Core Concept: Branch Per Test Run

```
Production Branch (main)
    └── Development Branch (develop)
            └── E2E Branch (e2e-{runId}-{timestamp})  <-- Created/destroyed per run
```

**Why this works:**

- Branches are **copy-on-write** - instant creation, zero storage cost until writes
- Full isolation - each test run gets pristine data from develop
- No cleanup needed - just delete the branch
- Consistent baseline - always starts from known state

#### SDK Initialization

```typescript
import { createApiClient } from '@neondatabase/api-client';

const neonClient = createApiClient({
  apiKey: process.env.NEON_API_KEY!,
});
```

#### Branch Management API

| Method                                     | Purpose                                  |
| ------------------------------------------ | ---------------------------------------- |
| `createProjectBranch(projectId, options)`  | Create new branch with optional endpoint |
| `deleteProjectBranch(projectId, branchId)` | Delete branch and all resources          |
| `getConnectionUri(projectId, params)`      | Get connection string for branch         |
| `listProjectBranches(projectId)`           | List all branches in project             |

#### Creating an E2E Branch

```typescript
const response = await neonClient.createProjectBranch(PROJECT_ID, {
  branch: {
    name: `e2e-${runId}`,
    parent_id: DEVELOP_BRANCH_ID, // Branch from develop, not production
  },
  endpoints: [
    {
      type: EndpointType.ReadWrite,
      autoscaling_limit_min_cu: 0.25, // Minimum compute for cost savings
      autoscaling_limit_max_cu: 0.25,
    },
  ],
});
```

#### Getting Connection String

```typescript
const connectionUri = await neonClient.getConnectionUri(PROJECT_ID, {
  branch_id: branchId,
  database_name: 'head-shakers',
  role_name: 'neondb_owner',
});
// Returns: { uri: 'postgresql://...' }
```

#### Cost Optimization Strategies

| Strategy          | Implementation                             |
| ----------------- | ------------------------------------------ |
| Minimum compute   | Use `0.25 CU` for E2E branches             |
| Auto-suspend      | Set `suspend_timeout_seconds: 300` (5 min) |
| Immediate cleanup | Delete branch in teardown, even on failure |
| Copy-on-write     | No storage cost until data is modified     |

#### Head Shakers Specific Configuration

| Parameter          | Value                                               |
| ------------------ | --------------------------------------------------- |
| Project ID         | `misty-boat-49919732`                               |
| Database Name      | `head-shakers`                                      |
| Production Branch  | `br-dry-forest-adjaydda` (NEVER use for E2E)        |
| Development Branch | `br-dark-forest-adf48tll` (Parent for E2E branches) |

---

### Playwright Configuration - Official Best Practices

#### Project Dependencies vs globalSetup

Playwright offers two approaches for global setup. **Project Dependencies is the recommended approach:**

| Feature                                    | Project Dependencies      | `globalSetup` Config          |
| ------------------------------------------ | ------------------------- | ----------------------------- |
| HTML report visibility                     | Shown as separate project | Not shown                     |
| Trace recording                            | Full trace available      | Not supported                 |
| Playwright fixtures                        | Fully supported           | Not supported                 |
| Browser management                         | Via `browser` fixture     | Manual `browserType.launch()` |
| Config options (headless, testIdAttribute) | Automatically applied     | Ignored                       |
| Parallelism and retries                    | Supported via config      | Not applicable                |

#### Project Dependencies Pattern

```typescript
projects: [
  // Setup project runs first
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
    teardown: 'teardown', // Links to teardown project
  },
  // Teardown runs after all tests complete
  {
    name: 'teardown',
    testMatch: /.*\.teardown\.ts/,
  },
  // Test projects depend on setup
  {
    name: 'tests',
    dependencies: ['setup'],
    use: { storageState: '...' },
  },
];
```

#### Fixture Scopes

| Scope            | Lifecycle                          | Use Case                         |
| ---------------- | ---------------------------------- | -------------------------------- |
| `test` (default) | Created/destroyed per test         | Page objects, test-specific data |
| `worker`         | Shared across tests in same worker | Database connections, accounts   |

#### Worker-Scoped Fixture Pattern

```typescript
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker fixture - runs once per worker process
  sharedResource: [
    async ({}, use, workerInfo) => {
      const resource = await createResource(workerInfo.workerIndex);
      await use(resource);
      await destroyResource(resource);
    },
    { scope: 'worker' },
  ],
});
```

#### Auto Fixtures

Fixtures that run automatically for every test (useful for global beforeEach/afterEach):

```typescript
export const test = base.extend({
  autoSetup: [
    async ({ page }, use) => {
      // Runs before each test
      await page.goto('/');
      await use();
      // Runs after each test
      console.log('Test completed');
    },
    { auto: true },
  ],
});
```

#### Multi-Role Testing Patterns

**Pattern 1: Separate Test Files**

```typescript
// admin.spec.ts
test.use({ storageState: 'playwright/.auth/admin.json' })
test('admin test', ...)

// user.spec.ts
test.use({ storageState: 'playwright/.auth/user.json' })
test('user test', ...)
```

**Pattern 2: Test Describe Blocks**

```typescript
test.describe('admin flows', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })
  test('admin test', ...)
})

test.describe('user flows', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })
  test('user test', ...)
})
```

**Pattern 3: Multiple Contexts in Single Test**

```typescript
test('admin and user interact', async ({ browser }) => {
  const adminContext = await browser.newContext({
    storageState: 'playwright/.auth/admin.json',
  });
  const userContext = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
  });

  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();

  // Test interaction between roles

  await adminContext.close();
  await userContext.close();
});
```

**Pattern 4: POM Fixtures for Multi-Role**

```typescript
export const test = base.extend({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(new AdminPage(page));
    await context.close();
  },
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(new UserPage(page));
    await context.close();
  },
});
```

#### Parallel Worker Isolation

For isolating test data between parallel workers:

```typescript
export const test = base.extend<{}, { dbUserName: string }>({
  dbUserName: [
    async ({}, use, workerInfo) => {
      // Unique per worker
      const userName = `user-${workerInfo.workerIndex}`;
      await createUserInDb(userName);
      await use(userName);
      await deleteUserFromDb(userName);
    },
    { scope: 'worker' },
  ],
});
```

#### Reporter Configuration

| Environment       | Recommended Reporters                         |
| ----------------- | --------------------------------------------- |
| Local development | `html` (interactive)                          |
| CI (sharded)      | `blob` (for merging) + `github` (annotations) |
| CI (non-sharded)  | `html` + `github`                             |

---

## Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        E2E Test Execution                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. DB SETUP PROJECT                                               │
│     ├── Create Neon branch from develop                            │
│     ├── Get connection string                                      │
│     ├── Run database migrations                                    │
│     ├── Seed test data                                             │
│     └── Export DATABASE_URL for app                                │
│                                                                     │
│  2. AUTH SETUP PROJECT (depends on db-setup)                       │
│     ├── Call clerkSetup() for Testing Token                        │
│     ├── Sign in as admin → save playwright/.auth/admin.json        │
│     ├── Sign in as user → save playwright/.auth/user.json          │
│     ├── Sign in as new-user → save playwright/.auth/new-user.json  │
│     └── Verify each auth state                                     │
│                                                                     │
│  3. TEST PROJECTS (depend on auth-setup)                           │
│     ├── smoke: Critical path tests (fast feedback)                 │
│     ├── authenticated: User flows with storageState                │
│     ├── admin: Admin flows with admin storageState                 │
│     └── unauthenticated: Public pages, no auth                     │
│                                                                     │
│  4. DB TEARDOWN PROJECT (runs after all tests)                     │
│     └── Delete Neon branch                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Neon API   │───▶│  E2E Branch  │───▶│  Connection  │
│              │    │  (ephemeral) │    │    String    │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                                │
                    ┌───────────────────────────┘
                    │
                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Next.js App │◀───│ DATABASE_URL │◀───│   Fixtures   │
│  (dev server)│    │  (env var)   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Clerk     │───▶│  Auth State  │───▶│   Storage    │
│   Sign-In    │    │   (session)  │    │    Files     │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Clerk Authentication Strategy

### Test User Matrix

| Role             | Username (env var)            | Purpose             | Collections     | Admin |
| ---------------- | ----------------------------- | ------------------- | --------------- | ----- |
| Admin            | `E2E_CLERK_ADMIN_USERNAME`    | Admin panel testing | Has collections | Yes   |
| Established User | `E2E_CLERK_USER_USERNAME`     | Main user flows     | Has collections | No    |
| New User         | `E2E_CLERK_NEW_USER_USERNAME` | Onboarding flows    | No collections  | No    |
| Anonymous        | N/A (no auth)                 | Public page testing | N/A             | N/A   |

### Clerk Test Instance Requirements

1. **Create test users in Clerk Dashboard** (development instance):
   - Enable username/password authentication
   - Create users with known passwords
   - Set admin role via user metadata for admin user

2. **Environment Variables Required**:
   ```
   CLERK_SECRET_KEY=sk_test_...
   CLERK_PUBLISHABLE_KEY=pk_test_...
   E2E_CLERK_ADMIN_USERNAME=admin@test.example.com
   E2E_CLERK_ADMIN_PASSWORD=<secure-password>
   E2E_CLERK_USER_USERNAME=user@test.example.com
   E2E_CLERK_USER_PASSWORD=<secure-password>
   E2E_CLERK_NEW_USER_USERNAME=newuser@test.example.com
   E2E_CLERK_NEW_USER_PASSWORD=<secure-password>
   ```

### Auth Setup Flow

```
1. clerkSetup()
   └── Obtains Testing Token for entire suite

2. For each role:
   ├── page.goto('/')
   │   └── Navigate to page that loads Clerk
   │
   ├── clerk.signIn({ page, signInParams })
   │   ├── Injects Testing Token automatically
   │   └── Performs sign-in via Clerk
   │
   ├── Verification
   │   └── Check for authenticated UI element
   │
   └── page.context().storageState({ path })
       └── Save cookies/localStorage to file
```

### Storage State Files

```
playwright/
  .auth/                    # Git-ignored
    admin.json             # Admin session + cookies
    user.json              # Established user session
    new-user.json          # New user session
```

**Important:** Add `playwright/.auth/` to `.gitignore` - these contain session tokens.

---

## Neon Database Branching Strategy

### Branch Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Branch Lifecycle                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CREATE                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Generate unique branch name: e2e-{timestamp}-local   │   │
│  │ 2. Call createProjectBranch() with parent=develop       │   │
│  │ 3. Wait for branch + endpoint to be ready               │   │
│  │ 4. Get connection URI                                   │   │
│  │ 5. Run migrations (if schema changes pending)           │   │
│  │ 6. Seed deterministic test data                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  USE                                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • App connects via DATABASE_URL                         │   │
│  │ • Tests run with full isolation                         │   │
│  │ • Each test can modify data freely                      │   │
│  │ • Copy-on-write means minimal storage                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  CLEANUP                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Call deleteProjectBranch()                           │   │
│  │ 2. Branch + endpoint + all data removed                 │   │
│  │ 3. No residual cost                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Branch Naming Convention

| Environment | Pattern                 | Example                   |
| ----------- | ----------------------- | ------------------------- |
| Local       | `e2e-local-{timestamp}` | `e2e-local-1700000000000` |
| CI (future) | `e2e-{runId}-shard{n}`  | `e2e-12345-shard1`        |

### Neon API Client Wrapper

Create a utility module that encapsulates all Neon operations:

**Responsibilities:**

- Initialize API client with authentication
- Create branches with consistent configuration
- Handle endpoint creation with cost-optimized settings
- Retrieve connection strings
- Delete branches with proper error handling
- Implement retry logic for transient failures

**Configuration Constants:**

```typescript
const NEON_CONFIG = {
  projectId: 'misty-boat-49919732',
  developBranchId: 'br-dark-forest-adf48tll',
  databaseName: 'head-shakers',
  roleName: 'neondb_owner',
  compute: {
    minCu: 0.25,
    maxCu: 0.25,
    suspendTimeoutSeconds: 300,
  },
};
```

### Test Data Seeding Strategy

After branch creation, seed with deterministic data:

1. **Users** (synced with Clerk test users):
   - Admin user with admin role
   - Established user with collections
   - New user with no collections

2. **Collections** (for established user):
   - 2-3 collections with varied states
   - At least one with subcollections
   - At least one marked as featured

3. **Bobbleheads**:
   - 5-10 bobbleheads across collections
   - Variety of categories, manufacturers
   - Some with images (Cloudinary test images)

4. **Social Data**:
   - Follows between test users
   - Likes on collections/bobbleheads

---

## Playwright Configuration Strategy

### Project Structure

```typescript
projects: [
  // ═══════════════════════════════════════════
  // SETUP PROJECTS
  // ═══════════════════════════════════════════
  {
    name: 'db-setup',
    testMatch: /db\.setup\.ts/,
    teardown: 'db-teardown',
  },
  {
    name: 'auth-setup',
    testMatch: /auth\.setup\.ts/,
    dependencies: ['db-setup'],
  },

  // ═══════════════════════════════════════════
  // TEARDOWN PROJECTS
  // ═══════════════════════════════════════════
  {
    name: 'db-teardown',
    testMatch: /db\.teardown\.ts/,
  },

  // ═══════════════════════════════════════════
  // TEST PROJECTS
  // ═══════════════════════════════════════════
  {
    name: 'smoke',
    testDir: './tests/e2e/specs/smoke',
    dependencies: ['auth-setup'],
  },
  {
    name: 'user-authenticated',
    testDir: './tests/e2e/specs/user',
    dependencies: ['auth-setup'],
    use: { storageState: 'playwright/.auth/user.json' },
  },
  {
    name: 'admin-authenticated',
    testDir: './tests/e2e/specs/admin',
    dependencies: ['auth-setup'],
    use: { storageState: 'playwright/.auth/admin.json' },
  },
  {
    name: 'new-user-authenticated',
    testDir: './tests/e2e/specs/onboarding',
    dependencies: ['auth-setup'],
    use: { storageState: 'playwright/.auth/new-user.json' },
  },
  {
    name: 'unauthenticated',
    testDir: './tests/e2e/specs/public',
    dependencies: ['db-setup'], // Only needs DB, not auth
    use: { storageState: { cookies: [], origins: [] } },
  },
];
```

### Execution Order

```
1. db-setup          ─┐
                      ├─► 2. auth-setup ─► 3. smoke
                      │                  ─► 3. user-authenticated
                      │                  ─► 3. admin-authenticated
                      │                  ─► 3. new-user-authenticated
                      └─► 3. unauthenticated

4. db-teardown (after ALL tests complete)
```

### Key Configuration Options

| Option           | Local Value         | Purpose                            |
| ---------------- | ------------------- | ---------------------------------- |
| `fullyParallel`  | `true`              | Run tests in parallel              |
| `workers`        | `undefined` (auto)  | Use available CPU cores            |
| `retries`        | `0`                 | No retries locally (fast feedback) |
| `timeout`        | `30000`             | 30 second test timeout             |
| `expect.timeout` | `5000`              | 5 second assertion timeout         |
| `use.trace`      | `'on-first-retry'`  | Record trace on failure            |
| `use.video`      | `'off'`             | No video locally (performance)     |
| `use.screenshot` | `'only-on-failure'` | Screenshot failures                |

### Web Server Configuration

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: true,  // Use existing dev server if running
  timeout: 120000,            // 2 min startup timeout
  env: {
    // E2E branch connection string injected here
    DATABASE_URL: process.env.E2E_DATABASE_URL,
  },
}
```

---

## Custom Fixtures Architecture

### Fixture Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Fixture Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: Base Fixtures (Worker-Scoped)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • neonBranch: Database branch info + connection string  │   │
│  │ • testData: Seeded data references                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  LAYER 2: Auth Fixtures (Test-Scoped)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • adminPage: Page with admin auth context               │   │
│  │ • userPage: Page with user auth context                 │   │
│  │ • newUserPage: Page with new user auth context          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  LAYER 3: Page Object Fixtures (Test-Scoped)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • homePage: HomePage POM instance                       │   │
│  │ • collectionPage: CollectionPage POM instance           │   │
│  │ • bobbleheadPage: BobbleheadPage POM instance           │   │
│  │ • adminDashboard: AdminDashboard POM instance           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Base Fixtures Module

**Purpose:** Extend Playwright's base test with custom fixtures

**Fixture Definitions:**

| Fixture       | Scope  | Purpose                            |
| ------------- | ------ | ---------------------------------- |
| `neonBranch`  | worker | Branch info and connection string  |
| `testDataIds` | worker | IDs of seeded test data            |
| `adminPage`   | test   | Browser context with admin auth    |
| `userPage`    | test   | Browser context with user auth     |
| `newUserPage` | test   | Browser context with new user auth |

### Page Object Model Structure

Each page object should:

1. Accept a Playwright `Page` in constructor
2. Expose locators as properties (not methods)
3. Provide action methods for user interactions
4. Use test IDs from `@/lib/test-ids` for selectors

**Base Page Class:**

- `goto()`: Navigate to the page
- `waitForLoad()`: Wait for page to be ready
- Common locators: header, footer, navigation

**Feature Pages:**

- HomePage, CollectionPage, BobbleheadPage
- AdminDashboard, UserProfile
- Each extends base with feature-specific locators/actions

---

## Directory Structure

```
tests/
├── e2e/
│   ├── setup/                          # Setup/teardown projects
│   │   ├── db.setup.ts                 # Create Neon branch, seed data
│   │   ├── db.teardown.ts              # Delete Neon branch
│   │   └── auth.setup.ts               # Clerk auth for all roles
│   │
│   ├── fixtures/                       # Custom Playwright fixtures
│   │   ├── base.fixture.ts             # Extended test with all fixtures
│   │   ├── auth.fixture.ts             # Multi-role auth fixtures
│   │   └── index.ts                    # Re-export test + expect
│   │
│   ├── pages/                          # Page Object Models
│   │   ├── base.page.ts                # Base page class
│   │   ├── home.page.ts                # Home page POM
│   │   ├── collection.page.ts          # Collection page POM
│   │   ├── collection-detail.page.ts   # Collection detail POM
│   │   ├── bobblehead.page.ts          # Bobblehead page POM
│   │   ├── bobblehead-detail.page.ts   # Bobblehead detail POM
│   │   ├── admin/
│   │   │   ├── dashboard.page.ts       # Admin dashboard POM
│   │   │   └── users.page.ts           # Admin users POM
│   │   └── index.ts                    # Re-export all POMs
│   │
│   ├── utils/                          # Utility modules
│   │   ├── neon-branch.ts              # Neon API wrapper
│   │   ├── test-data.ts                # Test data seeding
│   │   ├── cloudinary-test.ts          # Test image helpers
│   │   └── assertions.ts               # Custom assertions
│   │
│   ├── specs/                          # Test specifications
│   │   ├── smoke/                      # Critical path tests
│   │   │   ├── health.spec.ts          # App health checks
│   │   │   └── auth-flow.spec.ts       # Basic auth verification
│   │   │
│   │   ├── public/                     # Unauthenticated tests
│   │   │   ├── home.spec.ts            # Public home page
│   │   │   ├── about.spec.ts           # About page
│   │   │   └── browse.spec.ts          # Public browsing
│   │   │
│   │   ├── user/                       # Authenticated user tests
│   │   │   ├── collections/
│   │   │   │   ├── list.spec.ts        # Collection list
│   │   │   │   ├── create.spec.ts      # Create collection
│   │   │   │   ├── edit.spec.ts        # Edit collection
│   │   │   │   └── delete.spec.ts      # Delete collection
│   │   │   ├── bobbleheads/
│   │   │   │   ├── list.spec.ts        # Bobblehead list
│   │   │   │   ├── create.spec.ts      # Add bobblehead
│   │   │   │   ├── edit.spec.ts        # Edit bobblehead
│   │   │   │   └── delete.spec.ts      # Delete bobblehead
│   │   │   └── profile/
│   │   │       └── settings.spec.ts    # User settings
│   │   │
│   │   ├── onboarding/                 # New user tests
│   │   │   ├── welcome.spec.ts         # Welcome flow
│   │   │   └── first-collection.spec.ts # First collection creation
│   │   │
│   │   └── admin/                      # Admin tests
│   │       ├── dashboard.spec.ts       # Admin dashboard
│   │       ├── featured.spec.ts        # Featured content management
│   │       └── users.spec.ts           # User management
│   │
│   └── helpers/                        # Existing helpers
│       └── test-helpers.ts             # ComponentFinder (keep)
│
├── playwright/
│   └── .auth/                          # Git-ignored auth states
│       ├── admin.json
│       ├── user.json
│       └── new-user.json
│
└── (existing test directories...)
```

---

## Environment Configuration

### Required Environment Variables

```bash
# .env.e2e (local E2E testing)

# ═══════════════════════════════════════════════════════════════
# NEON DATABASE
# ═══════════════════════════════════════════════════════════════
NEON_API_KEY=                           # Neon API key for branch management
NEON_PROJECT_ID=misty-boat-49919732     # Head Shakers project
NEON_DEVELOP_BRANCH_ID=br-dark-forest-adf48tll  # Parent branch for E2E

# ═══════════════════════════════════════════════════════════════
# CLERK AUTHENTICATION
# ═══════════════════════════════════════════════════════════════
CLERK_SECRET_KEY=sk_test_...            # Clerk secret key (test instance)
CLERK_PUBLISHABLE_KEY=pk_test_...       # Clerk publishable key

# Test user credentials (create these in Clerk dashboard)
E2E_CLERK_ADMIN_USERNAME=admin@test.headshakers.com
E2E_CLERK_ADMIN_PASSWORD=<secure-password>

E2E_CLERK_USER_USERNAME=user@test.headshakers.com
E2E_CLERK_USER_PASSWORD=<secure-password>

E2E_CLERK_NEW_USER_USERNAME=newuser@test.headshakers.com
E2E_CLERK_NEW_USER_PASSWORD=<secure-password>

# ═══════════════════════════════════════════════════════════════
# CLOUDINARY (use existing test/dev credentials)
# ═══════════════════════════════════════════════════════════════
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ═══════════════════════════════════════════════════════════════
# OTHER SERVICES (can use test/mock values)
# ═══════════════════════════════════════════════════════════════
ABLY_API_KEY=...                        # Real-time features
REDIS_URL=...                           # Caching (optional for E2E)
```

### Environment Loading Strategy

1. Create `.env.e2e` with E2E-specific configuration
2. Playwright config loads this file before tests
3. DB setup project creates branch and sets `DATABASE_URL`
4. Web server receives `DATABASE_URL` via env

### Secrets Management (Local)

- Store `.env.e2e` locally, add to `.gitignore`
- Create `.env.e2e.example` with placeholder values
- Document required Clerk test user setup

---

## Implementation Checklist

### Phase 1A: Neon Branch Management

- [ ] Install `@neondatabase/api-client` package
- [ ] Create `tests/e2e/utils/neon-branch.ts` utility module
- [ ] Implement `createE2EBranch()` function
- [ ] Implement `deleteE2EBranch()` function
- [ ] Implement `getConnectionString()` function
- [ ] Add error handling and retry logic
- [ ] Test branch creation/deletion manually
- [ ] Document Neon API key setup in `.env.e2e.example`

### Phase 1B: Clerk Multi-User Setup

- [ ] Create test users in Clerk dashboard (admin, user, new-user)
- [ ] Configure admin user with admin role metadata
- [ ] Update `.env.e2e` with all user credentials
- [ ] Refactor `auth.setup.ts` for multi-role authentication
- [ ] Create auth state files for each role
- [ ] Verify each role can authenticate successfully
- [ ] Update `.gitignore` for `playwright/.auth/`

### Phase 1C: Playwright Project Structure

- [ ] Update `playwright.config.ts` with project dependencies
- [ ] Create `db.setup.ts` for branch creation
- [ ] Create `db.teardown.ts` for branch cleanup
- [ ] Update `auth.setup.ts` with multi-role support
- [ ] Configure storage states per project
- [ ] Test setup/teardown flow end-to-end
- [ ] Verify proper dependency ordering

### Phase 1D: Custom Fixtures

- [ ] Create `tests/e2e/fixtures/base.fixture.ts`
- [ ] Implement worker-scoped database fixture
- [ ] Implement test-scoped auth page fixtures
- [ ] Create fixture index for clean imports
- [ ] Update existing tests to use new fixtures
- [ ] Document fixture usage patterns

### Phase 1E: Page Object Models

- [ ] Create `tests/e2e/pages/base.page.ts`
- [ ] Create home page POM
- [ ] Create collection page POMs (list, detail)
- [ ] Create bobblehead page POMs (list, detail)
- [ ] Create admin page POMs
- [ ] Integrate with existing ComponentFinder

### Phase 1F: Test Data Seeding

- [ ] Create `tests/e2e/utils/test-data.ts`
- [ ] Define deterministic seed data schema
- [ ] Implement seeding functions using Drizzle
- [ ] Integrate seeding into db.setup.ts
- [ ] Test data integrity after seeding

### Phase 1G: Smoke Tests

- [ ] Create `tests/e2e/specs/smoke/health.spec.ts`
- [ ] Create `tests/e2e/specs/smoke/auth-flow.spec.ts`
- [ ] Verify all roles can access appropriate pages
- [ ] Verify database connection works
- [ ] Full local run validation

---

## Open Questions & Decisions

### Decisions to Make

1. **Test User Email Domain**
   - Option A: Use real email addresses (e.g., `admin@test.headshakers.com`)
   - Option B: Use Clerk test email format (e.g., `admin+clerk_test@example.com`)
   - Recommendation: Option A for clarity, just ensure they're only in test Clerk instance

2. **Cloudinary Strategy for E2E**
   - Option A: Use real Cloudinary (same as dev)
   - Option B: Mock Cloudinary uploads in E2E
   - Recommendation: Option A initially, monitor usage

3. **Branch Reuse for Local Development**
   - Option A: Always create fresh branch
   - Option B: Reuse branch if exists (faster iteration)
   - Recommendation: Option B with manual cleanup command

4. **Test Data Reset Strategy**
   - Option A: Delete/recreate branch per run (current plan)
   - Option B: Truncate tables and re-seed (faster but messier)
   - Recommendation: Option A for reliability

### Questions to Clarify

1. Should we create dedicated Clerk users or use existing dev accounts?
2. Any specific test scenarios that must be covered in Phase 1?
3. Preferred naming convention for test IDs in the app?
4. Should we integrate with existing ComponentFinder or replace?

---

## Success Criteria

Phase 1 is complete when:

1. ✅ Running `npm run test:e2e` locally:
   - Creates ephemeral Neon branch automatically
   - Authenticates all three user roles
   - Runs smoke tests successfully
   - Deletes branch on completion (success or failure)

2. ✅ Test isolation verified:
   - Each run starts with clean data
   - No data persists between runs
   - Parallel tests don't interfere

3. ✅ Developer experience is smooth:
   - Clear error messages on failures
   - Easy to run specific test files
   - Can debug with Playwright UI mode

4. ✅ Foundation ready for expansion:
   - Adding new tests is straightforward
   - Adding new user roles is documented
   - CI integration path is clear

---

## Next Phases (Future)

### Phase 2: Test Coverage Expansion

- Full CRUD tests for collections and bobbleheads
- Social features testing
- Admin functionality testing
- Error handling and edge cases

### Phase 3: CI/CD Integration

- GitHub Actions workflow
- Sharding for parallel execution
- HTML report artifacts
- Blocking gate configuration

### Phase 4: Advanced Features

- Visual regression testing
- Performance testing
- Cross-browser testing
- Mobile viewport testing
