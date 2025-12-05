# Quick Start: Featured Bobblehead E2E Testing

**Get started in 5 minutes or less.**

---

## TL;DR

- **Problem**: Featured bobblehead section on home page has ~0% E2E test coverage
- **Solution**: Add 17 E2E tests across 3 phases (6-9 hours total)
- **Start**: Phase 1 (6 critical tests, 2-3 hours)
- **Files**: Created 4 analysis docs with complete test code

---

## What You Need to Know (90 Seconds)

Featured bobblehead is the highlighted card in the home page hero section showing a cool bobblehead. It:
- Fetches data server-side via async component
- Displays image, title, stats, and floating cards
- Links to the bobblehead detail page
- Loads with a skeleton while fetching

**Currently Tested**: None (section visibility only, no interaction)

**Critical Gaps**:
1. Card doesn't appear in test
2. Click doesn't navigate
3. Mobile layout untested

---

## The 4 Documents (Read in This Order)

### 1. SUMMARY.md (5 min read)
**Start here.** Quick overview of findings and recommendations.
- What's tested: section visibility
- What's missing: 12 gaps identified
- Timeline: 3 weeks, 17 tests
- Risk: High - critical user path untested

### 2. gap-reference.md (10 min read)
**Then this.** Quick lookup for each gap.
- All 12 gaps explained
- What needs testing for each
- Priority level
- Affected components
- Number of tests needed

### 3. home-featured-bobblehead-e2e-analysis.md (30 min read)
**Detailed analysis.** Full technical breakdown.
- 6 source files analyzed
- 14 existing tests reviewed
- 12 coverage gaps detailed
- Test infrastructure notes
- Example test scenarios
- Implementation roadmap

### 4. test-implementation-guide.md (Reference)
**Copy-paste tests.** Complete code for all 17 tests.
- Page Object setup
- Phase 1: 6 critical tests with full code
- Phase 2: 6 visual tests with full code
- Phase 3: 5 edge case tests with full code
- Debugging guide
- Execution checklist

---

## Implementation Timeline

### Week 1: Critical Path (6 tests, 2-3 hours)
```
Monday-Tuesday:
  - Add Page Object locators (30 min)
  - Create test file (15 min)
  - Implement Tests 1-3 (1 hour) - Visibility & Navigation
  - Run tests locally (30 min)

Wednesday-Thursday:
  - Implement Tests 4-6 (1.5 hours) - Keyboard, Loading, Stats
  - Debug and fix (1 hour)
  - PR review (30 min)

Friday:
  - Merge to main
  - Verify CI passes
```

### Week 2: Visual & Responsive (6 tests, 2-3 hours)
```
Tests 7-12: Badge, Floating Cards, Image, Description, Layout
  Similar flow as Week 1
  Focus on responsive testing (mobile + desktop)
```

### Week 3: Edge Cases (5 tests, 2-3 hours)
```
Tests 13-17: Null state, Errors, Auth, Performance, Scroll
  Similar flow as Week 1
  Handle error scenarios
```

---

## Quick Implementation Checklist

### Day 1: Setup (1 hour)

- [ ] Read SUMMARY.md
- [ ] Read gap-reference.md
- [ ] Skim test-implementation-guide.md

**Commands**:
```bash
# Navigate to project
cd C:\Users\jasonpaff\dev\head-shakers

# Create test directory (if needed)
mkdir -p tests/e2e/specs/feature
```

### Day 2: Page Object (30 min)

- [ ] Open `tests/e2e/pages/home.page.ts`
- [ ] Copy locators from test-implementation-guide.md section "Page Object Additions Required"
- [ ] Add to the HomePage class
- [ ] Save file

**Check**:
```bash
npm run test:e2e -- home-sections.spec.ts  # Verify existing tests still pass
```

### Day 3: Create Test File (2 hours)

- [ ] Create `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`
- [ ] Copy Phase 1 tests from test-implementation-guide.md
- [ ] Run tests

**Commands**:
```bash
# Run Phase 1 tests
npm run test:e2e -- home-featured-bobblehead.spec.ts

# Run with debug mode
npm run test:e2e -- --debug home-featured-bobblehead.spec.ts

# Run specific test
npm run test:e2e -- -g "should render featured bobblehead card"
```

### Day 4: Phase 2 & 3 (Repeat)

- [ ] Add Phase 2 tests (Week 2)
- [ ] Add Phase 3 tests (Week 3)
- [ ] Same process as Day 3

---

## File Paths (Copy-Paste Ready)

### Files to Create
```
C:\Users\jasonpaff\dev\head-shakers\tests\e2e\specs\feature\home-featured-bobblehead.spec.ts
```

### Files to Modify
```
C:\Users\jasonpaff\dev\head-shakers\tests\e2e\pages\home.page.ts
```

### Analysis Documents (Already Created)
```
C:\Users\jasonpaff\dev\head-shakers\docs\2025_12_04\e2e-coverage-gaps\
├── SUMMARY.md
├── gap-reference.md
├── home-featured-bobblehead-e2e-analysis.md
└── test-implementation-guide.md
```

---

## Copy-Paste: Test File Template

**File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

```typescript
import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page - Featured Bobblehead Section', () => {
  test.describe('Phase 1: Critical User Path', () => {
    // Test 1: Card visibility
    test('should render featured bobblehead card in hero section - public', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      const featuredCard = homePage.featuredBobbleheadCard;
      await expect(featuredCard).toBeVisible({ timeout: 10000 });

      const image = homePage.featuredBobbleheadImage;
      await expect(image).toBeVisible();

      const title = homePage.featuredBobbleheadTitle;
      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();

      const badge = homePage.featuredBobbleheadBadge;
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Editor's Pick");
    });

    // Copy more tests from test-implementation-guide.md Phase 1
  });

  test.describe('Phase 2: Visual & Interaction Details', () => {
    // Tests 7-12: Copy from test-implementation-guide.md Phase 2
  });

  test.describe('Phase 3: Edge Cases & Error Handling', () => {
    // Tests 13-17: Copy from test-implementation-guide.md Phase 3
  });
});
```

---

## Copy-Paste: Page Object Additions

**File**: `tests/e2e/pages/home.page.ts`

Add these getter methods to the `HomePage` class:

```typescript
// Featured Bobblehead Locators
get featuredBobbleheadCard(): Locator {
  return this.byTestId('feature-bobblehead-card-card');
}

get featuredBobbleheadImage(): Locator {
  return this.byTestId('feature-bobblehead-card-image');
}

get featuredBobbleheadBadge(): Locator {
  return this.byTestId('feature-bobblehead-card-badge');
}

get featuredBobbleheadTitle(): Locator {
  return this.page.locator('[data-slot="hero-featured-bobblehead"]').getByRole('heading', { level: 3 });
}

get featuredBobbleheadLikes(): Locator {
  return this.page.locator('[data-slot="hero-featured-bobblehead"]').locator('text=/^[0-9,]+$/').first();
}

get featuredBobbleheadViews(): Locator {
  return this.page.locator('[data-slot="hero-featured-bobblehead"]').locator('text=/^[0-9,]+$/').nth(1);
}

get featuredBobbleheadTopRatedCard(): Locator {
  return this.byTestId('feature-bobblehead-card-top-rated-card');
}

get featuredBobbleheadValueGrowthCard(): Locator {
  return this.byTestId('feature-bobblehead-card-value-growth-card');
}

get featuredBobbleheadSkeleton(): Locator {
  return this.byTestId('ui-skeleton-hero-featured-bobblehead');
}

// Helper methods
async getFeaturedBobbleheadUrl(): Promise<string | null> {
  return this.featuredBobbleheadCard.getAttribute('href');
}

async clickFeaturedBobblehead(): Promise<void> {
  await this.featuredBobbleheadCard.click();
}

async isFeaturedBobbleheadVisible(): Promise<boolean> {
  return this.featuredBobbleheadCard.isVisible();
}
```

---

## Common Issues & Solutions

### Issue: Tests timeout waiting for featured bobblehead
**Solution**: Increase timeout
```typescript
await expect(featuredCard).toBeVisible({ timeout: 15000 }); // 15 seconds
```

### Issue: Page Object locators not found
**Solution**: Verify test IDs exist in source code
```bash
# Search for test IDs in source
grep -r "feature-bobblehead-card" src/
```

### Issue: Featured bobblehead doesn't exist in test database
**Solution**: Seed data or use factory
```typescript
import { createTestFeaturedBobbleheadContent } from '../../fixtures/featured-content.factory';

const bobblehead = await createTestBobblehead(...);
await createTestFeaturedBobbleheadContent(bobblehead.id, { isActive: true });
```

### Issue: Tests fail on mobile viewport
**Solution**: Set viewport before test
```typescript
await page.setViewportSize({ width: 375, height: 667 });
```

---

## Validation

### After Adding Tests

**Step 1: Run tests locally**
```bash
npm run test:e2e -- home-featured-bobblehead.spec.ts
```

**Step 2: Verify they pass**
- All 6 Phase 1 tests should pass
- No flaky tests (run 2x to verify)

**Step 3: Check coverage**
```bash
# Run existing tests to ensure no regression
npm run test:e2e -- home-sections.spec.ts
npm run test:e2e -- home-authenticated.spec.ts
```

**Step 4: Review**
- Ask team member to review test code
- Verify test IDs match source code
- Check assertions are meaningful

---

## Success Metrics

After Phase 1 (6 tests):
- [x] Featured bobblehead card renders
- [x] Featured bobblehead navigation works
- [x] Keyboard navigation works
- [x] Loading state displays
- [x] Stats format correctly
- [x] Tests pass consistently

After Phase 2 (12 tests):
- [x] All visual elements tested
- [x] Responsive layout tested
- [x] Mobile and desktop verified

After Phase 3 (17 tests):
- [x] Error handling tested
- [x] Edge cases covered
- [x] Full E2E coverage achieved

---

## Resources

### In This Repository
- `tests/e2e/specs/public/home-sections.spec.ts` - Reference tests
- `tests/e2e/pages/home.page.ts` - Page Object pattern
- `tests/e2e/fixtures/base.fixture.ts` - Test setup
- `tests/fixtures/featured-content.factory.ts` - Data factory

### Documentation
- `docs/2025_12_04/e2e-coverage-gaps/SUMMARY.md` - Overview
- `docs/2025_12_04/e2e-coverage-gaps/gap-reference.md` - Gap details
- `docs/2025_12_04/e2e-coverage-gaps/home-featured-bobblehead-e2e-analysis.md` - Full analysis
- `docs/2025_12_04/e2e-coverage-gaps/test-implementation-guide.md` - Implementation code

### External
- Playwright Docs: https://playwright.dev/docs/intro
- Testing Library: https://testing-library.com/docs/playwright-testing-library/intro

---

## Questions?

**"Where do I start?"**
→ Read SUMMARY.md, then gap-reference.md

**"How do I write the tests?"**
→ Copy code from test-implementation-guide.md Phase 1

**"What locators do I need?"**
→ Copy Page Object additions from test-implementation-guide.md

**"How do I run tests?"**
→ `npm run test:e2e -- home-featured-bobblehead.spec.ts`

**"Why this analysis?"**
→ Featured bobblehead is a critical user path with 0% E2E coverage. This analysis identifies 12 gaps and provides complete implementation guide.

---

## Next Steps

1. **Now**: Read SUMMARY.md (5 min)
2. **Next**: Read gap-reference.md (10 min)
3. **Then**: Skim test-implementation-guide.md (5 min)
4. **Day 2**: Add Page Object locators (30 min)
5. **Day 3**: Create test file with Phase 1 tests (2 hours)
6. **Run tests**: `npm run test:e2e` (verify they pass)
7. **Week 2-3**: Add Phase 2 & 3 tests (similar timeline)

**Total Time**: 6-9 hours spread across 3 weeks

---

## Key Dates

- **Analysis Date**: 2025-12-04
- **Recommended Start**: Week of 2025-12-09
- **Phase 1 Completion**: Week of 2025-12-16
- **Phase 2 Completion**: Week of 2025-12-23
- **Phase 3 Completion**: Week of 2025-12-30

---

**Ready to get started? → Read SUMMARY.md next**

