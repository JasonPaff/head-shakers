# User Reporting Feature Implementation Plan

**Generated**: 2025-09-21T00:00:00Z
**Original Request**: I want to add a feature to the app where users can report specific bobbleheads/subcollections/collections. This will be implemented as a report button somewhere on those respective pages. These reports will be visable and actionable from an admin area. The admin actions will be implemented in a different feature request. This request is specifically to build out the ability for users to report things, the admin side will come later.

**Refined Request**: Implement a comprehensive content reporting system for the Head Shakers bobblehead collection platform that enables authenticated users to report inappropriate or problematic bobbleheads, collections, and subcollections through strategically placed report buttons on their respective detail pages. The system will leverage the existing content reporting infrastructure including the `contentReports` database table (with PostgreSQL enums for report reasons like spam, harassment, inappropriate content, copyright violation, misinformation, hate speech, violence, and other), target types (bobblehead, collection, subcollection), and status tracking (pending, reviewed, resolved, dismissed), along with the established Zod validation schemas from `moderation.validation.ts` for type-safe data handling. Implementation should utilize Next-Safe-Action server actions for secure report submission, integrate with Clerk authentication to capture reporter identity and prevent anonymous abuse, employ TanStack Query for optimized client-state management and real-time report status updates, and follow the existing UI component patterns using Radix UI primitives (Alert Dialog for confirmation, Dropdown Menu for report reason selection, Button components with proper loading states) styled with Tailwind CSS and Class Variance Authority for consistent theming. The report submission flow should include client-side validation using Drizzle-Zod schemas, server-side processing with appropriate error handling and rate limiting, toast notifications via Sonner for user feedback, and proper database indexing on target type/ID combinations for efficient admin queries. Report buttons should be contextually positioned (likely in dropdown menus or action bars) with appropriate access controls, visual indicators for submission states, and integration with the existing feature-component architecture while maintaining the established TypeScript strict typing, ESLint compliance, and Prettier formatting standards throughout the codebase.

## Analysis Summary

- Feature request refined with project context
- Discovered existing content reporting infrastructure foundation
- Generated 10-step implementation plan
- Estimated 3-4 day implementation duration

## File Discovery Results

The comprehensive file discovery reveals that Head Shakers already has a solid foundation for content reporting with the database schema and validation layers complete. The implementation will primarily involve creating the missing business logic layers (facades, queries, actions), UI components, and integrating report buttons into existing detail pages. The existing patterns for authentication, server actions, and UI components provide excellent blueprints for implementing this feature consistently with the established codebase architecture.

## Implementation Plan

# Implementation Plan: Content Reporting System

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement a comprehensive content reporting system that allows authenticated users to report inappropriate bobbleheads, collections, and subcollections through strategically placed report buttons. The system will leverage existing database schema and validation infrastructure while adding business logic, UI components, and integration points.

## Prerequisites

- [ ] Verify existing `contentReports` table schema and enums are properly migrated
- [ ] Confirm Clerk authentication is working for user identity capture
- [ ] Ensure TanStack Query is configured for the project
- [ ] Validate existing Zod schemas in `moderation.validation.ts`

## Implementation Steps

### Step 1: Create Content Reporting Facade

**What**: Implement business logic layer for content reporting operations
**Why**: Provides centralized business logic for report creation, validation, and management
**Confidence**: High

**Files to Create:**

- `src/lib/facades/content-reports.facade.ts` - Content reporting business logic facade

**Files to Modify:**

- `src/lib/facades/index.ts` - Export new facade

**Changes:**

- Add ContentReportsFacade class with methods for creating reports, checking existing reports, and retrieving report status
- Implement rate limiting logic to prevent spam reporting
- Add validation for report target existence
- Include proper error handling and type safety

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade compiles without TypeScript errors
- [ ] All validation commands pass
- [ ] Facade exports are properly typed

---

### Step 2: Implement Content Reports Database Queries

**What**: Create database query layer for content reports operations
**Why**: Provides typed database access for content reports with proper indexing and filtering
**Confidence**: High

**Files to Create:**

- `src/lib/queries/content-reports.queries.ts` - Database queries for content reports

**Files to Modify:**

- `src/lib/queries/index.ts` - Export new query functions

**Changes:**

- Add functions for creating new reports with proper relations
- Implement query to check existing reports by user and target
- Add function to retrieve report status for targets
- Include proper error handling and transaction support
- Implement efficient queries with proper indexing on target type/ID combinations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query functions are properly typed
- [ ] Database operations use proper Drizzle ORM patterns
- [ ] All validation commands pass
- [ ] Queries follow existing project patterns

---

### Step 3: Create Server Actions for Report Submission

**What**: Implement Next-Safe-Action server actions for secure report submission
**Why**: Provides secure, validated server-side handling of report submissions with authentication
**Confidence**: High

**Files to Create:**

- `src/lib/actions/content-reports.actions.ts` - Server actions for content reporting

**Files to Modify:**

- `src/lib/actions/index.ts` - Export new actions

**Changes:**

- Add createContentReportAction using existing validation schemas
- Implement proper authentication checks using Clerk
- Add rate limiting to prevent abuse
- Include comprehensive error handling and logging
- Use existing Next-Safe-Action patterns for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Actions are properly authenticated and validated
- [ ] Rate limiting is implemented and tested
- [ ] All validation commands pass
- [ ] Actions follow established server action patterns

---

### Step 4: Create Report Button UI Component

**What**: Build reusable report button component with proper states and interactions
**Why**: Provides consistent reporting interface across different content types
**Confidence**: High

**Files to Create:**

- `src/components/feature/content-reports/report-button.tsx` - Main report button component
- `src/components/feature/content-reports/report-reason-dialog.tsx` - Report reason selection dialog
- `src/components/feature/content-reports/index.ts` - Export components

**Changes:**

- Create ReportButton component with loading states and accessibility
- Implement ReportReasonDialog using Radix UI Alert Dialog
- Add proper Tailwind CSS styling following existing patterns
- Include toast notifications for user feedback
- Implement proper error boundaries and fallbacks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Components render without errors
- [ ] Accessibility features are properly implemented
- [ ] All validation commands pass
- [ ] Components follow existing UI patterns

---

### Step 5: Integrate TanStack Query for State Management

**What**: Set up TanStack Query hooks for report state management and optimistic updates
**Why**: Provides efficient client-state management and real-time report status updates
**Confidence**: High

**Files to Create:**

- `src/lib/hooks/use-content-reports.ts` - TanStack Query hooks for content reports

**Changes:**

- Add useCreateContentReport mutation hook
- Implement useReportStatus query hook for checking existing reports
- Add proper cache invalidation and optimistic updates
- Include error handling and retry logic
- Follow existing TanStack Query patterns in the project

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hooks provide proper loading and error states
- [ ] Cache invalidation works correctly
- [ ] All validation commands pass
- [ ] Hooks follow established patterns

---

### Step 6: Integrate Report Buttons into Bobblehead Detail Pages

**What**: Add report functionality to bobblehead detail pages with contextual placement
**Why**: Enables users to report inappropriate bobbleheads directly from the detail view
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/bobbleheads/[id]/page.tsx` - Add report button to bobblehead detail page
- `src/components/feature/bobblehead/bobblehead-detail.tsx` - Integrate report button component

**Changes:**

- Add ReportButton component to bobblehead action menu or toolbar
- Implement proper authentication checks before showing report option
- Add contextual styling and positioning
- Ensure proper data flow for bobblehead ID and type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Report button appears in appropriate location
- [ ] Authentication checks work correctly
- [ ] All validation commands pass
- [ ] UI maintains existing design patterns

---

### Step 7: Integrate Report Buttons into Collection Detail Pages

**What**: Add report functionality to collection detail pages with proper access controls
**Why**: Enables users to report inappropriate collections and maintains consistent reporting experience
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/collections/[id]/page.tsx` - Add report button to collection detail page
- `src/components/feature/collections/collection-detail.tsx` - Integrate report button component

**Changes:**

- Add ReportButton component to collection action menu
- Implement authentication and ownership checks
- Add proper styling and positioning
- Ensure data flow for collection ID and type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Report button integrates seamlessly with existing UI
- [ ] Access controls prevent inappropriate reporting
- [ ] All validation commands pass
- [ ] Component positioning is intuitive

---

### Step 8: Integrate Report Buttons into Subcollection Detail Pages

**What**: Add report functionality to subcollection detail pages completing the content type coverage
**Why**: Ensures comprehensive reporting coverage across all user-generated content types
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/subcollections/[id]/page.tsx` - Add report button to subcollection detail page
- `src/components/feature/collections/subcollection-detail.tsx` - Integrate report button component

**Changes:**

- Add ReportButton component to subcollection action area
- Implement proper authentication and validation
- Add consistent styling with other detail pages
- Ensure proper data handling for subcollection reporting

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Report functionality works across all content types
- [ ] UI consistency is maintained
- [ ] All validation commands pass
- [ ] Data flow is properly implemented

---

### Step 9: Add Rate Limiting and Security Enhancements

**What**: Implement comprehensive rate limiting and security measures for report submission
**Why**: Prevents abuse and ensures system stability while maintaining legitimate reporting functionality
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/content-reports.actions.ts` - Add enhanced rate limiting
- `src/middleware.ts` - Add rate limiting middleware if needed

**Changes:**

- Implement per-user rate limiting for report submissions
- Add IP-based rate limiting for additional protection
- Include logging for suspicious reporting patterns
- Add validation to prevent self-reporting
- Implement cooldown periods for repeated reports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Rate limiting prevents abuse without blocking legitimate use
- [ ] Security measures are properly implemented
- [ ] All validation commands pass
- [ ] Logging captures necessary security events

---

### Step 10: Implement Toast Notifications and User Feedback

**What**: Add comprehensive user feedback system for report submission states
**Why**: Provides clear communication to users about report status and system responses
**Confidence**: High

**Files to Modify:**

- `src/components/feature/content-reports/report-button.tsx` - Add toast notifications
- `src/lib/hooks/use-content-reports.ts` - Integrate notification triggers

**Changes:**

- Add success notifications for successful report submissions
- Implement error notifications with helpful messages
- Add loading states with progress indicators
- Include rate limiting notifications
- Ensure accessibility compliance for all notifications

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Users receive clear feedback for all report actions
- [ ] Notifications are accessible and user-friendly
- [ ] All validation commands pass
- [ ] Error messages are helpful and actionable

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Report submission flow works end-to-end
- [ ] Rate limiting prevents abuse
- [ ] Authentication checks function correctly
- [ ] UI components maintain design consistency
- [ ] Database queries are optimized and indexed
- [ ] Error handling covers edge cases

## Notes

- The existing database schema and validation infrastructure significantly reduces implementation complexity
- Rate limiting is critical to prevent abuse of the reporting system
- Authentication checks must be thorough to prevent anonymous reporting
- UI placement should be intuitive but not overly prominent to avoid encouraging frivolous reports
- Consider implementing a daily report limit per user for additional abuse prevention
- Error messages should be helpful but not reveal system internals for security
- Toast notifications should be consistent with existing project notification patterns
