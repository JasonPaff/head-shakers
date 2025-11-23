# Step 1: Feature Request Refinement

## Step Metadata

| Field | Value |
|-------|-------|
| Start Time | 2025-01-22T00:00:00Z |
| End Time | 2025-01-22T00:00:30Z |
| Duration | ~30 seconds |
| Status | Success |

## Original Request

> an onboarding experience for new users to learn how to create collections/subcollections/bobbleheads

**Word Count**: 14 words

## Context Provided

- Next.js 16.0.3 with App Router, React 19.2.0 with TypeScript, Tailwind CSS 4
- PostgreSQL with Neon serverless, Drizzle ORM
- Clerk for authentication
- Radix UI components, Lucide React icons
- TanStack React Form for form handling
- Cloudinary for image uploads
- App structure: src/app/(app)/ for authenticated routes
- Components: src/components/ui/ (reusable), src/components/feature/ (feature-specific)
- Server actions in src/lib/actions/
- Existing features: collections, subcollections, bobbleheads CRUD
- Type-safe routing with next-typesafe-url ($path)

## Agent Prompt Sent

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): "an onboarding experience for new users to learn how to create collections/subcollections/bobbleheads"

Using the project context below, expand this request with relevant technical details while maintaining its core intent. Output ONLY the refined paragraph (200-500 words), nothing else.

PROJECT CONTEXT:
- Next.js 16.0.3 with App Router, React 19.2.0 with TypeScript, Tailwind CSS 4
- PostgreSQL with Neon serverless, Drizzle ORM
- Clerk for authentication
- Radix UI components, Lucide React icons
- TanStack React Form for form handling
- Cloudinary for image uploads
- App structure: src/app/(app)/ for authenticated routes
- Components: src/components/ui/ (reusable), src/components/feature/ (feature-specific)
- Server actions in src/lib/actions/
- Existing features: collections, subcollections, bobbleheads CRUD
- Type-safe routing with next-typesafe-url ($path)

The onboarding should guide new users through the key workflows of the platform. Focus on the core intent: helping new users understand how to create and organize their bobblehead collections effectively.
```

## Agent Response (Full)

Implement a guided onboarding experience for new users that introduces them to the core workflows of creating collections, subcollections, and bobbleheads on the Head Shakers platform. The onboarding should activate automatically after a user's first successful Clerk authentication, detected by checking a `hasCompletedOnboarding` flag stored in the user profile database table via Drizzle ORM. The experience should consist of an interactive multi-step wizard built using Radix UI Dialog components for modal overlays, with progress indicators and navigation controls styled with Tailwind CSS 4. The wizard should walk users through three primary workflows: first, creating their initial collection with a name, description, and optional cover image uploaded via Cloudinary integration; second, understanding how subcollections can organize bobbleheads within a parent collection for better categorization; and third, adding their first bobblehead entry with key fields like name, photos, acquisition details, and specifications using TanStack React Form for validation and form state management. Each step should include contextual tooltips or highlight overlays that point to relevant UI elements, helping users understand the interface layout within the authenticated app routes under `src/app/(app)/`. The onboarding wizard component should be created in `src/components/feature/onboarding/` and utilize type-safe navigation with $path from next-typesafe-url to guide users between the collections, subcollections, and bobblehead creation pages. A server action in `src/lib/actions/onboarding/` should handle marking the onboarding as complete and updating the user's profile flag via a facade layer for proper transaction handling. Users should have the option to skip the onboarding at any point and access it later from their profile settings, with the skip action also persisted to prevent the wizard from appearing repeatedly. The implementation should include smooth transitions between steps, clear visual feedback using Lucide React icons for success states and navigation cues, and responsive design to ensure the onboarding works seamlessly across desktop and mobile viewports.

## Refined Feature Request

Implement a guided onboarding experience for new users that introduces them to the core workflows of creating collections, subcollections, and bobbleheads on the Head Shakers platform. The onboarding should activate automatically after a user's first successful Clerk authentication, detected by checking a `hasCompletedOnboarding` flag stored in the user profile database table via Drizzle ORM. The experience should consist of an interactive multi-step wizard built using Radix UI Dialog components for modal overlays, with progress indicators and navigation controls styled with Tailwind CSS 4. The wizard should walk users through three primary workflows: first, creating their initial collection with a name, description, and optional cover image uploaded via Cloudinary integration; second, understanding how subcollections can organize bobbleheads within a parent collection for better categorization; and third, adding their first bobblehead entry with key fields like name, photos, acquisition details, and specifications using TanStack React Form for validation and form state management. Each step should include contextual tooltips or highlight overlays that point to relevant UI elements, helping users understand the interface layout within the authenticated app routes under `src/app/(app)/`. The onboarding wizard component should be created in `src/components/feature/onboarding/` and utilize type-safe navigation with $path from next-typesafe-url to guide users between the collections, subcollections, and bobblehead creation pages. A server action in `src/lib/actions/onboarding/` should handle marking the onboarding as complete and updating the user's profile flag via a facade layer for proper transaction handling. Users should have the option to skip the onboarding at any point and access it later from their profile settings, with the skip action also persisted to prevent the wizard from appearing repeatedly. The implementation should include smooth transitions between steps, clear visual feedback using Lucide React icons for success states and navigation cues, and responsive design to ensure the onboarding works seamlessly across desktop and mobile viewports.

## Validation Results

| Check | Result |
|-------|--------|
| Format (single paragraph) | Pass |
| Word Count | ~380 words |
| Length Ratio (vs original) | ~27x (exceeds 2-4x target but comprehensive) |
| Core Intent Preserved | Pass |
| Technical Context Added | Pass |

## Notes

The refined request successfully captures the core intent while adding essential technical details about:
- Authentication integration (Clerk + hasCompletedOnboarding flag)
- UI components (Radix UI Dialog, Tailwind CSS)
- Form handling (TanStack React Form)
- Image uploads (Cloudinary)
- Navigation (type-safe $path)
- File structure (components, actions, facades)
- Skip/resume functionality
