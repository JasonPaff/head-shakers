import type { RefinementConfig } from './types';

export const REFINEMENT_CONFIG: RefinementConfig = {
  allowedTools: ['Read'],
  maxTurns: 2,
  maxWords: 250,
  minWords: 100,
};

export const FEATURE_REQUEST_VALIDATION = {
  forbiddenPatterns: [
    /^\s*$/, // empty or whitespace only
    /^test$/i, // just "test"
    /lorem ipsum/i, // placeholder text
  ],
  maxWordCount: 100,
  minWordCount: 3,
} as const;

export const FILE_PATHS = {
  claudeMd: 'CLAUDE.md',
  packageJson: 'package.json',
  readme: 'README.md',
} as const;

export const ORCHESTRATION_CONFIG = {
  dateFormat: 'YYYY_MM_DD',
  maxFeatureNameLength: 50,
  stepFilePrefix: {
    contextGathering: '03-context-gathering',
    fileDiscovery: '02-file-discovery',
    planGeneration: '04-plan-generation',
    refinement: '01-feature-refinement',
  },
} as const;
