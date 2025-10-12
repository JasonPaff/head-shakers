# File Discovery JSON Format Improvements

**Date**: October 12, 2025
**Issue**: File discovery agents inconsistently returning proper JSON format
**Status**: ✅ Completed

## Problem Summary

The file discovery agents were returning responses with preambles like `"Claude confirmed..."` before the JSON, causing `JSON.parse()` to fail. The error logs showed:

```
Error in Facades & Services Agent: SyntaxError: Unexpected token 'C', "Claude con"... is not valid JSON
```

## Root Cause Analysis

1. **No Prefilling Support**: The Claude Agent SDK's `query()` function doesn't support assistant message prefilling (which would force starting with `{`)
2. **Weak Format Enforcement**: The original prompt used plain text instructions that Claude would sometimes ignore
3. **No Retry Mechanism**: If an agent failed to return proper format, the operation would just fail
4. **Poor Error Logging**: Limited visibility into what went wrong during parsing

## Research Findings

According to Anthropic's official documentation:

- **XML tags** are highly effective for structuring prompts and enforcing format compliance
- Claude is specifically trained to respect XML-structured instructions
- XML provides better clarity, accuracy, and parseability compared to dense prose
- Prefilling is the most powerful technique but is **not available** in the Agent SDK

## Implemented Solutions

### 1. XML-Structured Prompt (High Impact)

**File**: `src/lib/services/feature-planner.service.ts:832`

**Changes**:

- Restructured the entire prompt using XML tags for better organization
- Added `<feature_request>`, `<instructions>`, `<critical_output_format>`, `<examples>`, etc.
- Included explicit `<incorrect_format_examples>` showing what NOT to do
- Created nested sections for better logical grouping

**Benefits**:

- Claude respects XML boundaries more reliably than plain text
- Clear separation prevents instruction/output mixing
- More "readable" structure for the model

**Example Structure**:

````xml
<feature_request>
${refinedRequest}
</feature_request>

<instructions>
<task_steps>
1. Use Glob to search...
2. Use Grep to search...
</task_steps>
</instructions>

<critical_output_format>
<format_rules>
ABSOLUTELY CRITICAL:
- Your response MUST be ONLY a JSON code block
- NO text before the opening ```json
- NO text after the closing ```
</format_rules>

<incorrect_format_examples>
WRONG - Has preamble:
"Here are the files I found:
```json
[...]
```"
</incorrect_format_examples>
</critical_output_format>
````

### 2. Improved JSON Extraction (Quick Win)

**File**: `src/lib/services/feature-planner.service.ts:1145`

**Changes**:

- Added better regex matching to strip preambles
- Implemented fallback to find JSON without code block markers
- Enhanced error logging with response previews
- Added Zod validation error logging for debugging

**Benefits**:

- More resilient to format variations
- Better debugging information when parsing fails
- Graceful degradation to markdown format

**Key Improvements**:

````typescript
// IMPROVEMENT 1: Strip any preamble text before JSON code block
const jsonBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);

// IMPROVEMENT 2: Log Zod validation errors for debugging
console.error(`[parseFileDiscoveryResponse] Zod validation failed:`, parseResult.error.issues);

// IMPROVEMENT 3: Better error logging
console.error(`[parseFileDiscoveryResponse] JSON parse error:`, parseError);
console.error(`[parseFileDiscoveryResponse] Problematic JSON:`, jsonContent.substring(0, 200));

// IMPROVEMENT 4: Try to find JSON without code block markers
const jsonMatch = response.match(/\[[\s\S]*\]/);
````

### 3. Validation & Retry Loop (Best Practice)

**File**: `src/lib/services/feature-planner.service.ts:1013`

**Changes**:

- Added retry loop (max 1 retry) if format is invalid
- Created specialized retry prompt using XML structure
- Enhanced logging to show attempt numbers
- Graceful failure returns empty results instead of crashing

**Benefits**:

- Second chance for agents to correct format errors
- Better visibility into retry attempts
- No single agent failure crashes the entire operation

**Retry Logic**:

```typescript
const maxRetries = 1; // Allow one retry if format is invalid

for (let attempt = 0; attempt <= maxRetries; attempt++) {
  // Build prompt based on attempt number
  const prompt =
    attempt === 0 ?
      this.buildSpecializedAgentPrompt(refinedRequest, agent)
    : `Your previous response did not follow the required format.

<previous_response>
${lastResponse.substring(0, 500)}
</previous_response>

<problem>
Your response must start with \`\`\`json and end with \`\`\`, with NO other text before or after.
</problem>

<instructions>
Please try again and provide ONLY the JSON code block with no additional text.
</instructions>`;

  // ... execute agent ...

  if (discoveredFiles.length > 0) {
    return { agentId, discoveredFiles, tokenUsage };
  }

  if (attempt < maxRetries) {
    console.warn(`[${agent.agentId}] No files found on attempt ${attempt + 1}, retrying...`);
    continue;
  }
}
```

## Expected Outcomes

### Immediate Benefits

1. **Higher Success Rate**: XML structure + retry logic should significantly reduce format errors
2. **Better Debugging**: Enhanced logging provides clear visibility into what went wrong
3. **Graceful Degradation**: Even if JSON parsing fails, markdown fallback still works
4. **More Resilient**: Single agent failures don't crash the entire workflow

### Metrics to Monitor

- **Format Compliance Rate**: % of agents that return valid JSON on first attempt
- **Retry Success Rate**: % of retries that successfully correct format errors
- **Agent Success Rate**: % of agents that return at least 3 files
- **Parsing Errors**: Number of "SyntaxError: Unexpected token" errors (should drop to ~0)

## Testing Recommendations

1. **Run a test discovery session** to verify agents now return proper JSON
2. **Check server logs** for format compliance and retry patterns
3. **Monitor error rates** compared to previous runs
4. **Verify all 15 agents** successfully return files

## Code Quality

- ✅ All code formatted with Prettier
- ✅ TypeScript type checking passes with no errors
- ✅ No ESLint disable comments
- ✅ Proper error handling throughout

## Related Documentation

- **Anthropic Docs**: [Use XML tags to structure prompts](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags)
- **Anthropic Docs**: [Prefill Claude's response](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prefill-claudes-response)
- **Anthropic Docs**: [Increase consistency](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/increase-consistency)

## Next Steps

1. Test the changes with a real file discovery run
2. Monitor success rates and error logs
3. If issues persist, consider:
   - Increasing retry count from 1 to 2
   - Adding more explicit negative examples
   - Simplifying the JSON schema requirements
   - Using stricter validation before retry

## Notes

- The Claude Agent SDK does **not** support assistant message prefilling (unlike the Messages API)
- This means we cannot use the most powerful technique (`{"role": "assistant", "content": "{"}`)
- XML tags are the next best alternative for format enforcement
- The combination of XML + retry loop should achieve similar results
