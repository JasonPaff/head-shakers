import { z } from 'zod';

export const refinementSettingsSchema = z.object({
  agentCount: z.number().int().min(1).max(5).default(1),
  includeProjectContext: z.boolean().default(true),
  maxOutputLength: z.number().int().min(100).max(500).default(250),
});

export const refinementResultSchema = z.object({
  agentId: z.string(),
  error: z.string().max(500).optional(),
  executionTimeMs: z.number().int().min(0),
  isSuccess: z.boolean(),
  refinedRequest: z.string().max(1000),
  retryCount: z.number().int().min(0).max(10).optional(),
  wordCount: z.number().int().min(0),
});

export const parallelRefinementResponseSchema = z.object({
  avgRetries: z.number().min(0).optional(),
  executionTimeMs: z.number().int().min(0),
  isSuccess: z.boolean(),
  results: z.array(refinementResultSchema),
  settings: refinementSettingsSchema,
  successCount: z.number().int().min(0),
  totalAgents: z.number().int().min(1).max(5),
  totalRetries: z.number().int().min(0).optional(),
});

export interface FileDiscoveryResult {
  description: string;
  filePath: string;
  priority: 'high' | 'low' | 'medium';
  relevanceScore: number;
}
export type ParallelRefinementResponse = z.infer<typeof parallelRefinementResponseSchema>;

export type RefinementSettings = z.infer<typeof refinementSettingsSchema>;

export interface StepData {
  step1?: {
    originalRequest: string;
    parallelResults?: ParallelRefinementResponse;
    refinedRequest: string;
    selectedAgentId: string;
  };
  step2?: {
    discoveredFiles: Array<FileDiscoveryResult>;
    selectedFiles: Array<string>;
  };
  step3?: {
    implementationPlan: string;
    validationCommands: Array<string>;
  };
}
