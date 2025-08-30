import { and, desc, eq, inArray, like, or } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertBobblehead,
  InsertBobbleheadPhoto,
  UpdateBobblehead,
  UpdateBobbleheadPhoto,
} from '@/lib/validations/bobbleheads.validation';

import { TAGS } from '@/lib/constants/tags';
import { db } from '@/lib/db';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema';

export const createBobbleheadAsync = async (data: InsertBobblehead, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.insert(bobbleheads).values(data).returning();
};

export const updateBobbleheadAsync = async (
  id: string,
  data: UpdateBobblehead,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance.update(bobbleheads).set(data).where(eq(bobbleheads.id, id)).returning();
};

export const getBobbleheadByIdAsync = cache(async (id: string, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.select().from(bobbleheads).where(eq(bobbleheads.id, id));
});

export const getTrendingBobbleheads = unstable_cache(
  async (limit: number = 10) => {
    return db.select().from(bobbleheads).orderBy(desc(bobbleheads.viewCount)).limit(limit);
  },
  ['trending-bobbleheads'],
  { revalidate: 300, tags: [TAGS.BOBBLEHEAD.BOBBLEHEADS] },
);

export const getBobbleheadWithDetailsAsync = cache(
  async (id: string, userId?: string, dbInstance: DatabaseExecutor = db) => {
    const query = dbInstance
      .select()
      .from(bobbleheads)
      .where(
        and(
          eq(bobbleheads.id, id),
          eq(bobbleheads.isDeleted, false),
          userId ?
            or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, userId))
          : eq(bobbleheads.isPublic, true),
        ),
      );

    return query;
  },
);

export const getBobbleheadsByCollectionAsync = cache(
  async (collectionId: string, userId?: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance
      .select()
      .from(bobbleheads)
      .where(
        and(
          eq(bobbleheads.collectionId, collectionId),
          eq(bobbleheads.isDeleted, false),
          userId ?
            or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, userId))
          : eq(bobbleheads.isPublic, true),
        ),
      )
      .orderBy(desc(bobbleheads.createdAt));
  },
);

export const getBobbleheadsByUserAsync = cache(
  async (userId: string, viewerUserId?: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance
      .select()
      .from(bobbleheads)
      .where(
        and(
          eq(bobbleheads.userId, userId),
          eq(bobbleheads.isDeleted, false),
          viewerUserId === userId ? undefined : eq(bobbleheads.isPublic, true),
        ),
      )
      .orderBy(desc(bobbleheads.createdAt));
  },
);

export const searchBobbleheadsAsync = async (
  searchTerm: string,
  filters: {
    category?: string;
    collectionId?: string;
    manufacturer?: string;
    maxYear?: number;
    minYear?: number;
    status?: string;
    userId?: string;
  } = {},
  userId?: string,
  limit = 20,
  offset = 0,
  dbInstance: DatabaseExecutor = db,
) => {
  const conditions = [
    eq(bobbleheads.isDeleted, false),
    userId ?
      or(eq(bobbleheads.isPublic, true), eq(bobbleheads.userId, userId))
    : eq(bobbleheads.isPublic, true),
  ];

  const escapedSearchTerm = searchTerm.replace(/[%_]/g, '\\$&');
  if (escapedSearchTerm) {
    conditions.push(
      or(
        like(bobbleheads.name, `%${searchTerm}%`),
        like(bobbleheads.description, `%${searchTerm}%`),
        like(bobbleheads.characterName, `%${searchTerm}%`),
        like(bobbleheads.manufacturer, `%${searchTerm}%`),
        like(bobbleheads.series, `%${searchTerm}%`),
      ),
    );
  }

  if (filters.userId) conditions.push(eq(bobbleheads.userId, filters.userId));
  if (filters.collectionId) conditions.push(eq(bobbleheads.collectionId, filters.collectionId));
  if (filters.category) conditions.push(eq(bobbleheads.category, filters.category));
  if (filters.manufacturer) conditions.push(eq(bobbleheads.manufacturer, filters.manufacturer));
  if (filters.status) conditions.push(eq(bobbleheads.status, filters.status));
  if (filters.minYear) conditions.push(eq(bobbleheads.year, filters.minYear));
  if (filters.maxYear) conditions.push(eq(bobbleheads.year, filters.maxYear));

  return dbInstance
    .select()
    .from(bobbleheads)
    .where(and(...conditions))
    .orderBy(desc(bobbleheads.createdAt))
    .limit(limit)
    .offset(offset);
};

export const deleteBobbleheadAsync = async (
  id: string,
  userId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance
    .update(bobbleheads)
    .set({
      deletedAt: new Date(),
      isDeleted: true,
    })
    .where(and(eq(bobbleheads.id, id), eq(bobbleheads.userId, userId)))
    .returning();
};

export const deleteBobbleheadsAsync = async (
  ids: Array<string>,
  userId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance
    .update(bobbleheads)
    .set({
      deletedAt: new Date(),
      isDeleted: true,
    })
    .where(and(inArray(bobbleheads.id, ids), eq(bobbleheads.userId, userId)))
    .returning();
};

export const createBobbleheadPhotoAsync = async (
  data: InsertBobbleheadPhoto,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance.insert(bobbleheadPhotos).values(data).returning();
};

export const getBobbleheadPhotosAsync = cache(
  async (bobbleheadId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance
      .select()
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, bobbleheadId))
      .orderBy(bobbleheadPhotos.sortOrder, bobbleheadPhotos.uploadedAt);
  },
);

export const updateBobbleheadPhotoAsync = async (
  id: string,
  data: UpdateBobbleheadPhoto,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance.update(bobbleheadPhotos).set(data).where(eq(bobbleheadPhotos.id, id)).returning();
};

export const deleteBobbleheadPhotoAsync = async (
  id: string,
  bobbleheadId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance
    .delete(bobbleheadPhotos)
    .where(and(eq(bobbleheadPhotos.id, id), eq(bobbleheadPhotos.bobbleheadId, bobbleheadId)))
    .returning();
};

export const reorderBobbleheadPhotosAsync = async (
  updates: Array<{ id: string; sortOrder: number }>,
  bobbleheadId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  const sql = `
    UPDATE bobblehead_photos 
    SET sort_order = CASE id
      ${updates.map((u) => `WHEN '${u.id}' THEN ${u.sortOrder}`).join(' ')}
    END
    WHERE bobblehead_id = ${bobbleheadId} AND id IN (${updates.map((u) => `'${u.id}'`).join(',')})
    RETURNING *
  `;
  return dbInstance.execute(sql);
};

export const addTagToBobbleheadAsync = async (
  bobbleheadId: string,
  tagId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance
    .insert(bobbleheadTags)
    .values({
      bobbleheadId,
      tagId,
    })
    .onConflictDoNothing()
    .returning();
};

export const removeTagFromBobbleheadAsync = async (
  bobbleheadId: string,
  tagId: string,
  dbInstance: DatabaseExecutor = db,
) => {
  return dbInstance
    .delete(bobbleheadTags)
    .where(and(eq(bobbleheadTags.bobbleheadId, bobbleheadId), eq(bobbleheadTags.tagId, tagId)))
    .returning();
};

export const getBobbleheadTagsAsync = cache(
  async (bobbleheadId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance.select().from(bobbleheadTags).where(eq(bobbleheadTags.bobbleheadId, bobbleheadId));
  },
);
