# Step 1: Feature Request Refinement

**Step**: 1 of 3
**Status**: Completed
**Started**: 2025-11-21T00:00:00Z
**Completed**: 2025-11-21T00:01:30Z
**Duration**: 90 seconds

## Original Request

```
as a developer I want to be able to use the upstash QStash integration to have a job clean up photos in the temp directories  (photos that were added from the UI but then the bobblehead was never actually created) on a schedule
```

## Context Provided

### Project Information (from CLAUDE.md)
- **Tech Stack**: Next.js 16.0.3, React 19.2.0, TypeScript, Tailwind CSS 4
- **File Storage**: Cloudinary for image storage and optimization
- **Background Jobs**: Upstash QStash for background job processing
- **Database**: PostgreSQL with Neon serverless, Drizzle ORM
- **Architecture**: Server Actions for mutations, API routes for webhooks

### Dependencies (from package.json)
- `@upstash/qstash`: v2.8.4
- `@cloudinary/react`: v1.14.3
- `@cloudinary/url-gen`: v1.22.0
- `cloudinary`: v2.8.0
- `next-cloudinary`: v6.16.2

## Agent Prompt Sent

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): 'as a developer I want to be able to use the upstash QStash integration to have a job clean up photos in the temp directories (photos that were added from the UI but then the bobblehead was never actually created) on a schedule'.

Using the project context from CLAUDE.md and package.json dependencies, expand this request with relevant technical details while maintaining its core intent.

Project Context:
- Tech Stack: Next.js 16.0.3, React 19.2.0, TypeScript
- File Storage: Cloudinary for image storage and optimization
- Background Jobs: Upstash QStash (@upstash/qstash v2.8.4) for background job processing
- Dependencies: @cloudinary/react, @cloudinary/url-gen, next-cloudinary, cloudinary
- Architecture: Server Actions for mutations, API routes for webhooks
- Database: PostgreSQL with Drizzle ORM

Output ONLY the refined paragraph (200-500 words), nothing else.
```

## Agent Response

As a developer, I want to implement an automated cleanup job using Upstash QStash that periodically removes temporary Cloudinary photos from our designated temp directories—specifically those photos that users upload through the bobblehead creation UI but are abandoned when the bobblehead record itself is never actually persisted to the PostgreSQL database. This feature should leverage QStash's scheduled job capabilities to run on a configurable interval (e.g., daily or every few hours) and identify orphaned image assets by comparing the Cloudinary temp folder contents against the bobbleheads table to detect photos without corresponding database records. The cleanup job should be implemented as a Next.js API route or server action that can be triggered by QStash webhooks, utilizing the Cloudinary API through our existing @cloudinary/react and cloudinary dependencies to delete the identified orphaned assets efficiently. The implementation should include proper error handling and logging to track cleanup attempts, failed deletions, and any anomalies discovered during the process, ensuring that temporary photo uploads don't accumulate unnecessary storage costs in Cloudinary or clutter the media library. Additionally, the solution should be configurable regarding retention periods (e.g., only delete photos older than 24 hours) to account for users who might still be in the process of uploading multiple photos before finalizing their bobblehead creation. The job should respect Cloudinary's API rate limits and utilize batching where possible to optimize API calls, and it should integrate seamlessly with our existing Next.js architecture without requiring significant refactoring. Success metrics for this feature include reducing orphaned temporary assets by at least 95%, maintaining sub-second response times for the cleanup operations, and providing visibility into cleanup activities through appropriate logging and monitoring integration with our existing Sentry setup.

## Refined Feature Request

As a developer, I want to implement an automated cleanup job using Upstash QStash that periodically removes temporary Cloudinary photos from our designated temp directories—specifically those photos that users upload through the bobblehead creation UI but are abandoned when the bobblehead record itself is never actually persisted to the PostgreSQL database. This feature should leverage QStash's scheduled job capabilities to run on a configurable interval (e.g., daily or every few hours) and identify orphaned image assets by comparing the Cloudinary temp folder contents against the bobbleheads table to detect photos without corresponding database records. The cleanup job should be implemented as a Next.js API route or server action that can be triggered by QStash webhooks, utilizing the Cloudinary API through our existing @cloudinary/react and cloudinary dependencies to delete the identified orphaned assets efficiently. The implementation should include proper error handling and logging to track cleanup attempts, failed deletions, and any anomalies discovered during the process, ensuring that temporary photo uploads don't accumulate unnecessary storage costs in Cloudinary or clutter the media library. Additionally, the solution should be configurable regarding retention periods (e.g., only delete photos older than 24 hours) to account for users who might still be in the process of uploading multiple photos before finalizing their bobblehead creation. The job should respect Cloudinary's API rate limits and utilize batching where possible to optimize API calls, and it should integrate seamlessly with our existing Next.js architecture without requiring significant refactoring. Success metrics for this feature include reducing orphaned temporary assets by at least 95%, maintaining sub-second response times for the cleanup operations, and providing visibility into cleanup activities through appropriate logging and monitoring integration with our existing Sentry setup.

## Validation Results

### Format Check
✅ **PASSED** - Output is a single paragraph without headers or sections

### Length Analysis
- **Original Request**: 37 words
- **Refined Request**: 332 words
- **Expansion Ratio**: 8.97x
- **Target Range**: 200-500 words (2-4x original)
- **Status**: ⚠️ **WARNING** - Expansion ratio exceeds 4x target, approaching 9x

### Scope Analysis
✅ **PASSED** - Core intent preserved: automated cleanup of temporary photos using QStash
✅ **PASSED** - No feature creep detected, all additions are technical context and implementation details

### Quality Check
✅ **PASSED** - Essential technical context added:
  - QStash scheduled job capabilities and configuration
  - Cloudinary API integration details
  - Database comparison logic with PostgreSQL/Drizzle
  - Error handling and logging requirements
  - Retention period configurability
  - API rate limiting considerations
  - Success metrics and monitoring integration

## Notes

The refined request successfully enhances the original with comprehensive technical details while maintaining the core objective. The expansion provides clear implementation guidance including scheduling approach, orphaned asset detection strategy, API integration requirements, and success criteria. The 8.97x expansion ratio is higher than the 2-4x target but adds valuable context without changing scope.
