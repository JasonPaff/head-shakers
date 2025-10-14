import type { FeatureType, PriorityLevel } from '@/lib/validations/feature-planner.validation';

/**
 * Job input type
 */
export type JobInput = JobMetadata['input'];

/**
 * Job metadata stored in Redis for feature suggestion jobs
 */
export interface JobMetadata {
  createdAt: number;
  error?: string;
  input: {
    additionalContext?: string;
    customModel?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  };
  status: 'completed' | 'failed' | 'in_progress' | 'pending';
  userId: string;
}

/**
 * Job status type
 */
export type JobStatus = JobMetadata['status'];
