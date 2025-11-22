import { z } from 'zod';

import { zodNullableUUID } from '@/lib/utils/zod.utils';

/**
 * Type exports for navigation schemas
 */
export type AdjacentBobbleheadSchema = z.infer<typeof adjacentBobbleheadSchema>;
export type BobbleheadNavigationDataSchema = z.infer<typeof bobbleheadNavigationDataSchema>;
export type GetBobbleheadNavigation = z.infer<typeof getBobbleheadNavigationSchema>;

/**
 * Schema for an adjacent bobblehead in navigation context
 * Contains minimal data needed for rendering navigation links
 */
export const adjacentBobbleheadSchema = z.object({
  /** Unique identifier for the bobblehead */
  id: z.uuid({ message: 'Bobblehead ID must be a valid UUID' }),
  /** Display name of the bobblehead */
  name: z.string().min(1, { message: 'Name is required' }),
  /** Optional primary photo URL for preview */
  photoUrl: z.url().nullable(),
  /** URL-friendly slug for navigation */
  slug: z.string().min(1, { message: 'Slug is required' }),
});

/**
 * Schema for nullable adjacent bobblehead (used when no adjacent bobblehead exists)
 */
export const nullableAdjacentBobbleheadSchema = adjacentBobbleheadSchema.nullable();

/**
 * Schema for complete bobblehead navigation data
 * Contains references to both adjacent bobbleheads within a collection context
 */
export const bobbleheadNavigationDataSchema = z.object({
  /** The next bobblehead in the collection (older by createdAt) */
  nextBobblehead: nullableAdjacentBobbleheadSchema,
  /** The previous bobblehead in the collection (newer by createdAt) */
  previousBobblehead: nullableAdjacentBobbleheadSchema,
});

/**
 * Schema for fetching bobblehead navigation data
 * Validates input parameters for the navigation facade/action
 */
export const getBobbleheadNavigationSchema = z.object({
  /** The ID of the current bobblehead */
  bobbleheadId: z.uuid({ message: 'Bobblehead ID is required' }),
  /** The ID of the collection containing the bobblehead */
  collectionId: z.uuid({ message: 'Collection ID is required' }),
  /** Optional subcollection ID for filtered navigation */
  subcollectionId: zodNullableUUID('Subcollection ID'),
});
