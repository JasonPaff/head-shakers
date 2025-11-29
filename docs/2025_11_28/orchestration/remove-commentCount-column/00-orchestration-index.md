# Remove commentCount Column - Orchestration Index

**Feature**: Remove commentCount column from collections database
**Created**: 2025-11-28
**Status**: Complete

## Workflow Overview

This orchestration removes the denormalized `commentCount` column from the collections table and updates all queries to use proper JOIN operations to calculate comment counts dynamically.

## Navigation

- [Step 1: Feature Refinement](./01-feature-refinement.md) - ✅ Complete
- [Step 2: File Discovery](./02-file-discovery.md) - ✅ Complete
- [Step 3: Implementation Planning](./03-implementation-planning.md) - ✅ Complete

## Original Request

> I'd like you to remove the commentCount column from the collections database. Any queries that were using the commentCount field should instead include the proper joins to fetch that information differently.

## Summary

### Step 1: Feature Refinement

Enhanced the original request with project-specific technical context including Drizzle ORM, Neon serverless, next-safe-action, and the facade/query layer architecture.

### Step 2: File Discovery

Discovered 25+ relevant files across:

- **Critical**: Schema file with column definition, indexes, and constraints
- **High**: 3 query files selecting/updating commentCount
- **Medium**: Facades and validation schemas
- **Supporting**: Constants and test files

### Step 3: Implementation Planning

Generated 12-step implementation plan:

1. Update Collections Schema
2. Generate Database Migration
3. Update CollectionsQuery - getBrowseCategoriesAsync
4. Update CollectionsQuery - getBrowseCollectionsAsync
5. Update FeaturedContentQuery - getFeaturedCollectionsAsync
6. Remove Increment/Decrement from SocialQuery
7. Update SocialFacade (verify)
8. Remove COLLECTION.COMMENT_COUNT Constant
9. Update Test Fixtures and Mock Data
10. Update Integration Tests
11. Run Database Migration
12. Run Full Test Suite

## Output Files

- **Implementation Plan**: `docs/2025_11_28/plans/remove-commentCount-column-implementation-plan.md`
- **Orchestration Logs**: `docs/2025_11_28/orchestration/remove-commentCount-column/`
