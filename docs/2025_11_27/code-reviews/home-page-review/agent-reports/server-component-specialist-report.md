# Server Component Specialist Report

## Files Reviewed

- src/app/(app)/(home)/page.tsx
- src/app/(app)/(home)/components/sections/hero-section.tsx
- src/app/(app)/(home)/components/sections/featured-collections-section.tsx
- src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx
- src/app/(app)/(home)/components/sections/join-community-section.tsx
- src/app/(app)/(home)/components/async/platform-stats-async.tsx
- src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx
- src/app/(app)/(home)/components/async/featured-collections-async.tsx
- src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx

## Issues Found

### HIGH Severity (2)

#### 1. Authentication Function Import Mismatch

**File:Line**: `src/app/(app)/(home)/components/async/featured-collections-async.tsx:7`
**Issue**: Component imports `getUserIdAsync` from `@/utils/auth-utils`. The naming suggests it should be `getOptionalUserIdAsync` for optional auth scenarios.
**Recommendation**: Verify correct function name based on authentication requirement. If auth is optional, use return type appropriately (handle null case).

#### 2. Missing `data-testid` Attributes on Section Components

**Files**:

- `src/app/(app)/(home)/components/sections/featured-collections-section.tsx`
- `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx`
- `src/app/(app)/(home)/components/sections/join-community-section.tsx`

**Issue**: Section components have `data-slot` but missing `data-testid` attributes required by UI Components Conventions.
**Recommendation**: Add `data-testid` attributes using `generateTestId()` utility.

### MEDIUM Severity (5)

#### 3. Inconsistent Named Export Pattern

**File:Line**: `src/app/(app)/(home)/page.tsx:19`
**Issue**: Uses `export default function` instead of separate function declaration and export.
**Recommendation**: Refactor to use separate function declaration from export for consistency.

#### 4. Missing `async` Keyword on Page Component

**File:Line**: `src/app/(app)/(home)/page.tsx:19`
**Issue**: Page component should be async function even if not directly awaiting.
**Recommendation**: Add `async` keyword for consistency with server component patterns.

#### 5. Hardcoded Error Boundary Names

**Files**:

- `src/app/(app)/(home)/components/sections/hero-section.tsx:158,166`
- `src/app/(app)/(home)/components/sections/featured-collections-section.tsx:30`
- `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx:38`

**Issue**: Error boundary `name` prop values are hardcoded strings.
**Recommendation**: Consider using consistent naming pattern aligned with component test IDs.

#### 6. Missing Import Order Organization

**File:Line**: `src/app/(app)/(home)/page.tsx:1-9`
**Issue**: Import order doesn't fully follow conventions.
**Recommendation**: Group absolute path imports, then relative imports, then utilities/constants.

### LOW Severity (4)

#### 7. Components Missing TypeScript Props Interface

**Files**: All section components
**Issue**: Section components don't define empty props interfaces.
**Recommendation**: Add explicit empty props interfaces for future-proofing.

#### 8. Duplicate Comment Text

**File:Line**: `src/app/(app)/(home)/page.tsx:22,28`
**Issue**: Two identical comment blocks about JSON-LD.
**Recommendation**: Differentiate comments (Organization vs Website schema).

#### 9. Missing Component Documentation

**Files**: Some async components
**Issue**: Inconsistent JSDoc documentation across async components.
**Recommendation**: Add consistent JSDoc to all async components.

#### 10. Type Safety Improvement

**File:Line**: `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx:22`
**Issue**: No validation of year value before use.
**Recommendation**: Consider validating year is reasonable value.

## Positive Findings

1. Server-Only Guard: All async components use `import 'server-only'`
2. Caching Integration: All facades use CacheService domain helpers
3. Suspense Boundaries: All async children wrapped with skeleton fallbacks
4. Error Boundaries: Comprehensive error boundary usage
5. Promise.all: Proper parallel data fetching
6. SEO Metadata: Proper generateMetadata and JSON-LD schemas
7. ISR Configuration: Appropriate `revalidate = 600`
8. Data-Slot Attributes: Section components include data-slot
9. $path Usage: All internal links use type-safe $path
10. Single Quotes: Consistent quote usage
11. Authentication Caching: Auth utilities use React cache()
12. Facade Pattern: All data fetching through facade layer
