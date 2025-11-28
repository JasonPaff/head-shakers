# Client Component Specialist Report

## Files Reviewed

- src/components/ui/auth.tsx
- src/app/(app)/(home)/components/display/featured-collections-display.tsx
- src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx
- src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx

## Issues Found

### HIGH Severity (6)

#### 1. Missing ComponentTestIdProps in FeaturedCollectionsDisplay

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:36-38`
**Issue**: Props type missing `ComponentTestIdProps`.
**Recommendation**: Add `ComponentTestIdProps` to props type.

#### 2. Missing testId Implementation in FeaturedCollectionsDisplay

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:40`
**Issue**: Not destructuring or using `testId` prop.
**Recommendation**: Destructure `testId` from props and generate/use test ID.

#### 3. Missing ComponentTestIdProps in FeaturedCollectionCard

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:78`
**Issue**: Component should accept `testId`, `className`, and spread props.
**Recommendation**: Update to use `ComponentProps<'div'> & ComponentTestIdProps`.

#### 4. Missing ComponentTestIdProps in TrendingBobbleheadsDisplay

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:28-30`
**Issue**: Props type missing `ComponentTestIdProps`.
**Recommendation**: Add `ComponentTestIdProps` to props type.

#### 5. Missing testId Implementation in TrendingBobbleheadsDisplay

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:32`
**Issue**: Not destructuring or using `testId` prop.
**Recommendation**: Destructure and use `testId` prop.

#### 6. Missing ComponentTestIdProps in TrendingBobbleheadCard

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:62-66`
**Issue**: Component missing `ComponentTestIdProps`, `ComponentProps`, and spread props.
**Recommendation**: Update type to `ComponentProps<'div'> & ComponentTestIdProps & { bobblehead: TrendingBobblehead }`.

### MEDIUM Severity (6)

#### 7. Using `interface` Instead of `type` - FeaturedCollection

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:17-34`
**Issue**: Uses `interface` instead of `type` for props.
**Recommendation**: Change to `type FeaturedCollection`.

#### 8. Using `interface` Instead of `type` - FeaturedCollectionsDisplayProps

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:36-38`
**Issue**: Uses `interface` for props.
**Recommendation**: Change to `type FeaturedCollectionsDisplayProps`.

#### 9. Using `interface` Instead of `type` - TrendingBobblehead

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:15-26`
**Issue**: Uses `interface` instead of `type`.
**Recommendation**: Change to `type TrendingBobblehead`.

#### 10. Using `interface` Instead of `type` - TrendingBobbleheadsDisplayProps

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:28-30`
**Issue**: Uses `interface` for props.
**Recommendation**: Change to `type TrendingBobbleheadsDisplayProps`.

#### 11. Using `interface` Instead of `type` - TrendingBobbleheadCardProps

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:62-64`
**Issue**: Uses `interface` for props.
**Recommendation**: Change to `type TrendingBobbleheadCardProps`.

#### 12. Using `interface` Instead of `type` - FeaturedBobbleheadDisplayProps

**File:Line**: `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx:15-25`
**Issue**: Uses `interface` for props.
**Recommendation**: Change to `type FeaturedBobbleheadDisplayProps`.

### LOW Severity (4)

#### 13. Missing Test ID Support in Auth Component

**File:Line**: `src/components/ui/auth.tsx:10-13`
**Issue**: Missing `ComponentTestIdProps` in `AuthContentProps`.
**Recommendation**: Add test ID support.

#### 14. Missing data-slot in Auth Component

**File:Line**: `src/components/ui/auth.tsx:15-24`
**Issue**: Missing `data-slot` attribute on wrapper element.
**Recommendation**: Add `data-slot` to wrapper.

#### 15. Complex Ternary for Badge Text

**File:Line**: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx:74-77`
**Issue**: Badge text mapping uses complex ternary.
**Recommendation**: Extract to utility function or object map.

#### 16. Inconsistent Placeholder Image Approach

**File:Line**: `src/app/(app)/(home)/components/display/featured-collections-display.tsx:129-138`
**Issue**: Uses Next.js Image for placeholder instead of Cloudinary.
**Recommendation**: Consider Cloudinary placeholder for consistency.

## Positive Findings

1. All files correctly use 'use client' directive where needed
2. Derived variables consistently use `_` prefix (`_hasImage`, etc.)
3. CldImage usage follows Cloudinary conventions (publicId extraction, transformations)
4. Empty states properly implemented with icons and CTAs
5. Accessibility attributes (aria-hidden) correctly used
6. $path correctly used for all navigation links
7. Boolean naming conventions followed (isLoaded, isSignedIn, \_hasImage)
8. featured-bobblehead-display.tsx is exemplary - proper test ID patterns
