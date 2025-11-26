import { z } from 'zod';

import { ENUMS } from '@/lib/constants';

/**
 * validation schema for like toggle action
 * used for both like and unlike operations
 */
export const toggleLikeSchema = z.object({
  targetId: z.string().uuid('Target ID must be a valid UUID'),
  targetType: z.enum(ENUMS.LIKE.TARGET_TYPE, {
    message: 'Target type must be bobblehead or collection',
  }),
});

/**
 * validation schema for getting like status
 */
export const getLikeStatusSchema = toggleLikeSchema;

/**
 * validation schema for batch like operations
 */
export const getBatchLikeDataSchema = z.object({
  targets: z
    .array(
      z.object({
        targetId: z.string().uuid('Target ID must be a valid UUID'),
        targetType: z.enum(ENUMS.LIKE.TARGET_TYPE),
      }),
    )
    .min(1, 'At least one target is required')
    .max(50, 'Maximum 50 targets allowed per batch'),
});

export type GetBatchLikeData = z.infer<typeof getBatchLikeDataSchema>;
export type GetLikeStatus = z.infer<typeof getLikeStatusSchema>;
export type ToggleLike = z.infer<typeof toggleLikeSchema>;
