import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

import { SCHEMA_LIMITS } from '@/lib/constants/schema-limits';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/constants/slug';

export const Route = {
  routeParams: z.object({
    bobbleheadSlug: z
      .string()
      .min(SLUG_MIN_LENGTH, 'Bobblehead slug is required')
      .max(SLUG_MAX_LENGTH, `Bobblehead slug must be ${SLUG_MAX_LENGTH} characters or less`)
      .regex(SLUG_PATTERN, 'Bobblehead slug must contain only lowercase letters, numbers, and hyphens'),
    collectionSlug: z
      .string()
      .min(SLUG_MIN_LENGTH, 'Collection slug is required')
      .max(SLUG_MAX_LENGTH, `Collection slug must be ${SLUG_MAX_LENGTH} characters or less`)
      .regex(SLUG_PATTERN, 'Collection slug must contain only lowercase letters, numbers, and hyphens'),
    username: z.string().min(SCHEMA_LIMITS.USER.USERNAME.MIN, 'Username is required'),
  }),
  searchParams: z.object({}),
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
