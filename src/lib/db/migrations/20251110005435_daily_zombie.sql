-- Add username_changed_at timestamp to users table
ALTER TABLE "users" ADD COLUMN "username_changed_at" timestamp;--> statement-breakpoint