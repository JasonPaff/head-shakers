# Orchestration Output Validation Helper

## Purpose
This helper provides validation functions to ensure agent outputs match expected formats in the plan-feature orchestration.

## Validation Functions

### 1. Validate Feature Refinement Output
```javascript
function validateFeatureRefinement(output) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for single paragraph format (no headers)
  if (output.includes('#') || output.includes('##') || output.includes('###')) {
    validation.errors.push('Output contains headers - should be single paragraph only');
    validation.isValid = false;
  }

  // Check for bullet points or lists
  if (output.includes('\n-') || output.includes('\n*') || output.includes('\n1.')) {
    validation.errors.push('Output contains lists - should be single paragraph only');
    validation.isValid = false;
  }

  // Check word count (200-500 words)
  const wordCount = output.split(/\s+/).length;
  if (wordCount < 200) {
    validation.errors.push(`Output too short: ${wordCount} words (minimum 200)`);
    validation.isValid = false;
  }
  if (wordCount > 500) {
    validation.warnings.push(`Output too long: ${wordCount} words (maximum 500)`);
  }

  // Check for multiple paragraphs
  const paragraphs = output.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) {
    validation.errors.push(`Output has ${paragraphs.length} paragraphs - should be single paragraph`);
    validation.isValid = false;
  }

  return validation;
}
```

### 2. Validate Implementation Plan Output
```javascript
function validateImplementationPlan(output) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for XML format (should be markdown)
  if (output.includes('<?xml') || output.includes('<implementation-plan>')) {
    validation.errors.push('Output is in XML format - should be markdown');
    validation.isValid = false;
    return validation; // Critical error, skip other checks
  }

  // Check for required markdown sections
  const requiredSections = [
    '## Overview',
    '## Quick Summary',
    '## Prerequisites',
    '## Implementation Steps',
    '## Quality Gates',
    '## Notes'
  ];

  requiredSections.forEach(section => {
    if (!output.includes(section)) {
      validation.errors.push(`Missing required section: ${section}`);
      validation.isValid = false;
    }
  });

  // Check for required subsections in Overview
  if (output.includes('## Overview')) {
    if (!output.includes('**Estimated Duration**:')) {
      validation.errors.push('Missing Estimated Duration in Overview');
      validation.isValid = false;
    }
    if (!output.includes('**Complexity**:')) {
      validation.errors.push('Missing Complexity in Overview');
      validation.isValid = false;
    }
    if (!output.includes('**Risk Level**:')) {
      validation.errors.push('Missing Risk Level in Overview');
      validation.isValid = false;
    }
  }

  // Check for step format
  const stepPattern = /### Step \d+:/g;
  const steps = output.match(stepPattern);
  if (!steps || steps.length === 0) {
    validation.errors.push('No implementation steps found (expected format: ### Step N:)');
    validation.isValid = false;
  } else {
    // Check each step has required subsections
    const stepSections = ['**What**:', '**Why**:', '**Confidence**:', '**Validation Commands**:', '**Success Criteria**:'];
    stepSections.forEach(section => {
      if (!output.includes(section)) {
        validation.warnings.push(`Some steps may be missing: ${section}`);
      }
    });
  }

  // Check for validation commands
  if (!output.includes('npm run lint:fix && npm run typecheck')) {
    validation.errors.push('Missing required validation commands (npm run lint:fix && npm run typecheck)');
    validation.isValid = false;
  }

  // Check for code examples (should not be present)
  const codeBlockPattern = /```(?:javascript|typescript|jsx|tsx|js|ts)/gi;
  if (codeBlockPattern.test(output)) {
    validation.errors.push('Output contains code examples - should focus on WHAT not HOW');
    validation.isValid = false;
  }

  return validation;
}
```

### 3. Extract and Fix Content
```javascript
function extractValidContent(output, type) {
  if (type === 'refinement') {
    // Try to extract just the paragraph content
    const lines = output.split('\n');
    let content = '';
    let inParagraph = false;

    for (const line of lines) {
      // Skip headers and empty lines
      if (line.startsWith('#') || line.trim() === '') continue;
      // Skip lines that look like metadata
      if (line.includes('Analysis') || line.includes('Summary')) continue;
      // Collect paragraph content
      if (line.length > 50) { // Likely paragraph content
        content += (content ? ' ' : '') + line.trim();
        inParagraph = true;
      }
    }

    return content || output; // Fallback to original if extraction fails
  }

  if (type === 'plan' && output.includes('<?xml')) {
    // Attempt to convert XML to markdown
    // This would need more sophisticated parsing in practice
    return '## Conversion Required\n\nThe implementation plan was generated in XML format. Manual conversion to markdown template required.';
  }

  return output;
}
```

## Usage in Orchestration

```javascript
// In Step 1 validation
const refinementValidation = validateFeatureRefinement(agentOutput);
if (!refinementValidation.isValid) {
  console.error('Feature refinement validation failed:', refinementValidation.errors);
  // Attempt to extract valid content
  const extracted = extractValidContent(agentOutput, 'refinement');
  // Re-validate extracted content
  const revalidation = validateFeatureRefinement(extracted);
  if (revalidation.isValid) {
    agentOutput = extracted;
    console.log('Successfully extracted valid paragraph from output');
  }
}

// In Step 3 validation
const planValidation = validateImplementationPlan(agentOutput);
if (!planValidation.isValid) {
  console.error('Implementation plan validation failed:', planValidation.errors);
  if (agentOutput.includes('<?xml')) {
    console.error('CRITICAL: Agent returned XML instead of markdown. Retry with clearer instructions.');
    // Could trigger retry here
  }
}
```

## Validation Rules Summary

### Feature Refinement
- ✅ Single paragraph only (no headers, sections, lists)
- ✅ 200-500 words
- ✅ No multiple paragraphs
- ✅ Plain text format

### Implementation Plan
- ✅ Markdown format (not XML)
- ✅ Required sections present
- ✅ Proper step formatting
- ✅ Validation commands included
- ✅ No code examples
- ✅ Template compliance

### File Discovery
- ✅ Markdown format
- ✅ Files categorized by priority
- ✅ Analysis summary included
- ✅ File paths validated