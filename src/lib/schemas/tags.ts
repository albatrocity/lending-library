import type { tags } from '$lib/server/db/schema';

export type Tag = typeof tags.$inferSelect;
