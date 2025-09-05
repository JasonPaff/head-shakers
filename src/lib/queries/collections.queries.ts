import { and, eq, sql } from 'drizzle-orm';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { bobbleheads, collections, subCollections, users } from '@/lib/db/schema';

export const getCollectionsByUserAsync = cache(async (userId: string, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.select().from(collections).where(eq(collections.userId, userId));
});

export const getSubCollectionsByCollectionAsync = cache(
  async (collectionId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance.select().from(subCollections).where(eq(subCollections.collectionId, collectionId));
  },
);

export type CollectionById = Awaited<ReturnType<typeof getCollectionByIdAsync>>;

export const getCollectionByIdAsync = cache(
  async (collectionId: string, userId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance.query.collections.findFirst({
      where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
      with: {
        bobbleheads: {
          where: eq(bobbleheads.isDeleted, false),
        },
        subCollections: {
          orderBy: [sql`lower(${subCollections.name}) asc`],
          with: {
            bobbleheads: {
              where: eq(bobbleheads.isDeleted, false),
            },
          },
        },
      },
    });
  },
);

export const getCollectionsDashboardDataAsync = cache(
  async (clerkId: string, dbInstance: DatabaseExecutor = db) => {
    // first get the user by clerk ID and their collections with relations
    const userData = await dbInstance.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      with: {
        collections: {
          orderBy: [sql`lower(${collections.name}) asc`],
          with: {
            bobbleheads: {
              where: eq(bobbleheads.isDeleted, false),
            },
            subCollections: {
              with: {
                bobbleheads: {
                  where: eq(bobbleheads.isDeleted, false),
                },
              },
            },
          },
        },
      },
    });

    if (!userData) {
      return null;
    }

    // transform the data to include counts and flatten the structure
    return userData.collections.map((collection) => {
      // count direct bobbleheads in the collection
      const directBobbleheadCount = collection.bobbleheads.length;

      // count bobbleheads in subcollections and get subcollection details
      const subCollections = collection.subCollections.map((subCollection) => ({
        bobbleheadCount: subCollection.bobbleheads.length,
        id: subCollection.id,
        name: subCollection.name,
      }));

      // calculate total bobbleheads in subcollections
      const subCollectionBobbleheadCount = subCollections.reduce(
        (sum, subCollection) => sum + subCollection.bobbleheadCount,
        0,
      );

      return {
        bobbleheadCount: directBobbleheadCount,
        description: collection.description,
        id: collection.id,
        isPublic: collection.isPublic,
        name: collection.name,
        subCollectionCount: subCollections.length,
        subCollections,
        totalBobbleheadCount: directBobbleheadCount + subCollectionBobbleheadCount,
      };
    });
  },
);
