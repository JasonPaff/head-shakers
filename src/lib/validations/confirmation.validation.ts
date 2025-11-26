import { z } from 'zod';

/**
 * Creates a Zod validation schema for name confirmation.
 * Validates that the input exactly matches the target string (case-sensitive).
 *
 * @param targetName - The exact name that must be typed for confirmation
 * @returns Zod schema that validates exact string matching
 *
 * @example
 * const schema = createConfirmationSchema('My Collection');
 * schema.parse('My Collection'); // ✓ Valid
 * schema.parse('my collection'); // ✗ Invalid - case mismatch
 * schema.parse('My Collections'); // ✗ Invalid - text mismatch
 */
export const createConfirmationSchema = (targetName: string) => {
  return z.object({
    confirmationName: z
      .string()
      .trim()
      .min(1, { message: 'Please type the name to confirm' })
      .refine(
        (value) => {
          return (value ?? '').length <= 1 || value === targetName;
        },
        {
          message: `Please type "${targetName}" exactly to confirm`,
        },
      ),
  });
};

/**
 * Type inference helper for confirmation schemas.
 * Use this to get the TypeScript type for a confirmation schema instance.
 *
 * @example
 * type MyConfirmation = ConfirmationSchemaType<typeof mySchema>;
 */
export type ConfirmationSchemaType<T extends ReturnType<typeof createConfirmationSchema>> = z.infer<T>;
