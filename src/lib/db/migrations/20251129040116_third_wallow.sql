ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "notification_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_like_count_non_negative";--> statement-breakpoint
DROP INDEX IF EXISTS "collections_public_like_count_idx";--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN IF EXISTS "like_count";--> statement-breakpoint
DROP TYPE "public"."notification_related_type";--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
DROP TYPE "public"."digest_frequency";