ALTER TABLE "feature_planner"."custom_agents" DROP CONSTRAINT "custom_agents_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "feature_planner"."custom_agents_user_id_idx";--> statement-breakpoint
DROP INDEX "feature_planner"."custom_agents_user_active_idx";--> statement-breakpoint
DROP INDEX "feature_planner"."custom_agents_user_type_idx";--> statement-breakpoint
ALTER TABLE "feature_planner"."custom_agents" DROP COLUMN "user_id";