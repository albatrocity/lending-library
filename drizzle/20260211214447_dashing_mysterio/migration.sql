CREATE INDEX "borrow_requests_item_id_idx" ON "borrow_requests" ("item_id");--> statement-breakpoint
CREATE INDEX "borrow_requests_user_id_idx" ON "borrow_requests" ("user_id");--> statement-breakpoint
CREATE INDEX "borrows_item_id_idx" ON "borrows" ("item_id");--> statement-breakpoint
CREATE INDEX "borrows_borrower_id_idx" ON "borrows" ("borrower_id");--> statement-breakpoint
CREATE INDEX "borrows_lender_id_idx" ON "borrows" ("lender_id");--> statement-breakpoint
CREATE INDEX "images_imageable_id_idx" ON "images" ("imageable_id");--> statement-breakpoint
CREATE INDEX "images_imageable_type_idx" ON "images" ("imageableType");