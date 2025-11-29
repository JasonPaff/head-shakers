/**
 * cache tag management utilities for NextJS unstable_cache()
 * provides intelligent tag generation and invalidation patterns
 */

import { CACHE_CONFIG } from '@/lib/constants/cache';

/**
 * valid aggregate types for cache operations
 */
export type CacheAggregateType = 'global-stats' | 'trending' | 'user-stats';

/**
 * valid entity types for cache operations
 */
export type CacheEntityType = 'bobblehead' | 'collection' | 'comment' | 'tag' | 'user';

/**
 * valid feature types for cache operations
 */
export type CacheFeatureType = 'featured' | 'popular' | 'public' | 'search';

/**
 * valid relationship types for cache operations
 */
export type CacheRelationshipType =
  | 'bobblehead-tags'
  | 'collection-bobbleheads'
  | 'user-bobbleheads'
  | 'user-collections';

/**
 * cache tag builder constants
 */
export const CACHE_TAG_CONSTANTS = {
  MAX_TAG_LENGTH: 100, // Reasonable tag length limit
  MAX_TAGS_PER_BUILDER: 50, // Prevent memory leaks
} as const;

/**
 * cache tag builder utilities for consistent tag generation
 */
export class CacheTagBuilder {
  private tags: Set<string> = new Set();

  /**
   * add aggregate data tags
   */
  addAggregate(type: CacheAggregateType, id?: string): this {
    this.ensureTagLimit();

    switch (type) {
      case 'global-stats':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.GLOBAL_STATS));
        break;
      case 'trending':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.TRENDING));
        break;
      case 'user-stats':
        if (id) {
          this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.USER_STATS(id)));
        }
        break;
    }
    return this;
  }

  /**
   * add custom tag
   */
  addCustom(tag: string): this {
    this.ensureTagLimit();
    this.tags.add(this.validateTag(tag));
    return this;
  }

  /**
   * add entity-specific tags
   */
  addEntity(type: CacheEntityType, id: string): this {
    this.ensureTagLimit();

    if (!id || typeof id !== 'string') {
      throw new Error('Entity ID must be a non-empty string');
    }

    switch (type) {
      case 'bobblehead':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.BOBBLEHEAD(id)));
        break;
      case 'collection':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.COLLECTION(id)));
        break;
      case 'comment':
        this.tags.add(this.validateTag(`comment:${id}`));
        break;
      case 'tag':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.TAG(id)));
        break;
      case 'user':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.USER(id)));
        break;
    }
    return this;
  }

  /**
   * add feature-specific tags
   */
  addFeature(type: CacheFeatureType): this {
    this.ensureTagLimit();

    switch (type) {
      case 'featured':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.FEATURED_CONTENT));
        break;
      case 'popular':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.POPULAR_CONTENT));
        break;
      case 'public':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.PUBLIC_CONTENT));
        break;
      case 'search':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.SEARCH_RESULTS));
        break;
    }
    return this;
  }

  /**
   * add relationship-specific tags
   */
  addRelationship(type: CacheRelationshipType, id: string): this {
    this.ensureTagLimit();

    if (!id || typeof id !== 'string') {
      throw new Error('Relationship ID must be a non-empty string');
    }

    switch (type) {
      case 'bobblehead-tags':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.BOBBLEHEAD_TAGS(id)));
        break;
      case 'collection-bobbleheads':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(id)));
        break;
      case 'user-bobbleheads':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.USER_BOBBLEHEADS(id)));
        break;
      case 'user-collections':
        this.tags.add(this.validateTag(CACHE_CONFIG.TAGS.USER_COLLECTIONS(id)));
        break;
    }
    return this;
  }

  /**
   * build the final tag array
   */
  build(): Array<string> {
    return Array.from(this.tags);
  }

  /**
   * get the current tag count for monitoring
   */
  getTagCount(): number {
    return this.tags.size;
  }

  /**
   * reset the builder
   */
  reset(): this {
    this.tags.clear();
    return this;
  }

  /**
   * ensure tag limits are not exceeded
   */
  private ensureTagLimit(): void {
    if (this.tags.size >= CACHE_TAG_CONSTANTS.MAX_TAGS_PER_BUILDER) {
      throw new Error(
        `Cache tag limit exceeded: ${this.tags.size} >= ${CACHE_TAG_CONSTANTS.MAX_TAGS_PER_BUILDER}. ` +
          'Consider using fewer tags or calling build() and reset() more frequently.',
      );
    }
  }

  /**
   * validate and sanitize tag
   */
  private validateTag(tag: string): string {
    if (!tag || typeof tag !== 'string') {
      throw new Error('Cache tag must be a non-empty string');
    }

    if (tag.length > CACHE_TAG_CONSTANTS.MAX_TAG_LENGTH) {
      throw new Error(
        `Cache tag length exceeds maximum: ${tag.length} > ${CACHE_TAG_CONSTANTS.MAX_TAG_LENGTH}`,
      );
    }

    return tag;
  }
}

/**
 * pre-built tag generators for common scenarios
 */
export const CacheTagGenerators = {
  /**
   * generate tags for analytics operations
   */
  analytics: {
    trending: () => new CacheTagBuilder().addAggregate('trending').addFeature('popular').build(),

    view: (entityType: CacheEntityType, entityId: string) => {
      if (entityType !== 'bobblehead' && entityType !== 'collection') {
        throw new Error(
          `Analytics view only supports 'bobblehead' or 'collection' entities, got: ${entityType}`,
        );
      }
      return new CacheTagBuilder()
        .addEntity(entityType, entityId)
        .addCustom(`analytics:${entityType}`)
        .addAggregate('global-stats')
        .build();
    },
  },

  /**
   * generate tags for bobblehead operations
   */
  bobblehead: {
    create: (bobbleheadId: string, userId: string, collectionId?: string) => {
      const builder = new CacheTagBuilder()
        .addEntity('bobblehead', bobbleheadId)
        .addEntity('user', userId)
        .addRelationship('user-bobbleheads', userId)
        .addFeature('public');

      if (collectionId) {
        builder.addEntity('collection', collectionId).addRelationship('collection-bobbleheads', collectionId);
      }

      return builder.build();
    },

    delete: (bobbleheadId: string, userId: string, collectionId?: string) => {
      const builder = new CacheTagBuilder()
        .addEntity('bobblehead', bobbleheadId)
        .addEntity('user', userId)
        .addRelationship('user-bobbleheads', userId)
        .addFeature('public')
        .addFeature('popular')
        .addAggregate('user-stats', userId)
        .addAggregate('global-stats');

      if (collectionId) {
        builder.addEntity('collection', collectionId).addRelationship('collection-bobbleheads', collectionId);
      }

      return builder.build();
    },

    read: (bobbleheadId: string, userId?: string) => {
      const builder = new CacheTagBuilder().addEntity('bobblehead', bobbleheadId);

      if (userId) {
        builder.addEntity('user', userId);
      }

      return builder.build();
    },

    update: (bobbleheadId: string, userId: string, collectionId?: string) => {
      const builder = new CacheTagBuilder()
        .addEntity('bobblehead', bobbleheadId)
        .addEntity('user', userId)
        .addRelationship('user-bobbleheads', userId)
        .addFeature('public')
        .addFeature('popular');

      if (collectionId) {
        builder.addEntity('collection', collectionId).addRelationship('collection-bobbleheads', collectionId);
      }

      return builder.build();
    },
  },

  /**
   * generate tags for collection operations
   */
  collection: {
    create: (collectionId: string, userId: string) =>
      new CacheTagBuilder()
        .addEntity('collection', collectionId)
        .addEntity('user', userId)
        .addRelationship('user-collections', userId)
        .addFeature('public')
        .addAggregate('user-stats', userId)
        .build(),

    delete: (collectionId: string, userId: string) =>
      new CacheTagBuilder()
        .addEntity('collection', collectionId)
        .addEntity('user', userId)
        .addRelationship('user-collections', userId)
        .addRelationship('collection-bobbleheads', collectionId)
        .addFeature('public')
        .addFeature('popular')
        .addAggregate('user-stats', userId)
        .addAggregate('global-stats')
        .build(),

    read: (collectionId: string, userId?: string) => {
      const builder = new CacheTagBuilder().addEntity('collection', collectionId);

      if (userId) {
        builder.addEntity('user', userId);
      }

      return builder.build();
    },

    update: (collectionId: string, userId: string) =>
      new CacheTagBuilder()
        .addEntity('collection', collectionId)
        .addEntity('user', userId)
        .addRelationship('user-collections', userId)
        .addFeature('public')
        .addFeature('popular')
        .build(),
  },

  /**
   * generate tags for featured content
   */
  featured: {
    content: (type: string) =>
      new CacheTagBuilder().addFeature('featured').addCustom(`featured:${type}`).build(),

    update: () => new CacheTagBuilder().addFeature('featured').addFeature('public').build(),
  },

  /**
   * generate tags for newsletter operations
   */
  newsletter: {
    /**
     * generate tags for newsletter subscription check
     * Uses email-specific tag for targeted invalidation
     */
    subscription: (email: string) =>
      new CacheTagBuilder().addCustom(`newsletter:subscription:${email}`).build(),
  },

  /**
   * generate tags for search operations
   */
  search: {
    popular: () => new CacheTagBuilder().addFeature('search').addFeature('popular').build(),

    results: (_query: string, entityType: string) =>
      new CacheTagBuilder().addFeature('search').addCustom(`search:${entityType}`).build(),
  },

  /**
   * generate tags for social operations
   */
  social: {
    comment: (commentId: string, userId?: string) => {
      const builder = new CacheTagBuilder().addEntity('comment', commentId);
      if (userId) {
        builder.addEntity('user', userId);
      }
      return builder.build();
    },

    comments: (entityType: CacheEntityType, entityId: string) => {
      if (entityType !== 'bobblehead' && entityType !== 'collection') {
        throw new Error(
          `Social comments only supports 'bobblehead' or 'collection' entities, got: ${entityType}`,
        );
      }
      return new CacheTagBuilder()
        .addEntity(entityType, entityId)
        .addCustom(`comments:${entityType}:${entityId}`)
        .addFeature('popular')
        .build();
    },

    commentThread: (parentCommentId: string) =>
      new CacheTagBuilder()
        .addEntity('comment', parentCommentId)
        .addCustom(`comment-replies:${parentCommentId}`)
        .build(),

    follow: (followerId: string, followedId: string) =>
      new CacheTagBuilder()
        .addEntity('user', followerId)
        .addEntity('user', followedId)
        .addAggregate('user-stats', followerId)
        .addAggregate('user-stats', followedId)
        .build(),

    like: (entityType: CacheEntityType, entityId: string, userId: string) => {
      if (entityType !== 'bobblehead' && entityType !== 'collection' && entityType !== 'comment') {
        throw new Error(
          `Social like only supports 'bobblehead', 'collection', or 'comment' entities, got: ${entityType}`,
        );
      }
      return new CacheTagBuilder()
        .addEntity(entityType, entityId)
        .addEntity('user', userId)
        .addFeature('popular')
        .addAggregate('global-stats')
        .build();
    },
  },

  /**
   * generate tags for user operations
   */
  user: {
    profile: (userId: string) => new CacheTagBuilder().addEntity('user', userId).build(),

    stats: (userId: string) =>
      new CacheTagBuilder()
        .addEntity('user', userId)
        .addAggregate('user-stats', userId)
        .addAggregate('global-stats')
        .build(),

    update: (userId: string) =>
      new CacheTagBuilder()
        .addEntity('user', userId)
        .addRelationship('user-bobbleheads', userId)
        .addRelationship('user-collections', userId)
        .addAggregate('user-stats', userId)
        .build(),
  },
};

/**
 * smart tag invalidation utilities
 */
export const CacheTagInvalidation = {
  /**
   * get tags to invalidate when analytics view is recorded
   */
  onAnalyticsView: (entityType: CacheEntityType, entityId: string) => {
    return CacheTagGenerators.analytics.view(entityType, entityId);
  },

  /**
   * get tags to invalidate when a bobblehead is modified
   */
  onBobbleheadChange: (bobbleheadId: string, userId: string, collectionId?: string) => {
    return CacheTagGenerators.bobblehead.update(bobbleheadId, userId, collectionId);
  },

  /**
   * get tags to invalidate when a collection is modified
   */
  onCollectionChange: (collectionId: string, userId: string) => {
    return CacheTagGenerators.collection.update(collectionId, userId);
  },

  /**
   * get tags to invalidate when comment is created or updated
   */
  onCommentChange: (
    entityType: CacheEntityType,
    entityId: string,
    commentId?: string,
    parentCommentId?: string,
  ) => {
    const tags = CacheTagGenerators.social.comments(entityType, entityId);

    // Add individual comment cache tag if commentId is provided
    if (commentId) {
      tags.push(...CacheTagGenerators.social.comment(commentId));
    }

    // Add parent comment thread cache tag if this is a reply
    if (parentCommentId) {
      tags.push(...CacheTagGenerators.social.commentThread(parentCommentId));
      // Also invalidate the parent comment itself
      tags.push(...CacheTagGenerators.social.comment(parentCommentId));
    }

    return tags;
  },

  /**
   * get tags to invalidate when featured content changes
   */
  onFeaturedContentChange: () => {
    return CacheTagGenerators.featured.update();
  },

  /**
   * get comprehensive tags for major data changes
   */
  onMajorDataChange: () => {
    return new CacheTagBuilder()
      .addFeature('featured')
      .addFeature('popular')
      .addFeature('public')
      .addAggregate('global-stats')
      .addAggregate('trending')
      .build();
  },

  /**
   * get tags to invalidate when social interactions occur
   */
  onSocialInteraction: (entityType: CacheEntityType, entityId: string, userId: string) => {
    if (entityType !== 'bobblehead' && entityType !== 'collection' && entityType !== 'comment') {
      throw new Error(
        `Social interaction invalidation only supports 'bobblehead', 'collection', or 'comment' entities, got: ${entityType}`,
      );
    }
    return CacheTagGenerators.social.like(entityType, entityId, userId);
  },

  /**
   * get tags to invalidate when trending content is updated
   */
  onTrendingUpdate: () => {
    return CacheTagGenerators.analytics.trending();
  },

  /**
   * get tags to invalidate when user data changes
   */
  onUserChange: (userId: string) => {
    return CacheTagGenerators.user.update(userId);
  },
};
