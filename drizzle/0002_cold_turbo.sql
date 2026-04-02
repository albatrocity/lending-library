ALTER TABLE "borrow_requests" DROP CONSTRAINT "borrow_requests_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "borrows" DROP CONSTRAINT "borrows_borrow_request_id_borrow_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "borrows" DROP CONSTRAINT "borrows_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "community_items" DROP CONSTRAINT "community_items_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "community_items" DROP CONSTRAINT "community_items_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "tags_to_items" DROP CONSTRAINT "tags_to_items_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "tags_to_items" DROP CONSTRAINT "tags_to_items_item_id_items_id_fk";
--> statement-breakpoint
ALTER TABLE "borrow_requests" ADD CONSTRAINT "borrow_requests_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_borrow_request_id_borrow_requests_id_fk" FOREIGN KEY ("borrow_request_id") REFERENCES "public"."borrow_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrows" ADD CONSTRAINT "borrows_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_items" ADD CONSTRAINT "community_items_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_items" ADD CONSTRAINT "community_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags_to_items" ADD CONSTRAINT "tags_to_items_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags_to_items" ADD CONSTRAINT "tags_to_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;