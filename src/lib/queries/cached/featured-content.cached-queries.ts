'use server';

import { and, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

import { CACHE_KEYS, CACHE_TAGS, CACHE_TTL } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';
import { cacheService } from '@/lib/services/cache.service';

export interface CachedFeaturedContent {
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

export async function getActiveFeaturedContentCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.ACTIVE,
    async () => {
      const now = new Date();

      const results = await db
        .select()
        .from(featuredContent)
        .where(
          and(
            eq(featuredContent.isActive, true),
            lte(featuredContent.startDate, now),
            // either no end date or end date is in the future
            or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
          ),
        )
        .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

      return results.map((row) => ({
        ...row,
      }));
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.SHORT, // shorter TTL for time-sensitive data
    },
  );
}

export async function getCollectionOfWeekCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.COLLECTION_OF_WEEK,
    async () => {
      const allContent = await getFeaturedContentCached();
      return allContent.filter((content) => content.featureType === 'collection_of_week').slice(0, 1); // only one collection of the week
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.LONG, // longer TTL as this changes less frequently
    },
  );
}

export async function getEditorPicksContentCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.EDITOR_PICKS,
    async () => {
      const allContent = await getFeaturedContentCached();
      return allContent.filter((content) => content.featureType === 'editor_pick').slice(0, 6); // limit for performance
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.MEDIUM,
    },
  );
}

export async function getFeaturedContentByCategoryCached(
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending',
): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.BY_CATEGORY(featureType),
    async () => {
      const results = await db
        .select({
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
          viewCount: featuredContent.viewCount,
        })
        .from(featuredContent)
        .where(and(eq(featuredContent.isActive, true), eq(featuredContent.featureType, featureType)))
        .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

      return results.map((row) => ({
        ...row,
      }));
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.MEDIUM,
    },
  );
}

export async function getFeaturedContentByTypeCached(
  contentType: 'bobblehead' | 'collection' | 'user',
): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.BY_TYPE(contentType),
    async () => {
      const allContent = await getFeaturedContentCached();
      return allContent.filter((content) => content.contentType === contentType);
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.MEDIUM,
    },
  );
}

export async function getFeaturedContentCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.ALL,
    async () => {
      const results = await db
        .select({
          bobbleheadLikes: bobbleheads.likeCount,
          // bobblehead data
          bobbleheadOwner: bobbleheads.userId,
          // collection data (collections don't have likeCount)
          collectionOwner: collections.userId,
          contentId: featuredContent.contentId,
          contentType: featuredContent.contentType,
          createdAt: featuredContent.createdAt,
          curatorNotes: featuredContent.curatorNotes,
          description: featuredContent.description,
          endDate: featuredContent.endDate,
          featureType: featuredContent.featureType,
          // featured content fields
          id: featuredContent.id,
          imageUrl: featuredContent.imageUrl,
          isActive: featuredContent.isActive,
          priority: featuredContent.priority,
          startDate: featuredContent.startDate,
          title: featuredContent.title,
          updatedAt: featuredContent.updatedAt,
          // user data
          userDisplayName: users.displayName,
          userName: users.username,
          viewCount: featuredContent.viewCount,
        })
        .from(featuredContent)
        .leftJoin(collections, eq(featuredContent.contentId, collections.id))
        .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
        .leftJoin(users, eq(featuredContent.contentId, users.id))
        .where(eq(featuredContent.isActive, true))
        .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

      return results.map((row) => ({
        comments: 0, // would come from the comments table when implemented
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
        likes: row.bobbleheadLikes || 0, // collections don't have likes yet
        owner: row.collectionOwner || row.bobbleheadOwner || row.userName,
        ownerDisplayName: row.userDisplayName || row.userName,
        priority: row.priority,
        startDate: row.startDate,
        title: row.title,
        updatedAt: row.updatedAt,
        viewCount: row.viewCount,
      }));
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.MEDIUM,
    },
  );
}

export async function getHomepageBannerContentCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.HOMEPAGE_BANNER,
    async () => {
      const allContent = await getFeaturedContentCached();
      return allContent.filter((content) => content.featureType === 'homepage_banner').slice(0, 3); // limit to the top 3 for performance
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT],
      ttl: CACHE_TTL.MEDIUM,
    },
  );
}

export async function getTrendingContentCached(): Promise<Array<CachedFeaturedContent>> {
  return cacheService.getOrSet(
    CACHE_KEYS.FEATURED_CONTENT.TRENDING,
    async () => {
      const allContent = await getFeaturedContentCached();
      return allContent
        .filter((content) => content.featureType === 'trending')
        .sort((a, b) => b.viewCount - a.viewCount) // sort by view count
        .slice(0, 8); // limit for performance
    },
    {
      namespace: 'featured',
      tags: [CACHE_TAGS.FEATURED_CONTENT, CACHE_TAGS.ANALYTICS],
      ttl: CACHE_TTL.SHORT, // short TTL for trending content
    },
  );
}

// utility function to update view count with cache invalidation
export async function incrementViewCountCached(contentId: string): Promise<void> {
  try {
    // increment in the database using SQL
    await db
      .update(featuredContent)
      .set({
        updatedAt: new Date(),
        viewCount: sql`${featuredContent.viewCount} + 1`,
      })
      .where(eq(featuredContent.id, contentId));

    // invalidate related caches
    await invalidateContentCache(contentId);
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}

export async function invalidateContentCache(contentId: string): Promise<void> {
  const keysToInvalidate = [
    CACHE_KEYS.FEATURED_CONTENT.ALL,
    CACHE_KEYS.FEATURED_CONTENT.ACTIVE,
    CACHE_KEYS.FEATURED_CONTENT.TRENDING,
    CACHE_KEYS.CONTENT_METRICS.BY_CONTENT(contentId),
  ];

  await Promise.all(keysToInvalidate.map((key) => cacheService.del(key, 'featured')));
}

// cache invalidation functions
export async function invalidateFeaturedContentCache(): Promise<void> {
  await cacheService.invalidateByTag(CACHE_TAGS.FEATURED_CONTENT);
}

// cache warming functions
export async function warmFeaturedContentCache(): Promise<void> {
  try {
    await Promise.all([
      getFeaturedContentCached(),
      getActiveFeaturedContentCached(),
      getHomepageBannerContentCached(),
      getEditorPicksContentCached(),
      getCollectionOfWeekCached(),
      getTrendingContentCached(),
    ]);
    console.log('Featured content cache warmed successfully');
  } catch (error) {
    console.error('Failed to warm featured content cache:', error);
  }
}
