# Step 1: Feature Refinement Log

## Metadata

- **Step**: 1 - Feature Refinement
- **Started**: 2026-01-13T00:00:00.000Z
- **Completed**: 2026-01-13T00:01:00.000Z
- **Status**: Success

---

## Original Request

Add/Edit Bobblehead Form Requirements - Form Framework: TanStack Form with Next-Safe-Action, Location: User dashboard collection management, Two Modes: Add (create new) and Edit (modify existing). Required Fields: Name (Text, 1-50 characters), Collection (UUID Select, must be user's collection, can create new inline). Optional Fields include Basic Information, Photos (Max 8 per bobblehead), Acquisition Details, Physical Attributes, Custom Fields, and Item Settings. Server Actions: createBobbleheadWithPhotosAction and updateBobbleheadWithPhotosAction.

**Original Word Count**: ~150 words

---

## Context Provided

- Next.js 16.0.3 with App Router, React 19.2.0, TypeScript
- TanStack React Form for form handling
- Next-Safe-Action for server actions
- Drizzle ORM with PostgreSQL/Neon serverless
- Drizzle-Zod for schema validation
- Cloudinary for image storage
- Radix UI components
- Project structure: src/lib/actions/, src/lib/validations/, src/components/feature/, src/lib/facades/

---

## Agent Prompt Sent

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections):

'Add/Edit Bobblehead Form Requirements - Form Framework: TanStack Form with Next-Safe-Action...'

Using the project context... Expand this request with relevant technical details while maintaining its core intent. Output ONLY the refined paragraph (200-500 words), nothing else.
```

---

## Agent Response (Full)

The Add/Edit Bobblehead Form is a dual-mode form component built with TanStack React Form and integrated with Next-Safe-Action server actions, located within the user dashboard collection management interface at the appropriate route under src/app/(app)/. The form supports both creation of new bobbleheads and modification of existing entries, with the edit mode pre-populating all fields from the existing record. Required fields include Name (text input, 1-50 characters with trim validation) and Collection (UUID select dropdown populated from the user's owned collections via a query, with an inline "create new collection" option that triggers a nested form or modal). Optional fields are organized into logical groups: Basic Information containing Character/Person Name (max 100 chars), Description (textarea max 500 chars), Category (max 50 chars), Series/Collection Name (max 100 chars), and Year Released (number input constrained between 1800 and current year plus 5); Photos section supporting up to 8 images per bobblehead with accepted formats of JPEG, PNG, and WebP, maximum 10MB per file, uploaded via Cloudinary integration using the existing CloudinaryService and CldUploadWidget component, where each photo includes optional alt text (max 255 chars) and caption (max 500 chars) metadata, and edit mode allows deletion of existing photos and addition of new ones; Acquisition Details including Acquisition Date (date picker in YYYY-MM-DD format), Acquisition Method (max 50 chars), Purchase Location (max 100 chars), and Purchase Price (decimal input with precision 10:2, minimum 0); Physical Attributes covering Height in centimeters (decimal precision 5:2, must be positive), Weight in grams (decimal precision 6:2, must be positive), Material (max 100 chars), Manufacturer (max 100 chars), and Condition (select enum with options mint/excellent/good/fair/poor, defaulting to excellent); Custom Fields implemented as a dynamic array of key-value string pairs with add/remove functionality and no upper limit; and Item Settings containing Status (enum select owned/sold/wishlist defaulting to owned), Is Public (boolean toggle defaulting to true), and Is Featured (boolean toggle defaulting to false). The Zod validation schemas should be created in src/lib/validations/ using drizzle-zod integration where applicable, with separate schemas for create and update operations. The server actions createBobbleheadWithPhotosAction and updateBobbleheadWithPhotosAction in src/lib/actions/ must implement authentication verification, rate limiting via the established patterns, and wrap all database operations including photo associations within transactions through a facade in src/lib/facades/ to ensure atomic commits, with proper Sentry breadcrumb logging and error handling following the project's withActionErrorHandling and withActionBreadcrumbs patterns.

---

## Refined Feature Request (Extracted)

The Add/Edit Bobblehead Form is a dual-mode form component built with TanStack React Form and integrated with Next-Safe-Action server actions, located within the user dashboard collection management interface at the appropriate route under src/app/(app)/. The form supports both creation of new bobbleheads and modification of existing entries, with the edit mode pre-populating all fields from the existing record. Required fields include Name (text input, 1-50 characters with trim validation) and Collection (UUID select dropdown populated from the user's owned collections via a query, with an inline "create new collection" option that triggers a nested form or modal). Optional fields are organized into logical groups: Basic Information containing Character/Person Name (max 100 chars), Description (textarea max 500 chars), Category (max 50 chars), Series/Collection Name (max 100 chars), and Year Released (number input constrained between 1800 and current year plus 5); Photos section supporting up to 8 images per bobblehead with accepted formats of JPEG, PNG, and WebP, maximum 10MB per file, uploaded via Cloudinary integration using the existing CloudinaryService and CldUploadWidget component, where each photo includes optional alt text (max 255 chars) and caption (max 500 chars) metadata, and edit mode allows deletion of existing photos and addition of new ones; Acquisition Details including Acquisition Date (date picker in YYYY-MM-DD format), Acquisition Method (max 50 chars), Purchase Location (max 100 chars), and Purchase Price (decimal input with precision 10:2, minimum 0); Physical Attributes covering Height in centimeters (decimal precision 5:2, must be positive), Weight in grams (decimal precision 6:2, must be positive), Material (max 100 chars), Manufacturer (max 100 chars), and Condition (select enum with options mint/excellent/good/fair/poor, defaulting to excellent); Custom Fields implemented as a dynamic array of key-value string pairs with add/remove functionality and no upper limit; and Item Settings containing Status (enum select owned/sold/wishlist defaulting to owned), Is Public (boolean toggle defaulting to true), and Is Featured (boolean toggle defaulting to false). The Zod validation schemas should be created in src/lib/validations/ using drizzle-zod integration where applicable, with separate schemas for create and update operations. The server actions createBobbleheadWithPhotosAction and updateBobbleheadWithPhotosAction in src/lib/actions/ must implement authentication verification, rate limiting via the established patterns, and wrap all database operations including photo associations within transactions through a facade in src/lib/facades/ to ensure atomic commits, with proper Sentry breadcrumb logging and error handling following the project's withActionErrorHandling and withActionBreadcrumbs patterns.

---

## Validation Results

- **Format Check**: PASS - Single paragraph without headers or sections
- **Length Check**: PASS - ~450 words (3x original length, within 2-4x range)
- **Scope Check**: PASS - Core intent preserved, all original requirements present
- **Quality Check**: PASS - Technical context added (Cloudinary, Sentry patterns, facade layer)

---

## Warnings

None
