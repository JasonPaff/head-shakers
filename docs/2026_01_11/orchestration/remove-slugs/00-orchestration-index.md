# Orchestration Index: Remove Slugs from Application

**Feature**: Remove the concept of slugs from the application
**Created**: 2026-01-11T00:00:00.000Z
**Status**: In Progress

## Workflow Overview

This orchestration removes the slug concept from the Head Shakers application. Since routes are now scoped to username and collection, slugs are no longer needed - the collection/bobblehead names can be used directly.

## Step Navigation

| Step | Status | File | Description |
|------|--------|------|-------------|
| 1 | Pending | [01-feature-refinement.md](./01-feature-refinement.md) | Refine feature request with project context |
| 2 | Pending | [02-file-discovery.md](./02-file-discovery.md) | AI-powered file discovery |
| 3 | Pending | [03-implementation-planning.md](./03-implementation-planning.md) | Generate implementation plan |

## Output Files

- **Implementation Plan**: `../plans/remove-slugs-implementation-plan.md`

## Original Request

Remove the concept of slugs from the application, they were necessary when the route was /collection/[collectionSlug] or /bobbleheads/[bobbleheadSlug] but now that the routes are scoped to the user name and collection they are not necessary anymore and we can use the collection/bobblehead name directly without modification. The app is not in production yet so no backwards compatible approach is needed, remove the concept of 'slugs' entirely and use the bobblehead/collection name.
