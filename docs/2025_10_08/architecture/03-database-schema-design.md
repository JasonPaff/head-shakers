# Feature Planner Database Schema Design

**Date:** 2025-10-08
**Purpose:** Database schema design for storing feature planning workflows and implementation plans

## Overview

This schema design enables the web-based feature planner to persist all workflow executions, intermediate results, and final implementation plans. It supports versioning, iteration, parallel execution tracking, and complete audit trails.

## Schema Design

### Core Tables

#### 1. `feature_plans`

Main table storing feature planning workflows.

```typescript
import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '@/lib/db/schema/users.schema';

// Enums
export const planStatusEnum = pgEnum('plan_status', [
  'draft', // Initial state
  'refining', // Step 1 in progress
  'discovering', // Step 2 in progress
  'planning', // Step 3 in progress
  'completed', // All steps complete
  'failed', // Workflow failed
  'cancelled', // User cancelled
]);

export const complexityEnum = pgEnum('complexity', ['low', 'medium', 'high']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high']);

export const featurePlans = pgTable(
  'feature_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    // Original user input
    originalRequest: text('original_request').notNull(),

    // Workflow state
    status: planStatusEnum('status').default('draft').notNull(),
    currentStep: integer('current_step').default(0).notNull(), // 0=draft, 1-3=steps

    // Step 1: Refinement results
    refinedRequest: text('refined_request'),
    refinementSettings: jsonb('refinement_settings').$type<RefinementSettings>(),
    selectedRefinementId: uuid('selected_refinement_id'), // FK to feature_refinements

    // Step 2: File discovery results
    discoveredFiles: jsonb('discovered_files').$type<FileDiscoveryResult[]>(),
    selectedFiles: jsonb('selected_files').$type<string[]>(),

    // Step 3: Implementation plan
    implementationPlan: text('implementation_plan'),
    estimatedDuration: varchar('estimated_duration', { length: 50 }),
    complexity: complexityEnum('complexity'),
    riskLevel: riskLevelEnum('risk_level'),

    // Metadata
    sessionId: varchar('session_id', { length: 255 }), // Claude SDK session ID
    totalExecutionTimeMs: integer('total_execution_time_ms').default(0),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),

    // Versioning support
    version: integer('version').default(1).notNull(),
    parentPlanId: uuid('parent_plan_id').references(() => featurePlans.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    // User queries
    index('feature_plans_user_id_idx').on(table.userId),
    index('feature_plans_user_status_idx').on(table.userId, table.status),
    index('feature_plans_user_created_idx').on(table.userId, sql`${table.createdAt} DESC`),

    // Status queries
    index('feature_plans_status_idx').on(table.status),
    index('feature_plans_current_step_idx').on(table.currentStep),

    // Search
    index('feature_plans_original_request_search_idx').using(
      'gin',
      sql`${table.originalRequest} gin_trgm_ops`,
    ),
    index('feature_plans_refined_request_search_idx').using('gin', sql`${table.refinedRequest} gin_trgm_ops`),

    // Versioning
    index('feature_plans_parent_id_idx').on(table.parentPlanId),
    index('feature_plans_parent_version_idx').on(table.parentPlanId, table.version),
  ],
);
```

#### 2. `feature_refinements`

Stores individual refinement attempts (supports parallel refinement).

```typescript
export const refinementStatusEnum = pgEnum('refinement_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const featureRefinements = pgTable(
  'feature_refinements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),

    // Agent execution details
    agentId: varchar('agent_id', { length: 100 }).notNull(), // e.g., 'agent-1', 'agent-2'
    agentModel: varchar('agent_model', { length: 50 }).default('sonnet'),

    // Input/Output
    inputRequest: text('input_request').notNull(),
    refinedRequest: text('refined_request'),

    // Execution metadata
    status: refinementStatusEnum('status').default('pending').notNull(),
    executionTimeMs: integer('execution_time_ms'),
    retryCount: integer('retry_count').default(0).notNull(),

    // Quality metrics
    wordCount: integer('word_count'),
    characterCount: integer('character_count'),
    expansionRatio: integer('expansion_ratio'), // How much longer than original (2x, 3x, etc)

    // Validation
    isValidFormat: boolean('is_valid_format').default(false),
    validationErrors: jsonb('validation_errors').$type<string[]>(),

    // AI response metadata
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),

    // Error handling
    errorMessage: text('error_message'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('feature_refinements_plan_id_idx').on(table.planId),
    index('feature_refinements_status_idx').on(table.status),
    index('feature_refinements_plan_status_idx').on(table.planId, table.status),
  ],
);
```

#### 3. `file_discovery_sessions`

Stores file discovery execution details.

```typescript
export const discoveryStatusEnum = pgEnum('discovery_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const fileDiscoverySessions = pgTable(
  'file_discovery_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),

    // Input
    refinedRequest: text('refined_request').notNull(),

    // Output
    discoveredFiles: jsonb('discovered_files').$type<FileDiscoveryResult[]>(),
    architectureInsights: text('architecture_insights'),

    // Execution metadata
    status: discoveryStatusEnum('status').default('pending').notNull(),
    executionTimeMs: integer('execution_time_ms'),

    // Discovery stats
    totalFilesFound: integer('total_files_found').default(0),
    highPriorityCount: integer('high_priority_count').default(0),
    mediumPriorityCount: integer('medium_priority_count').default(0),
    lowPriorityCount: integer('low_priority_count').default(0),

    // AI metrics
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),

    errorMessage: text('error_message'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('file_discovery_sessions_plan_id_idx').on(table.planId),
    index('file_discovery_sessions_status_idx').on(table.status),
  ],
);
```

#### 4. `discovered_files`

Individual files discovered during file discovery.

```typescript
export const filePriorityEnum = pgEnum('file_priority', ['high', 'medium', 'low']);

export const discoveredFiles = pgTable(
  'discovered_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    discoverySessionId: uuid('discovery_session_id')
      .references(() => fileDiscoverySessions.id, { onDelete: 'cascade' })
      .notNull(),

    filePath: varchar('file_path', { length: 500 }).notNull(),
    priority: filePriorityEnum('priority').notNull(),
    relevanceScore: integer('relevance_score').default(0).notNull(), // 0-100

    description: text('description'),
    reasoning: text('reasoning'), // Why this file is relevant

    // File metadata (captured at discovery time)
    fileExists: boolean('file_exists').default(true).notNull(),
    fileType: varchar('file_type', { length: 50 }),
    linesOfCode: integer('lines_of_code'),

    isSelected: boolean('is_selected').default(false), // User selection

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('discovered_files_session_id_idx').on(table.discoverySessionId),
    index('discovered_files_priority_idx').on(table.priority),
    index('discovered_files_session_priority_idx').on(table.discoverySessionId, table.priority),
    index('discovered_files_file_path_idx').on(table.filePath),
  ],
);
```

#### 5. `implementation_plan_generations`

Stores implementation plan generation attempts.

```typescript
export const planGenerationStatusEnum = pgEnum('plan_generation_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const implementationPlanGenerations = pgTable(
  'implementation_plan_generations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),

    // Input
    refinedRequest: text('refined_request').notNull(),
    discoveredFiles: jsonb('discovered_files').$type<FileDiscoveryResult[]>(),

    // Output
    implementationPlan: text('implementation_plan'),
    estimatedDuration: varchar('estimated_duration', { length: 50 }),
    complexity: complexityEnum('complexity'),
    riskLevel: riskLevelEnum('risk_level'),

    // Execution metadata
    status: planGenerationStatusEnum('status').default('pending').notNull(),
    executionTimeMs: integer('execution_time_ms'),

    // Plan stats
    totalSteps: integer('total_steps').default(0),
    prerequisitesCount: integer('prerequisites_count').default(0),
    qualityGatesCount: integer('quality_gates_count').default(0),

    // Validation
    isValidMarkdown: boolean('is_valid_markdown').default(false),
    hasRequiredSections: boolean('has_required_sections').default(false),
    validationErrors: jsonb('validation_errors').$type<string[]>(),

    // AI metrics
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),

    errorMessage: text('error_message'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [
    index('implementation_plan_generations_plan_id_idx').on(table.planId),
    index('implementation_plan_generations_status_idx').on(table.status),
  ],
);
```

#### 6. `plan_execution_logs`

Complete audit trail of all agent executions.

```typescript
export const executionStepEnum = pgEnum('execution_step', ['refinement', 'discovery', 'planning']);

export const planExecutionLogs = pgTable(
  'plan_execution_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),

    step: executionStepEnum('step').notNull(),
    stepNumber: integer('step_number').notNull(), // 1, 2, or 3

    // Agent details
    agentType: varchar('agent_type', { length: 100 }).notNull(),
    agentModel: varchar('agent_model', { length: 50 }),

    // Complete execution data
    inputPrompt: text('input_prompt'),
    agentResponse: text('agent_response'),

    // Session tracking
    sessionId: varchar('session_id', { length: 255 }),
    parentToolUseId: varchar('parent_tool_use_id', { length: 255 }),

    // Execution metrics
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    durationMs: integer('duration_ms'),

    // AI usage
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),
    cacheReadTokens: integer('cache_read_tokens'),
    cacheCreationTokens: integer('cache_creation_tokens'),

    // Success/Error
    isSuccess: boolean('is_success').default(true),
    errorMessage: text('error_message'),
    retryAttempt: integer('retry_attempt').default(0),

    // Additional metadata
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('plan_execution_logs_plan_id_idx').on(table.planId),
    index('plan_execution_logs_step_idx').on(table.step),
    index('plan_execution_logs_plan_step_idx').on(table.planId, table.stepNumber),
    index('plan_execution_logs_session_id_idx').on(table.sessionId),
    index('plan_execution_logs_created_at_idx').on(table.createdAt),
  ],
);
```

### TypeScript Types

```typescript
// Types for JSONB fields
export interface RefinementSettings {
  agentCount: number;
  includeProjectContext: boolean;
  maxOutputLength: number;
  parallelExecution?: boolean;
  customModel?: string;
}

export interface FileDiscoveryResult {
  filePath: string;
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  description: string;
  reasoning?: string;
  fileExists?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ExecutionMetadata {
  toolsUsed?: string[];
  filesRead?: string[];
  searchQueries?: string[];
  [key: string]: unknown;
}
```

## Relationships

```
users (1) ──→ (N) feature_plans
  │
  └──→ (1) feature_plans ──→ (N) feature_refinements
        │                  ──→ (N) file_discovery_sessions ──→ (N) discovered_files
        │                  ──→ (N) implementation_plan_generations
        │                  ──→ (N) plan_execution_logs
        │
        └──→ (1) feature_plans (parent_plan_id) [self-reference for versioning]
```

## Key Features

### 1. **Parallel Refinement Support**

- Multiple `feature_refinements` records per plan
- Each refinement tracked independently
- User selects best refinement via `selectedRefinementId`

### 2. **Complete Audit Trail**

- `plan_execution_logs` captures every agent interaction
- Full prompts and responses stored
- Token usage tracked for cost analysis
- Retry attempts logged

### 3. **Versioning & Iteration**

- `parentPlanId` enables plan versioning
- Can fork existing plans to try alternatives
- Version number tracks iterations

### 4. **Step-by-Step Workflow**

- `currentStep` tracks progress (0-3)
- Status enum shows current state
- Each step has dedicated result tables

### 5. **File Discovery Tracking**

- Individual files stored in `discovered_files`
- Priority and relevance scoring
- User selection tracking (`isSelected`)

### 6. **Performance Analytics**

- Execution time tracking at every level
- Token usage metrics
- Success/failure rates
- Retry counts

## Query Patterns

### Get User's Recent Plans

```typescript
const recentPlans = await db
  .select()
  .from(featurePlans)
  .where(eq(featurePlans.userId, userId))
  .orderBy(desc(featurePlans.createdAt))
  .limit(10);
```

### Get Plan with All Related Data

```typescript
const planWithDetails = await db
  .select()
  .from(featurePlans)
  .leftJoin(featureRefinements, eq(featurePlans.id, featureRefinements.planId))
  .leftJoin(fileDiscoverySessions, eq(featurePlans.id, fileDiscoverySessions.planId))
  .leftJoin(implementationPlanGenerations, eq(featurePlans.id, implementationPlanGenerations.planId))
  .where(eq(featurePlans.id, planId));
```

### Get Parallel Refinements for Comparison

```typescript
const refinements = await db
  .select()
  .from(featureRefinements)
  .where(and(eq(featureRefinements.planId, planId), eq(featureRefinements.status, 'completed')))
  .orderBy(desc(featureRefinements.wordCount));
```

### Get Discovered Files by Priority

```typescript
const highPriorityFiles = await db
  .select()
  .from(discoveredFiles)
  .where(and(eq(discoveredFiles.discoverySessionId, sessionId), eq(discoveredFiles.priority, 'high')))
  .orderBy(desc(discoveredFiles.relevanceScore));
```

### Get Complete Execution Log for Plan

```typescript
const executionLog = await db
  .select()
  .from(planExecutionLogs)
  .where(eq(planExecutionLogs.planId, planId))
  .orderBy(asc(planExecutionLogs.stepNumber), asc(planExecutionLogs.createdAt));
```

## Migration Strategy

### Phase 1: Core Tables

1. Create enums
2. Create `feature_plans` table
3. Create `feature_refinements` table
4. Create `plan_execution_logs` table

### Phase 2: File Discovery

1. Create `file_discovery_sessions` table
2. Create `discovered_files` table

### Phase 3: Implementation Planning

1. Create `implementation_plan_generations` table

### Phase 4: Indexes & Optimization

1. Add all indexes
2. Add constraints
3. Performance testing

## Schema File Location

Following project conventions, create:

```
src/lib/db/schema/feature-planner.schema.ts
```

Then export from:

```
src/lib/db/schema/index.ts
```

## Next Steps

1. ✅ Design database schema
2. ⏳ Create comprehensive architecture plan
3. Implement schema file
4. Generate Drizzle migration
5. Create query functions
6. Build service layer
