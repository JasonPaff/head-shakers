-- Remove subcollection data before changing enum types
DELETE FROM "content_views" WHERE "content_views_target_type" = 'subcollection';--> statement-breakpoint
DELETE FROM "search_queries" WHERE "clicked_result_type" = 'subcollection';--> statement-breakpoint
DELETE FROM "content_reports" WHERE "target_type" = 'subcollection';--> statement-breakpoint
DELETE FROM "comments" WHERE "comment_target_type" = 'subcollection';--> statement-breakpoint
DELETE FROM "likes" WHERE "like_target_type" = 'subcollection';--> statement-breakpoint
DELETE FROM "notifications" WHERE "notification_related_type" = 'subcollection';--> statement-breakpoint

-- Drop the sub_collections table
ALTER TABLE "sub_collections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sub_collections" CASCADE;--> statement-breakpoint

-- Update content_views enum
ALTER TABLE "content_views" ALTER COLUMN "content_views_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_views_target_type";--> statement-breakpoint
CREATE TYPE "public"."content_views_target_type" AS ENUM('bobblehead', 'collection', 'profile');--> statement-breakpoint
ALTER TABLE "content_views" ALTER COLUMN "content_views_target_type" SET DATA TYPE "public"."content_views_target_type" USING "content_views_target_type"::"public"."content_views_target_type";--> statement-breakpoint

-- Update search_queries enum
ALTER TABLE "search_queries" ALTER COLUMN "clicked_result_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."result_type";--> statement-breakpoint
CREATE TYPE "public"."result_type" AS ENUM('bobblehead', 'collection', 'user');--> statement-breakpoint
ALTER TABLE "search_queries" ALTER COLUMN "clicked_result_type" SET DATA TYPE "public"."result_type" USING "clicked_result_type"::"public"."result_type";--> statement-breakpoint

-- Update content_reports enum
ALTER TABLE "content_reports" ALTER COLUMN "target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_report_target_type";--> statement-breakpoint
CREATE TYPE "public"."content_report_target_type" AS ENUM('bobblehead', 'comment', 'user', 'collection');--> statement-breakpoint
ALTER TABLE "content_reports" ALTER COLUMN "target_type" SET DATA TYPE "public"."content_report_target_type" USING "target_type"::"public"."content_report_target_type";--> statement-breakpoint

-- Update comments enum
ALTER TABLE "comments" ALTER COLUMN "comment_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."comment_target_type";--> statement-breakpoint
CREATE TYPE "public"."comment_target_type" AS ENUM('bobblehead', 'collection');--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_target_type" SET DATA TYPE "public"."comment_target_type" USING "comment_target_type"::"public"."comment_target_type";--> statement-breakpoint

-- Update likes enum
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."like_target_type";--> statement-breakpoint
CREATE TYPE "public"."like_target_type" AS ENUM('bobblehead', 'collection');--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE "public"."like_target_type" USING "like_target_type"::"public"."like_target_type";--> statement-breakpoint

-- Update notifications enum
ALTER TABLE "notifications" ALTER COLUMN "notification_related_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_related_type";--> statement-breakpoint
CREATE TYPE "public"."notification_related_type" AS ENUM('bobblehead', 'collection', 'comment', 'user');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "notification_related_type" SET DATA TYPE "public"."notification_related_type" USING "notification_related_type"::"public"."notification_related_type";--> statement-breakpoint

-- Clean up indexes and columns
DROP INDEX IF EXISTS "bobbleheads_sub_collection_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "comments_subcollection_target_idx";--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP COLUMN IF EXISTS "sub_collection_id";
