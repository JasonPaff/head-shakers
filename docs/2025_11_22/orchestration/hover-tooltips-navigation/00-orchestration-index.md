# Hover Tooltips Navigation - Orchestration Index

**Feature**: Add hover tooltips to bobblehead navigation buttons that preview the destination bobblehead name and cover photo before clicking
**Created**: 2025-11-22
**Status**: Completed

## Workflow Overview

This orchestration creates a detailed implementation plan through a 3-step process:

1. **Feature Request Refinement** - Enhance the user request with project context
2. **File Discovery** - Find all relevant files for the implementation
3. **Implementation Planning** - Generate detailed Markdown implementation plan

## Step Logs

| Step | File                                                             | Status    | Duration |
| ---- | ---------------------------------------------------------------- | --------- | -------- |
| 1    | [01-feature-refinement.md](./01-feature-refinement.md)           | Completed | ~15s     |
| 2    | [02-file-discovery.md](./02-file-discovery.md)                   | Completed | ~70s     |
| 3    | [03-implementation-planning.md](./03-implementation-planning.md) | Completed | ~70s     |

## Output Files

- **Implementation Plan**: [`docs/2025_11_22/plans/hover-tooltips-navigation-implementation-plan.md`](../../plans/hover-tooltips-navigation-implementation-plan.md)

## Execution Summary

| Metric                        | Value        |
| ----------------------------- | ------------ |
| Total Duration                | ~2.5 minutes |
| Files Discovered              | 17           |
| Implementation Steps          | 6            |
| Estimated Implementation Time | 4-6 hours    |
| Complexity                    | Medium       |
| Risk Level                    | Low          |

## Original Request

> Add hover tooltips to bobblehead navigation buttons that preview the destination bobblehead name and cover photo before clicking (e.g., "Next: Mike Trout Bobblehead")

## Key Findings

- **photoUrl field exists** but is currently hardcoded to null in facade layer
- **HoverCard component** already exists wrapping @radix-ui/react-hover-card
- **Data is pre-fetched** on server - no additional network requests needed on hover
- **CldImage pattern** well-established using extractPublicIdFromCloudinaryUrl()

## Files to Modify

1. `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Add photo JOIN
2. `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Map photoUrl
3. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Add HoverCard

## Files to Create

1. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation-preview.tsx` - Preview component
