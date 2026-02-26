import {
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	boolean,
	index,
	uniqueIndex,
	integer
} from 'drizzle-orm/pg-core';

import { user } from './auth.schema';

export const borrowRequestStatus = pgEnum('borrowRequestStatus', [
	'pending',
	'accepted',
	'rejected'
]);

export const borrowStatus = pgEnum('borrowStatus', ['active', 'returned', 'cancelled']);

export const imageableType = pgEnum('imageableType', [
	'items',
	'users',
	'borrowRequests',
	'borrows'
]);

export const communities = pgTable('communities', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),
	public: boolean('public').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const communityMemberships = pgTable(
	'community_memberships',
	{
		communityId: integer('community_id')
			.notNull()
			.references(() => communities.id),
		userId: text('user_id')
			.notNull()
			.references(() => user.id)
	},
	(t) => [primaryKey({ columns: [t.communityId, t.userId] })]
);

export const communityItems = pgTable(
	'community_items',
	{
		communityId: integer('community_id')
			.notNull()
			.references(() => communities.id),
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id)
	},
	(t) => [primaryKey({ columns: [t.communityId, t.itemId] })]
);

export const tags = pgTable(
	'tags',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull().unique(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [uniqueIndex('tags_name_idx').on(t.name)]
);

export const images = pgTable(
	'images',
	{
		id: serial('id').primaryKey(),
		url: text('url').notNull(),
		imageableType: imageableType().notNull(),
		imageableId: integer('imageable_id').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [
		index('images_imageable_id_idx').on(t.imageableId),
		index('images_imageable_type_idx').on(t.imageableType)
	]
);

export const items = pgTable(
	'items',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description').notNull(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => user.id),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [index('items_name_idx').on(t.name)]
);

export const borrowRequests = pgTable(
	'borrow_requests',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id),
		startDate: timestamp('start_date').notNull(),
		endDate: timestamp('end_date'),
		description: text('description'),
		status: borrowRequestStatus().default('pending'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [
		index('borrow_requests_item_id_idx').on(t.itemId),
		index('borrow_requests_user_id_idx').on(t.userId)
	]
);

export const borrows = pgTable(
	'borrows',
	{
		id: serial('id').primaryKey(),
		borrowRequestId: integer('borrow_request_id').references(() => borrowRequests.id),
		borrowerId: text('borrower_id')
			.notNull()
			.references(() => user.id),
		lenderId: text('lender_id')
			.notNull()
			.references(() => user.id),
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id),
		startDate: timestamp('start_date').notNull(),
		endDate: timestamp('end_date'),
		returnDate: timestamp('return_date'),
		status: borrowStatus().notNull().default('active'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [
		index('borrows_item_id_idx').on(t.itemId),
		index('borrows_borrower_id_idx').on(t.borrowerId),
		index('borrows_lender_id_idx').on(t.lenderId)
	]
);

export const tagsToItems = pgTable(
	'tags_to_items',
	{
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id),
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id)
	},
	(t) => [primaryKey({ columns: [t.tagId, t.itemId] })]
);

export * from './auth.schema';
