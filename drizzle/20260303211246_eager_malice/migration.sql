ALTER TYPE "borrowStatus" ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';--> statement-breakpoint
ALTER TABLE "borrows" ALTER COLUMN "status" SET DEFAULT 'pending'::"borrowStatus";