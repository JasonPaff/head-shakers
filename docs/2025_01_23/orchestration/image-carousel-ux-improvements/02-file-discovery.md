# Step 2: AI-Powered File Discovery

**Status**: Completed
**Started**: 2025-01-23T00:00:30.000Z
**Completed**: 2025-01-23T00:01:30.000Z
**Duration**: ~60 seconds

## Refined Request Used as Input

Enhance the visual appeal and overall UI/UX of the bobblehead details page image carousels by improving the existing Embla Carousel implementation located in the feature components under src/components/feature/. The current carousel should be refined with smoother transitions, better visual feedback for navigation controls, and improved thumbnail strip interactions that clearly indicate the active image state.

## Agent Prompt Sent

```
You are the file-discovery-agent. Find ALL files relevant to implementing this feature:
[Full refined feature request]
Your Task:
1. Search the codebase thoroughly for carousel, image gallery, bobblehead details components
2. Provide file path, priority, reason for relevance, modification status
3. Search patterns: carousel, embla, bobblehead, CldImage, Dialog
```

## Discovery Statistics

- **Directories explored**: 12+
- **Candidate files examined**: 35+
- **Highly relevant files found**: 17
- **Supporting files identified**: 12

## Discovered Files by Priority

### Critical Priority (Must Modify)

| File | Reason | Modification Needed |
|------|--------|---------------------|
| `src/components/ui/carousel.tsx` | Core Embla Carousel wrapper, navigation components | Yes - Add animations, dot indicators, improved states |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-primary-image.tsx` | Main image display with navigation | Yes - Enhance transitions, blur placeholders |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/feature-card-image-gallery.tsx` | Thumbnail strip component | Yes - Add scroll-snap, improve active states |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx` | Main feature card container | Yes - Extract lightbox, improve modal transitions |
| `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx` | Lightbox modal component | Yes - Add entrance animations, improve dots |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx` | Standalone photo gallery card | Yes - Add entrance animations, improve hover effects |

### High Priority (Supporting/Integration)

| File | Reason | Modification Needed |
|------|--------|---------------------|
| `src/components/feature/bobblehead/bobblehead-gallery-card.tsx` | Gallery card with inline navigation | Yes - Consistent styling |
| `src/components/ui/dialog.tsx` | Base Radix Dialog for lightbox | Possibly - Fullscreen variant |
| `src/components/ui/button.tsx` | Base button with CVA variants | Possibly - Carousel-specific variants |

### Medium Priority (May Need Updates)

| File | Reason | Modification Needed |
|------|--------|---------------------|
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/feature-card/types.ts` | PhotoItem type definition | Possibly - Animation state props |
| `src/lib/utils/cloudinary.utils.ts` | Cloudinary URL utilities | Possibly - Blur placeholder generation |
| `src/app/globals.css` | Global styles, animations | Possibly - Custom carousel keyframes |
| `src/hooks/use-toggle.ts` | Toggle hook for states | No - Reference only |
| `src/utils/tailwind-utils.ts` | cn utility function | No - Reference only |

### Low Priority (Reference Only)

| File | Reason | Modification Needed |
|------|--------|---------------------|
| `src/components/ui/conditional.tsx` | Conditional rendering utility | No |
| `src/components/ui/skeleton.tsx` | Loading skeleton | Possibly |
| `src/components/ui/card.tsx` | Card container | No |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton.tsx` | Feature card skeleton | Possibly |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` | Main page component | No |

## Architecture Insights Discovered

### Dual Image Display System
1. **Feature Card**: Primary image + thumbnail strip (main details view)
2. **Photo Gallery Card**: Grid layout + fullscreen modal (secondary gallery)

### Cloudinary Integration Pattern
- `crop: 'fill'` for thumbnails, `'pad'` for fullscreen
- `format: 'auto'` for automatic format selection
- `quality: 'auto:good'` for thumbnails, `'auto:best'` for fullscreen

### Existing Functionality to Leverage
- Keyboard navigation (ArrowLeft, ArrowRight, Escape)
- Basic dot indicators in modal
- Hover-reveal navigation buttons
- CldImage blur placeholder support (available but not utilized)

## Package Dependencies Identified

- `embla-carousel-react`: ^8.6.0
- `next-cloudinary`: ^6.16.2
- `lucide-react`: ^0.548.0
- `class-variance-authority`: ^0.7.1
- `@radix-ui/react-dialog`: ^1.1.15
- `tw-animate-css`: ^1.4.0

## Validation Results

- **Minimum Files**: PASSED (17 relevant files discovered)
- **AI Analysis Quality**: PASSED (detailed reasoning provided)
- **File Validation**: PASSED (all paths verified to exist)
- **Smart Categorization**: PASSED (Critical/High/Medium/Low priorities assigned)
- **Comprehensive Coverage**: PASSED (covers all architectural layers)
