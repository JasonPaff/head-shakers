import { z } from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants';

// ============================================================================
// REFINEMENT SETTINGS
// ============================================================================

export const refinementSettingsSchema = z.object({
  agentCount: z.number().int().min(1).max(5).default(1),
  customModel: z.string().optional(),
  includeProjectContext: z.boolean().default(true),
  maxOutputLength: z
    .number()
    .int()
    .min(SCHEMA_LIMITS.REFINEMENT.MAX_OUTPUT_LENGTH.MIN)
    .max(SCHEMA_LIMITS.REFINEMENT.MAX_OUTPUT_LENGTH.MAX)
    .default(500),
  minOutputLength: z
    .number()
    .int()
    .min(SCHEMA_LIMITS.REFINEMENT.MIN_OUTPUT_LENGTH.MIN)
    .max(SCHEMA_LIMITS.REFINEMENT.MIN_OUTPUT_LENGTH.MAX)
    .default(150),
  parallelExecution: z.boolean().optional(),
});

export type RefinementSettings = RefinementSettingsInput;
export type RefinementSettingsInput = z.infer<typeof refinementSettingsSchema>;

// ============================================================================
// FILE DISCOVERY RESULT
// ============================================================================

export const fileDiscoveryResultSchema = z.object({
  description: z.string().min(1).max(SCHEMA_LIMITS.FILE_DISCOVERY.DESCRIPTION.MAX),
  fileExists: z.boolean().optional(),
  filePath: z.string().min(1).max(SCHEMA_LIMITS.FILE_DISCOVERY.FILE_PATH.MAX),
  integrationPoint: z.string().max(SCHEMA_LIMITS.FILE_DISCOVERY.INTEGRATION_POINT.MAX).optional(),
  isManuallyAdded: z.boolean().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  reasoning: z.string().max(SCHEMA_LIMITS.FILE_DISCOVERY.REASONING.MAX).optional(),
  relevanceScore: z.number().int().min(0).max(100),
  role: z.string().max(SCHEMA_LIMITS.FILE_DISCOVERY.ROLE.MAX).optional(),
});

export type FileDiscoveryResultInput = z.infer<typeof fileDiscoveryResultSchema>;

// ============================================================================
// FEATURE PLAN
// ============================================================================

export const createFeaturePlanSchema = z.object({
  originalRequest: z
    .string()
    .min(SCHEMA_LIMITS.FEATURE_PLAN.ORIGINAL_REQUEST.MIN)
    .max(SCHEMA_LIMITS.FEATURE_PLAN.ORIGINAL_REQUEST.MAX)
    .refine((val) => val.trim().length > 0, {
      message: 'Original request cannot be empty or whitespace',
    }),
});

export const updateFeaturePlanSchema = z.object({
  completedAt: z.date().optional(),
  complexity: z.enum(['low', 'medium', 'high']).optional(),
  currentStep: z.number().int().min(0).max(3).optional(),
  discoveredFiles: z.array(fileDiscoveryResultSchema).optional(),
  estimatedDuration: z.string().max(SCHEMA_LIMITS.FEATURE_PLAN.ESTIMATED_DURATION.MAX).optional(),
  implementationPlan: z.string().optional(),
  refinedRequest: z.string().optional(),
  refinementSettings: refinementSettingsSchema.optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  selectedDiscoverySessionId: z.string().uuid().optional(),
  selectedFiles: z.array(z.string()).optional(),
  selectedPlanGenerationId: z.string().uuid().optional(),
  selectedRefinementId: z.string().uuid().optional(),
  status: z.enum(['draft', 'refining', 'discovering', 'planning', 'completed', 'failed', 'cancelled']).optional(),
});

export const deleteFeaturePlanSchema = z.object({
  planId: z.string().uuid(),
});

export const getFeaturePlanSchema = z.object({
  planId: z.string().uuid(),
});

export const listFeaturePlansSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'refining', 'discovering', 'planning', 'completed', 'failed', 'cancelled']).optional(),
});

export type CreateFeaturePlanInput = z.infer<typeof createFeaturePlanSchema>;
export type DeleteFeaturePlanInput = z.infer<typeof deleteFeaturePlanSchema>;
export type GetFeaturePlanInput = z.infer<typeof getFeaturePlanSchema>;
export type ListFeaturePlansInput = z.infer<typeof listFeaturePlansSchema>;
export type UpdateFeaturePlanInput = z.infer<typeof updateFeaturePlanSchema>;

// ============================================================================
// REFINEMENT
// ============================================================================

export const runRefinementSchema = z.object({
  planId: z.string().uuid(),
  settings: refinementSettingsSchema,
});

export const selectRefinementSchema = z.object({
  planId: z.string().uuid(),
  refinementId: z.string().uuid(),
});

export const getRefinementsSchema = z.object({
  planId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export type GetRefinementsInput = z.infer<typeof getRefinementsSchema>;
export type RunRefinementInput = z.infer<typeof runRefinementSchema>;
export type SelectRefinementInput = z.infer<typeof selectRefinementSchema>;

// ============================================================================
// FILE DISCOVERY
// ============================================================================

export const runFileDiscoverySchema = z.object({
  customModel: z.string().optional(),
  planId: z.string().uuid(),
});

export const addManualFileSchema = z.object({
  description: z.string().min(1).max(SCHEMA_LIMITS.FILE_DISCOVERY.DESCRIPTION.MAX),
  filePath: z.string().min(1).max(SCHEMA_LIMITS.FILE_DISCOVERY.FILE_PATH.MAX),
  planId: z.string().uuid(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  relevanceScore: z.number().int().min(0).max(100).default(50),
});

export const selectFilesSchema = z.object({
  files: z.array(z.string()).min(1),
  planId: z.string().uuid(),
});

export const getFileDiscoverySessionsSchema = z.object({
  planId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export type AddManualFileInput = z.infer<typeof addManualFileSchema>;
export type GetFileDiscoverySessionsInput = z.infer<typeof getFileDiscoverySessionsSchema>;
export type RunFileDiscoveryInput = z.infer<typeof runFileDiscoverySchema>;
export type SelectFilesInput = z.infer<typeof selectFilesSchema>;

// ============================================================================
// IMPLEMENTATION PLAN GENERATION
// ============================================================================

export const runPlanGenerationSchema = z.object({
  customModel: z.string().optional(),
  planId: z.string().uuid(),
});

export const selectPlanGenerationSchema = z.object({
  generationId: z.string().uuid(),
  planId: z.string().uuid(),
});

export const getPlanGenerationsSchema = z.object({
  planId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export type GetPlanGenerationsInput = z.infer<typeof getPlanGenerationsSchema>;
export type RunPlanGenerationInput = z.infer<typeof runPlanGenerationSchema>;
export type SelectPlanGenerationInput = z.infer<typeof selectPlanGenerationSchema>;

// ============================================================================
// PLAN STEPS
// ============================================================================

export const createPlanStepSchema = z.object({
  category: z.string().max(SCHEMA_LIMITS.PLAN_STEP.CATEGORY.MAX).optional(),
  commands: z.array(z.string()).optional(),
  confidenceLevel: z.string().max(SCHEMA_LIMITS.PLAN_STEP.CONFIDENCE_LEVEL.MAX).optional(),
  description: z.string().min(1),
  displayOrder: z.number().int().min(0),
  estimatedDuration: z.string().max(SCHEMA_LIMITS.PLAN_STEP.ESTIMATED_DURATION.MAX).optional(),
  planGenerationId: z.string().uuid(),
  stepNumber: z.number().int().min(1),
  title: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP.TITLE.MAX),
  validationCommands: z.array(z.string()).optional(),
});

export const updatePlanStepSchema = z.object({
  category: z.string().max(SCHEMA_LIMITS.PLAN_STEP.CATEGORY.MAX).optional(),
  commands: z.array(z.string()).optional(),
  confidenceLevel: z.string().max(SCHEMA_LIMITS.PLAN_STEP.CONFIDENCE_LEVEL.MAX).optional(),
  description: z.string().min(1).optional(),
  displayOrder: z.number().int().min(0).optional(),
  estimatedDuration: z.string().max(SCHEMA_LIMITS.PLAN_STEP.ESTIMATED_DURATION.MAX).optional(),
  stepId: z.string().uuid(),
  stepNumber: z.number().int().min(1).optional(),
  title: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP.TITLE.MAX).optional(),
  validationCommands: z.array(z.string()).optional(),
});

export const deletePlanStepSchema = z.object({
  stepId: z.string().uuid(),
});

export const reorderPlanStepsSchema = z.object({
  updates: z.array(
    z.object({
      displayOrder: z.number().int().min(0),
      stepId: z.string().uuid(),
    }),
  ),
});

export type CreatePlanStepInput = z.infer<typeof createPlanStepSchema>;
export type DeletePlanStepInput = z.infer<typeof deletePlanStepSchema>;
export type ReorderPlanStepsInput = z.infer<typeof reorderPlanStepsSchema>;
export type UpdatePlanStepInput = z.infer<typeof updatePlanStepSchema>;

// ============================================================================
// STEP TEMPLATES
// ============================================================================

export const createStepTemplateSchema = z.object({
  category: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.CATEGORY.MAX),
  commands: z.array(z.string()).optional(),
  confidenceLevel: z.string().max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.CONFIDENCE_LEVEL.MAX).optional(),
  content: z.string().min(1),
  description: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.DESCRIPTION.MAX),
  estimatedDuration: z.string().max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.ESTIMATED_DURATION.MAX).optional(),
  isPublic: z.boolean().default(false),
  name: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.NAME.MAX),
  title: z.string().min(1).max(SCHEMA_LIMITS.PLAN_STEP_TEMPLATE.TITLE.MAX),
  validationCommands: z.array(z.string()).optional(),
});

export const getStepTemplatesSchema = z.object({
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const useStepTemplateSchema = z.object({
  planGenerationId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export type CreateStepTemplateInput = z.infer<typeof createStepTemplateSchema>;
export type GetStepTemplatesInput = z.infer<typeof getStepTemplatesSchema>;
export type UseStepTemplateInput = z.infer<typeof useStepTemplateSchema>;

// ============================================================================
// EXECUTION LOGS
// ============================================================================

export const getExecutionLogsSchema = z.object({
  planId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(3).optional(),
});

export type GetExecutionLogsInput = z.infer<typeof getExecutionLogsSchema>;

// ============================================================================
// RESPONSE TYPES FOR UI
// ============================================================================

export interface ParallelRefinementResponse {
  refinements: Array<{
    agentId: string;
    id: string;
    refinedRequest: string;
  }>;
}

export interface RefineResponse {
  data?: unknown;
  isSuccess: boolean;
  message: string;
}

export interface Step2Data {
  discoveredFiles?: Array<{
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
    relevanceScore: number;
  }>;
  selectedFiles?: string[];
}

export interface Step3Data {
  implementationPlan?: string;
  validationCommands?: string[];
}

export interface StepData {
  step1?: unknown;
  step2?: Step2Data;
  step3?: Step3Data;
}
