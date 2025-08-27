import { relations } from 'drizzle-orm';

import { contentViews, searchQueries } from '@/lib/db/schema/analytics';
import { bobbleheadPhotos, bobbleheadsSchema, bobbleheadTags } from '@/lib/db/schema/bobbleheads.schema';
import { collectionsSchema, subCollections } from '@/lib/db/schema/collections.schema';
import { contentReports } from '@/lib/db/schema/moderations';
import { comments, follows, likes } from '@/lib/db/schema/socials';
import { featuredContent, notifications } from '@/lib/db/schema/systems';
import { tagsSchema } from '@/lib/db/schema/tags.schema';
import {
  loginHistory,
  notificationSettings,
  userActivity,
  userBlocks,
  userSessions,
  userSettings,
  usersSchema,
} from '@/lib/db/schema/users.schema';

export const usersRelations = relations(usersSchema, ({ many, one }) => ({
  activity: many(userActivity),
  blockedBy: many(userBlocks, { relationName: 'blocked' }),
  blocks: many(userBlocks, { relationName: 'blocker' }),
  bobbleheads: many(bobbleheadsSchema),
  collection: one(collectionsSchema, {
    fields: [usersSchema.id],
    references: [collectionsSchema.userId],
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
    fields: [usersSchema.id],
    references: [notificationSettings.userId],
  }),
  reports: many(contentReports, { relationName: 'reporter' }),
  searchQueries: many(searchQueries),
  sessions: many(userSessions),
  settings: one(userSettings, {
    fields: [usersSchema.id],
    references: [userSettings.userId],
  }),
  tags: many(tagsSchema),
}));

export const collectionsRelations = relations(collectionsSchema, ({ many, one }) => ({
  bobbleheads: many(bobbleheadsSchema),
  subCollections: many(subCollections),
  user: one(usersSchema, {
    fields: [collectionsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const subCollectionsRelations = relations(subCollections, ({ many, one }) => ({
  bobbleheads: many(bobbleheadsSchema),
  collection: one(collectionsSchema, {
    fields: [subCollections.collectionId],
    references: [collectionsSchema.id],
  }),
}));

export const bobbleheadsRelations = relations(bobbleheadsSchema, ({ many, one }) => ({
  bobbleheadTags: many(bobbleheadTags),
  collection: one(collectionsSchema, {
    fields: [bobbleheadsSchema.collectionId],
    references: [collectionsSchema.id],
  }),
  comments: many(comments),
  likes: many(likes),
  photos: many(bobbleheadPhotos),
  subCollection: one(subCollections, {
    fields: [bobbleheadsSchema.subCollectionId],
    references: [subCollections.id],
  }),
  tags: many(tagsSchema, {
    relationName: 'bobbleheadToTags',
  }),
  user: one(usersSchema, {
    fields: [bobbleheadsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const bobbleheadPhotosRelations = relations(bobbleheadPhotos, ({ one }) => ({
  bobblehead: one(bobbleheadsSchema, {
    fields: [bobbleheadPhotos.bobbleheadId],
    references: [bobbleheadsSchema.id],
  }),
}));

export const tagsRelations = relations(tagsSchema, ({ many, one }) => ({
  bobbleheads: many(bobbleheadsSchema, {
    relationName: 'bobbleheadToTags',
  }),
  bobbleheadTags: many(bobbleheadTags),
  user: one(usersSchema, {
    fields: [tagsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const bobbleheadTagsRelations = relations(bobbleheadTags, ({ one }) => ({
  bobblehead: one(bobbleheadsSchema, {
    fields: [bobbleheadTags.bobbleheadId],
    references: [bobbleheadsSchema.id],
  }),
  tag: one(tagsSchema, {
    fields: [bobbleheadTags.tagId],
    references: [tagsSchema.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(usersSchema, {
    fields: [follows.followerId],
    references: [usersSchema.id],
    relationName: 'follower',
  }),
  following: one(usersSchema, {
    fields: [follows.followingId],
    references: [usersSchema.id],
    relationName: 'following',
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocked: one(usersSchema, {
    fields: [userBlocks.blockedId],
    references: [usersSchema.id],
    relationName: 'blocked',
  }),
  blocker: one(usersSchema, {
    fields: [userBlocks.blockerId],
    references: [usersSchema.id],
    relationName: 'blocker',
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(usersSchema, {
    fields: [likes.userId],
    references: [usersSchema.id],
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
  user: one(usersSchema, {
    fields: [comments.userId],
    references: [usersSchema.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  relatedUser: one(usersSchema, {
    fields: [notifications.relatedUserId],
    references: [usersSchema.id],
  }),
  user: one(usersSchema, {
    fields: [notifications.userId],
    references: [usersSchema.id],
  }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(usersSchema, {
    fields: [userActivity.userId],
    references: [usersSchema.id],
  }),
}));

export const contentViewsRelations = relations(contentViews, ({ one }) => ({
  viewer: one(usersSchema, {
    fields: [contentViews.viewerId],
    references: [usersSchema.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(usersSchema, {
    fields: [searchQueries.userId],
    references: [usersSchema.id],
  }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  moderator: one(usersSchema, {
    fields: [contentReports.moderatorId],
    references: [usersSchema.id],
    relationName: 'moderator',
  }),
  reporter: one(usersSchema, {
    fields: [contentReports.reporterId],
    references: [usersSchema.id],
    relationName: 'reporter',
  }),
}));

export const featuredContentRelations = relations(featuredContent, ({ one }) => ({
  curator: one(usersSchema, {
    fields: [featuredContent.curatorId],
    references: [usersSchema.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(usersSchema, {
    fields: [userSessions.userId],
    references: [usersSchema.id],
  }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(usersSchema, {
    fields: [loginHistory.userId],
    references: [usersSchema.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(usersSchema, {
    fields: [userSettings.userId],
    references: [usersSchema.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(usersSchema, {
    fields: [notificationSettings.userId],
    references: [usersSchema.id],
  }),
}));
