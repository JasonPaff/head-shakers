# Feature Planner Schema Migration Plan

## Overview

This document outlines the plan to migrate all feature planner database tables from the `public` schema to a dedicated `feature_planner` schema. This migration will improve database organization by isolating development-only tools from production application tables.

## Motivation

- **Logical Separation**: Feature planner is a dev-only tool and should be isolated from production bobblehead collection tables
- **Easy Cleanup**: Can drop entire schema without affecting main application
- **Better Organization**: Clear separation in database management tools (pgAdmin, Neon console)
- **Flexible Permissions**: Future ability to restrict schema access independently
- **Reduced Clutter**: Main schema contains only production application tables

## Scope

### Tables to Migrate (8 total)

1. `feature_plans` - Main feature planning workflows
2. `feature_refinements` - Individual refinement attempts
3. `file_discovery_sessions` - File discovery execution details
4. `discovered_files` - Individual discovered files
5. `implementation_plan_generations` - Implementation plan attempts
6. `plan_steps` - Structured implementation steps
7. `plan_step_templates` - Reusable step templates library
8. `plan_execution_logs` - Complete audit trail of executions

### Enums to Migrate (8 total)

1. `complexity`
2. `confidence_level`
3. `estimated_scope`
4. `execution_step`
5. `file_discovery_status`
6. `file_priority`
7. `implementation_plan_status`
8. `plan_status`
9. `refinement_status`
10. `risk_level`
11. `technical_complexity`

**Note**: Total is 11 enums, not 8 as initially listed.

### Cross-Schema Dependencies

- **Foreign Keys to `public.users`**: 3 references
  - `feature_plans.user_id` → `public.users.id`
  - `discovered_files.added_by_user_id` → `public.users.id`
  - `plan_step_templates.user_id` → `public.users.id`

- **No Reverse Dependencies**: No tables in `public` schema reference feature planner tables

## Implementation Steps

### Phase 1: Schema Definition Updates

**File**: `src/lib/db/schema/feature-planner.schema.ts`

#### 1.1 Update Enum Definitions (~5 min)

Add schema specification to all enum definitions:

```typescript
// Before
export const complexityEnum = pgEnum('complexity', ENUMS.FEATURE_PLAN.COMPLEXITY);

// After
export const complexityEnum = pgEnum('complexity', ENUMS.FEATURE_PLAN.COMPLEXITY, {
  schema: 'feature_planner',
});
```

**Apply to all 11 enums** (lines 24-37).

#### 1.2 Update Table Definitions (~15 min)

Add schema parameter to all `pgTable()` calls:

```typescript
// Before
export const featurePlans = pgTable(
  'feature_plans',
  {
    // columns
  },
  (table) => [
    // indexes and constraints
  ],
);

// After
export const featurePlans = pgTable(
  'feature_plans',
  {
    // columns
  },
  (table) => [
    // indexes and constraints
  ],
  {
    schema: 'feature_planner',
  },
);
```

**Apply to all 8 tables**:

- `featurePlans` (line 81)
- `featureRefinements` (line 152)
- `fileDiscoverySessions` (line 228)
- `discoveredFiles` (line 293)
- `implementationPlanGenerations` (line 347)
- `planSteps` (line 415)
- `planStepTemplates` (line 456)
- `planExecutionLogs` (line 502)

#### 1.3 Update Foreign Key References (~10 min)

Update cross-schema foreign key references to explicitly reference `public.users`:

```typescript
// In feature_plans table
userId: uuid('user_id')
  .references(() => users.id, {
    onDelete: 'cascade',
    // Add schema reference if needed by Drizzle
  })
  .notNull(),
```

**Note**: Drizzle should handle this automatically, but verify in generated migration.

### Phase 2: Generate Migration (~5 min)

```bash
npm run db:generate
```

This will create a new migration file in `src/lib/db/migrations/`.

**Expected Migration Contents**:

1. Create schema
2. Create enums in new schema
3. Create tables in new schema
4. Migrate data from old tables to new tables
5. Update foreign key constraints
6. Drop old tables and enums
7. Grant necessary permissions

### Phase 3: Review Generated Migration (~15 min)

**Critical Review Points**:

1. **Schema Creation**: Verify `CREATE SCHEMA feature_planner;` exists
2. **Enum Migration**: Check all enums are created in correct schema
3. **Table Creation**: Verify all tables created with correct schema prefix
4. **Data Migration**: Ensure data is preserved (INSERT INTO ... SELECT FROM)
5. **Foreign Keys**: Verify cross-schema FKs are properly qualified:
   ```sql
   FOREIGN KEY ("user_id") REFERENCES public.users("id")
   ```
6. **Indexes**: All indexes should be recreated
7. **Constraints**: All check constraints should be preserved
8. **Drop Statements**: Old tables/enums dropped AFTER data migration

### Phase 4: Manual Migration Adjustments (~30-60 min)

If Drizzle doesn't generate optimal migration, create manual migration:

**File**: `src/lib/db/migrations/YYYYMMDDHHMMSS_migrate_feature_planner_schema.sql`

```sql
-- ============================================================================
-- CREATE NEW SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS feature_planner;

-- ============================================================================
-- CREATE ENUMS IN NEW SCHEMA
-- ============================================================================
CREATE TYPE feature_planner.complexity AS ENUM('low', 'medium', 'high');
CREATE TYPE feature_planner.confidence_level AS ENUM('high', 'medium', 'low');
CREATE TYPE feature_planner.estimated_scope AS ENUM('small', 'medium', 'large');
CREATE TYPE feature_planner.execution_step AS ENUM('refinement', 'discovery', 'planning');
CREATE TYPE feature_planner.file_discovery_status AS ENUM('pending', 'processing', 'completed', 'failed');
CREATE TYPE feature_planner.file_priority AS ENUM('critical', 'high', 'medium', 'low');
CREATE TYPE feature_planner.implementation_plan_status AS ENUM('pending', 'processing', 'completed', 'failed');
CREATE TYPE feature_planner.plan_status AS ENUM('draft', 'refining', 'discovering', 'planning', 'completed', 'failed', 'cancelled');
CREATE TYPE feature_planner.refinement_status AS ENUM('pending', 'processing', 'completed', 'failed');
CREATE TYPE feature_planner.risk_level AS ENUM('low', 'medium', 'high');
CREATE TYPE feature_planner.technical_complexity AS ENUM('high', 'medium', 'low');

-- ============================================================================
-- CREATE TABLES IN NEW SCHEMA
-- ============================================================================

-- Create feature_plans first (parent table)
CREATE TABLE feature_planner.feature_plans (
  -- Copy exact structure from current table
  -- Update enum references to feature_planner.enum_name
  -- Keep foreign key to public.users
);

-- Create dependent tables
CREATE TABLE feature_planner.feature_refinements (...);
CREATE TABLE feature_planner.file_discovery_sessions (...);
CREATE TABLE feature_planner.discovered_files (...);
CREATE TABLE feature_planner.implementation_plan_generations (...);
CREATE TABLE feature_planner.plan_steps (...);
CREATE TABLE feature_planner.plan_step_templates (...);
CREATE TABLE feature_planner.plan_execution_logs (...);

-- ============================================================================
-- MIGRATE DATA
-- ============================================================================

-- Migrate in order respecting foreign key dependencies
INSERT INTO feature_planner.feature_plans SELECT * FROM public.feature_plans;
INSERT INTO feature_planner.feature_refinements SELECT * FROM public.feature_refinements;
INSERT INTO feature_planner.file_discovery_sessions SELECT * FROM public.file_discovery_sessions;
INSERT INTO feature_planner.discovered_files SELECT * FROM public.discovered_files;
INSERT INTO feature_planner.implementation_plan_generations SELECT * FROM public.implementation_plan_generations;
INSERT INTO feature_planner.plan_steps SELECT * FROM public.plan_steps;
INSERT INTO feature_planner.plan_step_templates SELECT * FROM public.plan_step_templates;
INSERT INTO feature_planner.plan_execution_logs SELECT * FROM public.plan_execution_logs;

-- ============================================================================
-- RECREATE INDEXES
-- ============================================================================

-- Copy all index definitions from original migration
-- Update table references to feature_planner.table_name

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Cross-schema constraints to public.users
ALTER TABLE feature_planner.feature_plans
  ADD CONSTRAINT feature_plans_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE feature_planner.discovered_files
  ADD CONSTRAINT discovered_files_added_by_user_id_users_id_fk
  FOREIGN KEY (added_by_user_id) REFERENCES public.users(id);

ALTER TABLE feature_planner.plan_step_templates
  ADD CONSTRAINT plan_step_templates_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Within-schema constraints
-- (Add all other foreign key constraints)

-- ============================================================================
-- DROP OLD TABLES AND ENUMS
-- ============================================================================

DROP TABLE IF EXISTS public.plan_steps CASCADE;
DROP TABLE IF EXISTS public.plan_execution_logs CASCADE;
DROP TABLE IF EXISTS public.plan_step_templates CASCADE;
DROP TABLE IF EXISTS public.implementation_plan_generations CASCADE;
DROP TABLE IF EXISTS public.discovered_files CASCADE;
DROP TABLE IF EXISTS public.file_discovery_sessions CASCADE;
DROP TABLE IF EXISTS public.feature_refinements CASCADE;
DROP TABLE IF EXISTS public.feature_plans CASCADE;

DROP TYPE IF EXISTS public.complexity CASCADE;
DROP TYPE IF EXISTS public.confidence_level CASCADE;
DROP TYPE IF EXISTS public.estimated_scope CASCADE;
DROP TYPE IF EXISTS public.execution_step CASCADE;
DROP TYPE IF EXISTS public.file_discovery_status CASCADE;
DROP TYPE IF EXISTS public.file_priority CASCADE;
DROP TYPE IF EXISTS public.implementation_plan_status CASCADE;
DROP TYPE IF EXISTS public.plan_status CASCADE;
DROP TYPE IF EXISTS public.refinement_status CASCADE;
DROP TYPE IF EXISTS public.risk_level CASCADE;
DROP TYPE IF EXISTS public.technical_complexity CASCADE;

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA feature_planner TO authenticated;
GRANT ALL ON SCHEMA feature_planner TO authenticated;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA feature_planner TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA feature_planner TO authenticated;
```

### Phase 5: Testing Strategy

#### 5.1 Pre-Migration Verification (~10 min)

```sql
-- Count records in each table
SELECT 'feature_plans' as table_name, COUNT(*) as record_count FROM public.feature_plans
UNION ALL
SELECT 'feature_refinements', COUNT(*) FROM public.feature_refinements
UNION ALL
SELECT 'file_discovery_sessions', COUNT(*) FROM public.file_discovery_sessions
UNION ALL
SELECT 'discovered_files', COUNT(*) FROM public.discovered_files
UNION ALL
SELECT 'implementation_plan_generations', COUNT(*) FROM public.implementation_plan_generations
UNION ALL
SELECT 'plan_steps', COUNT(*) FROM public.plan_steps
UNION ALL
SELECT 'plan_step_templates', COUNT(*) FROM public.plan_step_templates
UNION ALL
SELECT 'plan_execution_logs', COUNT(*) FROM public.plan_execution_logs;

-- Export sample data for verification
SELECT * FROM public.feature_plans ORDER BY created_at DESC LIMIT 5;
```

#### 5.2 Migration Execution (~5 min)

**Development Branch First**:

```bash
# Use Neon dev branch (br-dark-forest-adf48tll)
npm run db:migrate
```

#### 5.3 Post-Migration Verification (~15 min)

```sql
-- Verify schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'feature_planner';

-- Verify all tables exist in new schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'feature_planner'
ORDER BY table_name;

-- Verify record counts match
SELECT 'feature_plans' as table_name, COUNT(*) as record_count FROM feature_planner.feature_plans
UNION ALL
SELECT 'feature_refinements', COUNT(*) FROM feature_planner.feature_refinements
UNION ALL
SELECT 'file_discovery_sessions', COUNT(*) FROM feature_planner.file_discovery_sessions
UNION ALL
SELECT 'discovered_files', COUNT(*) FROM feature_planner.discovered_files
UNION ALL
SELECT 'implementation_plan_generations', COUNT(*) FROM feature_planner.implementation_plan_generations
UNION ALL
SELECT 'plan_steps', COUNT(*) FROM feature_planner.plan_steps
UNION ALL
SELECT 'plan_step_templates', COUNT(*) FROM feature_planner.plan_step_templates
UNION ALL
SELECT 'plan_execution_logs', COUNT(*) FROM feature_planner.plan_execution_logs;

-- Verify sample data integrity
SELECT * FROM feature_planner.feature_plans ORDER BY created_at DESC LIMIT 5;

-- Verify foreign keys
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'feature_planner'
ORDER BY tc.table_name;

-- Verify indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'feature_planner'
ORDER BY tablename, indexname;

-- Verify old tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'feature_plans', 'feature_refinements', 'file_discovery_sessions',
    'discovered_files', 'implementation_plan_generations', 'plan_steps',
    'plan_step_templates', 'plan_execution_logs'
  );
-- Should return 0 rows
```

#### 5.4 Application Testing (~20 min)

Test all feature planner functionality:

1. **Create New Plan**
   - Navigate to `/feature-planner`
   - Enter a feature request
   - Verify plan creation succeeds

2. **Refinement Flow**
   - Start refinement process
   - Verify parallel refinements work
   - Select a refinement

3. **File Discovery**
   - Trigger file discovery
   - Verify files are discovered
   - Add manual files
   - Select files

4. **Plan Generation**
   - Generate implementation plan
   - Verify plan structure
   - Select a plan

5. **View Existing Plans**
   - List all plans
   - View plan details
   - Check execution metrics

6. **API Endpoints**
   - Test all API routes in `/api/feature-planner/`
   - Verify responses

#### 5.5 Query Performance Verification (~10 min)

```sql
-- Test common queries with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM feature_planner.feature_plans
WHERE user_id = 'some-user-id'
ORDER BY created_at DESC
LIMIT 10;

EXPLAIN ANALYZE
SELECT fp.*, fr.refined_request
FROM feature_planner.feature_plans fp
LEFT JOIN feature_planner.feature_refinements fr ON fr.plan_id = fp.id
WHERE fp.status = 'completed'
ORDER BY fp.created_at DESC;

-- Verify indexes are being used
```

### Phase 6: Application Code Verification (~10 min)

**No Code Changes Expected**, but verify:

#### 6.1 Query Files

Check `src/lib/queries/feature-planner/feature-planner.query.ts`:

- All imports work correctly
- Queries execute successfully
- Results are properly typed

#### 6.2 Facade Files

Check `src/lib/facades/feature-planner/feature-planner.facade.ts`:

- All database operations work
- Transactions span schemas correctly

#### 6.3 Action Files

Check `src/lib/actions/feature-planner/feature-planner.actions.ts`:

- Server actions execute successfully

#### 6.4 API Routes

Check all routes in `src/app/api/feature-planner/`:

- All endpoints return correct data
- Error handling works

### Phase 7: Rollback Plan

If issues arise, execute rollback:

#### Option A: Use Neon Branch Reset (~1 min)

```bash
# Reset dev branch to parent state (before migration)
# This discards all changes on the branch
```

Use Neon Console or `/db reset-from-parent` command.

#### Option B: Manual Rollback (~30 min)

Create rollback migration that:

1. Creates tables back in `public` schema
2. Migrates data from `feature_planner` to `public`
3. Recreates indexes and constraints
4. Drops `feature_planner` schema
5. Reverts schema file changes

**File**: `src/lib/db/migrations/YYYYMMDDHHMMSS_rollback_feature_planner_schema.sql`

```sql
-- Reverse the migration steps
-- Create tables in public
-- Copy data back
-- Drop feature_planner schema
```

Also revert code changes:

```bash
git checkout HEAD -- src/lib/db/schema/feature-planner.schema.ts
```

## Risk Assessment

### Low Risk Items ✅

- **Data Loss**: Very low - migration uses INSERT SELECT
- **Application Downtime**: None - Drizzle abstracts schema
- **Query Performance**: No change - same indexes
- **Foreign Key Issues**: Low - only 3 cross-schema FKs

### Medium Risk Items ⚠️

- **Migration Complexity**: Drizzle may not generate perfect migration
- **Enum Handling**: PostgreSQL enums can be tricky to migrate
- **Permission Issues**: Schema permissions must be set correctly

### Mitigation Strategies

1. **Test on Dev Branch First**: Use Neon's dev branch feature
2. **Full Backup Before Migration**: Export all data
3. **Incremental Testing**: Test each phase separately
4. **Easy Rollback**: Use Neon branch reset if needed
5. **Manual Migration**: Prepare manual SQL if Drizzle struggles

## Timeline Estimate

| Phase     | Task                                     | Duration            |
| --------- | ---------------------------------------- | ------------------- |
| 1         | Schema definition updates                | 30 min              |
| 2         | Generate migration                       | 5 min               |
| 3         | Review generated migration               | 15 min              |
| 4         | Manual migration adjustments (if needed) | 30-60 min           |
| 5.1       | Pre-migration verification               | 10 min              |
| 5.2       | Run migration on dev branch              | 5 min               |
| 5.3       | Post-migration verification              | 15 min              |
| 5.4       | Application testing                      | 20 min              |
| 5.5       | Query performance verification           | 10 min              |
| 6         | Application code verification            | 10 min              |
| **Total** |                                          | **2h 30m - 3h 30m** |

## Success Criteria

✅ All 8 tables exist in `feature_planner` schema
✅ All 11 enums exist in `feature_planner` schema
✅ All data successfully migrated (matching record counts)
✅ All indexes recreated and working
✅ Cross-schema foreign keys functional
✅ No tables remain in `public` schema
✅ Feature planner UI fully functional
✅ All API endpoints working
✅ Query performance unchanged
✅ No TypeScript errors
✅ All tests passing

## Post-Migration Tasks

1. **Update Documentation**: Note schema change in project docs
2. **Team Communication**: Notify team of schema structure change
3. **Monitor Performance**: Watch for any unexpected issues
4. **Update Scripts**: Update any raw SQL scripts or tools
5. **Database Backups**: Verify backup strategy includes new schema

## Future Considerations

### Potential Enhancements

1. **Separate Database User**: Create dedicated DB role for feature planner
2. **Read-Only Replica**: Separate read queries for analytics
3. **Automatic Cleanup**: Scheduled job to clean old feature plans
4. **Schema Versioning**: Track schema version separately

### Easy Removal Strategy

When feature planner is no longer needed:

```sql
-- Single command to remove everything
DROP SCHEMA feature_planner CASCADE;
```

## References

- **Current Schema File**: `src/lib/db/schema/feature-planner.schema.ts`
- **Relations File**: `src/lib/db/schema/relations.schema.ts`
- **Original Migration**: `src/lib/db/migrations/20251009231245_light_cargill.sql`
- **Drizzle Schema Docs**: https://orm.drizzle.team/docs/schemas
- **PostgreSQL Schema Docs**: https://www.postgresql.org/docs/current/ddl-schemas.html

## Approval & Sign-Off

- [ ] Plan reviewed
- [ ] Timeline acceptable
- [ ] Rollback strategy understood
- [ ] Success criteria agreed upon
- [ ] Ready to proceed

---

**Plan Created**: 2025-10-13
**Estimated Effort**: 2.5-3.5 hours
**Risk Level**: Low-Medium
**Priority**: Low (nice-to-have improvement)
