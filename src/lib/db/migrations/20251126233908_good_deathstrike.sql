DROP INDEX IF EXISTS "bobbleheads_listing_covering_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "bobbleheads_collection_covering_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "bobbleheads_public_browse_covering_idx";--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "bobbleheads_deleted_at_idx" ON "bobbleheads" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "collections_deleted_at_idx" ON "collections" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "bobbleheads_listing_covering_idx" ON "bobbleheads" USING btree ("user_id","is_public","id","name","created_at","deleted_at","like_count","view_count","comment_count");--> statement-breakpoint
CREATE INDEX "bobbleheads_collection_covering_idx" ON "bobbleheads" USING btree ("collection_id","is_public","id","name","created_at","deleted_at");--> statement-breakpoint
CREATE INDEX "bobbleheads_public_browse_covering_idx" ON "bobbleheads" USING btree ("is_public","is_featured","created_at","deleted_at","id","name","like_count","view_count");