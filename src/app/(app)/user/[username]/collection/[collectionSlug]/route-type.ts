import type { DynamicRoute, InferPagePropsType } from 'next-typesafe-url';

import { z } from 'zod';

import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_PATTERN } from '@/lib/constants/slug';

const searchParamsSchema = z.object({
  layout: z.enum(['grid', 'gallery', 'list']).optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional(),
});

export type CollectionSearchParams = z.infer<typeof searchParamsSchema>;

export const Route = {
  routeParams: z.object({
    collectionSlug: z
      .string()
      .min(SLUG_MIN_LENGTH, 'Collection slug is required')
      .max(SLUG_MAX_LENGTH, `Collection slug must be ${SLUG_MAX_LENGTH} characters or less`)
      .regex(SLUG_PATTERN, 'Collection slug must contain only lowercase letters, numbers, and hyphens'),
    username: z.string().min(1, 'Username is required'),
  }),
  searchParams: searchParamsSchema,
} satisfies DynamicRoute;

export type PageProps = InferPagePropsType<RouteType>;
export type RouteType = typeof Route;
