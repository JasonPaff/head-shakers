ALTER TYPE "public"."content_views_target_type" ADD VALUE 'subcollection' BEFORE 'profile';--> statement-breakpoint
ALTER TYPE "public"."result_type" ADD VALUE 'subcollection' BEFORE 'user';--> statement-breakpoint
ALTER TYPE "public"."content_report_target_type" ADD VALUE 'subcollection';--> statement-breakpoint
ALTER TYPE "public"."comment_target_type" ADD VALUE 'subcollection';--> statement-breakpoint
ALTER TYPE "public"."notification_related_type" ADD VALUE 'subcollection' BEFORE 'comment';--> statement-breakpoint
ALTER TYPE "public"."user_activity_target_type" ADD VALUE 'subcollection' BEFORE 'user';--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."like_target_type";--> statement-breakpoint
CREATE TYPE "public"."like_target_type" AS ENUM('bobblehead', 'collection', 'subcollection');--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "like_target_type" SET DATA TYPE "public"."like_target_type" USING "like_target_type"::"public"."like_target_type";--> statement-breakpoint
ALTER TABLE "sub_collections" ALTER COLUMN "cover_image_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "sub_collections" ALTER COLUMN "description" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "content_reports" ALTER COLUMN "moderator_notes" SET DATA TYPE varchar(2000);--> statement-breakpoint
ALTER TABLE "featured_content" ALTER COLUMN "curator_notes" SET DATA TYPE varchar(2000);--> statement-breakpoint
ALTER TABLE "featured_content" ALTER COLUMN "description" SET DATA TYPE varchar(5000);--> statement-breakpoint
ALTER TABLE "featured_content" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_content" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "featured_content" ADD CONSTRAINT "featured_content_description_not_empty" CHECK (length("featured_content"."description") > 0);