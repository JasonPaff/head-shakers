'use server';

import { and, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { db } from '@/lib/db';
import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';

const cacheStats = {
  nextjs: { hits: 0, misses: 0 },
  react: { hits: 0, misses: 0 },
};

export interface FeaturedContent {
  comments?: number;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  likes?: number;
  // joined content data
  owner?: null | string;
  ownerDisplayName?: null | string;
  priority: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

const getActiveFeaturedContentBase = cache(async (): Promise<Array<FeaturedContent>> => {
  console.log('Cache miss: React cache - getActiveFeaturedContentBase');
  cacheStats.react.misses++;

  const now = new Date();

  const results = await db
    .select({
      bobbleheadLikes: bobbleheads.likeCount,
      bobbleheadOwner: bobbleheads.userId,
      collectionOwner: collections.userId,
      contentId: featuredContent.contentId,
      contentType: featuredContent.contentType,
      createdAt: featuredContent.createdAt,
      curatorNotes: featuredContent.curatorNotes,
      description: featuredContent.description,
      endDate: featuredContent.endDate,
      featureType: featuredContent.featureType,
      id: featuredContent.id,
      imageUrl: featuredContent.imageUrl,
      isActive: featuredContent.isActive,
      priority: featuredContent.priority,
      startDate: featuredContent.startDate,
      title: featuredContent.title,
      updatedAt: featuredContent.updatedAt,
      userDisplayName: users.displayName,
      userName: users.username,
      viewCount: featuredContent.viewCount,
    })
    .from(featuredContent)
    .leftJoin(collections, eq(featuredContent.contentId, collections.id))
    .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
    .leftJoin(users, eq(featuredContent.contentId, users.id))
    .where(
      and(
        eq(featuredContent.isActive, true),
        or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
        // either no end date or end date is in the future
        or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
      ),
    )
    .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

  return results.map((row) => ({
    comments: 0, // would come from the comment table when implemented
    contentId: row.contentId,
    contentType: row.contentType,
    createdAt: row.createdAt,
    curatorNotes: row.curatorNotes,
    description: row.description,
    endDate: row.endDate,
    featureType: row.featureType,
    id: row.id,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    likes: row.bobbleheadLikes || 0,
    owner: row.collectionOwner || row.bobbleheadOwner || row.userName,
    ownerDisplayName: row.userDisplayName || row.userName,
    priority: row.priority,
    startDate: row.startDate,
    title: row.title,
    updatedAt: row.updatedAt,
    viewCount: row.viewCount,
  }));
});

export const getActiveFeaturedContent = unstable_cache(
  async (): Promise<Array<FeaturedContent>> => {
    console.log('Cache miss: Next.js cache - getActiveFeaturedContent');
    cacheStats.nextjs.misses++;
    return await getActiveFeaturedContentBase();
  },
  ['featured-content-active'],
  {
    revalidate: 300, // 5 minutes
    tags: ['featured-content'],
  },
);

export const getCollectionOfWeek = cache(async (): Promise<Array<FeaturedContent>> => {
  console.log('Cache access: getCollectionOfWeek');
  const allContent = await getActiveFeaturedContent();
  return allContent.filter((content) => content.featureType === 'collection_of_week').slice(0, 1);
});

export const getEditorPicks = cache(async (): Promise<Array<FeaturedContent>> => {
  console.log('Cache access: getEditorPicks');
  const allContent = await getActiveFeaturedContent();
  return allContent.filter((content) => content.featureType === 'editor_pick').slice(0, 6);
});

export const getHomepageBanner = cache(async (): Promise<Array<FeaturedContent>> => {
  console.log('Cache access: getHomepageBanner');
  const allContent = await getActiveFeaturedContent();
  return allContent.filter((content) => content.featureType === 'homepage_banner').slice(0, 3);
});

export const getTrendingContent = cache(async (): Promise<Array<FeaturedContent>> => {
  console.log('Cache access: getTrendingContent');
  const allContent = await getActiveFeaturedContent();
  return allContent
    .filter((content) => content.featureType === 'trending')
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 8);
});

export async function getCacheStats() {
  return new Promise((resolve) => {
    resolve(cacheStats);
  });
}

// utility function to update view count
export async function incrementViewCount(contentId: string): Promise<void> {
  try {
    // increment in the database using SQL
    await db
      .update(featuredContent)
      .set({
        updatedAt: new Date(),
        viewCount: sql`${featuredContent.viewCount} + 1`,
      })
      .where(eq(featuredContent.id, contentId));

    console.log(`View count incremented for content: ${contentId}`);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}

// reset cache statistics (useful for testing)
export async function resetCacheStats() {
  return new Promise((resolve) => {
    resolve(() => {
      cacheStats.nextjs.hits = 0;
      cacheStats.nextjs.misses = 0;
      cacheStats.react.hits = 0;
      cacheStats.react.misses = 0;
    });
  });
}
