# Step 1: Test Scope Refinement

**Started**: 2025-11-29
**Status**: Complete
**Scope Filter**: e2e

## Original Request

Newsletter subscribe/unsubscribe component in the app footer --scope=e2e

## Agent Prompt

Analyze the newsletter subscribe/unsubscribe component in the app footer for E2E testing. Using the project context from CLAUDE.md (Next.js 16 with App Router, React 19, TypeScript, Clerk authentication, Neon PostgreSQL, Drizzle ORM, Zod validation, Playwright for E2E tests), identify what specific functionality needs to be tested.

## Refined Test Scope

The newsletter subscribe/unsubscribe functionality in the app footer comprises a dual-state client component system with server action integration across multiple architectural layers. The testable scope encompasses the following dimensions:

### 1. Component Rendering & State Management

The system conditionally renders `FooterNewsletterSubscribe` for unauthenticated users or users without active subscriptions, and `FooterNewsletterUnsubscribe` for authenticated users with active subscriptions. E2E tests must verify the correct component renders based on authentication state (unauthenticated, authenticated but not subscribed, authenticated and subscribed).

### 2. Form Interaction & Validation

The subscribe form uses TanStack Form with email validation via Zod schema (`insertNewsletterSignupSchema`) enforcing valid email format and max length. Tests should verify email input accepts valid addresses, rejects invalid formats with error messages, handles whitespace trimming, and prevents submission when invalid.

### 3. Server Action Data Operations

Both `subscribeToNewsletterAction` and `unsubscribeFromNewsletterAction` represent separate public API endpoints with rate limiting middleware, database transactions, and Sentry breadcrumb logging. Tests must verify new subscriptions create database records, duplicate subscriptions are privacy-preserving, resubscriptions clear the `unsubscribedAt` field, and unsubscriptions set this timestamp without hard deletion.

### 4. Optimistic UI & Router Refresh

The components use `useOptimisticServerAction` hook to show immediate optimistic state while the server processes requests. Tests should verify UI updates immediately after button clicks, then verify form resets and component state updates after server confirmation.

### 5. Error Scenarios & Resilience

Tests must cover rate-limit enforcement, network/server failures returning actionFailure messages, race conditions during concurrent duplicate submissions, and invalid email addresses at form submission.

### 6. Cache Invalidation

E2E tests should verify subsequent navigation or page refreshes correctly reflect updated subscription status without stale cache values.

## Validation

- Format: Paragraph format with structured dimensions
- Word count: ~500 words (comprehensive)
- Focus: WHAT needs testing (verified)
