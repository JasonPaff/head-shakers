# Conventions Validator Report

## Files Scanned

13 files across server and client components

## Overall Status

VIOLATIONS FOUND

## Summary

- Files with Violations: 3
- Total Violations: 5
- High Priority: 0
- Medium Priority: 3
- Low Priority: 2

## Issues Found

### MEDIUM Severity (3)

#### 1. Derived Variable Missing `_` Prefix - badgeText

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:74-77`
**Current**: `badgeText`
**Should Be**: `_badgeText`
**Issue**: Derived transformation of `bobblehead.badge` should use underscore prefix.

#### 2. Derived Variables Missing `_` Prefix - testId Variables

**File:Line**: `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx:33-38`
**Current**: `heroTestId`, `cardTestId`, `imageTestId`, `badgeTestId`, `topRatedCardTestId`, `valueGrowthCardTestId`
**Should Be**: `_heroTestId`, `_cardTestId`, `_imageTestId`, `_badgeTestId`, `_topRatedCardTestId`, `_valueGrowthCardTestId`
**Issue**: All testId const declarations are derived from `testId` prop and should use prefix.

#### 3. Derived Variables Missing `_` Prefix - publicId, blurDataUrl, avatarUrl

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:82-86`
**Current**: `publicId`, `blurDataUrl`, `avatarUrl`
**Should Be**: `_publicId`, `_blurDataUrl`, `_avatarUrl`
**Issue**: These are derived transformations and should use underscore prefix (note: `_hasImage` on line 79 correctly uses prefix).

### LOW Severity (2)

#### 4. Derived Variables Missing `_` Prefix - publicId, blurDataUrl

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:70-71`
**Current**: `publicId`, `blurDataUrl`
**Should Be**: `_publicId`, `_blurDataUrl`
**Issue**: Similar to above, these derived variables need prefix.

#### 5. Derived Variables Inconsistency

**Multiple Files**: Display components have inconsistent `_` prefix usage
**Issue**: Some derived variables correctly use prefix (`_hasImage`), others don't.
**Recommendation**: Standardize all derived variable naming.

## Files in Full Compliance

The following files demonstrate excellent adherence to conventions:

- `src/app/(app)/(home)/page.tsx` - Perfect named exports, type imports, quote usage
- `src/app/(app)/(home)/components/sections/hero-section.tsx` - Excellent server component
- `src/app/(app)/(home)/components/sections/featured-collections-section.tsx` - Clean pattern
- `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx` - Proper structure
- `src/app/(app)/(home)/components/sections/join-community-section.tsx` - Excellent JSX attributes
- `src/app/(app)/(home)/components/async/platform-stats-async.tsx` - Clean async pattern
- `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx` - Good structure
- `src/app/(app)/(home)/components/async/featured-collections-async.tsx` - Proper async
- `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx` - Clean pattern
- `src/components/ui/auth.tsx` - Excellent Conditional usage, proper boolean naming

## Positive Findings

All files correctly use:

- Single quotes with curly braces for JSX attributes
- Named exports (no default exports)
- `import type` for type-only imports
- Boolean naming with `is`, `has`, `should` prefix
- `<Conditional>` component for complex conditions
- Proper 'use client' directives on client components

## Summary

The codebase shows excellent overall adherence to conventions. The main improvement area is consistent use of the `_` prefix for ALL derived variables, not just boolean conditionals.
