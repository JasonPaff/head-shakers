# Slug-Based URLs Implementation - Testing Issues Report

**Date**: 2025-11-13
**Environment**: localhost:3000 (Development)
**Branch**: br-dark-forest-adf48tll (Development Database)

## Executive Summary

The slug-based URLs implementation has **CRITICAL ISSUES** that prevent the application from functioning correctly. While TypeScript compilation and linting pass successfully, runtime testing reveals severe problems with slug generation in the database and route validation failures.

**Status**: ❌ BLOCKING ISSUES - Application is broken for collections and subcollections

---

## Critical Issues (P0 - Blocking)

### 1. ❌ BROKEN: Malformed Collection & Subcollection Slugs in Database

**Severity**: P0 - Critical
**Impact**: Collections and subcollections are completely inaccessible
**Location**: Database migration / Slug generation

**Issue Description**:
The slugs for collections and subcollections in the database are malformed. The first character of each word is being removed and replaced with a hyphen.

**Evidence**:

```sql
-- Collections table
SELECT id, name, slug FROM collections;
```

Results:

- Name: "Baltimore Orioles" → Slug: "-altimore-rioles-7ce6e293" ❌ (should be "baltimore-orioles")
- Name: "Spooky Collection" → Slug: "-pooky-ollection-5ea0a782" ❌ (should be "spooky-collection")

```sql
-- Subcollections table
SELECT id, name, slug FROM sub_collections;
```

Results:

- Name: "Frederick Keys" → Slug: "-rederick-eys-6948b6b5" ❌ (should be "frederick-keys")
- Name: "Bowie Baysox" → Slug: "-owie-aysox-65b190e5" ❌ (should be "bowie-baysox")
- Name: "Norfolk Tides" → Slug: "-orfolk-ides-ca46ba95" ❌ (should be "norfolk-tides")
- Name: "Aberdeen Ironbirds" → Slug: "aberdeen-ironbirds-fd4af84c" ✅ (correct!)

**Root Cause Analysis**:
The slug generation utility in `src/lib/utils/slug.ts` appears correct. The issue likely occurred during the database migration that populated existing slugs. The migration may have used a different slug generation method or had a bug in the data transformation logic.

**Fix Required**:

1. Review and fix the migration script that populated the slugs
2. Run a data fix migration to regenerate all collection and subcollection slugs using the correct `generateSlug()` utility
3. Verify slug uniqueness constraints are preserved

---

### 2. ❌ BROKEN: Collection Routes Throw Validation Errors

**Severity**: P0 - Critical
**Impact**: All collection pages return runtime errors
**Location**: `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`

**Issue Description**:
When navigating to a collection page, the application throws a ZodError because the malformed slugs (starting with hyphens) fail validation against the slug pattern.

**Error Message**:

```
ZodError: [
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "regex",
    "pattern": "/^[a-z0-9]+(?:-[a-z0-9]+)*$/",
    "path": ["collectionSlug"],
    "message": "Collection slug must contain only lowercase letters, numbers, and hyphens"
  }
]
```

**Evidence**:

- Attempting to navigate to `/collections/-altimore-rioles-7ce6e293` results in runtime error
- The slug pattern requires slugs to start with `[a-z0-9]`, not a hyphen
- The validation regex: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` correctly rejects slugs starting with `-`

**Fix Required**:
Fix the underlying data (Issue #1), which will resolve this validation error.

---

### 3. ❌ BROKEN: Slug Generation Removes First Character of Words

**Severity**: P0 - Critical
**Impact**: All newly created collections/subcollections will have broken slugs
**Location**: Database migration or slug population logic

**Issue Description**:
The pattern shows that the first character of each capitalized word is being removed:

- "Baltimore Orioles" → "-altimore" + "-rioles" (B→-, O→-)
- "Spooky Collection" → "-pooky" + "-ollection" (S→-, C→-)
- "Frederick Keys" → "-rederick" + "-eys" (F→-, K→-)

This suggests the migration script or initial slug population had a bug in character processing, possibly related to:

- Unicode normalization removing first character
- Regex replacement removing capital letters incorrectly
- Character encoding issues

**Fix Required**:

1. Audit the migration that populated slugs for collections and subcollections
2. Fix the migration script
3. Re-run slug generation for all existing records

---

## High Priority Issues (P1)

### 4. ⚠️ Database Schema: Nullable Slug Columns

**Severity**: P1 - High
**Impact**: Data integrity
**Location**: Database schema

**Issue Description**:
According to Step 3 of the implementation plan, slug columns should be NOT NULL with unique constraints. However:

- `bobbleheads.slug`: **nullable** ❌ (should be NOT NULL)
- `collections.slug`: **nullable** ❌ (should be NOT NULL)
- `sub_collections.slug`: NOT NULL ✅ (correct)

**Evidence**:

```sql
-- From table schema
bobbleheads.slug: character varying NULL
collections.slug: character varying NULL
sub_collections.slug: character varying NOT NULL DEFAULT 'temp'::character varying
```

**Fix Required**:

1. Ensure all existing records have valid slugs
2. Run migration to set columns to NOT NULL:
   ```sql
   ALTER TABLE bobbleheads ALTER COLUMN slug SET NOT NULL;
   ALTER TABLE collections ALTER COLUMN slug SET NOT NULL;
   ```

---

### 5. ⚠️ Route Structure Inconsistency

**Severity**: P1 - High
**Impact**: URL structure doesn't match original plan
**Location**: Route structure

**Issue Description**:
The implementation plan (Step 9) mentions routes with username scoping for collections:

- Expected: `/collections/[username]/[collectionSlug]`
- Actual: `/collections/[collectionSlug]`

The current implementation treats collection slugs as globally unique (querying only by slug), but the route structure doesn't include username.

**Current Query** (`src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx:45`):

```typescript
const results = await db.select().from(collections).where(eq(collections.slug, collectionSlug)).limit(1);
```

**Database Constraints**:

- Collections have unique constraint: `(user_id, slug)` - scoped per user ✅
- Query only uses `slug` without `user_id` ❌

**Fix Required**:
Decision needed:

1. **Option A**: Change route to `/collections/[username]/[collectionSlug]` and update queries to use both username and slug
2. **Option B**: Make collection slugs globally unique (change database constraint from `(user_id, slug)` to just `slug`)

Current implementation appears to assume Option B but hasn't updated the database constraint.

---

### 6. ⚠️ Featured Content Links Use Malformed Slugs

**Severity**: P1 - High
**Impact**: All featured content navigation is broken
**Location**: Featured content components and queries

**Issue Description**:
The homepage and featured pages display collection cards with links using the malformed slugs from the database:

- `/collections/-altimore-rioles-7ce6e293`
- `/collections/-pooky-ollection-5ea0a782`

These links are generated correctly by the `$path()` utility, but the underlying data is wrong.

**Evidence**:
Screenshot shows multiple collection cards on featured page with malformed slug URLs.

**Fix Required**:
Fix the underlying data (Issue #1), which will resolve the generated links.

---

## Medium Priority Issues (P2)

### 7. ⚠️ UUID Appended to Collection/Subcollection Slugs

**Severity**: P2 - Medium
**Impact**: SEO and URL aesthetics
**Location**: Slug generation logic for collections/subcollections

**Issue Description**:
Collection and subcollection slugs have UUIDs appended to them:

- "-altimore-rioles-7ce6e293"
- "-pooky-ollection-5ea0a782"
- "-rederick-eys-6948b6b5"

While this ensures uniqueness, it makes URLs less user-friendly. Bobblehead slugs don't have this pattern:

- "colton-air-cowser" ✅
- "matt-wieters-blood-drive" ✅
- "brooks-robinson-blood-drive-bobblehead" ✅

**Discussion**:
This may be intentional for collections/subcollections to handle slug collisions, but should be documented and possibly reconsidered for user experience.

**Recommendation**:

1. If collision handling is needed, use sequential numbers (e.g., "baltimore-orioles-2") instead of UUIDs
2. Consider global uniqueness without UUID suffixes for better SEO
3. Document the strategy in the codebase

---

### 8. ℹ️ Missing Username Display on Featured Content

**Severity**: P2 - Medium
**Impact**: User experience
**Location**: Featured content display components

**Issue Description**:
The featured content cards show:

- "by Unknown" for all collections
- "by 7b929672-4764-4613-9ddf-24613c803253" (UUID) for some items

This suggests the user data isn't being properly joined or the user profiles aren't set up.

**Evidence**:
Screenshot shows featured collections with "by Unknown" or UUID instead of username.

**Fix Required**:

1. Verify user data is being properly joined in queries
2. Ensure user profiles have display names or usernames set
3. Update featured content queries to include user information

---

## Low Priority Issues (P3)

### 9. ℹ️ Console Warnings for Font Resources

**Severity**: P3 - Low
**Impact**: Development console noise
**Location**: Font loading

**Issue Description**:
Browser console shows warnings about font resources:

```
The resource http://localhost:3000/_next/static/media/797e433ab948586e-s.p.dbea232f.woff2 was preloaded using link preload but not used within a few seconds
The resource http://localhost:3000/_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2 was preloaded using link preload but not used within a few seconds
```

**Fix Required**:
Optimize font preloading strategy or adjust preload timing.

---

## Passing Tests ✅

### Working Correctly:

1. ✅ **TypeScript Compilation**: All types compile successfully with no errors
2. ✅ **ESLint**: Code passes linting with no violations
3. ✅ **Bobblehead Slugs**: Generated correctly and stored properly in database
4. ✅ **Bobblehead Routes**: Navigate successfully to `/bobbleheads/[slug]`
5. ✅ **Bobblehead Detail Pages**: Load and display correctly
6. ✅ **Slug Utility Functions**: `src/lib/utils/slug.ts` implementation is correct
7. ✅ **Database Indexes**: Slug indexes created on all three tables
8. ✅ **Unique Constraints**: Proper constraints in place (bobbleheads: global unique, collections: user-scoped, subcollections: collection-scoped)
9. ✅ **Navigation**: Homepage, browse pages, and featured pages load without errors
10. ✅ **Subcollection Schema**: Slug column is NOT NULL with proper constraints

---

## Testing Summary

| Test Category           | Status     | Details                                          |
| ----------------------- | ---------- | ------------------------------------------------ |
| TypeScript Compilation  | ✅ PASS    | No type errors                                   |
| ESLint                  | ✅ PASS    | No linting errors                                |
| Database Schema         | ⚠️ PARTIAL | Slugs exist but 2/3 tables have nullable columns |
| Slug Generation Utility | ✅ PASS    | Functions work correctly                         |
| Bobblehead Routes       | ✅ PASS    | `/bobbleheads/[slug]` works                      |
| Collection Routes       | ❌ FAIL    | ZodError on navigation, malformed slugs          |
| Subcollection Routes    | ❌ FAIL    | Malformed slugs (not tested but same issue)      |
| Database Data           | ❌ FAIL    | Malformed slugs for collections/subcollections   |
| Featured Content        | ⚠️ PARTIAL | Displays but with broken links                   |

---

## Recommended Fix Priority

### Immediate (Today):

1. **Fix Database Slugs** - Write and run migration to regenerate all collection and subcollection slugs
2. **Set NOT NULL Constraints** - Update bobbleheads and collections tables after data fix
3. **Test Collection Routes** - Verify routes work after slug fix

### Short Term (This Week):

4. **Clarify Route Structure** - Decide on username-scoped vs globally unique collections
5. **Fix User Display** - Resolve "Unknown" and UUID display issues on featured content
6. **Remove UUID Suffixes** - Clean up slug generation strategy for better URLs

### Long Term:

7. **Documentation** - Document slug generation strategy and route structure
8. **Font Optimization** - Fix preload warnings

---

## Files Reviewed

### Database:

- ✅ `bobbleheads` table schema
- ✅ `collections` table schema
- ✅ `sub_collections` table schema
- ❌ Migration files (not found - drizzle/migrations directory missing)

### Code:

- ✅ `src/lib/utils/slug.ts` - Slug utility functions
- ✅ `src/lib/queries/collections/collections.query.ts` - Collection queries
- ✅ `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx` - Collection page
- ✅ `src/app/(app)/bobbleheads/[bobbleheadSlug]/` - Bobblehead routes

### Routes:

- ✅ `/` - Homepage
- ✅ `/browse` - Browse page
- ✅ `/browse/featured` - Featured content page
- ✅ `/bobbleheads/colton-air-cowser` - Bobblehead detail page
- ❌ `/collections/-altimore-rioles-7ce6e293` - Collection page (broken)

---

## Test Data Sample

### Bobbleheads (Working):

```
id: 6b18352c-45a7-4b6d-9597-b2ff2eb69ad6
name: Colton "Air" Cowser
slug: colton-air-cowser ✅
```

### Collections (Broken):

```
id: 7ce6e293-f529-47ac-8223-07eb4c5ea0f8
name: Baltimore Orioles
slug: -altimore-rioles-7ce6e293 ❌
```

### Subcollections (Broken):

```
id: 6948b6b5-151a-4a3a-ac88-a114cc082228
name: Frederick Keys
slug: -rederick-eys-6948b6b5 ❌
```

---

## Next Steps

1. **Investigate Migration**: Find and review the migration that populated collection/subcollection slugs
2. **Create Data Fix Migration**: Write migration to regenerate slugs using correct utility
3. **Test Data Fix**: Run migration on development branch and verify
4. **Update Schema Constraints**: Set NOT NULL on slug columns after data fix
5. **Comprehensive Retest**: Verify all routes work correctly
6. **Production Planning**: Document rollout plan for production database

---

## Appendices

### A. Error Stack Trace

```
ZodError: [
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "regex",
    "pattern": "/^[a-z0-9]+(?:-[a-z0-9]+)*$/",
    "path": ["collectionSlug"],
    "message": "Collection slug must contain only lowercase letters, numbers, and hyphens"
  }
]
```

### B. Slug Pattern Regex

```javascript
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
```

**Pattern Requirements**:

- Must start with lowercase letter or number
- Can contain lowercase letters, numbers, and hyphens
- No consecutive hyphens
- Must end with lowercase letter or number
- **Does NOT allow leading hyphens** ❌

### C. Database Constraint Details

**Collections**:

```sql
UNIQUE (user_id, slug)  -- Scoped per user
```

**Bobbleheads**:

```sql
UNIQUE (slug)  -- Globally unique
```

**Subcollections**:

```sql
UNIQUE (collection_id, slug)  -- Scoped per collection
```
