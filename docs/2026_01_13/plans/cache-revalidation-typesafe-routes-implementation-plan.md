# Implementation Plan: Refactor Cache-Revalidation Service to Use Type-Safe $path Function

## Overview

**Estimated Duration**: 1-2 hours
**Complexity**: Low
**Risk Level**: Low

## Quick Summary

This refactoring systematically replaces all hardcoded path strings in the cache-revalidation service with type-safe `$path()` calls from next-typesafe-url. The service currently has 15 instances of manually constructed path templates like `/user/${username}/collection/${collectionSlug}` that need to be replaced with the pattern already correctly used in `collections.onCreate` method (lines 417-425). This ensures consistency with project coding standards and provides compile-time safety for route parameters.

## Prerequisites

- [ ] Verify the `$path` import from 'next-typesafe-url' is already present in the file (confirmed on line 6)
- [ ] Understand the three route patterns to use:
  - `/user/[username]/collection/[collectionSlug]` - for collection pages
  - `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` - for bobblehead pages
  - `/user/[username]/dashboard/collection` - for dashboard pages (if needed)

## Implementation Steps

### Step 1: Refactor bobbleheads.onCreate Method (lines 157-159)

**What**: Replace hardcoded bobblehead path string with $path() call in the onCreate method
**Why**: Ensures type safety for the bobblehead page path and consistency with project standards
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on lines 157-159

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}/bobbleheads/${bobbleheadSlug}` with `$path()` call using route `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` and routeParams `{ username, collectionSlug, bobbleheadSlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username, collectionSlug, and bobbleheadSlug
- [ ] All validation commands pass

---

### Step 2: Refactor bobbleheads.onDelete Method (lines 199-201)

**What**: Replace hardcoded bobblehead path string with $path() call in the onDelete method
**Why**: Ensures type safety for the bobblehead page path during deletion revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on lines 199-201

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}/bobbleheads/${bobbleheadSlug}` with `$path()` call using same pattern as Step 1

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username, collectionSlug, and bobbleheadSlug
- [ ] All validation commands pass

---

### Step 3: Refactor bobbleheads.onPhotoChange Method (lines 257-260)

**What**: Replace hardcoded bobblehead path string with $path() call in the onPhotoChange method
**Why**: Ensures type safety for the bobblehead page path during photo change revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on lines 257-260

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}/bobbleheads/${bobbleheadSlug}` with `$path()` call

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username, collectionSlug, and bobbleheadSlug
- [ ] All validation commands pass

---

### Step 4: Refactor bobbleheads.onTagChange Method (lines 291-294)

**What**: Replace hardcoded bobblehead path string with $path() call in the onTagChange method
**Why**: Ensures type safety for the bobblehead page path during tag change revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on lines 291-294

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}/bobbleheads/${bobbleheadSlug}` with `$path()` call

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username, collectionSlug, and bobbleheadSlug
- [ ] All validation commands pass

---

### Step 5: Refactor bobbleheads.onUpdate Method (lines 331-334)

**What**: Replace hardcoded bobblehead path string with $path() call in the onUpdate method
**Why**: Ensures type safety for the bobblehead page path during update revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on lines 331-334

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}/bobbleheads/${bobbleheadSlug}` with `$path()` call

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username, collectionSlug, and bobbleheadSlug
- [ ] All validation commands pass

---

### Step 6: Refactor collections.onBobbleheadChange Method (lines 381, 384-386)

**What**: Replace both hardcoded path strings (collection and bobblehead) with $path() calls in the onBobbleheadChange method
**Why**: Ensures type safety for both collection and bobblehead page paths during structural changes
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded paths on lines 381 and 384-386

**Changes:**

- Replace collection path template literal on line 381 with `$path()` call using route `/user/[username]/collection/[collectionSlug]` and routeParams `{ username, collectionSlug }`
- Replace bobblehead path template literal on lines 384-386 with `$path()` call using route `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` and routeParams `{ username, collectionSlug, bobbleheadSlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Both template literal paths replaced with $path() calls
- [ ] Collection path uses username and collectionSlug params
- [ ] Bobblehead path uses username, collectionSlug, and bobbleheadSlug params
- [ ] All validation commands pass

---

### Step 7: Refactor collections.onDelete Method (line 455)

**What**: Replace hardcoded collection path string with $path() call in the onDelete method
**Why**: Ensures type safety for the collection page path during deletion revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on line 455

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}` with `$path()` call using route `/user/[username]/collection/[collectionSlug]` and routeParams `{ username, collectionSlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username and collectionSlug
- [ ] All validation commands pass

---

### Step 8: Refactor collections.onUpdate Method (line 484)

**What**: Replace hardcoded collection path string with $path() call in the onUpdate method
**Why**: Ensures type safety for the collection page path during update revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded path on line 484

**Changes:**

- Replace template literal `/user/${username}/collection/${collectionSlug}` with `$path()` call using route `/user/[username]/collection/[collectionSlug]` and routeParams `{ username, collectionSlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Template literal path replaced with $path() call
- [ ] Route params include username and collectionSlug
- [ ] All validation commands pass

---

### Step 9: Refactor social.onCommentChange Method (lines 628-631, 635)

**What**: Replace both hardcoded path strings (bobblehead and collection) with $path() calls in the onCommentChange method
**Why**: Ensures type safety for entity page paths during comment change revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded paths on lines 628-631 and 635

**Changes:**

- Replace bobblehead path template literal (lines 628-631, in 'bobblehead' case) with `$path()` call using route `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` and routeParams `{ username, collectionSlug, bobbleheadSlug: entitySlug }`
- Replace collection path template literal (line 635, in 'collection' case) with `$path()` call using route `/user/[username]/collection/[collectionSlug]` and routeParams `{ username, collectionSlug: entitySlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Both template literal paths replaced with $path() calls
- [ ] Bobblehead case uses entitySlug as bobbleheadSlug param
- [ ] Collection case uses entitySlug as collectionSlug param
- [ ] All validation commands pass

---

### Step 10: Refactor social.onLikeChange Method (lines 690-693, 697)

**What**: Replace both hardcoded path strings (bobblehead and collection) with $path() calls in the onLikeChange method
**Why**: Ensures type safety for entity page paths during like change revalidation
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Replace hardcoded paths on lines 690-693 and 697

**Changes:**

- Replace bobblehead path template literal (lines 690-693, in 'bobblehead' case) with `$path()` call using route `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` and routeParams `{ username, collectionSlug, bobbleheadSlug: entitySlug }`
- Replace collection path template literal (line 697, in 'collection' case) with `$path()` call using route `/user/[username]/collection/[collectionSlug]` and routeParams `{ username, collectionSlug: entitySlug }`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Both template literal paths replaced with $path() calls
- [ ] Bobblehead case uses entitySlug as bobbleheadSlug param
- [ ] Collection case uses entitySlug as collectionSlug param
- [ ] All validation commands pass

---

### Step 11: Final Verification and Consistency Check

**What**: Run full validation suite and verify all hardcoded paths have been replaced
**Why**: Ensures the refactoring is complete and the service is consistent with the existing correct pattern in collections.onCreate
**Confidence**: High

**Files to Modify:**

- `src/lib/services/cache-revalidation.service.ts` - Final review only, no modifications expected

**Changes:**

- Verify no remaining hardcoded path strings exist (search for template literals containing `/user/${` pattern)
- Verify all $path() calls follow the same structure as the reference pattern in collections.onCreate (lines 417-425)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 15 hardcoded path instances have been replaced with $path() calls
- [ ] No template literals containing `/user/${` remain in the file (except as part of route strings in $path)
- [ ] All validation commands pass
- [ ] Service maintains consistent coding style throughout

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] No hardcoded path strings remain (verify by searching for template literal patterns like `/user/${`)
- [ ] All $path() calls use the correct route string matching actual route definitions
- [ ] Route parameter objects match the expected parameter names from route-type.ts files

## Notes

- The `$path` import is already present in the file on line 6, so no import changes are needed
- The collections.onCreate method (lines 417-425) serves as the reference pattern showing the correct $path() usage
- Three route patterns are available and should be used appropriately:
  - `/user/[username]/collection/[collectionSlug]` with params `{ username, collectionSlug }`
  - `/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]` with params `{ username, collectionSlug, bobbleheadSlug }`
  - `/user/[username]/dashboard/collection` with params `{ username }` (if needed for dashboard revalidation)
- In the social methods, `entitySlug` is used differently depending on entity type: as `bobbleheadSlug` for bobbleheads and as `collectionSlug` for collections
- All steps can be combined into a single editing session since they modify the same file with similar patterns
