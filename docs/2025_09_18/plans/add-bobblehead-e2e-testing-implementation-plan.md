# Implementation Plan: End-to-End Testing Framework for Add Bobblehead Form

## Overview
**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary
Establish a comprehensive end-to-end testing framework that validates the core functionality of creating a bobblehead with minimal required fields (collection and name) using the existing Vitest infrastructure, integrating with Clerk authentication, MSW for API mocking, Testcontainers for PostgreSQL database testing, and @testing-library/react for component interactions within the Next.js 15.5.3 App Router application stack.

## Prerequisites
- [ ] Docker Desktop running for Testcontainers PostgreSQL
- [ ] All existing dependencies are installed (Vitest, MSW, @testing-library/react, Testcontainers)
- [ ] Test environment variables configured in `.env.test` file
- [ ] Existing test database setup working (`npm run test` passes)

## Implementation Steps

### Step 1: Create E2E Test Infrastructure and Utilities
**What**: Establish the foundational testing utilities and mocks for E2E tests
**Why**: Provides reusable testing infrastructure for authentication, database, and component rendering
**Confidence**: High

**Files to Create:**
- `tests/e2e/helpers/auth-mocks.helpers.ts` - Clerk authentication mocking utilities
- `tests/e2e/helpers/render.helpers.ts` - Custom render function with all providers
- `tests/e2e/helpers/navigation.helpers.ts` - Navigation and routing test utilities
- `tests/e2e/helpers/form-interactions.helpers.ts` - Form interaction utilities
- `tests/e2e/setup.ts` - E2E specific test setup

**Files to Modify:**
- `vitest.config.ts` - Add E2E test configuration and setup files

**Changes:**
- Add Clerk authentication mocking functions with test user creation
- Create custom render function wrapping components with QueryClient, theme providers, and auth context
- Add navigation utilities for testing Next.js App Router navigation
- Create form interaction helpers for filling out bobblehead form fields
- Configure E2E test environment with extended timeout and proper setup

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Authentication mocking utilities properly mock Clerk auth state
- [ ] Custom render function provides all necessary providers
- [ ] Navigation helpers work with Next.js App Router
- [ ] All validation commands pass

---

### Step 2: Create MSW API Handlers for Server Actions
**What**: Set up MSW handlers to mock the server actions and API endpoints used by the add bobblehead form
**Why**: Enables testing form submission flows without relying on actual server actions
**Confidence**: High

**Files to Create:**
- `tests/e2e/mocks/handlers/bobbleheads.handlers.ts` - MSW handlers for bobblehead server actions
- `tests/e2e/mocks/handlers/collections.handlers.ts` - MSW handlers for collection-related actions
- `tests/e2e/mocks/handlers/cloudinary.handlers.ts` - MSW handlers for photo upload endpoints
- `tests/e2e/mocks/handlers/index.ts` - Centralized handler exports

**Files to Modify:**
- `tests/setup.ts` - Import and register E2E MSW handlers

**Changes:**
- Create MSW handlers that mock createBobbleheadWithPhotosAction with success/error responses
- Add handlers for collection fetching and subcollection loading
- Mock Cloudinary upload signing and photo processing endpoints
- Register handlers in test setup with proper request/response validation
- Add handlers for authentication-related API calls

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] MSW handlers properly intercept server action calls
- [ ] Handlers return realistic response data matching actual API contracts
- [ ] Authentication endpoints are properly mocked
- [ ] All validation commands pass

---

### Step 3: Create E2E Test for Add Bobblehead Form Happy Path
**What**: Implement the core E2E test validating successful bobblehead creation with minimal required fields
**Why**: Validates the primary user flow from form rendering to successful submission
**Confidence**: High

**Files to Create:**
- `tests/e2e/add-bobblehead-form.test.tsx` - Main E2E test file for add bobblehead functionality

**Files to Modify:**
- None

**Changes:**
- Create test that renders the add bobblehead page with authenticated user
- Test collection selection from dropdown or creation of new collection
- Test entering bobblehead name (required field)
- Test form submission and success navigation
- Validate database state after form submission using test database
- Test form validation errors for missing required fields
- Test successful toast notification display

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Test successfully renders add bobblehead form with all components
- [ ] Form accepts and validates collection selection
- [ ] Form accepts and validates bobblehead name input
- [ ] Form submission triggers correct server action calls
- [ ] Navigation occurs correctly after successful submission
- [ ] Database contains created bobblehead record
- [ ] All validation commands pass

---

### Step 4: Add Authentication Flow Testing
**What**: Test the complete authentication flow integration with Clerk in the E2E test
**Why**: Ensures the form works correctly with authenticated users and handles unauthenticated states
**Confidence**: Medium

**Files to Create:**
- `tests/e2e/helpers/clerk-test-utils.ts` - Utilities for testing Clerk integration

**Files to Modify:**
- `tests/e2e/add-bobblehead-form.test.tsx` - Add authentication test cases

**Changes:**
- Add test utilities for mocking Clerk user authentication state
- Create test for unauthenticated user redirect behavior
- Add test for authenticated user with proper database user record
- Test user context propagation through form components
- Validate userId assignment in created bobblehead records
- Test authentication error handling scenarios

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Unauthenticated users are properly redirected
- [ ] Authenticated users can access and use the form
- [ ] User context is properly available throughout form components
- [ ] Created bobbleheads are correctly associated with authenticated user
- [ ] Authentication errors are handled gracefully
- [ ] All validation commands pass

---

### Step 5: Add Database Integration and Transaction Testing
**What**: Enhance tests to validate database operations, transactions, and data persistence
**Why**: Ensures data integrity and proper database interaction throughout the form submission process
**Confidence**: Medium

**Files to Create:**
- `tests/e2e/helpers/database-assertions.helpers.ts` - Database state assertion utilities

**Files to Modify:**
- `tests/e2e/add-bobblehead-form.test.tsx` - Add database validation tests

**Changes:**
- Create database assertion helpers for validating bobblehead creation
- Add tests for database transaction rollback on form submission errors
- Test collection and subcollection relationship integrity
- Validate bobblehead record fields match form input
- Test database cleanup after test completion
- Add tests for concurrent form submissions

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Database assertions validate correct record creation
- [ ] Transaction rollback works properly on errors
- [ ] Collection relationships are maintained correctly
- [ ] Form data accurately persists to database
- [ ] Database cleanup functions properly
- [ ] All validation commands pass

---

### Step 6: Add Error Handling and Edge Case Testing
**What**: Test error scenarios, validation failures, and edge cases in the form submission flow
**Why**: Ensures robust error handling and provides confidence in form reliability under various conditions
**Confidence**: Medium

**Files to Create:**
- `tests/e2e/helpers/error-simulation.helpers.ts` - Utilities for simulating various error conditions

**Files to Modify:**
- `tests/e2e/add-bobblehead-form.test.tsx` - Add error handling test cases

**Changes:**
- Add test cases for form validation errors (missing required fields)
- Test server action failure scenarios with proper error messaging
- Test network failure and retry behavior
- Add tests for invalid collection selection
- Test form state persistence during error recovery
- Test rate limiting behavior with multiple rapid submissions

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Form validation errors display correctly to user
- [ ] Server errors are handled gracefully with user feedback
- [ ] Network failures don't leave form in broken state
- [ ] Invalid inputs are properly rejected
- [ ] Form recovers correctly from error states
- [ ] All validation commands pass

---

### Step 7: Add Photo Upload and Advanced Features Testing
**What**: Test photo upload functionality, optional fields, and advanced form features
**Why**: Validates complete form functionality beyond minimal requirements for comprehensive coverage
**Confidence**: Low

**Files to Create:**
- `tests/e2e/helpers/file-upload.helpers.ts` - Utilities for testing file uploads in forms

**Files to Modify:**
- `tests/e2e/add-bobblehead-form.test.tsx` - Add photo upload and advanced feature tests

**Changes:**
- Add utilities for mocking file uploads and Cloudinary integration
- Test photo upload flow with file selection and preview
- Test optional field completion (description, category, year, etc.)
- Test custom fields addition and validation
- Test tag creation and assignment
- Test form auto-save and draft functionality if implemented

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Photo upload mock works correctly with form
- [ ] Optional fields are properly saved when provided
- [ ] Custom fields functionality works as expected
- [ ] Tag system integrates properly with form
- [ ] Advanced features don't interfere with core functionality
- [ ] All validation commands pass

---

## Quality Gates
- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] E2E tests pass consistently with `npm run test:e2e`
- [ ] Test coverage includes both happy path and error scenarios
- [ ] Database transactions work correctly in test environment
- [ ] Authentication mocking works reliably
- [ ] MSW handlers properly intercept all required API calls

## Notes
- This implementation leverages the existing Vitest, Testcontainers, and MSW infrastructure already established in the project
- Authentication testing requires careful mocking of Clerk's auth context to avoid external dependencies
- Database testing uses the existing test database setup with Testcontainers for isolation
- MSW handlers must accurately reflect the actual server action interfaces to prevent test-production mismatches
- Photo upload testing may require additional file mocking utilities depending on Cloudinary integration complexity
- The framework establishes patterns that can be extended to other forms and components in the application