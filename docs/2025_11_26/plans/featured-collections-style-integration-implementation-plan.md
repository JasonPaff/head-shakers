# Featured Collections Style Integration - Implementation Plan

**Generated**: 2025-11-26
**Original Request**: integrate the style from the /home-page-demo featured collections section into the real home page. No backwards compatable approach, use the new featured collections design only. Make sure to match the color scheme used in the real home page hero section. Must support light and dark mode.

**Refined Request**: Integrate the featured collections component styling from the /home-page-demo route into the production home page located in the (public) route group, completely replacing the existing featured collections section with the new design while maintaining no backwards compatibility. The new featured collections component must use the same color scheme and visual hierarchy as the hero section on the real home page to ensure consistent branding throughout the public landing experience. The implementation should leverage the existing Tailwind CSS 4 utility classes and custom theme configuration to automatically adapt to both light and dark modes using the next-themes provider.

---

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Replace the current featured collections section styling with the new design from the demo page, matching the orange/amber color scheme of the hero section while maintaining full light/dark mode support and all existing production integrations (Cloudinary, authentication, likes).

## Prerequisites

- [ ] Verify npm dependencies are installed (`npm install`)
- [ ] Ensure development server can run (`npm run dev`)
- [ ] Confirm demo page is accessible at `/home-page-demo` for reference

## Implementation Steps

### Step 1: Update Featured Collections Section Header in Production Home Page

**What**: Replace section header styling to match demo's orange/amber theme with icon badge
**Why**: Establishes visual consistency between hero section and featured collections with matching color palette
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/page.tsx` - Update featured collections section header (lines 174-189)

**Changes:**
- Replace section background from `bg-card` to `bg-white dark:bg-slate-950`
- Update section padding from `py-8` to `py-20`
- Modify icon container background from `bg-orange-200/50` to `bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`
- Update icon size from `size-7` to `size-8` and change from AwardIcon to Layers icon
- Modify icon color from `text-orange-700 dark:text-primary` to `text-orange-600 dark:text-orange-400`
- Update heading text size from `text-3xl md:text-4xl` to `text-4xl md:text-5xl`
- Change heading color from `text-foreground` to `text-slate-900 dark:text-white`
- Update description styling from `text-muted-foreground` to `text-lg text-slate-600 dark:text-slate-400`
- Modify container padding from `px-4` to `px-6`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Section header matches demo styling with orange/amber gradient icon background
- [ ] Typography sizes and colors match demo specifications
- [ ] Dark mode variants apply correctly
- [ ] All validation commands pass

---

### Step 2: Add View All Button to Featured Collections Section

**What**: Add "View All Collections" button below the grid matching demo styling
**Why**: Provides navigation to browse page with consistent orange/amber theme
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/page.tsx` - Add button after FeaturedCollectionsAsync (after line 195)

**Changes:**
- Add div container with classes `mt-12 text-center` after FeaturedCollectionsErrorBoundary closing tag
- Add Button component with `size="lg"` and `variant="outline"`
- Apply orange/amber themed classes: `border-orange-500/30 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/50`
- Include ArrowRight icon with `ml-2 size-5 transition-transform group-hover:translate-x-1`
- Use group class on button for hover animation coordination
- Link to browse collections page using $path utility
- Import ArrowRight from lucide-react if not already imported

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Button appears centered below featured collections grid
- [ ] Orange/amber styling matches demo and hero section theme
- [ ] Hover states work correctly in light and dark modes
- [ ] Arrow icon animates on hover
- [ ] Link navigates to correct browse page
- [ ] All validation commands pass

---

### Step 3: Completely Rebuild Featured Collections Display Component Card Structure

**What**: Replace entire card component structure with demo's design including image, overlay, and footer layout
**Why**: Implements the new visual design with proper image positioning, gradient overlays, and metadata footer
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Complete card component rebuild (lines 75-227)

**Changes:**
- Remove all CVA variant imports and usage (featuredCardVariants, featuredCardContentVariants, etc.)
- Replace article className with: `group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900`
- Restructure card to have two main sections: image container and footer section
- Update image container to `relative aspect-[4/3] overflow-hidden`
- Keep CldImage with existing Cloudinary configuration
- Replace gradient overlay with `absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`
- Remove featured badge entirely
- Add content overlay div with classes `absolute right-0 bottom-0 left-0 p-6`
- Move title into overlay with classes `text-xl font-bold text-white drop-shadow-lg`
- Add description into overlay with classes `mt-2 line-clamp-2 text-sm text-white/80`
- Add hover scale effect on image: `transition-transform duration-500 group-hover:scale-110`
- Remove User icon and change owner display format
- Create footer section outside image container with classes `p-5`
- Build owner section with avatar, username, and item count
- Add estimated value display with orange/amber styling
- Add stats row with Heart, Eye, and MessageCircle icons
- Remove LikeCompactButton and ArrowRight "View" link from overlay
- Use Link wrapper on entire card for navigation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Card displays image at top with gradient overlay
- [ ] Title and description appear as white text overlaid on image
- [ ] Footer section displays owner avatar, username, items count, and value
- [ ] Stats row shows likes, views, and comments with icons
- [ ] Hover animation translates card up and scales image
- [ ] Orange/amber accents match theme (avatar ring, value text)
- [ ] Dark mode styling works correctly
- [ ] All validation commands pass

---

### Step 4: Integrate Static Stats Display for Collections

**What**: Add likes, views, and comments display in footer stats row
**Why**: Provides engagement metrics visibility matching demo design
**Confidence**: Medium

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Add stats to interface and display

**Changes:**
- Import Eye and MessageCircle icons from lucide-react
- Add stats display div with classes `mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800`
- Create span for likes with Heart icon: `flex items-center gap-1` and icon classes `size-4 text-red-400`
- Display like count using toLocaleString for number formatting
- Create span for views with Eye icon: `flex items-center gap-1` and icon classes `size-4`
- Display view count using toLocaleString
- Create span for comments with MessageCircle icon: `flex items-center gap-1` and icon classes `size-4`
- Display comment count from collection.comments property
- Remove any existing like button interaction components

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Stats row displays likes, views, and comments with proper icons
- [ ] Numbers format correctly with thousand separators
- [ ] Icons have correct sizes and colors
- [ ] Border separator appears above stats
- [ ] Dark mode colors apply correctly
- [ ] All validation commands pass

---

### Step 5: Add Owner Avatar and Metadata Display

**What**: Create owner information section with avatar, username, items count, and estimated value
**Why**: Displays collection ownership and key metrics matching demo layout
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Add owner section to footer

**Changes:**
- Add owner section container with classes `flex items-center justify-between`
- Create left section with classes `flex items-center gap-3`
- Add img element for owner avatar with classes `size-9 rounded-full object-cover ring-2 ring-orange-500/20`
- Use placeholder avatar or user avatar from collection data (may need to add to interface)
- Create owner info div containing username and items count
- Display username with classes `text-sm font-medium text-slate-900 dark:text-white` formatted as `@{ownerDisplayName}`
- Display items count with classes `text-xs text-slate-500` formatted as `{totalItems} items`
- Add totalItems property to FeaturedCollection interface
- Create right section with classes `text-right`
- Display estimated value with classes `text-sm font-semibold text-orange-600 dark:text-orange-400` formatted with dollar sign and toLocaleString
- Add totalValue property to FeaturedCollection interface
- Display "Est. Value" label with classes `text-xs text-slate-500`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Owner avatar displays with orange ring effect
- [ ] Username shows with @ prefix
- [ ] Items count appears below username
- [ ] Estimated value displays in orange with proper formatting
- [ ] Layout aligns correctly with space-between
- [ ] All validation commands pass

---

### Step 6: Update Featured Collections Data Mapping

**What**: Extend data mapping to include totalItems and totalValue from backend
**Why**: Provides necessary data for the new owner metadata display
**Confidence**: Medium

**Files to Modify:**
- `src/app/(app)/(home)/components/async/featured-collections-async.tsx` - Add fields to data mapping
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Update interface

**Changes:**
- Update FeaturedCollection interface to add `totalItems: number` and `totalValue: number` properties
- Modify collections mapping in FeaturedCollectionsAsync to include these fields from content data
- Map totalItems from `content.totalItems ?? 0`
- Map totalValue from `content.totalValue ?? 0`
- Verify FeaturedContentFacade returns these fields or add placeholder values
- Update async component return type to match new interface

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Interface includes new properties with correct types
- [ ] Data mapping provides values for totalItems and totalValue
- [ ] TypeScript compilation succeeds without errors
- [ ] All validation commands pass

---

### Step 7: Update Featured Collections Skeleton Loading State

**What**: Redesign skeleton to match new card structure with image, overlay, and footer
**Why**: Maintains consistent loading experience with new design
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/skeletons/featured-collections-skeleton.tsx` - Complete skeleton rebuild

**Changes:**
- Update grid classes from `gap-6` to `gap-8`
- Change Card className to match new design: `overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800`
- Remove CardContent wrapper
- Create image skeleton section with `aspect-[4/3] w-full rounded-none`
- Add footer skeleton section with `p-5` padding
- Create owner section skeleton with avatar circle `size-9 rounded-full` and text skeletons
- Add value section skeleton on right side
- Create stats row skeleton with separator border
- Update skeleton count from 6 to match grid display (3 or 6)
- Ensure all Skeleton components use appropriate widths and heights

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Skeleton structure matches new card layout
- [ ] Loading state appears visually similar to loaded cards
- [ ] Skeleton displays correct aspect ratio for image
- [ ] Footer sections have appropriate placeholders
- [ ] All validation commands pass

---

### Step 8: Remove Unused CVA Variant Imports and Clean Up

**What**: Remove all unused featured card variant imports from display component
**Why**: Eliminates dead code and reduces bundle size
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Remove variant imports

**Changes:**
- Remove import of featuredCardBadgeVariants
- Remove import of featuredCardContentVariants
- Remove import of featuredCardDescriptionVariants
- Remove import of featuredCardImageVariants
- Remove import of featuredCardOverlayVariants
- Remove import of featuredCardTitleVariants
- Remove import of featuredCardVariants
- Remove Conditional component import if no longer used
- Remove User icon import
- Keep ArrowRight and Layers imports for other sections
- Verify no other components depend on removed imports

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All unused imports removed
- [ ] No TypeScript errors from missing imports
- [ ] Component still renders correctly
- [ ] All validation commands pass

---

### Step 9: Add Trending Badge Support

**What**: Implement trending badge display on featured collection cards
**Why**: Highlights trending collections matching demo functionality
**Confidence**: Medium

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Add trending badge
- `src/app/(app)/(home)/components/async/featured-collections-async.tsx` - Add isTrending field

**Changes:**
- Import Badge component from `@/components/ui/badge`
- Add isTrending boolean property to FeaturedCollection interface
- Map isTrending from content data in async component
- Add conditional rendering for badge in top-right of image container
- Position badge with absolute positioning: `absolute top-4 right-4`
- Use Badge component with variant="trending" if available, or create custom styling
- Badge should have classes matching demo's trending badge
- Ensure badge appears above image with proper z-index

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Trending badge appears on applicable collections
- [ ] Badge positioned correctly in top-right corner
- [ ] Badge styling matches demo design
- [ ] Badge visible over image with proper contrast
- [ ] All validation commands pass

---

### Step 10: Verify Badge Variant Support

**What**: Check if Badge component supports "trending" variant or add custom styling
**Why**: Ensures trending badge displays with correct colors and styling
**Confidence**: Low

**Files to Modify:**
- `src/components/ui/badge.tsx` - Potentially add trending variant

**Changes:**
- Review Badge component variants to check for "trending" support
- If trending variant exists, use it directly
- If not, apply custom className to Badge for trending styling: `bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent`
- Ensure badge text displays as "Trending"
- Verify badge works in both light and dark modes

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Badge displays with orange-to-red gradient
- [ ] Text is white and readable
- [ ] Badge works in light and dark modes
- [ ] All validation commands pass

---

### Step 11: Update Grid Layout and Spacing

**What**: Adjust grid gap and container spacing to match demo
**Why**: Ensures proper visual spacing between cards
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Update grid classes

**Changes:**
- Change grid gap from `gap-8` to `gap-8` (verify if demo uses different spacing)
- Ensure grid maintains `md:grid-cols-2 lg:grid-cols-3` for responsive layout
- Verify empty state styling still works with new design
- Update empty state icon and text colors to match new theme

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Grid spacing matches demo visually
- [ ] Responsive breakpoints work correctly
- [ ] Empty state displays appropriately
- [ ] All validation commands pass

---

### Step 12: Test Full Integration and Visual Consistency

**What**: Comprehensive testing of complete featured collections section with all changes
**Why**: Validates entire implementation works correctly across all scenarios
**Confidence**: High

**Files to Modify:**
- None - testing only

**Changes:**
- Start development server and navigate to home page
- Verify featured collections section matches demo styling
- Test hover interactions on cards (translate-y, shadow, image scale)
- Verify all data displays correctly (title, description, owner, stats)
- Test in both light and dark modes
- Check responsive behavior at different breakpoints
- Verify "View All Collections" button works
- Test with empty state (no featured collections)
- Verify loading skeleton displays correctly
- Check accessibility (keyboard navigation, screen readers)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Visual design matches demo and hero section color scheme
- [ ] All interactions work smoothly
- [ ] Light and dark modes both display correctly
- [ ] Responsive layout works at all breakpoints
- [ ] Data displays accurately from backend
- [ ] No console errors or warnings
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Featured collections section visually matches demo design
- [ ] Orange/amber color scheme consistent with hero section
- [ ] Both light and dark modes work correctly
- [ ] All hover and transition effects function properly
- [ ] Navigation links use $path utility
- [ ] No CVA variants remain in component
- [ ] Loading skeleton matches new card structure

## Notes

**Color Palette Reference:**
- Primary background: `bg-white dark:bg-slate-950`
- Card background: `bg-white dark:bg-slate-900`
- Card border: `border-slate-200 dark:border-slate-800`
- Icon gradient: `from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`
- Icon color: `text-orange-600 dark:text-orange-400`
- Primary text: `text-slate-900 dark:text-white`
- Secondary text: `text-slate-600 dark:text-slate-400`
- Muted text: `text-slate-500`
- Accent color: `text-orange-600 dark:text-orange-400`
- Button hover: `hover:bg-orange-50 dark:hover:bg-orange-950/50`

**Key Assumptions:**
- FeaturedContentFacade may not return totalItems and totalValue - may need facade updates
- Owner avatar URL may not be in current data structure - may need to add or use placeholder
- Trending flag may need to be added to backend data
- Current Badge component may not have "trending" variant

**Risk Mitigation:**
- If backend data missing required fields, use placeholder values initially
- If Badge lacks trending variant, use custom className approach
- Test with real data early to identify data mapping issues
- Verify Cloudinary image URLs work correctly with new structure
