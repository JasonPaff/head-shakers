# Step 3: Implementation Planning

**Step**: 3 of 3
**Status**: Completed
**Started**: 2025-11-21T00:04:00Z
**Completed**: 2025-11-21T00:06:30Z
**Duration**: 150 seconds

## Input Context

### Refined Feature Request

As a developer, I want to implement an automated cleanup job using Upstash QStash that periodically removes temporary Cloudinary photos from our designated temp directories—specifically those photos that users upload through the bobblehead creation UI but are abandoned when the bobblehead record itself is never actually persisted to the PostgreSQL database. This feature should leverage QStash's scheduled job capabilities to run on a configurable interval (e.g., daily or every few hours) and identify orphaned image assets by comparing the Cloudinary temp folder contents against the bobbleheads table to detect photos without corresponding database records. The cleanup job should be implemented as a Next.js API route or server action that can be triggered by QStash webhooks, utilizing the Cloudinary API through our existing @cloudinary/react and cloudinary dependencies to delete the identified orphaned assets efficiently. The implementation should include proper error handling and logging to track cleanup attempts, failed deletions, and any anomalies discovered during the process, ensuring that temporary photo uploads don't accumulate unnecessary storage costs in Cloudinary or clutter the media library. Additionally, the solution should be configurable regarding retention periods (e.g., only delete photos older than 24 hours) to account for users who might still be in the process of uploading multiple photos before finalizing their bobblehead creation. The job should respect Cloudinary's API rate limits and utilize batching where possible to optimize API calls, and it should integrate seamlessly with our existing Next.js architecture without requiring significant refactoring. Success metrics for this feature include reducing orphaned temporary assets by at least 95%, maintaining sub-second response times for the cleanup operations, and providing visibility into cleanup activities through appropriate logging and monitoring integration with our existing Sentry setup.

### File Discovery Summary

- **Total Files Discovered**: 50
- **Critical Priority**: 11 files
- **High Priority**: 7 files
- **Medium Priority**: 12 files
- **Files to Create**: 3
- **Files to Modify**: 3

## Agent Prompt Sent

```
Generate a detailed implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes.

IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples.

[Feature Request, Project Context, and File Discovery Results provided]
```

## Agent Response

The agent successfully generated a comprehensive implementation plan in markdown format with all required sections. The plan includes:

- Overview with duration estimate (2 days), complexity (Medium), and risk level (Medium)
- Quick summary of the implementation approach
- Prerequisites checklist
- 10 detailed implementation steps with complete metadata
- Quality gates for validation
- Notes section with architecture decisions and critical assumptions

## Plan Validation Results

### Format Check
✅ **PASSED** - Output is in markdown format (not XML)

### Template Compliance
✅ **PASSED** - Includes all required sections:
- ✅ Overview with Estimated Duration, Complexity, Risk Level
- ✅ Quick Summary
- ✅ Prerequisites
- ✅ Implementation Steps (10 steps)
- ✅ Quality Gates
- ✅ Notes

### Section Validation

**Overview Section**:
✅ Estimated Duration: 2 days
✅ Complexity: Medium
✅ Risk Level: Medium

**Prerequisites**:
✅ 4 prerequisite items listed with checkboxes
✅ Covers QStash, Cloudinary, environment variables

**Implementation Steps**:
✅ 10 steps total
✅ Each step includes:
  - What (description)
  - Why (reasoning)
  - Confidence level
  - Files to Create/Modify
  - Changes description
  - Validation Commands
  - Success Criteria

**Quality Gates**:
✅ 10 quality gate items
✅ Covers TypeScript, linting, patterns, security, performance

**Notes**:
✅ Architecture Decisions section
✅ Critical Assumptions section
✅ Implementation Warnings section
✅ Success Metrics Validation section

### Command Validation
✅ **PASSED** - All steps touching TypeScript files include `npm run lint:fix && npm run typecheck`

**Steps with Validation**:
- Step 1: ✅ Configuration constants
- Step 2: ✅ Cleanup job service
- Step 3: ✅ API route
- Step 4: ✅ Cloudinary service extension
- Step 5: ✅ Database queries
- Step 6: ✅ Utility functions
- Step 7: ✅ Batch processing
- Step 8: ✅ Logging
- Step 9: ✅ Environment variables
- Step 10: ✅ Documentation (conditional)

### Content Quality
✅ **PASSED** - No code examples included (instruction-only plan)
✅ **PASSED** - Plan addresses all aspects of refined request:
  - ✅ QStash integration with webhook endpoint
  - ✅ Cloudinary Admin API for listing temp photos
  - ✅ Database comparison for orphan detection
  - ✅ Retention period logic (24 hours)
  - ✅ Batch processing with rate limiting
  - ✅ Error handling and logging
  - ✅ Sentry monitoring integration
  - ✅ Configuration management

### Completeness Check
✅ **PASSED** - Plan is comprehensive and actionable:
- ✅ All files from discovery analysis addressed
- ✅ Step-by-step progression is logical
- ✅ Each step has clear success criteria
- ✅ Quality gates ensure implementation quality
- ✅ Notes provide critical context and warnings

## Implementation Plan Overview

### Files to Create (3)

1. **src/lib/constants/cleanup-config.ts** - Step 1
   - Configuration constants for retention and batch sizes

2. **src/lib/jobs/temp-photo-cleanup.job.ts** - Step 2
   - Core cleanup job implementation following view-aggregation pattern

3. **src/app/api/cleanup/temp-photos/route.ts** - Step 3
   - QStash webhook endpoint with signature verification

4. **src/lib/queries/bobbleheads/bobblehead-photos.queries.ts** - Step 5
   - Database queries for orphan detection

5. **src/lib/utils/cleanup-helpers.ts** - Step 6
   - Utility functions for retention period filtering

6. **docs/2025_11_21/deployment/qstash-cleanup-schedule.md** - Step 10
   - Deployment documentation for QStash schedule

### Files to Modify (3)

1. **.env.local** - Steps 1, 9
   - Add cleanup job environment variables

2. **src/lib/services/cloudinary.service.ts** - Step 4
   - Add listTempFolderResources() method

3. **src/lib/jobs/temp-photo-cleanup.job.ts** - Steps 7, 8
   - Add batch processing and logging enhancements

### Implementation Steps Summary

1. **Configuration** (Steps 1, 9) - Setup constants and environment variables
2. **Core Implementation** (Steps 2, 3) - Job service and API endpoint
3. **Integration** (Steps 4, 5) - Cloudinary Admin API and database queries
4. **Business Logic** (Steps 6, 7) - Retention filtering and batch processing
5. **Observability** (Step 8) - Logging and monitoring
6. **Documentation** (Step 10) - Deployment guide

### Complexity Assessment

**Estimated Duration**: 2 days

**Complexity Breakdown**:
- High Confidence Steps: 9/10 (90%)
- Medium Confidence Steps: 1/10 (10%) - Cloudinary Admin API integration
- Low Confidence Steps: 0/10 (0%)

**Risk Assessment**: Medium
- Primary Risk: Cloudinary Admin API pagination and rate limiting
- Mitigation: Follow existing circuit breaker and retry patterns
- Secondary Risk: Database query performance at scale
- Mitigation: Monitor and add indexing if needed

### Quality Gates Summary

The plan includes comprehensive quality gates covering:
- ✅ TypeScript type checking
- ✅ ESLint validation
- ✅ Architectural pattern consistency
- ✅ Security (QStash signature verification)
- ✅ Performance (rate limiting, batch processing)
- ✅ Resilience (circuit breakers)
- ✅ Observability (Sentry integration)
- ✅ Documentation completeness

## Plan Format Analysis

### Format Compliance
✅ **SUCCESS** - Plan generated in markdown format
❌ **NOT XML** - No XML conversion required

### Structure Quality
✅ **Excellent** - Clear hierarchical structure with proper markdown formatting
✅ **Readable** - Sections well-organized with consistent formatting
✅ **Actionable** - Each step has concrete, measurable outcomes

### Template Adherence
✅ **100%** - All required sections present and properly formatted

## Validation Summary

✅ **SUCCESS** - Implementation plan generation completed
✅ **Format Validation** - Markdown format confirmed (not XML)
✅ **Template Compliance** - All required sections present
✅ **Command Validation** - Lint/typecheck commands in all relevant steps
✅ **Content Quality** - No code examples, instruction-only plan
✅ **Completeness** - Addresses all aspects of refined feature request
✅ **Actionability** - Clear, measurable steps with success criteria
✅ **Quality Assurance** - Comprehensive quality gates defined

## Notes

**Plan Strengths**:
1. Follows existing architectural patterns from file discovery
2. Leverages proven job implementation patterns (view-aggregation.job.ts)
3. Uses existing Cloudinary service methods where possible
4. Includes comprehensive error handling and monitoring
5. Addresses all success metrics from refined request

**Implementation Considerations**:
1. Medium risk due to Cloudinary Admin API complexity
2. Requires careful testing of retention period logic
3. Batch processing critical for performance at scale
4. QStash schedule must be configured externally (not in code)
5. Monitor Cloudinary API rate limits during initial deployments

**Next Steps**:
1. Review and approve implementation plan
2. Begin Step 1 (Configuration setup)
3. Follow steps sequentially with validation at each stage
4. Deploy and configure QStash schedule after Step 10
