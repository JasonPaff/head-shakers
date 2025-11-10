CREATE TABLE "launch_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"notified_at" timestamp,
	CONSTRAINT "launch_notifications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "launch_notifications_email_idx" ON "launch_notifications" USING btree ("email");