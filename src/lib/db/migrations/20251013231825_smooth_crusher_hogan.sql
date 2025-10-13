CREATE TABLE "feature_planner"."custom_agents" (
	"agent_id" varchar(100) PRIMARY KEY NOT NULL,
	"agent_type" varchar(50) DEFAULT 'refinement' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"focus" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(100) NOT NULL,
	"system_prompt" text NOT NULL,
	"temperature" numeric(3, 2) NOT NULL,
	"tools" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	CONSTRAINT "custom_agents_temperature_range" CHECK ("feature_planner"."custom_agents"."temperature" >= 0.0 AND "feature_planner"."custom_agents"."temperature" <= 2.0),
	CONSTRAINT "custom_agents_agent_id_not_empty" CHECK (length(trim("feature_planner"."custom_agents"."agent_id")) > 0),
	CONSTRAINT "custom_agents_name_not_empty" CHECK (length(trim("feature_planner"."custom_agents"."name")) > 0),
	CONSTRAINT "custom_agents_role_not_empty" CHECK (length(trim("feature_planner"."custom_agents"."role")) > 0),
	CONSTRAINT "custom_agents_agent_type_valid" CHECK ("feature_planner"."custom_agents"."agent_type" IN ('refinement', 'feature-suggestion'))
);
--> statement-breakpoint
DROP TABLE "feature_planner"."refinement_agents" CASCADE;--> statement-breakpoint
ALTER TABLE "feature_planner"."custom_agents" ADD CONSTRAINT "custom_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_agents_agent_id_idx" ON "feature_planner"."custom_agents" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "custom_agents_agent_type_idx" ON "feature_planner"."custom_agents" USING btree ("agent_type");--> statement-breakpoint
CREATE INDEX "custom_agents_is_active_idx" ON "feature_planner"."custom_agents" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "custom_agents_is_default_idx" ON "feature_planner"."custom_agents" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "custom_agents_user_id_idx" ON "feature_planner"."custom_agents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_agents_user_active_idx" ON "feature_planner"."custom_agents" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "custom_agents_user_type_idx" ON "feature_planner"."custom_agents" USING btree ("user_id","agent_type");