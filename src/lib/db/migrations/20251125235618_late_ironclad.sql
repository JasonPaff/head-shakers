ALTER TABLE "user_settings" DROP COLUMN "allow_direct_messages";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "default_item_privacy";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "moderate_comments";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "show_collection_stats";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "show_collection_value";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "show_join_date";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "show_last_active";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "show_real_name";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "timezone";--> statement-breakpoint
DROP TYPE "public"."dm_permission";