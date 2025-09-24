export interface ClaudeErrorResult {
  duration_api_ms: number;
  duration_ms: number;
  isError: boolean;
  num_turns: number;
  subtype: 'error_during_execution' | 'error_max_turns';
  total_cost_usd: number;
  type: 'result';
  usage: Record<string, number>;
}

export type ClaudeResult = ClaudeErrorResult | ClaudeSuccessResult;

export interface ClaudeSuccessResult {
  duration_api_ms: number;
  num_turns: number;
  result: string;
  subtype: 'success';
  total_cost_usd: number;
  type: 'result';
  usage: Record<string, number>;
}

export interface FeaturePlannerResult {
  discoveredFiles?: string[];
  error?: string;
  executionTime?: number;
  implementationPlan?: string;
  isSuccessful: boolean;
  orchestrationPath?: string;
  planPath?: string;
  refinedRequest?: string;
}

export interface FeatureRequestValidation {
  errors: string[];
  isValid: boolean;
  wordCount: number;
}

export interface RefinementConfig {
  allowedTools: string[];
  maxTurns: number;
  maxWords: number;
  minWords: number;
}

export interface StepResult {
  data?: unknown;
  error?: string;
  isSuccessful: boolean;
}
