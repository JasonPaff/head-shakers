import { relations } from 'drizzle-orm';

import { contentViews, searchQueries } from '@/lib/db/schema/analytics.schema';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags } from '@/lib/db/schema/bobbleheads.schema';
import { collections, subCollections } from '@/lib/db/schema/collections.schema';
import { contentReports } from '@/lib/db/schema/moderation.schema';
import { comments, follows, likes } from '@/lib/db/schema/social.schema';
import { featuredContent, notifications } from '@/lib/db/schema/system.schema';
import { tags } from '@/lib/db/schema/tags.schema';
import {
  loginHistory,
  notificationSettings,
  userActivity,
  userBlocks,
  users,
  userSessions,
  userSettings,
} from '@/lib/db/schema/users.schema';

export const usersRelations = relations(users, ({ many, one }) => ({
  activity: many(userActivity),
  blockedBy: many(userBlocks, { relationName: 'blocked' }),
  blocks: many(userBlocks, { relationName: 'blocker' }),
  bobbleheads: many(bobbleheads),
  collection: one(collections, {
    fields: [users.id],
    references: [collections.userId],
  }),
  comments: many(comments),
  contentViews: many(contentViews),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  likes: many(likes),
  loginHistory: many(loginHistory),
  moderatedReports: many(contentReports, { relationName: 'moderator' }),
  notifications: many(notifications),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  reports: many(contentReports, { relationName: 'reporter' }),
  searchQueries: many(searchQueries),
  sessions: many(userSessions),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  tags: many(tags),
}));

export const collectionsRelations = relations(collections, ({ many, one }) => ({
  bobbleheads: many(bobbleheads),
  subCollections: many(subCollections),
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
}));

export const subCollectionsRelations = relations(subCollections, ({ many, one }) => ({
  bobbleheads: many(bobbleheads),
  collection: one(collections, {
    fields: [subCollections.collectionId],
    references: [collections.id],
  }),
}));

export const bobbleheadsRelations = relations(bobbleheads, ({ many, one }) => ({
  bobbleheadTags: many(bobbleheadTags),
  collection: one(collections, {
    fields: [bobbleheads.collectionId],
    references: [collections.id],
  }),
  comments: many(comments),
  likes: many(likes),
  photos: many(bobbleheadPhotos),
  subCollection: one(subCollections, {
    fields: [bobbleheads.subCollectionId],
    references: [subCollections.id],
  }),
  tags: many(tags, {
    relationName: 'bobbleheadToTags',
  }),
  user: one(users, {
    fields: [bobbleheads.userId],
    references: [users.id],
  }),
}));

export const bobbleheadPhotosRelations = relations(bobbleheadPhotos, ({ one }) => ({
  bobblehead: one(bobbleheads, {
    fields: [bobbleheadPhotos.bobbleheadId],
    references: [bobbleheads.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many, one }) => ({
  bobbleheads: many(bobbleheads, {
    relationName: 'bobbleheadToTags',
  }),
  bobbleheadTags: many(bobbleheadTags),
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
}));

export const bobbleheadTagsRelations = relations(bobbleheadTags, ({ one }) => ({
  bobblehead: one(bobbleheads, {
    fields: [bobbleheadTags.bobbleheadId],
    references: [bobbleheads.id],
  }),
  tag: one(tags, {
    fields: [bobbleheadTags.tagId],
    references: [tags.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocked: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
    relationName: 'blocked',
  }),
  blocker: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
    relationName: 'blocker',
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ many, one }) => ({
  likes: many(likes),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'parentComment',
  }),
  replies: many(comments, {
    relationName: 'parentComment',
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}));

export const contentViewsRelations = relations(contentViews, ({ one }) => ({
  viewer: one(users, {
    fields: [contentViews.viewerId],
    references: [users.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  moderator: one(users, {
    fields: [contentReports.moderatorId],
    references: [users.id],
    relationName: 'moderator',
  }),
  reporter: one(users, {
    fields: [contentReports.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
}));

export const featuredContentRelations = relations(featuredContent, ({ one }) => ({
  curator: one(users, {
    fields: [featuredContent.curatorId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));
