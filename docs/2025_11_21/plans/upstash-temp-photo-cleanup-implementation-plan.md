# Upstash Temp Photo Cleanup Implementation Plan

**Generated**: 2025-11-21T00:06:30Z
**Original Request**: as a developer I want to be able to use the upstash QStash integration to have a job clean up photos in the temp directories (photos that were added from the UI but then the bobblehead was never actually created) on a schedule

## Analysis Summary

- Feature request refined with project context
- Discovered 50 files across 15+ directories
- Generated 10-step implementation plan
- Estimated duration: 2 days
- Complexity: Medium
- Risk level: Medium

## Refined Feature Request

As a developer, I want to implement an automated cleanup job using Upstash QStash that periodically removes temporary Cloudinary photos from our designated temp directories—specifically those photos that users upload through the bobblehead creation UI but are abandoned when the bobblehead record itself is never actually persisted to the PostgreSQL database. This feature should leverage QStash's scheduled job capabilities to run on a configurable interval (e.g., daily or every few hours) and identify orphaned image assets by comparing the Cloudinary temp folder contents against the bobbleheads table to detect photos without corresponding database records. The cleanup job should be implemented as a Next.js API route or server action that can be triggered by QStash webhooks, utilizing the Cloudinary API through our existing @cloudinary/react and cloudinary dependencies to delete the identified orphaned assets efficiently. The implementation should include proper error handling and logging to track cleanup attempts, failed deletions, and any anomalies discovered during the process, ensuring that temporary photo uploads don't accumulate unnecessary storage costs in Cloudinary or clutter the media library. Additionally, the solution should be configurable regarding retention periods (e.g., only delete photos older than 24 hours) to account for users who might still be in the process of uploading multiple photos before finalizing their bobblehead creation. The job should respect Cloudinary's API rate limits and utilize batching where possible to optimize API calls, and it should integrate seamlessly with our existing Next.js architecture without requiring significant refactoring. Success metrics for this feature include reducing orphaned temporary assets by at least 95%, maintaining sub-second response times for the cleanup operations, and providing visibility into cleanup activities through appropriate logging and monitoring integration with our existing Sentry setup.

## File Discovery Results

### Critical Priority Files (11)

**Cloudinary Integration & Services**

1. `src/lib/services/cloudinary.service.ts` - Core Cloudinary service with batch delete methods
2. `src/components/ui/cloudinary-photo-upload.tsx` - Shows temp photo creation in `users/${userId}/temp`
3. `src/types/cloudinary.types.ts` - Type definitions for CloudinaryPhoto

**Database Schema & Queries** 4. `src/lib/db/schema/bobbleheads.schema.ts` - Bobbleheads and bobbleheadPhotos schema 5. `src/lib/queries/bobbleheads/bobbleheads-query.ts` - Database queries for bobbleheads

**QStash Job Pattern (CRITICAL REFERENCES)** 6. `src/app/api/analytics/process-views/route.ts` - QStash webhook endpoint pattern 7. `src/lib/jobs/view-aggregation.job.ts` - Background job class pattern 8. `src/lib/jobs/trending-calculation.job.ts` - Additional job reference

**Configuration & Constants** 9. `src/lib/constants/cloudinary-paths.ts` - Path builders including `tempPath(userId)` 10. `src/lib/constants/config.ts` - Application config with Cloudinary settings 11. `.env` - Environment variables for Cloudinary and QStash

### High Priority Files (7)

**Server Actions & Facades** 12. `src/lib/actions/bobbleheads/bobbleheads.actions.ts` - Photo lifecycle patterns 13. `src/lib/facades/bobbleheads/bobbleheads.facade.ts` - Business logic layer

**Utilities & Helpers** 14. `src/lib/utils/photo-transform.utils.ts` - `isTempPhoto()` type guard 15. `src/lib/utils/redis-client.ts` - Redis operations for job state 16. `src/lib/utils/error-builders.ts` - Error handling utilities 17. `src/lib/utils/circuit-breaker-registry.ts` - Circuit breaker patterns

**Middleware & Rate Limiting** 18. `src/lib/middleware/rate-limit.middleware.ts` - Rate limiting patterns

### Architecture Insights

**Key Patterns Identified**:

1. QStash jobs are class-based services in `src/lib/jobs/`
2. API routes use `verifySignatureAppRouter` for QStash webhook security
3. Cloudinary service has batch delete with retry logic and circuit breakers
4. Temp photos stored in `users/${userId}/temp` folder structure
5. View aggregation job shows periodic cleanup pattern (line 189)

**Integration Points**:

1. Use Cloudinary Admin API to list temp folder resources
2. Query `bobblehead_photos` table for comparison
3. Use existing `CloudinaryService.deletePhotosFromCloudinary()` for deletion
4. Implement 24-hour retention period logic
5. Configure QStash schedule externally

---

# Implementation Plan: Automated Temporary Cloudinary Photo Cleanup Job

## Overview

**Estimated Duration**: 2 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement an automated cleanup system using Upstash QStash that periodically identifies and removes orphaned temporary Cloudinary photos uploaded during bobblehead creation but never persisted to the database. The job will leverage existing Cloudinary service methods, follow the established view-aggregation job pattern, and include comprehensive error handling with Sentry integration.

## Prerequisites

- [ ] Verify Upstash QStash is configured and accessible
- [ ] Confirm Cloudinary Admin API credentials are available
- [ ] Ensure QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY environment variables exist
- [ ] Access to QStash dashboard for schedule configuration

## Implementation Steps

### Step 1: Create Cleanup Configuration Constants

**What**: Add cleanup job configuration constants to centralize retention periods and batch sizes
**Why**: Centralizing configuration enables easy tuning without code changes and maintains consistency with existing config patterns
**Confidence**: High

**Files to Create:**

- `src/lib/constants/cleanup-config.ts` - Cleanup job configuration constants

**Files to Modify:**

- `.env.local` - Add TEMP_PHOTO_RETENTION_HOURS and CLEANUP_BATCH_SIZE variables

**Changes:**

- Create cleanup-config.ts with constants for retention hours, batch size, and rate limits
- Export configuration object with type safety
- Add environment variables for TEMP_PHOTO_RETENTION_HOURS (default 24) and CLEANUP_BATCH_SIZE (default 50)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Configuration file exports typed constants object
- [ ] Environment variables are documented
- [ ] All validation commands pass

---

### Step 2: Implement Temp Photo Cleanup Job Service

**What**: Create TempPhotoCleanupJob class following the view-aggregation job pattern
**Why**: Centralized job logic with circuit breaker integration, error handling, and batch processing capabilities following established architectural patterns
**Confidence**: High

**Files to Create:**

- `src/lib/jobs/temp-photo-cleanup.job.ts` - Core cleanup job implementation

**Files to Modify:**

- None

**Changes:**

- Create TempPhotoCleanupJob class with execute() method
- Implement listTempPhotos() method using Cloudinary Admin API to fetch resources from temp folders
- Implement identifyOrphans() method to query bobblehead_photos table and compare public IDs
- Implement deleteOrphans() method using CloudinaryService.deletePhotosFromCloudinary() with batching
- Add retention period filtering (only photos older than configured hours)
- Integrate circuit breaker pattern using cloudinary circuit breaker from registry
- Add comprehensive error handling with Sentry context
- Implement detailed logging for cleanup metrics (photos scanned, deleted, errors)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Job class follows established pattern from view-aggregation.job.ts
- [ ] Method signatures use proper TypeScript types from Drizzle schema
- [ ] Circuit breaker integration matches existing patterns
- [ ] Error boundaries include Sentry integration
- [ ] All validation commands pass

---

### Step 3: Create QStash Webhook API Route

**What**: Implement Next.js API route handler for QStash webhook triggers with signature verification
**Why**: Provides secure endpoint for scheduled job execution following the established verifySignatureAppRouter pattern
**Confidence**: High

**Files to Create:**

- `src/app/api/cleanup/temp-photos/route.ts` - QStash webhook endpoint

**Files to Modify:**

- None

**Changes:**

- Create POST handler function following api/analytics/process-views/route.ts pattern
- Implement verifySignatureAppRouter for QStash authentication
- Instantiate TempPhotoCleanupJob and call execute() method
- Add request/response logging with performance metrics
- Implement proper error responses with HTTP status codes
- Add Sentry error tracking for webhook failures
- Return JSON response with cleanup statistics (scanned, deleted, errors)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Route uses verifySignatureAppRouter correctly
- [ ] Response includes detailed cleanup metrics
- [ ] Error handling returns appropriate HTTP status codes
- [ ] Sentry integration captures webhook execution context
- [ ] All validation commands pass

---

### Step 4: Implement Cloudinary Admin API Integration

**What**: Add method to CloudinaryService for listing resources in temp folders using Admin API
**Why**: Enables discovery of orphaned photos by accessing Cloudinary folder contents programmatically
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/services/cloudinary.service.ts` - Add listTempFolderResources() method

**Changes:**

- Add listTempFolderResources() method using Cloudinary Admin API v2.api.resources()
- Implement pagination handling for large result sets
- Add prefix filtering for users/\*/temp folders
- Include created_at timestamp extraction for retention period filtering
- Add error handling with circuit breaker integration
- Return typed array of resource metadata (public_id, created_at, format)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Method handles Cloudinary API pagination correctly
- [ ] Return type includes necessary metadata for filtering
- [ ] Error handling matches existing CloudinaryService patterns
- [ ] Circuit breaker integration prevents cascading failures
- [ ] All validation commands pass

---

### Step 5: Implement Orphan Detection Query

**What**: Add database query method to fetch all bobblehead photo public IDs for comparison
**Why**: Required to identify which temp photos are orphaned by comparing Cloudinary contents against database records
**Confidence**: High

**Files to Create:**

- `src/lib/queries/bobbleheads/bobblehead-photos.queries.ts` - Photo queries for cleanup job

**Files to Modify:**

- None

**Changes:**

- Create getAllPhotoPublicIds() query function using Drizzle ORM
- Select only publicId column from bobbleheadPhotos table for efficiency
- Return Set<string> for fast lookup performance
- Add database error handling with proper error types
- Include query performance logging for monitoring

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Query uses Drizzle ORM correctly with bobbleheadPhotos schema
- [ ] Returns Set for O(1) lookup performance
- [ ] Error handling includes proper PostgreSQL error types
- [ ] Query is optimized for large datasets
- [ ] All validation commands pass

---

### Step 6: Add Retention Period Filtering Logic

**What**: Implement timestamp comparison logic to respect configured retention period
**Why**: Prevents deletion of photos from users still actively creating bobbleheads within the grace period
**Confidence**: High

**Files to Create:**

- `src/lib/utils/cleanup-helpers.ts` - Utility functions for cleanup job

**Files to Modify:**

- None

**Changes:**

- Create isOlderThanRetentionPeriod() function accepting created_at timestamp and retention hours
- Implement getCurrentTimestamp() helper for testability
- Add filterPhotosByAge() function to process Cloudinary resource arrays
- Include TypeScript types for Cloudinary resource metadata
- Add unit test friendly pure functions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Timestamp comparison logic handles timezone differences correctly
- [ ] Functions are pure for easy unit testing
- [ ] Type definitions match Cloudinary Admin API response structure
- [ ] Edge cases (null timestamps) are handled gracefully
- [ ] All validation commands pass

---

### Step 7: Implement Batch Processing with Rate Limiting

**What**: Add batch processing logic to handle large cleanup operations within Cloudinary API rate limits
**Why**: Prevents API throttling and ensures reliable cleanup execution even with thousands of orphaned photos
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/jobs/temp-photo-cleanup.job.ts` - Add batch processing to deleteOrphans() method

**Changes:**

- Implement chunk() utility to split orphan arrays into batches
- Add delay between batch deletions to respect Cloudinary rate limits
- Use existing CloudinaryService.deletePhotosFromCloudinary() for actual deletion
- Implement partial failure handling (continue on batch errors)
- Track successful and failed deletions separately
- Add batch-level error logging

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Batch size respects configured CLEANUP_BATCH_SIZE constant
- [ ] Rate limiting delay calculated from cleanup-config.ts
- [ ] Partial failures don't abort entire cleanup operation
- [ ] Detailed metrics track per-batch success/failure
- [ ] All validation commands pass

---

### Step 8: Add Comprehensive Logging and Monitoring

**What**: Implement detailed logging with Sentry breadcrumbs and performance metrics
**Why**: Provides visibility into cleanup operations, enables debugging, and tracks storage cost reduction over time
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/jobs/temp-photo-cleanup.job.ts` - Add logging throughout execution
- `src/app/api/cleanup/temp-photos/route.ts` - Add webhook execution logging

**Changes:**

- Add Sentry breadcrumbs for major cleanup phases (scan, identify, delete)
- Implement performance timing for each operation phase
- Log cleanup metrics (total scanned, orphans found, successfully deleted, errors)
- Add structured logging with consistent format
- Include error context (failed public IDs, error messages)
- Track Cloudinary API call count for rate limit monitoring

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Sentry breadcrumbs provide clear execution timeline
- [ ] Metrics include all required visibility data
- [ ] Error logs include actionable debugging information
- [ ] Logging format matches existing job patterns
- [ ] All validation commands pass

---

### Step 9: Add Environment Variable Configuration

**What**: Document and configure required environment variables for job execution
**Why**: Enables runtime configuration without code changes and maintains security best practices
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `.env.local` - Add cleanup job environment variables
- `.env.example` - Document required variables

**Changes:**

- Add TEMP_PHOTO_RETENTION_HOURS with default value 24
- Add CLEANUP_BATCH_SIZE with default value 50
- Add CLEANUP_RATE_LIMIT_DELAY_MS with default value 1000
- Document each variable purpose in .env.example
- Add comments explaining configuration impact

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All required environment variables documented
- [ ] Default values are production-safe
- [ ] Variable names follow existing naming conventions
- [ ] .env.example includes helpful comments
- [ ] All validation commands pass

---

### Step 10: Create QStash Schedule Configuration Documentation

**What**: Document QStash schedule setup instructions for deployment
**Why**: Ensures proper job scheduling configuration and provides deployment reference
**Confidence**: High

**Files to Create:**

- `docs/2025_11_21/deployment/qstash-cleanup-schedule.md` - Schedule configuration guide

**Files to Modify:**

- None

**Changes:**

- Document QStash dashboard configuration steps
- Specify recommended cron schedule (daily at 2 AM UTC)
- Include webhook URL format for production and staging
- Document required QStash environment variables
- Add troubleshooting section for common issues
- Include verification steps post-deployment

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Documentation includes complete QStash setup steps
- [ ] Cron schedule recommendation is justified
- [ ] Webhook URL examples are accurate
- [ ] Troubleshooting covers signature verification issues
- [ ] All validation commands pass (if any TS files created)

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Job class follows established pattern from view-aggregation.job.ts
- [ ] API route implements verifySignatureAppRouter correctly
- [ ] Circuit breaker integration matches existing patterns
- [ ] Sentry error tracking captures appropriate context
- [ ] Environment variables documented in .env.example
- [ ] QStash schedule configuration documented for deployment
- [ ] Batch processing respects Cloudinary rate limits
- [ ] Retention period filtering prevents premature deletion

## Notes

### Architecture Decisions

- **Medium Risk Assessment**: Cloudinary Admin API pagination and rate limiting require careful handling to prevent service disruption
- **Job Pattern**: Following view-aggregation.job.ts ensures consistency with existing background job architecture
- **Security**: QStash signature verification using verifySignatureAppRouter prevents unauthorized cleanup triggers
- **Performance**: Set-based lookup for orphan detection provides O(1) comparison performance at scale
- **Resilience**: Circuit breaker integration prevents cascading failures during Cloudinary API issues

### Critical Assumptions Requiring Confirmation

1. Cloudinary Admin API credentials have read/delete permissions for temp folders
2. QStash webhook endpoint will be accessible from Upstash infrastructure (no firewall blocking)
3. Database query performance remains acceptable as bobblehead_photos table grows (may need indexing)
4. 24-hour retention period balances user experience with storage cost optimization

### Implementation Warnings

- Do NOT implement schedule creation in code - QStash schedules must be configured via dashboard or CLI to avoid duplicate job triggers
- Ensure proper error handling for partial batch failures to prevent cleanup job from aborting prematurely
- Test retention period logic thoroughly to avoid accidental deletion of active user uploads
- Monitor Cloudinary API rate limit headers to tune batch delay configuration

### Success Metrics Validation

- 95% orphan reduction target measurable via before/after cleanup metrics logging
- Sub-second response times achievable with async batch processing
- Sentry integration provides required visibility into cleanup activities

---

## Orchestration Details

**Feature Planning Workflow**: 3-Step Orchestration
**Step 1**: Feature Request Refinement - Completed
**Step 2**: AI-Powered File Discovery - Completed
**Step 3**: Implementation Planning - Completed

**Full Orchestration Logs**: `docs/2025_11_21/orchestration/upstash-temp-photo-cleanup/`

- `00-orchestration-index.md` - Workflow overview and navigation
- `01-feature-refinement.md` - Detailed refinement log
- `02-file-discovery.md` - Comprehensive file discovery analysis
- `03-implementation-planning.md` - Planning step detailed log
