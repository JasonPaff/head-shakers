import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { DEFAULTS, ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

// ============================================================================
// SCHEMA
// ============================================================================

export const featurePlannerSchema = pgSchema('feature_planner');

// ============================================================================
// ENUMS
// ============================================================================

export const complexityEnum = featurePlannerSchema.enum('complexity', ENUMS.FEATURE_PLAN.COMPLEXITY);
export const confidenceLevelEnum = featurePlannerSchema.enum('confidence_level', ['high', 'medium', 'low']);
export const estimatedScopeEnum = featurePlannerSchema.enum('estimated_scope', ['small', 'medium', 'large']);
export const executionStepEnum = featurePlannerSchema.enum('execution_step', ENUMS.PLAN_EXECUTION.STEP);
export const fileDiscoveryStatusEnum = featurePlannerSchema.enum(
  'file_discovery_status',
  ENUMS.FILE_DISCOVERY.STATUS,
);
export const filePriorityEnum = featurePlannerSchema.enum('file_priority', ENUMS.FILE_DISCOVERY.PRIORITY);
export const implementationPlanStatusEnum = featurePlannerSchema.enum(
  'implementation_plan_status',
  ENUMS.IMPLEMENTATION_PLAN.STATUS,
);
export const planStatusEnum = featurePlannerSchema.enum('plan_status', ENUMS.FEATURE_PLAN.STATUS);
export const refinementStatusEnum = featurePlannerSchema.enum('refinement_status', ENUMS.REFINEMENT.STATUS);
export const riskLevelEnum = featurePlannerSchema.enum('risk_level', ENUMS.FEATURE_PLAN.RISK_LEVEL);
export const technicalComplexityEnum = featurePlannerSchema.enum('technical_complexity', [
  'high',
  'medium',
  'low',
]);

// ============================================================================
// ZOD SCHEMAS FOR JSONB TYPES
// ============================================================================

export const refinementSettingsSchema = z.object({
  agentCount: z.number().int().positive(),
  customModel: z.string().optional(),
  enableSynthesis: z.boolean().optional(),
  includeProjectContext: z.boolean(),
  maxOutputLength: z.number().int().positive(),
  minOutputLength: z.number().int().positive(),
  parallelExecution: z.boolean().optional(),
  selectedAgentIds: z.array(z.string()).optional(),
});
export type RefinementSettings = z.infer<typeof refinementSettingsSchema>;

export const fileDiscoveryResultSchema = z.object({
  description: z.string(),
  fileExists: z.boolean().optional(),
  filePath: z.string(),
  integrationPoint: z.string().optional(),
  isManuallyAdded: z.boolean().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  reasoning: z.string().optional(),
  relevanceScore: z.number().int().min(0).max(100),
  role: z.string().optional(),
});
export type FileDiscoveryResult = z.infer<typeof fileDiscoveryResultSchema>;

export const validationErrorSchema = z.object({
  code: z.string(),
  field: z.string(),
  message: z.string(),
});
export type ValidationError = z.infer<typeof validationErrorSchema>;

export const executionMetadataSchema = z.record(z.string(), z.unknown());
export type ExecutionMetadata = z.infer<typeof executionMetadataSchema>;

// ============================================================================
// TABLE: custom_agents
// Stores custom agent configurations (refinement, feature-suggestion, etc.)
// ============================================================================

export const customAgents = featurePlannerSchema.table(
  'custom_agents',
  {
    agentId: varchar('agent_id', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).primaryKey(),
    agentType: varchar('agent_type', { length: 50 }).default('refinement').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    focus: text('focus').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    role: varchar('role', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    systemPrompt: text('system_prompt').notNull(),
    temperature: numeric('temperature', { precision: 3, scale: 2 }).notNull(),
    tools: jsonb('tools').$type<Array<string>>().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // data validation constraints
    check(
      'custom_agents_temperature_range',
      sql`${table.temperature} >= 0.0 AND ${table.temperature} <= 2.0`,
    ),
    check('custom_agents_agent_id_not_empty', sql`length(trim(${table.agentId})) > 0`),
    check('custom_agents_name_not_empty', sql`length(trim(${table.name})) > 0`),
    check('custom_agents_role_not_empty', sql`length(trim(${table.role})) > 0`),
    check('custom_agents_agent_type_valid', sql`${table.agentType} IN ('refinement', 'feature-suggestion')`),

    // single column indexes
    index('custom_agents_agent_id_idx').on(table.agentId),
    index('custom_agents_agent_type_idx').on(table.agentType),
    index('custom_agents_is_active_idx').on(table.isActive),
    index('custom_agents_is_default_idx').on(table.isDefault),
  ],
);

// ============================================================================
// TABLE: feature_plans
// Main table storing feature planning workflows
// ============================================================================

export const featurePlans = featurePlannerSchema.table(
  'feature_plans',
  {
    completedAt: timestamp('completed_at'),
    complexity: complexityEnum('complexity'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currentStep: integer('current_step').default(DEFAULTS.FEATURE_PLAN.CURRENT_STEP).notNull(),
    discoveredFiles: jsonb('discovered_files').$type<Array<FileDiscoveryResult>>(),
    estimatedDuration: varchar('estimated_duration', {
      length: SCHEMA_LIMITS.FEATURE_PLAN.ESTIMATED_DURATION.MAX,
    }),
    id: uuid('id').primaryKey().defaultRandom(),
    implementationPlan: text('implementation_plan'),
    originalRequest: text('original_request').notNull(),
    parentPlanId: uuid('parent_plan_id'),
    refinedRequest: text('refined_request'),
    refinementSettings: jsonb('refinement_settings').$type<RefinementSettings>(),
    riskLevel: riskLevelEnum('risk_level'),
    selectedDiscoverySessionId: uuid('selected_discovery_session_id'),
    selectedFiles: jsonb('selected_files').$type<Array<string>>(),
    selectedPlanGenerationId: uuid('selected_plan_generation_id'),
    selectedRefinementId: uuid('selected_refinement_id'),
    sessionId: varchar('session_id', { length: SCHEMA_LIMITS.FEATURE_PLAN.SESSION_ID.MAX }),
    status: planStatusEnum('status').default(DEFAULTS.FEATURE_PLAN.STATUS).notNull(),
    totalExecutionTimeMs: integer('total_execution_time_ms')
      .default(DEFAULTS.FEATURE_PLAN.TOTAL_EXECUTION_TIME_MS)
      .notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    version: integer('version').default(DEFAULTS.FEATURE_PLAN.VERSION).notNull(),
  },
  (table) => [
    // data validation constraints
    check('feature_plans_current_step_range', sql`${table.currentStep} >= 0 AND ${table.currentStep} <= 3`),
    check('feature_plans_execution_time_non_negative', sql`${table.totalExecutionTimeMs} >= 0`),
    check('feature_plans_original_request_not_empty', sql`length(trim(${table.originalRequest})) > 0`),
    check('feature_plans_version_positive', sql`${table.version} > 0`),

    // single column indexes
    index('feature_plans_current_step_idx').on(table.currentStep),
    index('feature_plans_status_idx').on(table.status),
    index('feature_plans_user_id_idx').on(table.userId),

    // composite indexes
    index('feature_plans_parent_id_idx').on(table.parentPlanId),
    index('feature_plans_parent_version_idx').on(table.parentPlanId, table.version),
    index('feature_plans_user_created_idx').on(table.userId, table.createdAt),
    index('feature_plans_user_status_idx').on(table.userId, table.status),

    // pagination and filtering indexes
    index('feature_plans_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),

    // search indexes (requires pg_trgm extension)
    index('feature_plans_original_request_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.originalRequest})`,
    ),
    index('feature_plans_refined_request_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.refinedRequest})`,
    ),
  ],
);

// ============================================================================
// TABLE: feature_refinements
// Stores individual refinement attempts (supports parallel refinement)
// ============================================================================

export const featureRefinements = featurePlannerSchema.table(
  'feature_refinements',
  {
    agentId: varchar('agent_id', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    agentModel: varchar('agent_model', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_MODEL.MAX })
      .default(DEFAULTS.REFINEMENT.AGENT_MODEL)
      .notNull(),
    agentName: varchar('agent_name', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }),
    agentRole: varchar('agent_role', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }),
    assumptions: jsonb('assumptions').$type<Array<string>>(),
    characterCount: integer('character_count'),
    completedAt: timestamp('completed_at'),
    completionTokens: integer('completion_tokens'),
    confidence: confidenceLevelEnum('confidence'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    errorMessage: text('error_message'),
    estimatedScope: estimatedScopeEnum('estimated_scope'),
    executionTimeMs: integer('execution_time_ms'),
    expansionRatio: integer('expansion_ratio'),
    focus: text('focus'),
    id: uuid('id').primaryKey().defaultRandom(),
    inputRequest: text('input_request').notNull(),
    isValidFormat: boolean('is_valid_format').default(DEFAULTS.REFINEMENT.IS_VALID_FORMAT).notNull(),
    keyRequirements: jsonb('key_requirements').$type<Array<string>>(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),
    promptTokens: integer('prompt_tokens'),
    refinedRequest: text('refined_request'),
    retryCount: integer('retry_count').default(DEFAULTS.REFINEMENT.RETRY_COUNT).notNull(),
    risks: jsonb('risks').$type<Array<string>>(),
    status: refinementStatusEnum('status').default(DEFAULTS.REFINEMENT.STATUS).notNull(),
    technicalComplexity: technicalComplexityEnum('technical_complexity'),
    totalTokens: integer('total_tokens'),
    validationErrors: jsonb('validation_errors').$type<Array<ValidationError>>(),
    wordCount: integer('word_count'),
  },
  (table) => [
    // data validation constraints
    check(
      'feature_refinements_character_count_non_negative',
      sql`${table.characterCount} IS NULL OR ${table.characterCount} >= 0`,
    ),
    check(
      'feature_refinements_execution_time_non_negative',
      sql`${table.executionTimeMs} IS NULL OR ${table.executionTimeMs} >= 0`,
    ),
    check(
      'feature_refinements_expansion_ratio_positive',
      sql`${table.expansionRatio} IS NULL OR ${table.expansionRatio} > 0`,
    ),
    check('feature_refinements_retry_count_non_negative', sql`${table.retryCount} >= 0`),
    check(
      'feature_refinements_token_counts_non_negative',
      sql`(${table.promptTokens} IS NULL OR ${table.promptTokens} >= 0) AND (${table.completionTokens} IS NULL OR ${table.completionTokens} >= 0)`,
    ),
    check(
      'feature_refinements_word_count_non_negative',
      sql`${table.wordCount} IS NULL OR ${table.wordCount} >= 0`,
    ),

    // single column indexes
    index('feature_refinements_agent_id_idx').on(table.agentId),
    index('feature_refinements_plan_id_idx').on(table.planId),
    index('feature_refinements_status_idx').on(table.status),

    // composite indexes
    index('feature_refinements_plan_status_idx').on(table.planId, table.status),
  ],
);

// ============================================================================
// TABLE: file_discovery_sessions
// Stores file discovery execution details
// ============================================================================

export const fileDiscoverySessions = featurePlannerSchema.table(
  'file_discovery_sessions',
  {
    agentId: varchar('agent_id', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    architectureInsights: text('architecture_insights'),
    completedAt: timestamp('completed_at'),
    completionTokens: integer('completion_tokens'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    criticalPriorityCount: integer('critical_priority_count')
      .default(DEFAULTS.FILE_DISCOVERY.CRITICAL_PRIORITY_COUNT)
      .notNull(),
    discoveredFiles: jsonb('discovered_files').$type<Array<FileDiscoveryResult>>(),
    errorMessage: text('error_message'),
    executionTimeMs: integer('execution_time_ms'),
    highPriorityCount: integer('high_priority_count')
      .default(DEFAULTS.FILE_DISCOVERY.HIGH_PRIORITY_COUNT)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isSelected: boolean('is_selected').default(DEFAULTS.IMPLEMENTATION_PLAN.IS_SELECTED).notNull(),
    lowPriorityCount: integer('low_priority_count')
      .default(DEFAULTS.FILE_DISCOVERY.LOW_PRIORITY_COUNT)
      .notNull(),
    mediumPriorityCount: integer('medium_priority_count')
      .default(DEFAULTS.FILE_DISCOVERY.MEDIUM_PRIORITY_COUNT)
      .notNull(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),
    promptTokens: integer('prompt_tokens'),
    refinedRequest: text('refined_request').notNull(),
    status: fileDiscoveryStatusEnum('status').default(DEFAULTS.FILE_DISCOVERY.STATUS).notNull(),
    totalFilesFound: integer('total_files_found')
      .default(DEFAULTS.FILE_DISCOVERY.TOTAL_FILES_FOUND)
      .notNull(),
    totalTokens: integer('total_tokens'),
  },
  (table) => [
    // data validation constraints
    check(
      'file_discovery_sessions_counts_non_negative',
      sql`${table.criticalPriorityCount} >= 0 AND ${table.highPriorityCount} >= 0 AND ${table.mediumPriorityCount} >= 0 AND ${table.lowPriorityCount} >= 0`,
    ),
    check(
      'file_discovery_sessions_execution_time_non_negative',
      sql`${table.executionTimeMs} IS NULL OR ${table.executionTimeMs} >= 0`,
    ),
    check(
      'file_discovery_sessions_token_counts_non_negative',
      sql`(${table.promptTokens} IS NULL OR ${table.promptTokens} >= 0) AND (${table.completionTokens} IS NULL OR ${table.completionTokens} >= 0)`,
    ),
    check('file_discovery_sessions_total_files_non_negative', sql`${table.totalFilesFound} >= 0`),

    // single column indexes
    index('file_discovery_sessions_agent_id_idx').on(table.agentId),
    index('file_discovery_sessions_is_selected_idx').on(table.isSelected),
    index('file_discovery_sessions_plan_id_idx').on(table.planId),
    index('file_discovery_sessions_status_idx').on(table.status),
  ],
);

// ============================================================================
// TABLE: discovered_files
// Individual files discovered during file discovery
// ============================================================================

export const discoveredFiles = featurePlannerSchema.table(
  'discovered_files',
  {
    addedByUserId: uuid('added_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    discoverySessionId: uuid('discovery_session_id')
      .references(() => fileDiscoverySessions.id, { onDelete: 'cascade' })
      .notNull(),
    fileExists: boolean('file_exists').default(DEFAULTS.DISCOVERED_FILE.IS_FILE_EXISTS).notNull(),
    filePath: varchar('file_path', { length: SCHEMA_LIMITS.FILE_DISCOVERY.FILE_PATH.MAX }).notNull(),
    fileType: varchar('file_type', { length: SCHEMA_LIMITS.FILE_DISCOVERY.FILE_TYPE.MAX }),
    id: uuid('id').primaryKey().defaultRandom(),
    integrationPoint: varchar('integration_point', {
      length: SCHEMA_LIMITS.FILE_DISCOVERY.INTEGRATION_POINT.MAX,
    }),
    isManuallyAdded: boolean('is_manually_added')
      .default(DEFAULTS.DISCOVERED_FILE.IS_MANUALLY_ADDED)
      .notNull(),
    isSelected: boolean('is_selected').default(DEFAULTS.DISCOVERED_FILE.IS_SELECTED).notNull(),
    linesOfCode: integer('lines_of_code'),
    priority: filePriorityEnum('priority').notNull(),
    reasoning: text('reasoning'),
    relevanceScore: integer('relevance_score').default(DEFAULTS.DISCOVERED_FILE.RELEVANCE_SCORE).notNull(),
    role: varchar('role', { length: SCHEMA_LIMITS.FILE_DISCOVERY.ROLE.MAX }),
  },
  (table) => [
    // data validation constraints
    check(
      'discovered_files_lines_of_code_positive',
      sql`${table.linesOfCode} IS NULL OR ${table.linesOfCode} > 0`,
    ),
    check(
      'discovered_files_relevance_score_range',
      sql`${table.relevanceScore} >= 0 AND ${table.relevanceScore} <= 100`,
    ),

    // single column indexes
    index('discovered_files_discovery_session_id_idx').on(table.discoverySessionId),
    index('discovered_files_file_path_idx').on(table.filePath),
    index('discovered_files_is_manually_added_idx').on(table.isManuallyAdded),
    index('discovered_files_is_selected_idx').on(table.isSelected),
    index('discovered_files_priority_idx').on(table.priority),

    // composite indexes
    index('discovered_files_session_priority_idx').on(table.discoverySessionId, table.priority),
  ],
);

// ============================================================================
// TABLE: implementation_plan_generations
// Stores implementation plan generation attempts
// ============================================================================

export const implementationPlanGenerations = featurePlannerSchema.table(
  'implementation_plan_generations',
  {
    agentId: varchar('agent_id', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    completedAt: timestamp('completed_at'),
    completionTokens: integer('completion_tokens'),
    complexity: complexityEnum('complexity'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    discoveredFiles: jsonb('discovered_files').$type<Array<FileDiscoveryResult>>(),
    errorMessage: text('error_message'),
    estimatedDuration: varchar('estimated_duration', {
      length: SCHEMA_LIMITS.FEATURE_PLAN.ESTIMATED_DURATION.MAX,
    }),
    executionTimeMs: integer('execution_time_ms'),
    hasRequiredSections: boolean('has_required_sections')
      .default(DEFAULTS.IMPLEMENTATION_PLAN.HAS_REQUIRED_SECTIONS)
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    implementationPlan: text('implementation_plan'),
    isSelected: boolean('is_selected').default(DEFAULTS.IMPLEMENTATION_PLAN.IS_SELECTED).notNull(),
    isValidMarkdown: boolean('is_valid_markdown')
      .default(DEFAULTS.IMPLEMENTATION_PLAN.IS_VALID_MARKDOWN)
      .notNull(),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),
    prerequisitesCount: integer('prerequisites_count')
      .default(DEFAULTS.IMPLEMENTATION_PLAN.PREREQUISITES_COUNT)
      .notNull(),
    promptTokens: integer('prompt_tokens'),
    qualityGatesCount: integer('quality_gates_count')
      .default(DEFAULTS.IMPLEMENTATION_PLAN.QUALITY_GATES_COUNT)
      .notNull(),
    refinedRequest: text('refined_request').notNull(),
    riskLevel: riskLevelEnum('risk_level'),
    status: implementationPlanStatusEnum('status').default(DEFAULTS.IMPLEMENTATION_PLAN.STATUS).notNull(),
    totalSteps: integer('total_steps').default(DEFAULTS.IMPLEMENTATION_PLAN.TOTAL_STEPS).notNull(),
    totalTokens: integer('total_tokens'),
    validationErrors: jsonb('validation_errors').$type<Array<ValidationError>>(),
  },
  (table) => [
    // data validation constraints
    check(
      'implementation_plan_generations_counts_non_negative',
      sql`${table.totalSteps} >= 0 AND ${table.prerequisitesCount} >= 0 AND ${table.qualityGatesCount} >= 0`,
    ),
    check(
      'implementation_plan_generations_execution_time_non_negative',
      sql`${table.executionTimeMs} IS NULL OR ${table.executionTimeMs} >= 0`,
    ),
    check(
      'implementation_plan_generations_token_counts_non_negative',
      sql`(${table.promptTokens} IS NULL OR ${table.promptTokens} >= 0) AND (${table.completionTokens} IS NULL OR ${table.completionTokens} >= 0)`,
    ),

    // single column indexes
    index('implementation_plan_generations_agent_id_idx').on(table.agentId),
    index('implementation_plan_generations_is_selected_idx').on(table.isSelected),
    index('implementation_plan_generations_plan_id_idx').on(table.planId),
    index('implementation_plan_generations_status_idx').on(table.status),
  ],
);

// ============================================================================
// TABLE: plan_steps
// Structured implementation plan steps (supports editing and reordering)
// ============================================================================

export const planSteps = featurePlannerSchema.table(
  'plan_steps',
  {
    category: varchar('category', { length: SCHEMA_LIMITS.PLAN_STEP.CATEGORY.MAX }),
    commands: jsonb('commands').$type<Array<string>>(),
    confidenceLevel: varchar('confidence_level', { length: SCHEMA_LIMITS.PLAN_STEP.CONFIDENCE_LEVEL.MAX }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description').notNull(),
    displayOrder: integer('display_order').notNull(),
    estimatedDuration: varchar('estimated_duration', {
      length: SCHEMA_LIMITS.PLAN_STEP.ESTIMATED_DURATION.MAX,
    }),
    id: uuid('id').primaryKey().defaultRandom(),
    isFromTemplate: boolean('is_from_template').default(DEFAULTS.PLAN_STEP_TEMPLATE.IS_PUBLIC).notNull(),
    planGenerationId: uuid('plan_generation_id')
      .references(() => implementationPlanGenerations.id, { onDelete: 'cascade' })
      .notNull(),
    stepNumber: integer('step_number').notNull(),
    templateId: uuid('template_id'),
    title: varchar('title', { length: SCHEMA_LIMITS.PLAN_STEP.TITLE.MAX }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    validationCommands: jsonb('validation_commands').$type<Array<string>>(),
  },
  (table) => [
    // data validation constraints
    check('plan_steps_display_order_non_negative', sql`${table.displayOrder} >= 0`),
    check('plan_steps_step_number_positive', sql`${table.stepNumber} > 0`),

    // single column indexes
    index('plan_steps_category_idx').on(table.category),
    index('plan_steps_display_order_idx').on(table.displayOrder),
    index('plan_steps_plan_generation_id_idx').on(table.planGenerationId),
    index('plan_steps_template_id_idx').on(table.templateId),
  ],
);

// ============================================================================
// TABLE: plan_step_templates
// Reusable step templates library
// ============================================================================

export const planStepTemplates = featurePlannerSchema.table(
  'plan_step_templates',
  {
    category: varchar('category', { length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.CATEGORY.MAX }).notNull(),
    commands: jsonb('commands').$type<Array<string>>(),
    confidenceLevel: varchar('confidence_level', {
      length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.CONFIDENCE_LEVEL.MAX,
    })
      .default(DEFAULTS.PLAN_STEP_TEMPLATE.CONFIDENCE_LEVEL)
      .notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: varchar('description', {
      length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.DESCRIPTION.MAX,
    }).notNull(),
    estimatedDuration: varchar('estimated_duration', {
      length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.ESTIMATED_DURATION.MAX,
    }),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(DEFAULTS.PLAN_STEP_TEMPLATE.IS_PUBLIC).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.NAME.MAX }).notNull(),
    title: varchar('title', { length: SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.TITLE.MAX }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    usageCount: integer('usage_count').default(DEFAULTS.PLAN_STEP_TEMPLATE.USAGE_COUNT).notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    validationCommands: jsonb('validation_commands').$type<Array<string>>(),
  },
  (table) => [
    // data validation constraints
    check('plan_step_templates_usage_count_non_negative', sql`${table.usageCount} >= 0`),

    // single column indexes
    index('plan_step_templates_category_idx').on(table.category),
    index('plan_step_templates_is_public_idx').on(table.isPublic),
    index('plan_step_templates_usage_count_idx').on(table.usageCount),
    index('plan_step_templates_user_id_idx').on(table.userId),
  ],
);

// ============================================================================
// TABLE: plan_execution_logs
// Complete audit trail of all agent executions
// ============================================================================

export const planExecutionLogs = featurePlannerSchema.table(
  'plan_execution_logs',
  {
    agentLevel: integer('agent_level').default(DEFAULTS.PLAN_EXECUTION.AGENT_LEVEL).notNull(),
    agentModel: varchar('agent_model', { length: SCHEMA_LIMITS.PLAN_EXECUTION.AGENT_MODEL.MAX }),
    agentResponse: text('agent_response'),
    agentType: varchar('agent_type', { length: SCHEMA_LIMITS.PLAN_EXECUTION.AGENT_TYPE.MAX }).notNull(),
    cacheCreationTokens: integer('cache_creation_tokens'),
    cacheReadTokens: integer('cache_read_tokens'),
    completionTokens: integer('completion_tokens'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    durationMs: integer('duration_ms'),
    endTime: timestamp('end_time'),
    errorMessage: text('error_message'),
    id: uuid('id').primaryKey().defaultRandom(),
    inputPrompt: text('input_prompt'),
    isSuccess: boolean('is_success').default(DEFAULTS.PLAN_EXECUTION.IS_SUCCESS).notNull(),
    metadata: jsonb('metadata').$type<ExecutionMetadata>(),
    parentLogId: uuid('parent_log_id'),
    parentToolUseId: varchar('parent_tool_use_id', {
      length: SCHEMA_LIMITS.PLAN_EXECUTION.PARENT_TOOL_USE_ID.MAX,
    }),
    planId: uuid('plan_id')
      .references(() => featurePlans.id, { onDelete: 'cascade' })
      .notNull(),
    promptTokens: integer('prompt_tokens'),
    retryAttempt: integer('retry_attempt').default(DEFAULTS.PLAN_EXECUTION.RETRY_ATTEMPT).notNull(),
    sessionId: varchar('session_id', { length: SCHEMA_LIMITS.PLAN_EXECUTION.SESSION_ID.MAX }),
    startTime: timestamp('start_time').notNull(),
    step: executionStepEnum('step').notNull(),
    stepNumber: integer('step_number').notNull(),
    totalTokens: integer('total_tokens'),
  },
  (table) => [
    // data validation constraints
    check('plan_execution_logs_agent_level_non_negative', sql`${table.agentLevel} >= 0`),
    check(
      'plan_execution_logs_duration_non_negative',
      sql`${table.durationMs} IS NULL OR ${table.durationMs} >= 0`,
    ),
    check('plan_execution_logs_retry_attempt_non_negative', sql`${table.retryAttempt} >= 0`),
    check(
      'plan_execution_logs_step_number_range',
      sql`${table.stepNumber} >= 1 AND ${table.stepNumber} <= 3`,
    ),
    check(
      'plan_execution_logs_token_counts_non_negative',
      sql`(${table.promptTokens} IS NULL OR ${table.promptTokens} >= 0) AND (${table.completionTokens} IS NULL OR ${table.completionTokens} >= 0)`,
    ),

    // single column indexes
    index('plan_execution_logs_agent_level_idx').on(table.agentLevel),
    index('plan_execution_logs_created_at_idx').on(table.createdAt),
    index('plan_execution_logs_parent_log_id_idx').on(table.parentLogId),
    index('plan_execution_logs_plan_id_idx').on(table.planId),
    index('plan_execution_logs_session_id_idx').on(table.sessionId),
    index('plan_execution_logs_step_idx').on(table.step),

    // composite indexes
    index('plan_execution_logs_plan_step_idx').on(table.planId, table.stepNumber),
  ],
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CustomAgent = typeof customAgents.$inferSelect;
export type DiscoveredFile = typeof discoveredFiles.$inferSelect;
export type FeaturePlan = typeof featurePlans.$inferSelect;
export type FeatureRefinement = typeof featureRefinements.$inferSelect;
export type FileDiscoverySession = typeof fileDiscoverySessions.$inferSelect;
export type ImplementationPlanGeneration = typeof implementationPlanGenerations.$inferSelect;
export type NewCustomAgent = typeof customAgents.$inferInsert;
export type NewDiscoveredFile = typeof discoveredFiles.$inferInsert;
export type NewFeaturePlan = typeof featurePlans.$inferInsert;
export type NewFeatureRefinement = typeof featureRefinements.$inferInsert;
export type NewFileDiscoverySession = typeof fileDiscoverySessions.$inferInsert;
export type NewImplementationPlanGeneration = typeof implementationPlanGenerations.$inferInsert;
export type NewPlanExecutionLog = typeof planExecutionLogs.$inferInsert;
export type NewPlanStep = typeof planSteps.$inferInsert;
export type NewPlanStepTemplate = typeof planStepTemplates.$inferInsert;
export type PlanExecutionLog = typeof planExecutionLogs.$inferSelect;
export type PlanStep = typeof planSteps.$inferSelect;
export type PlanStepTemplate = typeof planStepTemplates.$inferSelect;
