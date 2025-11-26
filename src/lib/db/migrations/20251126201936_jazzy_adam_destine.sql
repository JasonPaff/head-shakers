ALTER TABLE "sub_collections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sub_collections" CASCADE;--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP CONSTRAINT "bobbleheads_sub_collection_id_sub_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "content_views" ALTER COLUMN "content_views_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_views_target_type";--> statement-breakpoint
CREATE TYPE "public"."content_views_target_type" AS ENUM('bobblehead', 'collection', 'profile');--> statement-breakpoint
ALTER TABLE "content_views" ALTER COLUMN "content_views_target_type" SET DATA TYPE "public"."content_views_target_type" USING "content_views_target_type"::"public"."content_views_target_type";--> statement-breakpoint
ALTER TABLE "search_queries" ALTER COLUMN "clicked_result_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."result_type";--> statement-breakpoint
CREATE TYPE "public"."result_type" AS ENUM('bobblehead', 'collection', 'user');--> statement-breakpoint
ALTER TABLE "search_queries" ALTER COLUMN "clicked_result_type" SET DATA TYPE "public"."result_type" USING "clicked_result_type"::"public"."result_type";--> statement-breakpoint
ALTER TABLE "content_reports" ALTER COLUMN "target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_report_target_type";--> statement-breakpoint
CREATE TYPE "public"."content_report_target_type" AS ENUM('bobblehead', 'comment', 'user', 'collection');--> statement-breakpoint
ALTER TABLE "content_reports" ALTER COLUMN "target_type" SET DATA TYPE "public"."content_report_target_type" USING "target_type"::"public"."content_report_target_type";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."comment_target_type";--> statement-breakpoint
CREATE TYPE "public"."comment_target_type" AS ENUM('bobblehead', 'collection');--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "comment_target_type" SET DATA TYPE "public"."comment_target_type" USING "comment_target_type"::"public"."comment_target_type";--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."like_target_type";--> statement-breakpoint
CREATE TYPE "public"."like_target_type" AS ENUM('bobblehead', 'collection');--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE "public"."like_target_type" USING "like_target_type"::"public"."like_target_type";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "notification_related_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."notification_related_type";--> statement-breakpoint
CREATE TYPE "public"."notification_related_type" AS ENUM('bobblehead', 'collection', 'comment', 'user');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "notification_related_type" SET DATA TYPE "public"."notification_related_type" USING "notification_related_type"::"public"."notification_related_type";--> statement-breakpoint
DROP INDEX "bobbleheads_sub_collection_id_idx";--> statement-breakpoint
DROP INDEX "comments_subcollection_target_idx";--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP COLUMN "sub_collection_id";