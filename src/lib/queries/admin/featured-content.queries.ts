'use server';

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';

export interface AdminFeaturedContent {
  contentId: string;
  contentTitle?: null | string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorId: null | string;
  curatorName: null | string;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  metadata: null | Record<string, unknown>;
  priority: number;
  sortOrder: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

export async function getAllFeaturedContentForAdmin(): Promise<AdminFeaturedContent[]> {
  const results = await db
    .select({
      bobbleheadTitle: bobbleheads.name,
      collectionTitle: collections.name,
      contentId: featuredContent.contentId,
      contentType: featuredContent.contentType,
      createdAt: featuredContent.createdAt,
      curatorId: featuredContent.curatorId,
      curatorName: users.displayName,
      curatorNotes: featuredContent.curatorNotes,
      description: featuredContent.description,
      endDate: featuredContent.endDate,
      featureType: featuredContent.featureType,
      id: featuredContent.id,
      imageUrl: featuredContent.imageUrl,
      isActive: featuredContent.isActive,
      metadata: featuredContent.metadata,
      priority: featuredContent.priority,
      sortOrder: featuredContent.sortOrder,
      startDate: featuredContent.startDate,
      title: featuredContent.title,
      updatedAt: featuredContent.updatedAt,
      userTitle: sql<string>`CASE WHEN ${featuredContent.contentType} = 'user' THEN u2.display_name ELSE NULL END`,
      viewCount: featuredContent.viewCount,
    })
    .from(featuredContent)
    .leftJoin(users, eq(featuredContent.curatorId, users.id))
    .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
    .leftJoin(collections, eq(featuredContent.contentId, collections.id))
    .leftJoin(sql`${users} AS u2`, sql`${featuredContent.contentId} = u2.id`)
    .orderBy(desc(featuredContent.updatedAt));

  return results.map((row) => ({
    contentId: row.contentId,
    contentTitle: row.bobbleheadTitle || row.collectionTitle || row.userTitle,
    contentType: row.contentType,
    createdAt: row.createdAt,
    curatorId: row.curatorId,
    curatorName: row.curatorName,
    curatorNotes: row.curatorNotes,
    description: row.description,
    endDate: row.endDate,
    featureType: row.featureType,
    id: row.id,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    metadata: (row.metadata as Record<string, unknown>) || null,
    priority: row.priority,
    sortOrder: row.sortOrder,
    startDate: row.startDate,
    title: row.title,
    updatedAt: row.updatedAt,
    viewCount: row.viewCount,
  }));
}
