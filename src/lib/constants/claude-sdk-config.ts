import type { Options } from '@anthropic-ai/claude-agent-sdk';

/**
 * Maximum conversation turns per operation type
 * Lower values = faster execution and lower costs
 */
export const TURN_LIMITS = {
  FEATURE_SUGGESTION: 50, // Increased to accommodate file reading + response generation
  FILE_DISCOVERY_LEGACY: 12,
  FILE_DISCOVERY_SPECIALIZED: 6,
  IMPLEMENTATION_PLANNING: 10,
  REFINEMENT: 8,
  SYNTHESIS: 5,
} as const;

/**
 * Maximum thinking tokens per operation type
 * Prevents cost overruns from excessive reasoning
 */
export const THINKING_TOKEN_LIMITS = {
  FEATURE_SUGGESTION: 2000,
  FILE_DISCOVERY: 1000,
  IMPLEMENTATION_PLANNING: 3000,
  REFINEMENT: 1500,
  SYNTHESIS: 1000,
} as const;

/**
 * Default temperature for creative vs deterministic outputs
 * Note: Requires SDK support - will be added when available
 */
export const TEMPERATURE_CONFIG = {
  FEATURE_SUGGESTION: 0.7, // Creative suggestions
  FILE_DISCOVERY: 0.3, // Deterministic search
  IMPLEMENTATION_PLANNING: 0.4, // Structured output
  REFINEMENT: 0.5, // Balanced
  SYNTHESIS: 0.6, // Balanced creativity
} as const;

/**
 * Base SDK options for all feature planner operations
 */
export const BASE_SDK_OPTIONS: Partial<Options> = {
  additionalDirectories: ['docs', 'tests'],
  cwd: process.cwd(),
  permissionMode: 'bypassPermissions', // Read-only tools, no prompts needed
  settingSources: ['project'], // Load CLAUDE.md
} as const;
