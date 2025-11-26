DROP INDEX IF EXISTS "users_display_name_search_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_profile_covering_idx";--> statement-breakpoint
CREATE INDEX "users_username_search_idx" ON "users" USING gin ("username" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "users_profile_covering_idx" ON "users" USING btree ("username","id","bio","avatar_url");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "display_name";