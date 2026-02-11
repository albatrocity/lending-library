CREATE TYPE "borrowRequestStatus" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "borrowStatus" AS ENUM('active', 'returned', 'cancelled');--> statement-breakpoint
CREATE TYPE "imageableType" AS ENUM('items', 'users', 'borrowRequests', 'borrows');--> statement-breakpoint
CREATE TABLE "borrow_requests" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"description" text,
	"status" "borrowRequestStatus" DEFAULT 'pending'::"borrowRequestStatus",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrows" (
	"id" serial PRIMARY KEY,
	"borrower_id" text NOT NULL,
	"lender_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"return_date" timestamp,
	"status" "borrowStatus" DEFAULT 'active'::"borrowStatus" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY,
	"url" text NOT NULL,
	"imageableType" "imageableType" NOT NULL,
	"imageable_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"tags" text[],
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags_to_items" (
	"tag_id" integer,
	"item_id" integer,
	CONSTRAINT "tags_to_items_pkey" PRIMARY KEY("tag_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "items_name_idx" ON "items" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" ("name");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "borrow_requests" ADD CONSTRAINT "borrow_requests_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "borrow_requests" ADD CONSTRAINT "borrow_requests_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_borrower_id_user_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_lender_id_user_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "tags_to_items" ADD CONSTRAINT "tags_to_items_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "tags_to_items" ADD CONSTRAINT "tags_to_items_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;