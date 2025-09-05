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

export const getSubCollectionsByCollectionIdAsync = cache(
  async (collectionId: string, userId: string, dbInstance: DatabaseExecutor = db) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    });

    if (!collection) {
      return null;
    }

    const subCollectionData = await dbInstance.query.subCollections.findMany({
      orderBy: [sql`lower(${subCollections.name}) asc`],
      where: eq(subCollections.collectionId, collectionId),
      with: {
        bobbleheads: {
          where: eq(bobbleheads.isDeleted, false),
        },
      },
    });

    return subCollectionData.map((subCollection) => ({
      bobbleheadCount: subCollection.bobbleheads.length,
      description: subCollection.description,
      featurePhoto: subCollection.coverImageUrl,
      id: subCollection.id,
      name: subCollection.name,
    }));
  },
);

export type CollectionById = Awaited<ReturnType<typeof getCollectionByIdAsync>>;

export const getCollectionByIdAsync = cache(
  async (collectionId: string, userId: string, dbInstance: DatabaseExecutor = db) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
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
    });

    if (!collection) {
      return null;
    }

    // calculate total bobblehead count (collection plus subcollections)
    const directBobbleheadCount = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subCollectionId === null,
    ).length;
    const subCollectionBobbleheadCount = collection.subCollections.reduce(
      (sum, subCollection) => sum + subCollection.bobbleheads.length,
      0,
    );
    const totalBobbleheadCount = directBobbleheadCount + subCollectionBobbleheadCount;

    // the last updated at is the latest updatedAt from the collection and its subcollections
    const lastUpdatedAt = [
      collection.updatedAt,
      ...collection.subCollections.map((sc) => sc.updatedAt),
    ].reduce((latest, date) => (date > latest ? date : latest), collection.updatedAt);

    return {
      createdAt: collection.createdAt,
      description: collection.description,
      id: collection.id,
      lastUpdatedAt,
      name: collection.name,
      subCollectionCount: collection.subCollections.length,
      totalBobbleheadCount,
    };
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
