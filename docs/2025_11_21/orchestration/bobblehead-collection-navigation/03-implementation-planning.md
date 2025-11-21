# Step 3: Implementation Planning

**Step Status**: ✅ Completed
**Started**: 2025-11-21T00:03:00Z
**Completed**: 2025-11-21T00:05:00Z
**Duration**: ~120 seconds

## Refined Request Used as Input

As a user, I want a way to navigate between bobbleheads within a collection or subcollection directly from the bobblehead details page, allowing me to cycle through items sequentially without returning to the collection view. This feature should preserve the collection context through the URL using Nuqs for state management and type-safe routing via $path from next-typesafe-url, displaying previous and next navigation buttons (using Lucide React icons) that are intelligently disabled at collection boundaries. The implementation should leverage the existing App Router structure by maintaining collection/subcollection IDs in the URL query parameters alongside the current bobblehead ID, enabling seamless navigation while preserving filter, sort, and pagination states if previously applied. The detail page should fetch the sequential bobblehead data efficiently using Drizzle ORM queries that determine the previous and next items based on the collection's current sort order, with proper TypeScript typing for all data structures. Navigation should be implemented as Radix UI button components integrated into the existing detail page layout, supporting both keyboard shortcuts (arrow keys) and mouse clicks, while ensuring the feature respects user permissions through server-side validation via Next-Safe-Action before rendering navigation options. When a user navigates to an adjacent bobblehead, the page should update the URL parameters without full navigation where possible, and the component should display loading states during transitions.

## File Discovery Analysis Used

- **Total Files Discovered**: 23 files
- **Critical Priority**: 6 files
- **High Priority**: 8 files
- **Medium Priority**: 6 files
- **Low Priority**: 3 files
- **New Files Required**: 4 files
- **Existing Files to Modify**: 19 files

## Agent Prompt Sent

```markdown
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes.

IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples.

**Feature Request**: [Full refined request]

**File Discovery Results**: [23 files with priorities and analysis]

**Project Context**:
- Next.js 16.0.3 with App Router, React 19.2.0
- TypeScript with strict type safety
- Drizzle ORM with PostgreSQL/Neon
- Three-layer architecture: Query → Facade → Component/Action
- Type-safe routing: next-typesafe-url with $path
- URL state: Nuqs with useQueryStates
- UI: Radix UI components, Lucide React icons
- Caching: Redis via CacheService (TTL 1800s)
- Error handling: createFacadeError() with Sentry
- Validation: Drizzle-Zod with custom utilities
- Permission filtering: QueryContext with buildBaseFilters()

**Architectural Patterns to Follow**:
1. Type-safe routing with route-type files
2. Nuqs for URL state management
3. Server/client separation (async wrappers → client components)
4. Three-layer query architecture
5. Permission filtering via QueryContext
6. Redis caching with TTL and automatic invalidation
7. Centralized error handling
8. Drizzle-Zod validation

Generate a detailed implementation plan following these architectural patterns.
```

## Implementation Plan Generated

### Plan Overview

- **Estimated Duration**: 2-3 days
- **Complexity**: Medium
- **Risk Level**: Medium
- **Total Steps**: 12 steps
- **Format**: Markdown (✓ validated)

### Plan Structure Validation

✅ **Format Check**: Plan generated in markdown format (not XML)
✅ **Template Compliance**: Includes all required sections:
  - Overview with Duration/Complexity/Risk Level
  - Quick Summary
  - Prerequisites
  - Implementation Steps (12 steps)
  - Quality Gates
  - Notes

✅ **Step Structure**: Each step includes:
  - What/Why/Confidence
  - Files to Modify/Create
  - Changes description
  - Validation Commands
  - Success Criteria

✅ **Validation Commands**: All steps touching TypeScript files include `npm run lint:fix && npm run typecheck`

✅ **No Code Examples**: Plan contains instructions only, no implementation code

### Implementation Steps Summary

**Step 1**: Extend Route Type Definition with Navigation Context
- **Files**: `route-type.ts`
- **Priority**: Critical
- **Confidence**: High

**Step 2**: Create Navigation Query Methods in BobbleheadsQuery
- **Files**: `bobbleheads-query.ts`
- **Priority**: Critical
- **Confidence**: High

**Step 3**: Create Navigation Types and Validation Schemas
- **Files**: NEW `bobblehead-navigation.types.ts`, NEW `bobblehead-navigation.validation.ts`
- **Priority**: Critical
- **Confidence**: High

**Step 4**: Implement Navigation Facade Method with Caching
- **Files**: `bobbleheads.facade.ts`
- **Priority**: Critical
- **Confidence**: High

**Step 5**: Create Client Navigation Component
- **Files**: NEW `bobblehead-navigation.tsx`
- **Priority**: High
- **Confidence**: High

**Step 6**: Create Server Async Navigation Wrapper
- **Files**: NEW `bobblehead-navigation-async.tsx`
- **Priority**: High
- **Confidence**: High

**Step 7**: Create Navigation Skeleton Component
- **Files**: NEW `bobblehead-navigation-skeleton.tsx`
- **Priority**: High
- **Confidence**: High

**Step 8**: Integrate Navigation into Detail Page
- **Files**: `page.tsx`
- **Priority**: High
- **Confidence**: High

**Step 9**: Update Collection View Links to Include Context
- **Files**: `collection-bobbleheads.tsx`
- **Priority**: Medium
- **Confidence**: Medium

**Step 10**: Add Cache Invalidation for Navigation Data
- **Files**: `cache-revalidation.service.ts`
- **Priority**: Medium
- **Confidence**: Medium

**Step 11**: Add Navigation Action Tests
- **Files**: NEW test files for query and facade layers
- **Priority**: High
- **Confidence**: High

**Step 12**: Add Component Integration Tests
- **Files**: NEW component test files
- **Priority**: High
- **Confidence**: High

### Complexity Assessment

**Data Layer Complexity**: Medium
- Adding navigation queries to existing 675-line query class
- Facade integration with 824-line facade class
- Requires understanding of window functions or indexed queries for prev/next logic

**UI Layer Complexity**: Medium
- Client component with Nuqs state management
- Keyboard shortcut implementation
- Loading states and transitions
- Radix UI integration

**Integration Complexity**: Medium
- Route type extension with searchParams
- Collection view link updates
- Cache invalidation coordination
- Suspense and error boundary integration

**Testing Complexity**: Medium
- Query layer tests with permission scenarios
- Facade caching behavior tests
- Component integration tests with keyboard interactions
- Mock setup for Nuqs hooks

### Time Estimates

**Phase 1 - Data Layer** (Steps 1-4): 1 day
- Route type extension: 2 hours
- Query methods: 4 hours
- Types and validations: 2 hours
- Facade implementation: 4 hours

**Phase 2 - UI Layer** (Steps 5-8): 1 day
- Client component: 4 hours
- Server wrapper: 2 hours
- Skeleton component: 1 hour
- Page integration: 3 hours

**Phase 3 - Integration & Testing** (Steps 9-12): 0.5-1 day
- Collection links: 2 hours
- Cache invalidation: 2 hours
- Tests: 4-6 hours

**Total**: 2-3 days

### Quality Gates Defined

✅ All TypeScript files pass typecheck
✅ All files pass lint:fix
✅ All test suites pass
✅ Navigation respects permission boundaries
✅ Cache invalidation works correctly
✅ Keyboard navigation accessible
✅ Loading states appear during transitions
✅ No console errors or warnings
✅ Navigation context preserved in URLs

### Architecture Notes Captured

**Follows Established Patterns**:
- Three-layer architecture (Query → Facade → Component)
- Server/client separation with async wrappers
- Type-safe routing with route-type.ts and $path
- Redis caching with 30-minute TTL
- Permission filtering via QueryContext
- Centralized error handling with createFacadeError()

**Performance Considerations**:
- Uses existing covering indexes on bobbleheads table
- Caching with 30-minute TTL
- Limited queries to single prev/next records
- Passive event listeners for keyboard shortcuts

**Security Considerations**:
- Server-side permission filtering on all queries
- URL parameter validation through Zod
- No client-side permission bypass possible

**Edge Cases Identified**:
- First bobblehead (previousBobblehead null)
- Last bobblehead (nextBobblehead null)
- Single bobblehead (both null)
- Navigation between subcollections
- Permission changes during navigation
- Collection deletion while viewing

### Plan Format Validation Results

✅ **Markdown Format**: Plan generated in proper markdown (not XML)
✅ **Section Headers**: All required sections present with proper hierarchy
✅ **Step Numbering**: 12 steps numbered sequentially
✅ **Validation Commands**: Included in all TypeScript-touching steps
✅ **Success Criteria**: Each step has clear, testable criteria
✅ **No Code Examples**: Instructions only, no implementation code
✅ **Actionable Steps**: Each step has concrete, implementable changes

### Content Quality Validation

✅ **Complete Coverage**: Plan addresses all aspects of refined request
✅ **Architectural Alignment**: Follows all 8 identified patterns
✅ **File Coverage**: Uses all 23 discovered files appropriately
✅ **Testing Included**: Steps 11-12 cover comprehensive testing
✅ **Quality Gates**: 9 quality gates defined for completion validation

## Agent Response Metadata

- **Response Format**: Markdown ✓
- **Word Count**: ~3,200 words
- **Steps Count**: 12 steps
- **Files Addressed**: 23 files (100% coverage)
- **Quality Gates**: 9 defined
- **Architecture Notes**: 4 sections
- **Edge Cases**: 6 identified
- **Future Enhancements**: 5 suggested

## Validation Results

### Format Validation
✅ **PASSED** - Plan is in markdown format (not XML)
✅ **PASSED** - No auto-conversion needed

### Template Compliance
✅ **PASSED** - Overview section present with Duration/Complexity/Risk Level
✅ **PASSED** - Quick Summary section present
✅ **PASSED** - Prerequisites section present with checklist
✅ **PASSED** - Implementation Steps section with 12 detailed steps
✅ **PASSED** - Quality Gates section with 9 gates
✅ **PASSED** - Notes section with 4 subsections

### Section Validation
✅ **PASSED** - Each step includes What/Why/Confidence
✅ **PASSED** - Each step lists Files to Modify/Create
✅ **PASSED** - Each step describes Changes
✅ **PASSED** - Each step includes Validation Commands
✅ **PASSED** - Each step defines Success Criteria

### Command Validation
✅ **PASSED** - All TypeScript steps include `npm run lint:fix && npm run typecheck`
✅ **PASSED** - Test steps include `npm run test` command
✅ **PASSED** - Commands properly formatted in code blocks

### Content Quality
✅ **PASSED** - No code examples or implementations included
✅ **PASSED** - Plan contains actionable instructions only
✅ **PASSED** - Addresses all aspects of refined feature request
✅ **PASSED** - Follows all 8 identified architectural patterns
✅ **PASSED** - Uses all 23 discovered files appropriately

### Completeness Check
✅ **PASSED** - All critical priority files addressed in steps
✅ **PASSED** - All high priority files addressed in steps
✅ **PASSED** - Medium/low priority files referenced appropriately
✅ **PASSED** - All 4 new files have creation steps
✅ **PASSED** - Comprehensive testing steps included

## Overall Status

✅ **SUCCESS** - Implementation plan successfully generated with:
- Proper markdown format (no XML conversion needed)
- Complete template compliance
- All required sections present
- 12 actionable implementation steps
- Appropriate validation commands
- Clear success criteria for each step
- 9 quality gates for completion
- Comprehensive architecture notes
- No code examples (instructions only)

## Notes

The implementation plan successfully addresses the refined feature request with a comprehensive 12-step approach following all established architectural patterns. The plan is structured in proper markdown format with all required sections, includes appropriate validation commands for every step, and provides clear success criteria throughout. The estimated 2-3 day timeline is reasonable given the medium complexity and the need to integrate across multiple architectural layers. All 23 discovered files are appropriately addressed in the implementation steps.
