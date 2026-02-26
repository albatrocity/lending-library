ALTER TABLE "borrow_requests" DROP CONSTRAINT "borrow_requests_community_id_communities_id_fkey";--> statement-breakpoint
ALTER TABLE "borrows" DROP CONSTRAINT "borrows_community_id_communities_id_fkey";--> statement-breakpoint
DROP INDEX "borrow_requests_community_id_idx";--> statement-breakpoint
DROP INDEX "borrows_community_id_idx";--> statement-breakpoint
ALTER TABLE "borrow_requests" DROP COLUMN "community_id";--> statement-breakpoint
ALTER TABLE "borrows" DROP COLUMN "community_id";