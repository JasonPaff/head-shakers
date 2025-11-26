DROP INDEX "users_failed_attempts_idx";--> statement-breakpoint
DROP INDEX "users_verified_created_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_auth_covering_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_profile_covering_idx";--> statement-breakpoint
CREATE INDEX "users_auth_covering_idx" ON "users" USING btree ("clerk_id","id","email","role","deleted_at");--> statement-breakpoint
CREATE INDEX "users_profile_covering_idx" ON "users" USING btree ("username","id","display_name","bio","avatar_url");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "failed_login_attempts";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_failed_login_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "member_since";