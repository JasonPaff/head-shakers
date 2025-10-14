/**
 * Claude model identifiers for Agent SDK
 * @see {@link https://docs.anthropic.com/en/docs/about-claude/models}
 */
export const CLAUDE_MODELS = {
  HAIKU_4: 'claude-haiku-4-20250229',
  OPUS_4: 'claude-opus-4-20250514',
  SONNET_4: 'claude-sonnet-4-20250929',
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * Default model for feature planner operations
 */
export const DEFAULT_FEATURE_PLANNER_MODEL = CLAUDE_MODELS.SONNET_4_5;

/**
 * Fallback model if primary model is unavailable
 */
export const FALLBACK_MODEL = CLAUDE_MODELS.SONNET_4;
