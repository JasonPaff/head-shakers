import type { ClaudeResult, ClaudeSuccessResult, FeatureRequestValidation } from './types';

import { FEATURE_REQUEST_VALIDATION } from './config';

export function createDetailedError(
  operation: string,
  context: Record<string, unknown>,
  originalError?: Error,
): Error {
  const errorDetails = {
    context,
    operation,
    originalError: originalError?.message,
    timestamp: new Date().toISOString(),
  };

  const message = `${operation} failed: ${JSON.stringify(errorDetails, null, 2)}`;
  return new Error(message);
}

export function isClaudeSuccessResult(result: ClaudeResult): result is ClaudeSuccessResult {
  return result.subtype === 'success' && 'result' in result;
}

export function validateClaudeResult(result: unknown): ClaudeResult {
  if (!result || typeof result !== 'object') {
    throw new Error(`Invalid Claude result: expected object, got ${typeof result}`);
  }

  const obj = result as Record<string, unknown>;

  if (obj.type !== 'result') {
    throw new Error(`Invalid Claude result type: expected 'result', got '${String(obj.type)}'`);
  }

  if (typeof obj.subtype !== 'string') {
    throw new Error(`Invalid Claude result subtype: expected string, got ${typeof obj.subtype}`);
  }

  const validSubtypes = ['success', 'error_max_turns', 'error_during_execution'];
  if (!validSubtypes.includes(obj.subtype)) {
    throw new Error(
      `Invalid Claude result subtype: '${obj.subtype}', expected one of: ${validSubtypes.join(', ')}`,
    );
  }

  // For success results, validate required fields
  if (obj.subtype === 'success') {
    if (typeof obj.result !== 'string') {
      throw new Error(
        `Invalid Claude success result: 'result' field must be string, got ${typeof obj.result}`,
      );
    }
  }

  return result as ClaudeResult;
}

export function validateFeatureRequest(request: string): FeatureRequestValidation {
  const errors: string[] = [];
  const trimmedRequest = request.trim();
  const wordCount = trimmedRequest.split(/\s+/).length;

  // check if empty or whitespace only
  if (!trimmedRequest) {
    errors.push('Feature request cannot be empty');
    return { errors, isValid: false, wordCount: 0 };
  }

  // check word count limits
  if (wordCount < FEATURE_REQUEST_VALIDATION.minWordCount) {
    errors.push(
      `Feature request too short: ${wordCount} words (minimum ${FEATURE_REQUEST_VALIDATION.minWordCount})`,
    );
  }

  if (wordCount > FEATURE_REQUEST_VALIDATION.maxWordCount) {
    errors.push(
      `Feature request too long: ${wordCount} words (maximum ${FEATURE_REQUEST_VALIDATION.maxWordCount})`,
    );
  }

  // check for forbidden patterns
  for (const pattern of FEATURE_REQUEST_VALIDATION.forbiddenPatterns) {
    if (pattern.test(trimmedRequest)) {
      errors.push(`Feature request contains invalid content pattern: ${pattern.source}`);
    }
  }

  // check for basic content requirements
  if (trimmedRequest.length < 10) {
    errors.push('Feature request must contain meaningful description');
  }

  return {
    errors,
    isValid: errors.length === 0,
    wordCount,
  };
}
