import { createInsertSchema } from 'drizzle-orm/zod';
import { communities } from '$lib/server/db/schema';
import { z } from 'zod';

export const createCommunitySchema = createInsertSchema(communities).pick({
	name: true,
	description: true
});

export const inviteMemberSchema = z.object({
	email: z.string().email('Please enter a valid email address')
});

export type CreateCommunity = z.infer<typeof createCommunitySchema>;
export type InviteMember = z.infer<typeof inviteMemberSchema>;

