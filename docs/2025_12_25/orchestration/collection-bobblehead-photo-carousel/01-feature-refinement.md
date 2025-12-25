# Step 1: Feature Request Refinement

**Started**: 2025-12-25T00:00:00Z
**Completed**: 2025-12-25T00:00:30Z
**Status**: Success

## Original Request

The /dashboard/collection page has a bobblehead grid that displays the bobbleheads in the selected collection, these bobbleheads are displayed as cards that display the featured image from the bobblehead. The bobbleheads though can have multiple photos on them and I would like a way for the collection owner to see these additional photos on the bobblehead cards in the collection dashboard.

**Word Count**: 64 words

## Context Provided

- Next.js 16 with App Router, React 19, TypeScript
- Radix UI components, Tailwind CSS 4
- Cloudinary for image storage via next-cloudinary
- TanStack Form for form handling
- Embla Carousel React is available in dependencies (embla-carousel-react)
- Class Variance Authority for component variants
- Lucide React for icons
- Components in src/components/ui/ and src/components/feature/
- Server components for data fetching, client components for interactivity

## Agent Prompt

Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): [original request]. Using this project context, expand the request with relevant technical details while maintaining its core intent. Output ONLY the refined paragraph (200-500 words), nothing else.

## Refined Feature Request

The collection dashboard at /dashboard/collection displays bobblehead items in a grid layout where each card currently shows only the featured image of the bobblehead, but since bobbleheads can have multiple photos attached to them, collection owners need a way to browse through all available images directly on these cards without navigating away from the collection view. This feature should implement an image carousel or gallery preview on each bobblehead card that allows owners to cycle through all photos associated with that bobblehead, leveraging the existing Embla Carousel React dependency for smooth, performant carousel functionality with proper touch and drag support. The implementation should add navigation controls such as previous/next arrows using Lucide React icons and optional dot indicators to show the current image position within the photo set, with these controls styled consistently using Tailwind CSS 4 and potentially Class Variance Authority for variant management to handle hover states, active states, and responsive sizing. Since this is an interactive feature requiring user input handling, the bobblehead card component or a new carousel wrapper should be implemented as a client component while the parent grid and data fetching remain server components, with the photo URLs being passed down as props from the existing bobblehead data structure that already includes Cloudinary-hosted images. The carousel should use next-cloudinary's CldImage component for optimized image delivery with appropriate transformations for card-sized displays, ensuring fast loading and responsive image sizing. The feature should gracefully handle edge cases such as bobbleheads with only a single image by hiding navigation controls when unnecessary, and should maintain the current card layout and aspect ratio while allowing smooth transitions between images. Accessibility considerations should include keyboard navigation support for the carousel controls and appropriate ARIA labels for screen readers, following Radix UI patterns where applicable for consistent accessible component behavior throughout the application.

**Word Count**: 294 words

## Validation Results

- Format Check: PASS (single paragraph, no headers/sections)
- Length Check: PASS (294 words, ~4.6x original - acceptable)
- Scope Check: PASS (core intent preserved, technical details added appropriately)
- Quality Check: PASS (essential technical context included)
