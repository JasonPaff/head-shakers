# Collection Header Feature - Test Implementation Plan

**Feature Area**: Collection Header Components & Infrastructure
**Test Scope**: Unit | Component | Integration (NO E2E)
**Total Tests**: 65 tests across 3 test types
**Created**: 2025-12-04

---

## 1. Overview

### 1.1 Summary

This plan covers comprehensive test implementation for the collection header feature, addressing critical coverage gaps across utilities, hooks, UI components, and server actions.

**Test Distribution:**
- **Unit Tests**: 17 tests (utilities & hooks)
- **Component Tests**: 35 tests (UI components)
- **Integration Tests**: 12 tests (actions, async components, queries)

### 1.2 Complexity Assessment

**Overall Risk Level**: MEDIUM-HIGH

**Risk Factors:**
1. **Currency formatting** - Edge cases with null/undefined/string values
2. **Share utilities** - Browser API mocking (clipboard, window.open)
3. **useLike hook** - Complex optimistic updates with auth gating
4. **Form interactions** - TanStack Form integration with validation
5. **Server actions** - Transaction handling, permission checks
6. **Dialog orchestration** - Multiple dialogs with state synchronization

**Technical Challenges:**
- Mocking browser APIs (clipboard, navigator)
- Testing optimistic UI updates with server action integration
- Testing authenticated vs unauthenticated flows
- Verifying toast notifications and error handling
- Testing complex form validation with confirmation inputs

### 1.3 Dependencies

**Existing Test Infrastructure:**
- `tests/setup/test-utils.tsx` - Component rendering with Clerk mock
- `tests/setup/test-db.ts` - Testcontainers database setup
- `tests/fixtures/collection.factory.ts` - Collection test data
- `tests/fixtures/user.factory.ts` - User test data

**Required New Infrastructure:**
- Browser API mocks (clipboard, window.open)
- Social share URL mocks
- MSW handlers for server actions
- Component test factories for complex props

---

## 2. Prerequisites

### 2.1 Test Infrastructure Requirements

**Files to Create:**

1. **`tests/mocks/browser-api.mocks.ts`**
   - Mock `navigator.clipboard` API
   - Mock `window.open` with call tracking
   - Mock `window.screen` dimensions
   - Export reusable mock factories

2. **`tests/fixtures/collection-header.factory.ts`**
   - Factory for `CollectionDashboardHeaderRecord`
   - Factory for `PublicCollection`
   - Preset variants (with/without stats, owner/non-owner)

3. **`tests/mocks/handlers/collections.handlers.ts`**
   - MSW handlers for collection CRUD actions
   - Mock successful/failed responses
   - Simulate permission errors

4. **`tests/setup/mock-environment.ts`**
   - Mock `NEXT_PUBLIC_APP_URL` environment variable
   - Export setup/teardown utilities

### 2.2 Validation Commands

After creating infrastructure:
```bash
# Verify infrastructure files compile
npm run typecheck

# Test that mocks are importable
npm test tests/mocks/browser-api.mocks.test.ts
```

---

## 3. Implementation Steps

### STEP 1: Test Infrastructure Setup

**What**: Create reusable mocks and factories for browser APIs, test data, and MSW handlers

**Why**: Foundation for all subsequent tests; reduces duplication and ensures consistency

**Test Type**: Infrastructure (no tests yet)

**Files to Create:**
1. `C:\Users\jasonpaff\dev\head-shakers\tests\mocks\browser-api.mocks.ts`
2. `C:\Users\jasonpaff\dev\head-shakers\tests\fixtures\collection-header.factory.ts`
3. `C:\Users\jasonpaff\dev\head-shakers\tests\mocks\handlers\collections.handlers.ts`
4. `C:\Users\jasonpaff\dev\head-shakers\tests\setup\mock-environment.ts`

**Implementation Details:**

**browser-api.mocks.ts** should include:
- `mockClipboard()` - Returns mock clipboard API with writeText
- `mockWindowOpen()` - Returns spy for window.open calls
- `mockWindowScreen()` - Mocks screen dimensions
- `restoreBrowserAPIs()` - Cleanup function

**collection-header.factory.ts** should include:
- `createMockCollectionHeader()` - Full header data with defaults
- `createMockPublicCollection()` - Public collection variant
- Preset options: `withLikes`, `withComments`, `withValue`

**collections.handlers.ts** should include:
- Handler for `createCollectionAction`
- Handler for `updateCollectionAction`
- Handler for `deleteCollectionAction`
- Error response variants (permission denied, validation error)

**mock-environment.ts** should include:
- `setupMockEnvironment()` - Sets NEXT_PUBLIC_APP_URL
- `teardownMockEnvironment()` - Restores original values

**Patterns to Follow:**
- Reference `tests/setup/test-utils.tsx` for setup patterns
- Reference `tests/fixtures/user.factory.ts` for factory structure

**Validation Commands:**
```bash
npm run typecheck
npm test tests/mocks/ -- --run
```

**Success Criteria:**
- All infrastructure files compile without errors
- Mock factories can be imported in test files
- Environment variables can be set/restored

---

### STEP 2: Currency Utils Unit Tests (5 tests)

**What**: Test `formatCurrency()` utility with various input types and edge cases

**Why**: HIGH RISK - Currency formatting is displayed throughout the app; incorrect formatting could confuse users or display invalid data

**Test Type**: Unit

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\unit\lib\utils\currency.utils.test.ts`

**Test Cases:**
1. Should format valid number as USD currency with thousand separators
2. Should format string numeric value as currency
3. Should return '$0.00' for null value
4. Should return '$0.00' for undefined value
5. Should return '$0.00' for NaN string value

**Test Details:**

Test 1: `formatCurrency(1234.56) => "$1,234.56"`
Test 2: `formatCurrency("500") => "$500.00"`
Test 3: `formatCurrency(null) => "$0.00"`
Test 4: `formatCurrency(undefined) => "$0.00"`
Test 5: `formatCurrency("invalid") => "$0.00"`

**Patterns to Follow:**
- Reference `tests/unit/lib/utils/email-utils.test.ts` for unit test structure
- Use simple describe/it blocks
- Test edge cases explicitly
- Verify exact string output

**Validation Commands:**
```bash
npm test tests/unit/lib/utils/currency.utils.test.ts -- --run
```

**Success Criteria:**
- All 5 tests pass
- 100% code coverage of `currency.utils.ts`
- No console warnings or errors

---

### STEP 3: Share Utils Unit Tests (8 tests)

**What**: Test share utility functions including clipboard operations, URL generation, and social media share URLs

**Why**: MEDIUM-HIGH RISK - Share functionality involves browser APIs and external URLs; failures could break social sharing features

**Test Type**: Unit

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\unit\lib\utils\share-utils.test.ts`

**Test Cases:**

**copyToClipboard (2 tests):**
1. Should copy text to clipboard and return true on success
2. Should return false when clipboard API is unavailable

**generateAbsoluteUrl (2 tests):**
3. Should generate absolute URL from relative path with leading slash
4. Should add leading slash if missing and generate absolute URL

**generateSocialShareUrl (3 tests):**
5. Should generate Twitter/X share URL with title and description
6. Should generate Facebook share URL with just URL
7. Should generate LinkedIn share URL with URL parameter

**getBaseUrl (1 test):**
8. Should throw error when NEXT_PUBLIC_APP_URL is not configured

**Test Details:**

Tests 1-2: Mock `navigator.clipboard` using browser-api.mocks
Tests 3-4: Mock `process.env.NEXT_PUBLIC_APP_URL` using mock-environment
Tests 5-7: Verify URL construction and URLSearchParams encoding
Test 8: Verify error is thrown and captured by Sentry mock

**Patterns to Follow:**
- Reference `tests/unit/lib/utils/email-utils.test.ts` for unit test structure
- Use `beforeEach` to set up mocks
- Use `afterEach` to restore mocks
- Verify Sentry calls for error cases

**Validation Commands:**
```bash
npm test tests/unit/lib/utils/share-utils.test.ts -- --run
```

**Success Criteria:**
- All 8 tests pass
- Browser API mocks work correctly
- Sentry mock captures exceptions
- No actual clipboard or window operations

---

### STEP 4: useLike Hook Unit Tests (4 tests)

**What**: Test `useLike` custom hook behavior including state management, optimistic updates, and auth gating

**Why**: HIGH RISK - Like functionality is core to user engagement; optimistic updates must work correctly to avoid UI desync

**Test Type**: Unit (Hook)

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\unit\hooks\use-like.test.tsx`

**Test Cases:**
1. Should initialize with provided like count and isLiked state
2. Should toggle like state optimistically when toggleLike is called
3. Should not toggle like when user is not signed in
4. Should call onLikeChange callback with new values on toggle

**Test Details:**

Test 1: Verify initial state matches props
Test 2: Call `toggleLike()`, verify count increments and isLiked toggles
Test 3: Mock unauthenticated Clerk state, call `toggleLike()`, verify no state change
Test 4: Provide `onLikeChange` callback, verify it's called with correct args

**Implementation Notes:**
- Use `renderHook` from `@testing-library/react`
- Mock `@clerk/nextjs` useAuth hook
- Mock `toggleLikeAction` server action
- Mock `useOptimisticServerAction` hook behavior

**Patterns to Follow:**
- Create wrapper with necessary providers (Clerk)
- Use `act()` for state updates
- Test authenticated and unauthenticated scenarios
- Verify callbacks are called with correct arguments

**Validation Commands:**
```bash
npm test tests/unit/hooks/use-like.test.tsx -- --run
```

**Success Criteria:**
- All 4 tests pass
- Hook state updates correctly
- Auth gating works
- Callbacks fire with correct values

---

### STEP 5: Collection Header Card Component Tests (4 tests)

**What**: Test `CollectionHeaderCard` rendering, stats display, currency formatting, and dropdown interactions

**Why**: MEDIUM RISK - Primary header display component; must render stats accurately and provide edit/delete actions

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\dashboard\collection-header-card.test.tsx`

**Test Cases:**
1. Should render collection name, description, and avatar
2. Should display formatted stats (items, likes, views, comments)
3. Should format total value as currency using formatCurrency utility
4. Should render dropdown menu with Edit and Delete options

**Test Details:**

Test 1: Verify heading, description, avatar present
Test 2: Verify stat text content (e.g., "5 items", "10 views")
Test 3: Pass collection with totalValue=1234.56, verify "$1,234.56" displayed
Test 4: Click dropdown trigger, verify Edit and Delete menu items

**Required Props:**
```typescript
{
  collection: createMockCollectionHeader({ totalValue: 1234.56 }),
  onEdit: vi.fn(),
  onDelete: vi.fn()
}
```

**Patterns to Follow:**
- Reference `tests/components/collections/dashboard/sidebar-header.test.tsx`
- Use `render()` from test-utils
- Query by role for accessibility
- Test user interactions with `user.click()`

**Validation Commands:**
```bash
npm test tests/components/collections/dashboard/collection-header-card.test.tsx -- --run
```

**Success Criteria:**
- All 4 tests pass
- Component renders without errors
- Stats display correctly
- Callbacks fire on interactions

---

### STEP 6: Collection Header Display Component Tests (5 tests)

**What**: Test `CollectionHeaderDisplay` orchestration of dialogs, edit flow, and delete confirmation

**Why**: HIGH RISK - Orchestrates multiple dialogs and server actions; state synchronization is critical

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\dashboard\collection-header-display.test.tsx`

**Test Cases:**
1. Should render CollectionHeaderCard with collection data
2. Should open edit dialog when onEdit is triggered
3. Should open delete confirmation dialog when onDelete is triggered
4. Should close edit dialog and clear editing state on cancel
5. Should execute delete action and navigate away on confirm

**Test Details:**

Test 1: Verify CollectionHeaderCard is rendered with correct props
Test 2: Simulate dropdown menu Edit click, verify dialog opens
Test 3: Simulate dropdown menu Delete click, verify confirmation dialog opens
Test 4: Open edit dialog, click Cancel, verify dialog closes and state clears
Test 5: Mock `deleteCollectionAction`, confirm delete, verify action called and navigation occurs

**MSW Handlers Required:**
- Mock `deleteCollectionAction` success response

**Patterns to Follow:**
- Use `render()` with mock collection data
- Query dialogs by role and test IDs
- Mock `useServerAction` hook
- Verify `setParams` called with null to clear route

**Validation Commands:**
```bash
npm test tests/components/collections/dashboard/collection-header-display.test.tsx -- --run
```

**Success Criteria:**
- All 5 tests pass
- Dialogs open/close correctly
- Server action executes on delete
- Navigation occurs after success

---

### STEP 7: Collection Sticky Header Component Tests (5 tests)

**What**: Test mobile sticky header with owner/non-owner action buttons and conditional rendering

**Why**: MEDIUM RISK - Different action sets for owners vs non-owners; auth state affects button visibility

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\collection-sticky-header.test.tsx`

**Test Cases:**
1. Should render collection title and like button for all users
2. Should show Edit and Delete buttons for owner when canEdit and canDelete are true
3. Should show Report button for non-owner users
4. Should open edit dialog when Edit button is clicked
5. Should not show Edit/Delete buttons when permissions are false

**Test Details:**

Test 1: Verify title heading and LikeCompactButton render
Test 2: Pass `isOwner=true, canEdit=true, canDelete=true`, verify buttons present
Test 3: Pass `isOwner=false`, verify ReportButton renders
Test 4: Click Edit button, verify CollectionUpsertDialog opens
Test 5: Pass `canEdit=false, canDelete=false`, verify buttons hidden

**Required Props Variants:**
- Owner with permissions
- Owner without permissions
- Non-owner

**Patterns to Follow:**
- Test conditional rendering with different prop combinations
- Query buttons by aria-label
- Verify nested dialog components render
- Test responsive behavior (desktop vs mobile if needed)

**Validation Commands:**
```bash
npm test tests/components/collections/collection-sticky-header.test.tsx -- --run
```

**Success Criteria:**
- All 5 tests pass
- Conditional rendering works correctly
- Owner/non-owner flows verified
- Edit dialog integration works

---

### STEP 8: Collection Upsert Dialog Component Tests (5 tests)

**What**: Test collection create/edit dialog with form validation, file upload, and mode-specific behavior

**Why**: HIGH RISK - Complex form with TanStack Form integration; create vs edit modes have different validation rules

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\collection-upsert-dialog.test.tsx`

**Test Cases:**
1. Should render in create mode with "Create Collection" title and no delete button
2. Should render in edit mode with "Edit Collection" title and delete button
3. Should validate required fields and show errors on submit
4. Should call onSuccess callback after successful form submission
5. Should reset form and close dialog on cancel

**Test Details:**

Test 1: Pass `collection=null`, verify title and absence of delete button
Test 2: Pass existing collection, verify title and delete button present
Test 3: Submit empty form, verify validation errors displayed
Test 4: Mock successful action, submit valid form, verify onSuccess called
Test 5: Click Cancel button, verify dialog closes and form resets

**Form Fields to Test:**
- Collection name (required)
- Description (optional)
- isPublic toggle
- Cover image upload

**Patterns to Follow:**
- Mock `useCollectionUpsertForm` hook
- Mock server actions (create/update)
- Test form validation with TanStack Form
- Verify focus management on errors

**Validation Commands:**
```bash
npm test tests/components/collections/collection-upsert-dialog.test.tsx -- --run
```

**Success Criteria:**
- All 5 tests pass
- Create and edit modes work differently
- Form validation fires correctly
- Callbacks execute on success/cancel

---

### STEP 9: Collection Share Menu Component Tests (4 tests)

**What**: Test share dropdown menu with copy link and social share options

**Why**: MEDIUM RISK - Involves clipboard API and window.open; toast notifications must fire

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\collection-share-menu.test.tsx`

**Test Cases:**
1. Should render dropdown menu with Copy Link, Twitter, and Facebook options
2. Should copy absolute URL to clipboard and show success toast
3. Should open Twitter share window with correct URL
4. Should open Facebook share window with correct URL

**Test Details:**

Test 1: Click trigger, verify menu items present
Test 2: Mock clipboard API, click "Copy Link", verify toast success
Test 3: Mock window.open, click "Share on X", verify called with Twitter URL
Test 4: Mock window.open, click "Share on Facebook", verify called with Facebook URL

**Browser API Mocks Required:**
- `navigator.clipboard.writeText`
- `window.open`
- `window.screen` dimensions

**Patterns to Follow:**
- Use browser-api.mocks from Step 1
- Mock toast notifications
- Verify URL construction with correct collectionSlug
- Test error handling (clipboard fails)

**Validation Commands:**
```bash
npm test tests/components/collections/collection-share-menu.test.tsx -- --run
```

**Success Criteria:**
- All 4 tests pass
- Clipboard operations work
- Social share URLs correct
- Toast notifications fire

---

### STEP 10: Collection Delete Component Tests (4 tests)

**What**: Test delete button with confirmation dialog and server action execution

**Why**: HIGH RISK - Destructive operation; confirmation must work correctly to prevent accidental deletion

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\collections\collection-delete.test.tsx`

**Test Cases:**
1. Should render delete button with trash icon
2. Should open confirmation dialog when button is clicked
3. Should execute delete action and call onSuccess callback
4. Should disable button while delete action is executing

**Test Details:**

Test 1: Verify button and icon render
Test 2: Click button, verify ConfirmDeleteAlertDialog opens
Test 3: Mock action success, confirm delete, verify action called and onSuccess fires
Test 4: Set `isExecuting=true` state, verify button disabled

**Confirmation Flow:**
- Click delete button
- Dialog opens with confirmation text
- User types collection name
- Click Delete button
- Action executes

**Patterns to Follow:**
- Mock `useServerAction` hook
- Mock `deleteCollectionAction`
- Verify `router.refresh()` called
- Test loading state

**Validation Commands:**
```bash
npm test tests/components/collections/collection-delete.test.tsx -- --run
```

**Success Criteria:**
- All 4 tests pass
- Confirmation dialog works
- Delete action executes
- Loading state prevents double-submit

---

### STEP 11: Like Button Component Tests (6 tests)

**What**: Test three like button variants (Icon, Compact, Full) with toggle behavior and auth gating

**Why**: MEDIUM-HIGH RISK - Core engagement feature; must handle authenticated/unauthenticated states correctly

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\ui\like-button.test.tsx`

**Test Cases:**

**LikeIconButton (2 tests):**
1. Should render with heart icon and like count
2. Should toggle like state when clicked (authenticated)

**LikeCompactButton (2 tests):**
3. Should render compact variant with smaller size
4. Should show sign-in prompt when clicked while unauthenticated

**LikeFullButton (2 tests):**
5. Should render full variant with label text
6. Should call onLikeChange callback with new values on toggle

**Test Details:**

Tests 1-2: Test basic rendering and click interaction
Tests 3-4: Mock unauthenticated Clerk state, verify sign-up button shows
Tests 5-6: Test full variant with "Like" text and callback

**Mock Requirements:**
- Mock `useLike` hook (already tested in Step 4)
- Mock Clerk `useAuth` for auth state
- Mock `toggleLikeAction` server action

**Patterns to Follow:**
- Test each variant separately
- Mock hook return values
- Verify aria-labels for accessibility
- Test NumberFlow animation component integration

**Validation Commands:**
```bash
npm test tests/components/ui/like-button.test.tsx -- --run
```

**Success Criteria:**
- All 6 tests pass
- Three variants render correctly
- Auth gating works
- Optimistic updates display

---

### STEP 12: Report Button Component Tests (3 tests)

**What**: Test report button rendering and dialog integration

**Why**: LOW-MEDIUM RISK - Secondary feature; must open report dialog correctly

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\content-reports\report-button.test.tsx`

**Test Cases:**
1. Should render button with flag icon
2. Should open ReportReasonDialog when clicked
3. Should use correct aria-label based on target type

**Test Details:**

Test 1: Verify button and icon render
Test 2: Click button, verify dialog opens (check dialog visibility)
Test 3: Test with targetType='collection', 'bobblehead', 'comment', verify aria-labels

**Patterns to Follow:**
- Query by role='button'
- Test dialog state (open/closed)
- Verify accessibility labels
- Test different target types

**Validation Commands:**
```bash
npm test tests/components/content-reports/report-button.test.tsx -- --run
```

**Success Criteria:**
- All 3 tests pass
- Button renders correctly
- Dialog opens on click
- Aria-labels correct for each type

---

### STEP 13: Confirm Delete Alert Dialog Component Tests (4 tests)

**What**: Test reusable confirmation dialog with validation and async delete handling

**Why**: HIGH RISK - Used for all destructive operations; validation must work to prevent accidental deletion

**Test Type**: Component

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\components\ui\alert-dialogs\confirm-delete-alert-dialog.test.tsx`

**Test Cases:**
1. Should render dialog with warning message and confirmation input
2. Should disable Delete button until confirmation text matches
3. Should execute onDeleteAsync when form is valid and submitted
4. Should close dialog and reset form when Cancel is clicked

**Test Details:**

Test 1: Verify title, alert, description, and input field render
Test 2: Type incorrect text, verify Delete button disabled; type correct text, verify enabled
Test 3: Submit valid form, verify `onDeleteAsync` called
Test 4: Click Cancel, verify dialog closes and form resets

**Form Validation:**
- User must type exact confirmation text
- Delete button disabled until validation passes
- Form uses TanStack Form with `createConfirmationSchema`

**Patterns to Follow:**
- Test TanStack Form validation
- Use `user.type()` for input interactions
- Verify button disabled states
- Test async delete execution

**Validation Commands:**
```bash
npm test tests/components/ui/alert-dialogs/confirm-delete-alert-dialog.test.tsx -- --run
```

**Success Criteria:**
- All 4 tests pass
- Validation works correctly
- Delete executes on valid submit
- Dialog closes on cancel

---

### STEP 14: Collections Actions Integration Tests (6 tests)

**What**: Test collection CRUD server actions with real database using Testcontainers

**Why**: HIGH RISK - Server actions perform critical database operations; must handle transactions and permissions correctly

**Test Type**: Integration

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\integration\actions\collections.actions.test.ts`

**Test Cases:**

**createCollectionAction (2 tests):**
1. Should create collection with valid data and return success response
2. Should return failure when collection name is already taken

**updateCollectionAction (2 tests):**
3. Should update collection and return success response
4. Should return failure when user doesn't own the collection

**deleteCollectionAction (2 tests):**
5. Should delete collection and return success response
6. Should return failure when collection doesn't exist

**Test Details:**

All tests use real Testcontainers PostgreSQL database
Mock Clerk auth to provide userId context
Verify action responses (wasSuccess, message, data)
Test permission checks
Verify database state after operations

**Infrastructure Required:**
- Import `getTestDb()` and `resetTestDatabase()`
- Mock Sentry (already done in existing tests)
- Mock cache service
- Create test users and collections using factories

**Patterns to Follow:**
- Reference `tests/integration/actions/collections.facade.test.ts`
- Use `beforeEach` to reset database
- Create test data with factories
- Verify response structure matches `ActionResponse<T>`

**Validation Commands:**
```bash
npm test tests/integration/actions/collections.actions.test.ts -- --run
```

**Success Criteria:**
- All 6 tests pass
- Database operations work correctly
- Permission checks enforce ownership
- Validation errors return proper responses

---

### STEP 15: Collection Header Async Component Integration Tests (2 tests)

**What**: Test async server component data fetching and null handling

**Why**: MEDIUM RISK - Server component that fetches data; must handle missing slug and null collection gracefully

**Test Type**: Integration

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\integration\components\collection-header-async.test.tsx`

**Test Cases:**
1. Should fetch collection header data and render CollectionHeaderDisplay
2. Should return null when collectionSlug is not provided

**Test Details:**

Test 1: Mock search params cache with valid slug, create collection in DB, verify component renders
Test 2: Mock search params cache with null slug, verify component returns null

**Mock Requirements:**
- Mock `collectionDashboardSearchParamsCache.get()`
- Mock `getRequiredUserIdAsync()` to return test user ID
- Use real database with Testcontainers
- Create test collection data

**Patterns to Follow:**
- Similar to component tests but with database integration
- Mock Next.js search params utilities
- Verify facade calls and data fetching
- Test null handling edge cases

**Validation Commands:**
```bash
npm test tests/integration/components/collection-header-async.test.tsx -- --run
```

**Success Criteria:**
- Both tests pass
- Data fetching works with real DB
- Null slug handled gracefully
- Component renders with fetched data

---

### STEP 16: Query and Facade Expansion Integration Tests (4 tests)

**What**: Test supporting query and facade methods used by collection header components

**Why**: MEDIUM RISK - Ensure data layer methods support header feature correctly

**Test Type**: Integration

**Files to Create:**
- `C:\Users\jasonpaff\dev\head-shakers\tests\integration\queries\collections-dashboard.query.test.ts` (2 tests)
- `C:\Users\jasonpaff\dev\head-shakers\tests\integration\facades\collections-dashboard.facade.test.ts` (2 tests)

**Test Cases:**

**Query Tests (2 tests):**
1. Should fetch collection header record with all stats (likes, views, comments)
2. Should return null when collection doesn't exist

**Facade Tests (2 tests):**
3. Should call query and return formatted header data
4. Should apply permission filtering for private collections

**Test Details:**

Query tests verify SQL query execution and data structure
Facade tests verify business logic and permission checks
Use real database with Testcontainers
Create test data with likes, views, and comments

**Required Test Data:**
- Collection with associated stats
- Public and private collections
- Owner and non-owner users

**Patterns to Follow:**
- Reference existing facade tests
- Test both success and edge cases
- Verify permission filtering
- Check data structure matches TypeScript types

**Validation Commands:**
```bash
npm test tests/integration/queries/collections-dashboard.query.test.ts -- --run
npm test tests/integration/facades/collections-dashboard.facade.test.ts -- --run
```

**Success Criteria:**
- All 4 tests pass
- Queries return correct data structure
- Facades apply business logic correctly
- Permission checks work

---

## 4. Quality Gates

### 4.1 Checkpoint 1: After Steps 1-4 (Infrastructure + Unit Tests)

**Criteria:**
- All infrastructure files compile without TypeScript errors
- Unit tests for currency and share utilities pass (13 tests)
- useLike hook tests pass (4 tests)
- No test flakiness or intermittent failures

**Validation:**
```bash
npm run typecheck
npm test tests/unit/lib/utils/ tests/unit/hooks/ -- --run
```

**Gate Decision:**
- ✅ PASS: Proceed to component tests
- ❌ FAIL: Fix infrastructure issues before continuing

---

### 4.2 Checkpoint 2: After Steps 5-13 (Component Tests)

**Criteria:**
- All component tests pass (35 tests)
- No console errors or warnings during test runs
- Test coverage for components >80%
- MSW handlers work correctly

**Validation:**
```bash
npm test tests/components/ -- --run --coverage
```

**Gate Decision:**
- ✅ PASS: Proceed to integration tests
- ❌ FAIL: Review component test failures

---

### 4.3 Checkpoint 3: After Steps 14-16 (Integration Tests)

**Criteria:**
- All integration tests pass (12 tests)
- Testcontainers database setup works
- Server actions execute correctly
- No database connection errors

**Validation:**
```bash
npm test tests/integration/ -- --run
```

**Gate Decision:**
- ✅ PASS: Implementation complete
- ❌ FAIL: Debug integration issues

---

### 4.4 Final Validation: All Tests

**Criteria:**
- All 65 tests pass
- No skipped or pending tests
- Test suite runs in <2 minutes
- No memory leaks or hanging processes

**Validation:**
```bash
npm test -- --run
npm test -- --run --coverage
```

**Success Metrics:**
- Test pass rate: 100%
- Code coverage: >85% for collection header feature
- No flaky tests (run 3 times, all pass)

---

## 5. Test Infrastructure Notes

### 5.1 Mock Patterns

**Browser API Mocks:**
```typescript
// Usage in tests
import { mockClipboard, restoreBrowserAPIs } from '@/tests/mocks/browser-api.mocks';

beforeEach(() => {
  mockClipboard({ success: true });
});

afterEach(() => {
  restoreBrowserAPIs();
});
```

**Environment Mocks:**
```typescript
// Usage in tests
import { setupMockEnvironment } from '@/tests/setup/mock-environment';

beforeEach(() => {
  setupMockEnvironment({ NEXT_PUBLIC_APP_URL: 'https://test.headshakers.com' });
});
```

### 5.2 Factory Patterns

**Collection Header Factory:**
```typescript
// Usage in tests
import { createMockCollectionHeader } from '@/tests/fixtures/collection-header.factory';

const collection = createMockCollectionHeader({
  totalValue: 1234.56,
  likeCount: 10,
  viewCount: 100,
  commentCount: 5
});
```

### 5.3 MSW Handler Patterns

**Server Action Handlers:**
```typescript
// Usage in tests
import { server } from '@/tests/setup/msw.setup';
import { collectionsHandlers } from '@/tests/mocks/handlers/collections.handlers';

beforeEach(() => {
  server.use(...collectionsHandlers.success);
});
```

### 5.4 Common Test Utilities

**Component Rendering:**
```typescript
import { render, screen } from '@/tests/setup/test-utils';

const { user } = render(<Component />);
await user.click(screen.getByRole('button'));
```

**Database Setup:**
```typescript
import { getTestDb, resetTestDatabase } from '@/tests/setup/test-db';

beforeEach(async () => {
  await resetTestDatabase();
});
```

### 5.6 Debugging Tips

**Common Issues:**
1. **Clerk mock not working**: Ensure `ClerkProvider` is in test-utils wrapper
2. **Clipboard tests failing**: Check that `navigator` is properly mocked
3. **Dialog not opening**: Verify dialog state management and triggers
4. **Form validation not firing**: Check TanStack Form validation logic is set to 'submit' mode
5. **Database tests hanging**: Ensure Testcontainers is properly initialized

**Debug Commands:**
```bash
# Run single test file with verbose output
npm test tests/unit/lib/utils/currency.utils.test.ts -- --run --reporter=verbose

# Run tests with coverage
npm test -- --coverage --run

# Run tests in watch mode for debugging
npm test tests/components/collections/ -- --watch
```

---

## 6. Risk Mitigation

### 6.1 High-Risk Areas

**1. Browser API Mocking**
- **Risk**: Tests may fail in CI if browser APIs aren't properly mocked
- **Mitigation**: Create reusable mock utilities in Step 1; test mocks independently

**2. Optimistic Updates**
- **Risk**: Race conditions between optimistic UI and server response
- **Mitigation**: Test both optimistic and resolved states; use `waitFor()` for async assertions

**3. Form Validation**
- **Risk**: Complex TanStack Form validation may not trigger correctly in tests
- **Mitigation**: Test validation explicitly; verify error messages appear

**4. Database Transactions**
- **Risk**: Testcontainers may be slow or flaky in some environments
- **Mitigation**: Use `beforeEach` to reset DB; increase timeout for integration tests

### 6.2 Flaky Test Prevention

**Strategies:**
1. Always use `waitFor()` for async assertions
2. Mock all external dependencies (APIs, timers)
3. Reset all mocks in `afterEach`
4. Use deterministic test data (avoid random values)
5. Avoid testing implementation details (test behavior, not structure)

---

## 7. Appendix

### 7.1 File Structure Summary

```
tests/
├── mocks/
│   ├── browser-api.mocks.ts (NEW)
│   └── handlers/
│       └── collections.handlers.ts (NEW)
├── fixtures/
│   └── collection-header.factory.ts (NEW)
├── setup/
│   └── mock-environment.ts (NEW)
├── unit/
│   ├── lib/
│   │   └── utils/
│   │       ├── currency.utils.test.ts (NEW)
│   │       └── share-utils.test.ts (NEW)
│   └── hooks/
│       └── use-like.test.tsx (NEW)
├── components/
│   ├── collections/
│   │   ├── dashboard/
│   │   │   ├── collection-header-card.test.tsx (NEW)
│   │   │   └── collection-header-display.test.tsx (NEW)
│   │   ├── collection-sticky-header.test.tsx (NEW)
│   │   ├── collection-upsert-dialog.test.tsx (NEW)
│   │   ├── collection-share-menu.test.tsx (NEW)
│   │   └── collection-delete.test.tsx (NEW)
│   ├── ui/
│   │   ├── like-button.test.tsx (NEW)
│   │   └── alert-dialogs/
│   │       └── confirm-delete-alert-dialog.test.tsx (NEW)
│   └── content-reports/
│       └── report-button.test.tsx (NEW)
└── integration/
    ├── actions/
    │   └── collections.actions.test.ts (NEW)
    ├── components/
    │   └── collection-header-async.test.tsx (NEW)
    ├── queries/
    │   └── collections-dashboard.query.test.ts (NEW)
    └── facades/
        └── collections-dashboard.facade.test.ts (NEW)
```

### 7.2 Dependency Matrix

| Step | Depends On | Blocks |
|------|------------|--------|
| 1 (Infrastructure) | - | 2, 3, 4, 5-13 |
| 2 (Currency Utils) | 1 | 5 |
| 3 (Share Utils) | 1 | 9 |
| 4 (useLike Hook) | 1 | 11 |
| 5 (Header Card) | 1, 2 | 6 |
| 6 (Header Display) | 1, 5 | - |
| 7 (Sticky Header) | 1 | - |
| 8 (Upsert Dialog) | 1 | 6, 7 |
| 9 (Share Menu) | 1, 3 | 7 |
| 10 (Delete Component) | 1 | 6, 7, 8 |
| 11 (Like Button) | 1, 4 | 7 |
| 12 (Report Button) | 1 | 7 |
| 13 (Confirm Delete) | 1 | 10 |
| 14 (Actions Integration) | 1 | 15, 16 |
| 15 (Header Async) | 1, 14 | - |
| 16 (Query/Facade) | 1, 14 | 15 |

### 7.3 Estimated Effort

| Step Range | Effort | Time Estimate |
|------------|--------|---------------|
| Step 1 (Infrastructure) | High | 3-4 hours |
| Steps 2-4 (Unit Tests) | Medium | 3-4 hours |
| Steps 5-13 (Component Tests) | High | 8-10 hours |
| Steps 14-16 (Integration Tests) | Medium | 4-5 hours |
| **Total** | - | **18-23 hours** |

---

**Plan Created**: 2025-12-04
**Last Updated**: 2025-12-04
**Status**: Ready for Implementation
**Owner**: Development Team
