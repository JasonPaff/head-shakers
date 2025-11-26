DROP INDEX IF EXISTS "comments_deleted_created_idx";--> statement-breakpoint
DROP INDEX IF EXISTS  "comments_target_deleted_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "comments_target_active_created_idx";--> statement-breakpoint
CREATE INDEX "comments_deleted_created_idx" ON "comments" USING btree ("deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "comments_target_deleted_idx" ON "comments" USING btree ("comment_target_type","target_id","deleted_at");--> statement-breakpoint
CREATE INDEX "comments_target_active_created_idx" ON "comments" USING btree ("comment_target_type","target_id","deleted_at","created_at" DESC);--> statement-breakpoint
ALTER TABLE "bobbleheads" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "is_edited";