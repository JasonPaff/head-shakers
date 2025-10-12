# File Discovery Timeout Fixes

**Date**: 2025-10-11
**Issue**: File discovery process timing out after 30s on /feature-planner page
**Status**: ✅ Implemented & Tested

## Problems Identified

1. **Database Evidence**: 4 stuck sessions in "processing" status that never completed
2. **No Error Recovery**: Failed/timed-out agents never update database to 'failed' status
3. **Frontend Timeout**: Default fetch timeout (30s) conflicts with long-running agent operations
4. **Missing Error Handling**: No error handling wrapper in facade method to catch agent failures
5. **No Session Cleanup**: No mechanism to mark abandoned sessions as failed

## Fixes Implemented

### 1. Error Handling in Facade ✅

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

- Added try/catch wrapper around file discovery execution
- On error, updates session status to 'failed' with error message
- Reverts plan status back to 'refining' state for recovery
- Prevents database from having stuck sessions in 'processing' state

### 2. Frontend Timeout Configuration ✅

**File**: `src/app/(app)/feature-planner/page.tsx`

- Added `signal: AbortSignal.timeout(180000)` to fetch calls (3 minute timeout)
- Applied to both file discovery and implementation planning endpoints
- Prevents frontend from hanging on slow operations

### 3. API Route Timeout Configuration ✅

**Files**:

- `src/app/api/feature-planner/discover/route.ts`
- `src/app/api/feature-planner/plan/route.ts`

- Added `export const maxDuration = 180` (3 minutes for Vercel)
- Ensures serverless functions don't timeout prematurely

### 4. Session Cleanup Utility ✅

**File**: `src/lib/utils/cleanup-stuck-sessions.ts`

Created utility functions to mark stuck sessions as failed:

- `cleanupStuckFileDiscoverySessions()` - Marks stuck discovery sessions
- `cleanupStuckPlanGenerations()` - Marks stuck plan generations
- `cleanupAllStuckSessions()` - Cleans up all stuck sessions

Default threshold: 10 minutes

### 5. Database Cleanup ✅

Cleaned up 4 existing stuck sessions in the database:

```sql
UPDATE file_discovery_sessions
SET status = 'failed',
    error_message = 'Session timed out and was automatically marked as failed',
    completed_at = NOW()
WHERE status = 'processing'
  AND created_at < NOW() - INTERVAL '10 minutes';
```

## Timeout Configuration Summary

| Layer                 | Timeout    | Purpose                   |
| --------------------- | ---------- | ------------------------- |
| Frontend Fetch        | 3 minutes  | Prevents UI from hanging  |
| API Route (Vercel)    | 3 minutes  | Serverless function limit |
| Agent Circuit Breaker | Default    | Service-level resilience  |
| Agent Retry Logic     | 2 attempts | Automatic recovery        |

## Testing

- ✅ Lint checks pass
- ✅ TypeScript compilation successful
- ✅ 4 stuck sessions cleaned up in database

## Next Steps (Optional Enhancements)

1. **Periodic Cleanup**: Add cron job or background worker to run cleanup utility
2. **UI Improvements**: Add progress feedback showing elapsed time
3. **Retry Logic**: Allow users to retry failed discovery sessions from UI
4. **Monitoring**: Add alerts for high failure rates

## Notes

- The Claude Agent SDK `query()` function does not support a `timeout` option
- Timeout enforcement happens at the circuit breaker and HTTP layers
- All changes follow existing project patterns for error handling
