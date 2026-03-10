CREATE TYPE "public"."activityRelatedType" AS ENUM('borrowRequest', 'borrow');--> statement-breakpoint
CREATE TYPE "public"."activitySubjectType" AS ENUM('item');--> statement-breakpoint
CREATE TYPE "public"."activityType" AS ENUM('requested', 'accepted', 'rejected', 'cancelled', 'borrowed', 'returned');--> statement-breakpoint
CREATE TYPE "public"."actorType" AS ENUM('user', 'system');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"actor_type" "actorType" NOT NULL,
	"subject_id" integer NOT NULL,
	"subject_type" "activitySubjectType" NOT NULL,
	"activity_type" "activityType" NOT NULL,
	"community_id" integer NOT NULL,
	"related_id" integer,
	"related_type" "activityRelatedType",
	"message" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_subject_idx" ON "activities" USING btree ("subject_id","subject_type");--> statement-breakpoint
CREATE INDEX "activities_actor_idx" ON "activities" USING btree ("actor_id","actor_type");--> statement-breakpoint
CREATE INDEX "activities_community_id_idx" ON "activities" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "activities_occurred_at_idx" ON "activities" USING btree ("occurred_at");