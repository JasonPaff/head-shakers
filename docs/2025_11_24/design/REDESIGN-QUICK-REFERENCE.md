# Subcollections Redesign - Quick Reference Guide

## Current Implementation Summary

### Component Props

```typescript
interface SubcollectionCardProps {
  collectionSlug: string; // Type-safe routing
  isOwner: boolean; // Conditional actions display
  subcollection: {
    id: string;
    slug: string;
    name: string; // Main display text
    description: null | string; // Secondary text (2-line clamp)
    coverImageUrl?: null | string; // Cloudinary URL (PRIMARY IMAGE)
    bobbleheadCount: number; // Badge count
    isPublic: boolean; // Privacy indicator
  };
}
```

### Current Layout (Sidebar Context)

- **Image**: 533×400px (4:3 ratio), `crop='fill'`, `gravity='auto'`
- **Grid**: 1 col mobile, 2 cols tablet+ (within 320-360px sidebar)
- **Card Structure**:
  - Image section with hover scale effect
  - Content section with title, badge, description
  - Owner actions dropdown (conditional)

### Current Cloudinary Transformations

```
crop='fill'        // Fill container, intelligent crop
gravity='auto'     // Face/object detection for crop focus
format='auto'      // Best format negotiation (webp, etc.)
quality='auto:good' // Balance quality/performance
```

---

## Key Metrics for New Design

### Width Constraints (Desktop - lg breakpoint)

- **Sidebar Width**: ~320-360px (col-span-3 of 12-column grid)
- **Max Image Width**: 533px (needs responsive sizing)
- **Ratio**: 533:400 (4:3) current

### Responsive Breakpoints Available

```
Mobile:  < 640px   (sm breakpoint)
Tablet:  640-1024px (sm to lg)
Desktop: >= 1024px  (lg+)
```

### Data Flow Chain

```
Query Layer (subcollections.query.ts)
  ↓ Returns: coverImageUrl, name, description, bobbleheadCount
Query Context (Public/User/Protected)
  ↓
Facade (subcollections.facade.ts)
  ↓ Orchestrates & handles errors
Server Component (collection-sidebar-subcollections.tsx)
  ↓ Fetches data
List Component (collection-subcollections-list.tsx, Client)
  ↓ Grid: grid-cols-1 gap-4 sm:grid-cols-2
Card Component (subcollection-card.tsx, Client) ← REDESIGN TARGET
  ↓ Renders individual card
```

---

## Architectural Constraints

### ✓ Safe to Modify

- Card layout and styling (CSS/Tailwind)
- Image aspect ratio and transformations
- Typography sizing and hierarchy
- Hover effects and transitions
- Badge and metadata display

### ⚠️ Consider Before Modifying

- Client Component boundary (currently justified for interactions)
- Props interface (used by parent list component)
- Cloudinary URL handling (service layer manages transformations)
- Test IDs (used by QA automation)

### ✗ Do Not Modify

- Server Component data fetching pattern (already optimized)
- Type safety ($path routing, validation)
- Accessibility patterns (alt text, ARIA labels)
- Database query structure (separate optimization)

---

## Redesign Focal Points

### 1. Image Prominence

- **Current**: ~40% of card visual space
- **Target**: ~60-70% of card visual space
- **Method**: Increase aspect ratio height, reduce content padding

### 2. Typography Hierarchy

- **Current**: Medium title with secondary description
- **Target**: Bold prominent name with minimal metadata
- **Consider**: Overlay text on image or below with darker background

### 3. Interactive States

- **Current**: Image zoom on hover (scale-105)
- **Target**: Enhanced feedback with potential overlay effects
- **Options**: Gradient overlay, title appearance/opacity change

### 4. Responsive Optimization

- **Current**: Fixed 2-column grid in sidebar
- **Target**: Responsive 1-4 columns based on context
- **Decision Point**: Adjust grid or move out of sidebar (Step 4)

---

## Cloudinary Optimization Opportunities

### Available Utilities (src/lib/utils/cloudinary.utils.ts)

- `extractPublicIdFromCloudinaryUrl()` - Parse Cloudinary URLs
- `generateBlurDataUrl()` - Create placeholder (10×10, blur)
- `generateOpenGraphImageUrl()` - Social image (1200×630)

### Suggested New Utilities

```typescript
// Subcollection cover transformations
generateSubcollectionCoverUrl(publicId, breakpoint);
// Responsive sizing for mobile/tablet/desktop
// Maintains gravity='auto' for intelligent crops

generateSubcollectionBlurPlaceholder(publicId);
// Blur placeholder for progressive loading
```

### Transformation Strategy for New Design

```
// Desktop (lg+): 533px width
responsive_width=533, crop=fill, gravity=auto,
format=auto, quality=auto:good

// Tablet (md): 400px width
responsive_width=400, crop=fill, gravity=auto,
format=auto, quality=auto:good

// Mobile (< sm): Full viewport width
responsive_width=280, crop=fill, gravity=auto,
format=auto, quality=auto:good
```

---

## Layout Decision Points

### Current Constraint

- Sidebar limits card width to ~320-360px at desktop
- Current 2-column grid fits but visual impact is constrained

### Step 4 Will Assess

- Is sidebar width sufficient for redesigned cards?
- Should layout change to accommodate larger cards?
- Options:
  1. Keep sidebar, optimize for 2-3 columns
  2. Expand sidebar to col-span-4 (adjust main to col-span-8)
  3. Move subcollections to full-width section

---

## Testing Checklist

### Post-Redesign Validation

- [ ] Image loads correctly at all breakpoints
- [ ] Card proportions maintain visual balance
- [ ] Hover effects smooth and responsive
- [ ] Title readable with new layout
- [ ] Badge/metadata visibility maintained
- [ ] Links navigate correctly (type-safe)
- [ ] Test IDs functional for automation
- [ ] Accessibility: Alt text, keyboard nav, screen readers
- [ ] Mobile experience optimized (spacing, text size)
- [ ] Performance: Image loading, bundle size

### Responsive Testing

- [ ] Mobile (< 640px): Single column layout
- [ ] Tablet (640-1024px): 2-column grid
- [ ] Desktop (1024+): 2-3 column in sidebar or full-width section
- [ ] Dark mode: Sufficient contrast for overlays
- [ ] Light mode: Color balance

---

## File References

### Primary Files

- **Redesign Target**: `src/components/feature/subcollections/subcollection-card.tsx`
- **Grid Container**: `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollections-list.tsx`
- **Layout Parent**: `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`
- **Cloudinary Utils**: `src/lib/utils/cloudinary.utils.ts`

### Related Files (Reference Only)

- Facade: `src/lib/facades/collections/subcollections.facade.ts`
- Query: `src/lib/queries/collections/subcollections.query.ts`
- Actions: `src/components/feature/subcollections/subcollection-actions.tsx`

---

## Import Dependencies to Maintain

```typescript
import { CldImage } from 'next-cloudinary'; // Image rendering
import { $path } from 'next-typesafe-url'; // Type-safe routing
import Image from 'next/image'; // Fallback placeholder
import Link from 'next/link'; // Navigation links
import { SubcollectionActions } from '...'; // Owner menu
import { Badge } from '@/components/ui/badge'; // Count badge
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants/cloudinary-paths';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';
```

---

## Tailwind Classes to Leverage

### For New Design

- `aspect-[ratio]` - Image aspect ratios (e.g., aspect-video, aspect-[16/10])
- `group` / `group-hover:` - Hover state management
- `line-clamp-[n]` - Text truncation (1, 2, 3, 4 lines)
- `overflow-hidden` - Clip content to borders
- `transition-[property] duration-[ms]` - Smooth animations
- `hover:scale-[n]`, `hover:shadow-[n]` - Interactive effects
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:` - Breakpoints

### Grid Utilities

- `grid grid-cols-[n]` - Column count
- `gap-[n]` - Spacing between items
- `md:grid-cols-[n]`, `lg:grid-cols-[n]` - Responsive columns

---

## Implementation Notes

1. **Maintain Client Component**: Keep 'use client' boundary (justified by interactivity)
2. **Preserve Props Interface**: Parent component expects current props
3. **Leverage CldImage**: Already in codebase, highly optimized
4. **Type Safety First**: Use $path for all internal navigation
5. **Test IDs Important**: QA automation depends on these
6. **Accessibility**: Don't reduce alt text quality, maintain ARIA labels
7. **Performance**: Use Cloudinary transformations (not CSS scaling)

---

## Next Phase (Step 2)

Focus areas for card redesign:

1. ✓ Increase image area to 60-70% of card
2. ✓ Enhance typography for prominence
3. ✓ Add/refine hover effects
4. ✓ Responsive sizing for breakpoints
5. ✓ Optimize Cloudinary transformations
6. ✓ Test accessibility thoroughly

---

**For detailed architectural analysis, see**: `docs/2025_11_24/design/subcollections-redesign-architecture-analysis.md`
