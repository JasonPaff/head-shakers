DROP INDEX IF EXISTS "users_deleted_active_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_auth_covering_idx";--> statement-breakpoint
CREATE INDEX "users_deleted_active_idx" ON "users" USING btree ("deleted_at","last_active_at");--> statement-breakpoint
CREATE INDEX "users_auth_covering_idx" ON "users" USING btree ("clerk_id","id","email","is_verified","role","deleted_at");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_deleted";