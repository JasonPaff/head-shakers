ALTER TABLE "collections" DROP CONSTRAINT "collections_name_length";--> statement-breakpoint
ALTER TABLE "collections" DROP CONSTRAINT "collections_name_not_empty";--> statement-breakpoint
ALTER TABLE "sub_collections" DROP CONSTRAINT "sub_collections_name_length";--> statement-breakpoint
ALTER TABLE "featured_content" DROP CONSTRAINT "featured_content_title_length";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_title_length";--> statement-breakpoint
ALTER TABLE "platform_settings" DROP CONSTRAINT "platform_settings_key_length";--> statement-breakpoint
ALTER TABLE "content_views" ALTER COLUMN "referrer_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "search_queries" ALTER COLUMN "ip_address" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "bobblehead_photos" ALTER COLUMN "caption" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "bobblehead_photos" ALTER COLUMN "url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "bobbleheads" ALTER COLUMN "description" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "bobbleheads" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "cover_image_url" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "description" SET DATA TYPE varchar(1000);--> statement-breakpoint
ALTER TABLE "sub_collections" ALTER COLUMN "cover_image_url" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "sub_collections" ALTER COLUMN "description" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "currency" SET DATA TYPE varchar(3);--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "theme";--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_name_length" CHECK (length("collections"."name") <= $1);--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_name_not_empty" CHECK (length("collections"."name") >= $1);--> statement-breakpoint
ALTER TABLE "sub_collections" ADD CONSTRAINT "sub_collections_name_length" CHECK (length("sub_collections"."name") <= $1);--> statement-breakpoint
ALTER TABLE "featured_content" ADD CONSTRAINT "featured_content_title_length" CHECK ("featured_content"."title" IS NULL OR length("featured_content"."title") <= $1);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_title_length" CHECK (length("notifications"."title") <= $1);--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_key_length" CHECK (length("platform_settings"."key") <= $1);--> statement-breakpoint
DROP TYPE "public"."theme";