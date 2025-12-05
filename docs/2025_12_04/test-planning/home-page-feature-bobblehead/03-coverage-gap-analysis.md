# Step 3: Coverage Gap Analysis

**Start Time**: 2025-12-04T00:03:00Z
**End Time**: 2025-12-04T00:04:00Z
**Duration**: ~60 seconds
**Status**: Complete

## Input (From Step 2)

**Source Files Analyzed**:
1. `src/app/(app)/(home)/page.tsx` - Main home page route
2. `src/app/(app)/(home)/components/sections/hero-section.tsx` - Hero section container
3. `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx` - Featured card display
4. `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx` - Data fetching
5. `src/lib/facades/featured-content/featured-content.facade.ts` - Business logic + caching
6. `src/lib/queries/featured-content/featured-content-query.ts` - Database queries

**Existing E2E Tests**:
- `tests/e2e/specs/public/home-sections.spec.ts` - Hero section visibility only
- `tests/e2e/specs/user/home-authenticated.spec.ts` - Auth-specific checks
- `tests/e2e/pages/home.page.ts` - Page Object with basic locators

**Scope**: E2E tests only

## Coverage Summary

| Metric | Value |
|--------|-------|
| **Source Files Analyzed** | 6 files |
| **Existing E2E Tests** | 14 tests (section visibility only) |
| **Direct Featured Bobblehead E2E Coverage** | 0% (CRITICAL GAP) |
| **Coverage Gaps Identified** | 12 distinct gaps |
| **Recommended New E2E Tests** | 17-20 tests |
| **Risk Level** | HIGH - Critical user path untested |

## Coverage Gap Details

### Tier 1: Critical Priority (MUST FIX)

| Gap | Description | Risk | Tests Needed |
|-----|-------------|------|--------------|
| 1 | Featured Bobblehead Card Visibility | Card may not render | 1-2 |
| 2 | Navigation/Click-Through | Users can't access details | 2-3 |
| 3 | Loading States | Poor UX during data fetch | 3-4 |
| 4 | Stats Display (likes/views) | Engagement metrics broken | 2 |

### Tier 2: High Priority (SHOULD FIX)

| Gap | Description | Risk | Tests Needed |
|-----|-------------|------|--------------|
| 5 | Floating Cards (Top Rated, Value Growth) | Visual elements missing | 2 |
| 6 | Editor's Pick Badge | Feature indicator broken | 1 |
| 7 | Responsive Layout (mobile/desktop) | Layout breaks | 2 |
| 8 | Description Text | Context missing | 1 |

### Tier 3: Medium Priority (NICE TO HAVE)

| Gap | Description | Risk | Tests Needed |
|-----|-------------|------|--------------|
| 9 | Authentication State Consistency | UI inconsistency | 2 |
| 10 | Error Handling | Crashes on errors | 2 |
| 11 | Image Performance | Slow loading | 1 |
| 12 | Cross-Browser | Compatibility issues | Deferred |

## What's Currently Tested vs Missing

### Currently Covered (Existing E2E)
- Hero section container visibility
- Home page loads without errors
- Platform stats section visibility
- Navigation menu works
- Authentication flow redirects

### NOT Covered (Gaps)
- Featured bobblehead card renders
- Clicking featured bobblehead navigates correctly
- Loading skeleton shows during fetch
- Stats (likes, views) display correctly
- Editor's Pick badge visible
- Floating cards (Top Rated, Value Growth) visible
- Cloudinary images load properly
- Empty state when no featured bobblehead
- Error boundaries catch failures
- Responsive behavior (mobile vs desktop)
- Dark mode rendering

## Test Infrastructure Notes

### What's Already Available
- Playwright E2E framework configured
- Base test fixtures available
- Page Object pattern established (`tests/e2e/pages/home.page.ts`)
- Test data factories exist (`tests/fixtures/featured-content.factory.ts`)
- MSW mock handlers available

### What Needs to be Added
- Page Object locators for featured bobblehead elements
- Test spec file for featured bobblehead scenarios
- Possibly: Custom Playwright fixtures for featured content seeding

## Recommended Test Plan Summary

### Phase 1: Critical Path (Week 1, 2-3 hours)
- Featured bobblehead card rendering (1 test)
- Navigation/click-through (2 tests)
- Keyboard accessibility (1 test)
- Loading skeleton (1 test)
- Stats formatting (1 test)
**Total: 6 tests**

### Phase 2: Visual & Responsive (Week 2, 2-3 hours)
- Editor's Pick badge (1 test)
- Floating cards (2 tests)
- Image loading (1 test)
- Description text (1 test)
- Responsive layout (2 tests)
**Total: 6 tests**

### Phase 3: Edge Cases (Week 3, 2-3 hours)
- No featured bobblehead handling (1 test)
- Error boundaries (1 test)
- Auth state consistency (2 tests)
- Image performance (1 test)
**Total: 5 tests**

## Validation Results

- All source files analyzed for E2E testing needs
- Gaps categorized by priority (Critical/High/Medium)
- Test count estimates provided (17-20 total tests)
- Implementation phases defined
- Risk assessment: HIGH before → LOW after implementation
