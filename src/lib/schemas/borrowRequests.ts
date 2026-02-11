import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { borrowRequests } from '$lib/server/db/schema';

export const createBorrowRequestSchema = createInsertSchema(borrowRequests);
export const updateBorrowRequestSchema = createUpdateSchema(borrowRequests);
export type BorrowRequest = typeof borrowRequests.$inferSelect;
