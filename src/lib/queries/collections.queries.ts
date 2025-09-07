import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { bobbleheadPhotos, bobbleheads, collections, subCollections, users } from '@/lib/db/schema';

export const getCollectionsByUserAsync = cache(async (userId: string, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.select().from(collections).where(eq(collections.userId, userId));
});

export const getSubCollectionsByCollectionAsync = cache(
  async (collectionId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance.select().from(subCollections).where(eq(subCollections.collectionId, collectionId));
  },
);

export type SubcollectionByCollectionId = Awaited<ReturnType<typeof getSubCollectionByCollectionIdAsync>>;

export const getSubCollectionByCollectionIdAsync = cache(
  async (
    collectionId: string,
    subcollectionId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(eq(collections.id, collectionId), eq(collections.userId, userId)),
    });

    if (!collection) {
      return null;
    }

    const subCollection = await dbInstance.query.subCollections.findFirst({
      where: and(eq(subCollections.collectionId, collectionId), eq(subCollections.id, subcollectionId)),
      with: {
        bobbleheads: {
          where: eq(bobbleheads.isDeleted, false),
        },
      },
    });

    if (!subCollection) {
      return null;
    }

    const featuredBobbleheadCount = subCollection.bobbleheads.filter(
      (bobblehead) => bobblehead.isFeatured,
    ).length;

    return {
      bobbleheadCount: subCollection.bobbleheads.length,
      collectionId: subCollection.collectionId,
      collectionName: collection.name,
      createdAt: subCollection.createdAt,
      description: subCollection.description,
      featuredBobbleheadCount,
      featurePhoto: subCollection.coverImageUrl,
      id: subCollection.id,
      lastUpdatedAt: subCollection.updatedAt,
      name: subCollection.name,
    };
  },
);
export type SubcollectionsByCollectionId = Awaited<ReturnType<typeof getSubCollectionsByCollectionIdAsync>>;

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
      (bobblehead) => bobblehead.subcollectionId === null,
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

export type CollectionBobbleheads = Awaited<ReturnType<typeof getBobbleheadsBySubcollectionAsync>>;

export const getBobbleheadsByCollectionAsync = cache(
  async (collectionId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        status: bobbleheads.status,
        weight: bobbleheads.weight,
      })
      .from(bobbleheads)
      .leftJoin(
        bobbleheadPhotos,
        and(
          eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId),
          eq(bobbleheadPhotos.isPrimary, true),
          eq(bobbleheads.isDeleted, false),
        ),
      )
      .where(
        and(
          eq(bobbleheads.collectionId, collectionId),
          eq(bobbleheads.isDeleted, false),
          isNull(bobbleheads.subcollectionId),
        ),
      );
  },
);

export type SubcollectionBobbleheads = Awaited<ReturnType<typeof getBobbleheadsBySubcollectionAsync>>;

export const getBobbleheadsBySubcollectionAsync = cache(
  async (subcollectionId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        status: bobbleheads.status,
        weight: bobbleheads.weight,
      })
      .from(bobbleheads)
      .leftJoin(
        bobbleheadPhotos,
        and(
          eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId),
          eq(bobbleheadPhotos.isPrimary, true),
          eq(bobbleheads.isDeleted, false),
        ),
      )
      .where(and(eq(bobbleheads.subcollectionId, subcollectionId), eq(bobbleheads.isDeleted, false)));
  },
);

// public access versions of queries
export type CollectionByIdPublic = Awaited<ReturnType<typeof getCollectionByIdForPublicAsync>>;

export const getCollectionByIdForPublicAsync = cache(
  async (collectionId: string, viewerUserId?: string, dbInstance: DatabaseExecutor = db) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(
        eq(collections.id, collectionId),
        viewerUserId ?
          or(eq(collections.isPublic, true), eq(collections.userId, viewerUserId))
        : eq(collections.isPublic, true),
      ),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            viewerUserId ?
              or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, viewerUserId))
            : eq(bobbleheads.isPublic, true),
          ),
        },
        subCollections: {
          with: {
            bobbleheads: {
              where: and(
                eq(bobbleheads.isDeleted, false),
                viewerUserId ?
                  or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, viewerUserId))
                : eq(bobbleheads.isPublic, true),
              ),
            },
          },
        },
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // calculate total bobblehead count (collection plus subcollections)
    const directBobbleheadCount = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subcollectionId === null,
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
      isPublic: collection.isPublic,
      lastUpdatedAt,
      name: collection.name,
      subCollectionCount: collection.subCollections.length,
      totalBobbleheadCount,
      userId: collection.user?.id,
    };
  },
);

export type SubcollectionByCollectionIdPublic = Awaited<
  ReturnType<typeof getSubCollectionByCollectionIdForPublicAsync>
>;

export const getSubCollectionByCollectionIdForPublicAsync = cache(
  async (
    collectionId: string,
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(
        eq(collections.id, collectionId),
        viewerUserId ?
          or(eq(collections.isPublic, true), eq(collections.userId, viewerUserId))
        : eq(collections.isPublic, true),
      ),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    const subCollection = await dbInstance.query.subCollections.findFirst({
      where: and(eq(subCollections.collectionId, collectionId), eq(subCollections.id, subcollectionId)),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            viewerUserId ?
              or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, viewerUserId))
            : eq(bobbleheads.isPublic, true),
          ),
        },
      },
    });

    if (!subCollection) {
      return null;
    }

    const featuredBobbleheadCount = subCollection.bobbleheads.filter(
      (bobblehead) => bobblehead.isFeatured,
    ).length;

    return {
      bobbleheadCount: subCollection.bobbleheads.length,
      collectionId: subCollection.collectionId,
      collectionName: collection.name,
      createdAt: subCollection.createdAt,
      description: subCollection.description,
      featuredBobbleheadCount,
      featurePhoto: subCollection.coverImageUrl,
      id: subCollection.id,
      lastUpdatedAt: subCollection.updatedAt,
      name: subCollection.name,
      userId: collection.user?.id,
    };
  },
);

export type SubcollectionsByCollectionIdPublic = Awaited<
  ReturnType<typeof getSubCollectionsByCollectionIdForPublicAsync>
>;

export const getSubCollectionsByCollectionIdForPublicAsync = cache(
  async (collectionId: string, viewerUserId?: string, dbInstance: DatabaseExecutor = db) => {
    const collection = await dbInstance.query.collections.findFirst({
      where: and(
        eq(collections.id, collectionId),
        viewerUserId ?
          or(eq(collections.isPublic, true), eq(collections.userId, viewerUserId))
        : eq(collections.isPublic, true),
      ),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    const subCollectionData = await dbInstance.query.subCollections.findMany({
      orderBy: [sql`lower(${subCollections.name}) asc`],
      where: eq(subCollections.collectionId, collectionId),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            viewerUserId ?
              or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, viewerUserId))
            : eq(bobbleheads.isPublic, true),
          ),
        },
      },
    });

    return {
      subCollections: subCollectionData.map((subCollection) => ({
        bobbleheadCount: subCollection.bobbleheads.length,
        description: subCollection.description,
        featurePhoto: subCollection.coverImageUrl,
        id: subCollection.id,
        name: subCollection.name,
      })),
      userId: collection.user?.id,
    };
  },
);
