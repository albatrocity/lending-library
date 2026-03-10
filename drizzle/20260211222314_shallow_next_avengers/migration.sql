CREATE TABLE "community_items" (
	"community_id" integer,
	"item_id" integer,
	CONSTRAINT "community_items_pkey" PRIMARY KEY("community_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "community_memberships" (
	"community_id" integer,
	"user_id" text,
	CONSTRAINT "community_memberships_pkey" PRIMARY KEY("community_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "borrow_requests" ADD COLUMN "community_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "borrows" ADD COLUMN "borrow_request_id" integer;--> statement-breakpoint
ALTER TABLE "borrows" ADD COLUMN "community_id" integer;--> statement-breakpoint
CREATE INDEX "borrow_requests_community_id_idx" ON "borrow_requests" ("community_id");--> statement-breakpoint
CREATE INDEX "borrows_community_id_idx" ON "borrows" ("community_id");--> statement-breakpoint
ALTER TABLE "borrow_requests" ADD CONSTRAINT "borrow_requests_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id");--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_borrow_request_id_borrow_requests_id_fkey" FOREIGN KEY ("borrow_request_id") REFERENCES "borrow_requests"("id");--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id");--> statement-breakpoint
ALTER TABLE "community_items" ADD CONSTRAINT "community_items_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id");--> statement-breakpoint
ALTER TABLE "community_items" ADD CONSTRAINT "community_items_item_id_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id");--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id");--> statement-breakpoint
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");