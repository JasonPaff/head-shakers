import { eq, sql } from 'drizzle-orm';
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

export const getCollectionsDashboardDataAsync = cache(
  async (clerkId: string, dbInstance: DatabaseExecutor = db) => {
    const user = await dbInstance
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    const userId = user[0]!.id;

    // get all collections with aggregated data
    const collectionsData = await dbInstance
      .select({
        // get direct bobblehead count for this collection
        bobbleheadCount: sql<number>`
          COALESCE((
            SELECT COUNT(*)::int
            FROM ${bobbleheads}
            WHERE ${bobbleheads.collectionId} = ${collections.id}
            AND ${bobbleheads.isDeleted} = false
          ), 0)
        `,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        // get subcollection count
        subCollectionCount: sql<number>`
          COALESCE((
            SELECT COUNT(*)::int
            FROM ${subCollections}
            WHERE ${subCollections.collectionId} = ${collections.id}
          ), 0)
        `,
        // get total bobblehead count including subcollections
        totalBobbleheadCount: sql<number>`
          COALESCE((
            SELECT COUNT(*)::int
            FROM ${bobbleheads}
            WHERE ${bobbleheads.collectionId} = ${collections.id}
            AND ${bobbleheads.isDeleted} = false
          ), 0) + COALESCE((
            SELECT COUNT(*)::int
            FROM ${bobbleheads} b
            INNER JOIN ${subCollections} sc ON b.${bobbleheads.subCollectionId} = sc.id
            WHERE sc.${subCollections.collectionId} = ${collections.id}
            AND b.${bobbleheads.isDeleted} = false
          ), 0)
        `,
      })
      .from(collections)
      .where(eq(collections.userId, userId));

    // get subcollection details for each collection
    const collectionsWithSubcollections = await Promise.all(
      collectionsData.map(async (collection) => {
        const subcollectionsData = await dbInstance
          .select({
            bobbleheadCount: sql<number>`
              COALESCE((
                SELECT COUNT(*)::int
                FROM ${bobbleheads}
                WHERE ${bobbleheads.subCollectionId} = ${subCollections.id}
                AND ${bobbleheads.isDeleted} = false
              ), 0)
            `,
            id: subCollections.id,
            name: subCollections.name,
          })
          .from(subCollections)
          .where(eq(subCollections.collectionId, collection.id));

        return {
          ...collection,
          subCollections: subcollectionsData,
        };
      }),
    );

    return collectionsWithSubcollections;
  },
);
