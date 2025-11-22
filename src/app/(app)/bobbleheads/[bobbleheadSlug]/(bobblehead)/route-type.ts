import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/constants/slug';

const searchParamsSchema = z.object({
  // Use .catch(undefined) to handle empty strings gracefully - they fail UUID validation but we want them treated as undefined
  collectionId: z.uuid('Invalid collection ID').optional().catch(undefined),
  subcollectionId: z.uuid('Invalid subcollection ID').optional().catch(undefined),
});

export type BobbleheadNavigationContext = z.infer<typeof searchParamsSchema>;

export const Route = {
  routeParams: z.object({
    bobbleheadSlug: z
      .string()
      .min(SLUG_MIN_LENGTH, 'Bobblehead slug is required')
      .max(SLUG_MAX_LENGTH, `Bobblehead slug must be ${SLUG_MAX_LENGTH} characters or less`)
      .regex(SLUG_PATTERN, 'Bobblehead slug must contain only lowercase letters, numbers, and hyphens'),
  }),
  searchParams: searchParamsSchema,
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
