# Step 3: Implementation Planning

**Status**: ✅ Completed
**Started**: 2025-11-12T00:00:06Z
**Completed**: 2025-11-12T00:00:09Z
**Duration**: ~3 seconds

## Input

### Refined Feature Request

Implement a comprehensive migration to slug-based URL architecture for bobbleheads, subcollections, and collections, eliminating all GUID-based routing with no backwards compatibility support. This requires updating the Next.js App Router pages to use human-readable slugs instead of UUIDs, with slugs generated from entity names and stored in the PostgreSQL database schema via Drizzle ORM migrations.

### File Discovery Summary

- **Total Files**: 59 files across database, routing, business logic, and UI layers
- **New Files**: 2 (slug utilities, migration)
- **Directory Renames**: 3 (breaking changes)
- **Estimated Time**: 4-5 days

## Agent Prompt Sent

```
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes.

CRITICAL REQUIREMENTS:
- Output MUST be in MARKDOWN format, NOT XML
- Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files
- Do NOT include code examples or implementations
- Each step must have clear validation commands and success criteria

FEATURE REQUEST:
Implement a comprehensive migration to slug-based URL architecture for bobbleheads, subcollections, and collections, eliminating all GUID-based routing with no backwards compatibility support. This requires updating the Next.js App Router pages to use human-readable slugs instead of UUIDs, with slugs generated from entity names and stored in the PostgreSQL database schema via Drizzle ORM migrations.

KEY REQUIREMENTS:
- Unique slug constraints: Bobbleheads (global), Collections (per-user), Subcollections (per-collection)
- Update all Next.js App Router routes from [id] to [slug] patterns
- Update next-typesafe-url route types and $path() calls
- Generate slugs from entity names with collision handling
- Update database queries, server actions, facades, and components
- No backwards compatibility with GUID-based URLs

DISCOVERED FILES (59 total):
Critical: Database schemas (bobbleheads, collections, subcollections), migration files
High Priority: Validation schemas (3), route-type files (5), page components (10), queries (3), actions (3), facades (3), utilities (2)
Medium Priority: Components with $path() calls (12), services (4)
Low Priority: Analytics (4), admin/browse (3)
Supporting: Constants (2)

PROJECT CONTEXT:
- Next.js 15.5.3 with App Router
- PostgreSQL with Neon serverless (use /db command for operations)
- Drizzle ORM with drizzle-zod
- Type-safe routing with next-typesafe-url
- Strict TypeScript (no any, no ts-ignore)
- Must run lint:fix and typecheck after changes

IMPLEMENTATION PHASES:
1. Foundation: Utilities, constants, database schema, migration
2. Data Layer: Validations, queries, facades, actions
3. Routing: Route types, directory renames, page components (BREAKING)
4. Components: Update $path() calls, navigation, async components
5. Infrastructure: Middleware, caching, analytics, testing
```

## Full Agent Response

[See implementation plan below - agent returned markdown format as requested]

## Plan Validation Results

### Format Validation

- ✅ Output is in MARKDOWN format (not XML)
- ✅ Contains all required sections
- ✅ Each step has What/Why/Confidence/Files/Changes
- ✅ Validation commands included for all steps
- ✅ Success criteria defined for each step
- ✅ No code examples or implementations included

### Template Compliance

- ✅ Overview section with Duration, Complexity, Risk Level
- ✅ Quick Summary section
- ✅ Prerequisites section
- ✅ Implementation Steps (20 steps)
- ✅ Quality Gates section
- ✅ Notes section with assumptions and risks

### Content Quality

- ✅ Steps follow logical progression (utilities → schema → data layer → routing → components)
- ✅ Breaking changes clearly identified (Step 10: directory renames)
- ✅ Validation commands include lint:fix and typecheck
- ✅ Database operations reference /db command
- ✅ Addresses all 59 discovered files
- ✅ Includes comprehensive testing step (Step 20)

### Complexity Assessment

- **Estimated Duration**: 3-4 days (reasonable for 59 files)
- **Complexity**: High (appropriate for breaking change)
- **Risk Level**: High (correct assessment)
- **Step Count**: 20 steps (comprehensive coverage)

### Quality Gate Analysis

- ✅ TypeScript validation required
- ✅ Linting validation required
- ✅ Route type regeneration included
- ✅ Database migration validation
- ✅ Manual testing confirmation
- ✅ Production build verification

## Implementation Plan Overview

### Phase Breakdown

**Phase 1: Foundation (Steps 1-4)** - 1 day
- Slug utilities creation
- Constants definition
- Database schema updates
- Migration generation and execution

**Phase 2: Data Layer (Steps 5-8)** - 1 day
- Validation schema updates
- Query method modifications
- Facade updates
- Server action changes

**Phase 3: Routing (Steps 9-12)** - 1 day
- Route type definitions
- Directory renames (BREAKING)
- Page component updates
- Layout component updates

**Phase 4: Components (Steps 13-14)** - 0.5 days
- $path() call updates
- Service layer modifications

**Phase 5: Infrastructure (Steps 15-20)** - 1 day
- Middleware updates
- Analytics tracking
- Admin/browse pages
- Cache invalidation
- Cleanup and testing

### Key Highlights

1. **Breaking Changes**: Clearly identified in Step 10 (directory renames)
2. **Database Safety**: Uses /db command for migration operations
3. **Type Safety**: Every step includes typecheck validation
4. **Comprehensive Testing**: Final step ensures end-to-end validation
5. **Risk Mitigation**: Notes section identifies all major risks

### Critical Success Factors

- Database migration executes successfully without data loss
- All route types regenerate correctly with next-typesafe-url
- Slug collision handling works for duplicate entity names
- No remaining ID-based route references in codebase
- Production build completes without errors

## Notes from Plan

**Breaking Changes Identified:**
- All existing UUID-based URLs will break immediately
- No backwards compatibility
- External links and bookmarks will need updates

**Assumptions Requiring Confirmation:**
- Slug uniqueness constraints acceptable
- Breaking URLs acceptable at current project stage
- Development branch available for testing
- Entity names suitable for slug generation

**Risks Identified:**
- Slug collision handling needs thorough testing
- Name changes may break shared links
- Migration scope requires significant testing time
- SEO impact from URL changes

**Recommendations:**
- Test on development branch first
- Document new URL structure
- Implement helpful 404 messaging
- Monitor analytics post-deployment
- Add slug preview in forms

## Next Steps

Save implementation plan to `docs/2025_11_12/plans/slug-based-urls-implementation-plan.md`
