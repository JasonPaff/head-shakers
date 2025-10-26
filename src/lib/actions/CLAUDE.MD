## SERVER ACTION RULES

- ** Do not** use the parsedInput directly, use the ctx.sanitizedInput parsed through the Zod validation schema.
- The ctx.sanitizedInput is guaranteed to be valid but it will be typed as unknown, you need to run it through the Zod schema to get the correct types.
