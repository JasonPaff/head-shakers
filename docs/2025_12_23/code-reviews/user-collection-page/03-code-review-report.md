# Code Review Report

**Target**: User collection public view page at `src/app/(app)/user/[username]/collection/[collectionSlug]`
**Date**: 2025-12-23
**Review ID**: review-2025-12-23-user-collection

---

## Executive Summary

### Overall Health: C (72/100)

| Layer          | Score | Grade | Status |
|----------------|-------|-------|--------|
| UI/Components  | 65    | D     | Needs Work |
| Business Logic | 60    | D     | Needs Work |
| Data Layer     | 55    | F     | Critical |
| Validation     | 85    | B     | Good |
| **Overall**    | **72** | **C** | **Needs Work** |

### Issue Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0     | None found |
| High     | 13    | Fix before merge |
| Medium   | 24    | Should address |
| Low      | 12    | Consider fixing |
| **Total** | **49** | |

### Key Findings

1. **Security Risk - SQL Injection Vulnerability** - Search functionality in collections.query.ts doesn't escape user input in ILIKE patterns
2. **Data Integrity Issues - Inconsistent Soft Delete Handling** - Multiple query methods missing soft delete filters
3. **Performance Issue - Sequential Data Fetching** - Page component making sequential facade calls instead of parallel Promise.all()

---

## High Priority Issues (Fix Before Merge)

### Issue 1: SQL Injection Risk in Search Functionality
- **Severity**: HIGH
- **Location**: `src/lib/queries/collections/collections.query.ts:309`
- **Description**: Search terms are not escaped before being used in ILIKE patterns
- **Recommendation**: Escape special characters: `searchTerm.replace(/[%_\\]/g, '\\\\$&')`

### Issue 2: Incorrect Auth Utility in Page Component
- **Severity**: HIGH
- **Location**: `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx:109`
- **Description**: Using `getUserIdAsync()` instead of `getOptionalUserIdAsync()` for public page
- **Recommendation**: Replace with `getOptionalUserIdAsync()` from optional-auth-utils

### Issue 3: Incorrect Auth Utility in Comment Section
- **Severity**: HIGH
- **Location**: `src/components/feature/comments/async/comment-section-async.tsx:9`
- **Description**: Same auth utility issue
- **Recommendation**: Use `getOptionalUserIdAsync()` instead

### Issue 4: Missing Soft Delete Filter in Base Query
- **Severity**: HIGH
- **Location**: `src/lib/queries/collections/collections.query.ts:166-170`
- **Description**: `buildBaseFilters` called with undefined deletedAt
- **Recommendation**: Pass `deletedAt: null` to ensure deleted records are excluded

### Issue 5-7: Missing Soft Delete in User Queries
- **Severity**: HIGH
- **Location**: `src/lib/queries/users/users-query.ts`
- **Methods**: `checkUsernameExistsAsync`, `getUserByClerkIdAsync`, `getUserByUserIdAsync`
- **Recommendation**: Add `.where(isNull(users.deletedAt))` filter

### Issue 8-9: Incorrect Cache Helper with Composite Key
- **Severity**: HIGH
- **Location**: `src/lib/facades/collections/collections.facade.ts:925, 1081`
- **Description**: Using byId() with composite username:slug key
- **Recommendation**: Create a new cache helper method like `byUsernameAndSlug()`

### Issue 10-11: Missing Test IDs and data-slot Attributes
- **Severity**: HIGH
- **Location**: `src/app/(app)/user/[username]/collection/[collectionSlug]/components/collection-header.tsx`
- **Description**: No data-testid or data-slot attributes
- **Recommendation**: Add test IDs using createTestId() and data-slot for component sections

### Issue 12: Missing Async Suffix
- **Severity**: HIGH
- **Location**: `src/lib/facades/collections/collections.facade.ts`
- **Method**: `getAllCollectionBobbleheadsWithPhotos`
- **Recommendation**: Rename to `getAllCollectionBobbleheadsWithPhotosAsync`

### Issue 13: Missing Caching in User Lookup
- **Severity**: HIGH
- **Location**: `src/lib/facades/users/users.facade.ts`
- **Method**: `getUserByUsername`
- **Recommendation**: Add caching with MEDIUM TTL

---

## Medium Priority Issues (24 total)

### Performance & Caching
- Sequential facade calls in page.tsx (use Promise.all)
- Duplicate getCollectionSeoMetadata call
- Missing caching in getCollectionBySlugWithRelations, getContentLikeData, getLikesForMultipleContentItems

### Naming Conventions (10 methods missing Async suffix)
- getCollectionForPublicView, getCollectionWithRelations, getCollectionBySlugWithRelations
- getContentLikeData, getLikeCount, getCommentsWithReplies, getLikesForMultipleContentItems
- getUserByUsername, getCollectionMetadata, getUserMetadata

### Error Handling & Monitoring
- Missing try-catch with createFacadeError in facades
- Missing Sentry breadcrumbs in client components

### Component Best Practices
- Missing 'server-only' import in page.tsx
- Using getIsOwnerAsync instead of checkIsOwnerAsync
- Missing ComponentTestIdProps in CommentSectionAsync
- formattedDate calculated inline without useMemo
- Missing ARIA labels on interactive elements

---

## Low Priority Issues (12 total)

- Invalid gradient class `bg-linear-to-t` should be `bg-gradient-to-t`
- getInitials utility should be outside component
- Slug validation pattern duplicated across route-type files
- Missing JSDoc documentation on facade methods
- Missing hook organization comments in client components

---

## Agent Completion Status

| Agent | Status | Methods Reviewed | Issues Found |
|-------|--------|------------------|--------------|
| server-component-specialist | SUCCESS | 4 components | 7 |
| client-component-specialist | SUCCESS | 2 components | 14 |
| facade-specialist | SUCCESS | 12 methods | 24 |
| database-specialist | SUCCESS | 10 methods | 16 |
| validation-specialist | SUCCESS | 2 schemas | 3 |
| static-analysis-validator | SUCCESS | 12 files | 0 |

---

## Recommended Actions

### Immediate (Before Merge)
1. Fix SQL injection vulnerability in collections.query.ts:309
2. Replace getUserIdAsync with getOptionalUserIdAsync in page.tsx and comment-section-async.tsx
3. Add soft delete filters to buildBaseFilters calls
4. Add soft delete filters to user queries
5. Fix cache helper usage - create byUsernameAndSlug helper
6. Add test IDs and data-slot attributes to collection-header.tsx
7. Add caching to getUserByUsername

### Short-term (This Sprint)
1. Parallelize data fetching in page.tsx
2. Rename all async methods to include "Async" suffix
3. Add error handling and Sentry breadcrumbs
4. Add caching to frequently-called facade methods
5. Standardize soft delete patterns

---

*Report generated by Claude Code - Code Review Orchestrator*
