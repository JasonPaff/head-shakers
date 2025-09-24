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

export interface StepResult {
  data?: unknown;
  error?: string;
  isSuccessful: boolean;
}